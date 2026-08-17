//import utils before the cache to avoid the circular-import crash
//(videoelementcacheitem → sourcenode → utils → videonode → medianode → sourcenode)
import "../../src/utils";
import VideoElementCache from "../../src/videoelementcache";

const PLAYING_STATE = 2;

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

/* jsdom does not implement media playback, so stub the element methods init() drives */
const stubPlayback = cache => {
    for (const item of cache._cacheItems) {
        item.element.play = jest.fn(() => Promise.resolve());
        item.element.pause = jest.fn();
    }
};

describe("VideoElementCache", () => {
    describe("constructor", () => {
        test("creates the requested number of pooled video elements", () => {
            expect(new VideoElementCache(5).length).toBe(5);
        });

        test("pools elements configured for inline cross-origin playback", () => {
            const cache = new VideoElementCache(1);

            const element = cache.getElementAndLinkToNode({});

            expect(element.tagName).toBe("VIDEO");
            expect(element.getAttribute("crossorigin")).toBe("anonymous");
            expect(element.hasAttribute("playsinline")).toBe(true);
            expect(element.preload).toBe("auto");
        });
    });

    describe("getElementAndLinkToNode", () => {
        test("hands out each pooled element only once while it has media attached", () => {
            const cache = new VideoElementCache(2);
            const first = cache.getElementAndLinkToNode({});
            first.src = "http://example.com/a.mp4";

            const second = cache.getElementAndLinkToNode({});

            expect(second).not.toBe(first);
        });

        test("grows beyond its initial size when every element is in use", () => {
            const cache = new VideoElementCache(1);
            const first = cache.getElementAndLinkToNode({});
            first.src = "http://example.com/a.mp4";

            const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
            const second = cache.getElementAndLinkToNode({});
            debugSpy.mockRestore();

            expect(second).not.toBe(first);
            expect(cache.length).toBe(2);
        });

        test("links the media node so the cache knows the element is playing, and unlinks it again", () => {
            const cache = new VideoElementCache(1);
            const playingNode = { _state: PLAYING_STATE };

            const element = cache.getElementAndLinkToNode(playingNode);
            expect(cache._cacheItems[0].isPlaying()).toBe(true);

            cache.unlinkNodeFromElement(element);
            expect(cache._cacheItems[0].isPlaying()).toBe(false);
        });
    });

    describe("unused", () => {
        test("counts only elements without media attached", () => {
            const cache = new VideoElementCache(3);
            expect(cache.unused).toBe(3);

            cache.getElementAndLinkToNode({}).src = "http://example.com/a.mp4";

            expect(cache.unused).toBe(2);
        });
    });

    describe("init", () => {
        test("plays every pooled element once and pauses those not linked to a playing node", async () => {
            const cache = new VideoElementCache(2);
            stubPlayback(cache);
            // link a playing node to the first element; leave the second unlinked
            cache._cacheItems[0].linkNode({ _state: PLAYING_STATE });

            cache.init();
            await flushPromises();

            expect(cache._cacheItems[0].element.play).toHaveBeenCalledTimes(1);
            expect(cache._cacheItems[0].element.pause).not.toHaveBeenCalled();
            expect(cache._cacheItems[1].element.play).toHaveBeenCalledTimes(1);
            expect(cache._cacheItems[1].element.pause).toHaveBeenCalledTimes(1);
        });

        test("does not touch the elements again once initialised", async () => {
            const cache = new VideoElementCache(1);
            stubPlayback(cache);

            cache.init();
            cache.init();
            await flushPromises();

            expect(cache._cacheItems[0].element.play).toHaveBeenCalledTimes(1);
        });

        test("swallows NotSupportedError autoplay rejections", async () => {
            const cache = new VideoElementCache(1);
            const error = new Error("no supported source");
            error.name = "NotSupportedError";
            cache._cacheItems[0].element.play = jest.fn(() => Promise.reject(error));
            cache._cacheItems[0].element.pause = jest.fn();

            cache.init();
            await flushPromises();

            expect(cache._cacheItems[0].element.pause).not.toHaveBeenCalled();
        });
    });
});
