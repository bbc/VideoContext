import VideoContext from "../../src/videocontext";
import { SOURCENODESTATE } from "../../src/SourceNodes/sourcenode";

let ctx;
require("webgl-mock");

/*
 * an element mock which reports itself as ready for playback
 * (readyState 4 = HAVE_ENOUGH_DATA) so the node's load polling completes
 */
const makeReadyElement = (duration = 30) => ({
    play: jest.fn(),
    pause: jest.fn(),
    readyState: 4,
    seeking: false,
    duration,
    currentTime: 0
});

/*
 * creates a video node with provided attributes.
 * returns: the node instance and the mocked HTMLVideoElement which is controlled by the node
 */
const nodeFactory = (
    vidCtx,
    attr = {},
    { sourceOffset = undefined, preloadTime = undefined } = {}
) => {
    let _currentTime = undefined;
    const _currentTimeSetter = jest.fn(v => {
        _currentTime = v;
    });
    const element = {
        play: jest.fn(),
        pause: jest.fn(),
        get currentTime() {
            return _currentTime;
        },
        set currentTime(v) {
            _currentTimeSetter(v);
        },
        _currentTimeSetter
    };
    const node = vidCtx.video(element, sourceOffset, preloadTime, attr);
    // some sane defaults
    // node should play from the start
    node.start(0);
    node.stop(10);
    return { node, element };
};

/*
 * create a fresh video context with mocked canvas for each test
 * don't useVideoElementCache as unnecessary for these tests and would need to be patched with a mock.
 */
beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    ctx = new VideoContext(canvas, undefined, { useVideoElementCache: false });
});

/*
 * These tests use nodeFactory to produce a video element and a controlling video node.
 * The tests check that interaction with the node effects the element as intended.
 * Some tested interactions require the node to have loaded. (eg updating element attributes)
 * We use the public ctx.update method to advance the videocontext timeline and trigger these updates
 */
describe("medianode", () => {
    describe("volume", () => {
        it("volume setter sets volume on element", () => {
            const { element, node } = nodeFactory(ctx);
            node.volume = 0.5;
            expect(element.volume).toBe(0.5);
            node.volume = 1.5;
            expect(element.volume).toBe(1.5);
        });

        it("should play with a default volume if volume attribute is not supplied", () => {
            expect.assertions(3);

            const { element } = nodeFactory(ctx);
            expect(element.volume).toBe(undefined /* because our mock has no volume attr */);

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.volume).not.toBe(undefined /* it will be a number now */);
            expect(element.volume).toBeGreaterThan(-Infinity);
        });

        it("should set provided volume on update if volume attribute is supplied", () => {
            const { element } = nodeFactory(ctx, { volume: 0.2 });
            expect(element.volume).toBe(undefined /* because our mock has no volume attr */);

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.volume).toBe(0.2);
        });
    });

    describe("other attributes", () => {
        it("should set generic attributes on node when update loop is run", () => {
            const { element } = nodeFactory(ctx, { asdf: "great!" });
            expect(element.asdf).toBe(undefined /* because our mock has no asdf attr */);

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.asdf).toBe("great!");
            expect(element.notasdf).toBe(undefined);
        });
    });

    describe("durationchange", () => {
        /*
         * an element mock which reports itself as ready for playback
         * (readyState 4 = HAVE_ENOUGH_DATA) so the node's load polling completes
         */
        const readyElementFactory = (duration = 5) => ({
            play: jest.fn(),
            pause: jest.fn(),
            readyState: 4,
            seeking: false,
            duration,
            currentTime: 0
        });

        it("should fire durationchange exactly once when the duration is derived from the element", () => {
            const element = readyElementFactory(5);
            const node = ctx.video(element);
            node.start(0);
            const durationChangeSpy = jest.fn();
            node.registerCallback("durationchange", durationChangeSpy);

            ctx.update(1 / 60);
            ctx.update(1 / 60);
            ctx.update(1 / 60);

            expect(durationChangeSpy).toHaveBeenCalledTimes(1);
            expect(node.stopTime).toBe(5);
        });

        it("should not fire durationchange every frame for an endless source", () => {
            const element = readyElementFactory(Infinity);
            const node = ctx.video(element);
            node.start(0);
            const durationChangeSpy = jest.fn();
            node.registerCallback("durationchange", durationChangeSpy);

            ctx.update(1 / 60);
            ctx.update(1 / 60);
            ctx.update(1 / 60);

            expect(durationChangeSpy).not.toHaveBeenCalled();
            expect(node.stopTime).toBe(Infinity);
        });
    });

    describe("unload behaviour", () => {
        const readyElementFactory = (duration = 30) => ({
            play: jest.fn(),
            pause: jest.fn(),
            readyState: 4,
            seeking: false,
            duration,
            currentTime: 0
        });

        it("should clear the element error handler when the node is destroyed", () => {
            const { element, node } = nodeFactory(ctx);
            ctx.update(1);
            expect(typeof element.onerror).toBe("function");

            node.destroy();

            expect(element.onerror).toBeFalsy();
        });

        it("should unload once when a paused node passes its stop time", () => {
            const element = readyElementFactory();
            const node = ctx.video(element);
            node.start(0);
            node.stop(10);
            const destroySpy = jest.fn();
            node.registerCallback("destroy", destroySpy);

            ctx.play();
            ctx.update(1); // node is now playing
            node._pause();
            node._update(1); // paused: element paused, no longer marked as playing
            node._update(11); // past the stop time: node ends and must unload
            node._update(12); // ...but only unload once

            expect(destroySpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("currentTime on provided element", () => {
        it("element.currentTime should equal ctx.currentTime be zero after load if no sourceOffset is given", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: undefined });

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.currentTime).toBe(0);
        });

        it("element.currentTime should equal ctx.currentTime plus offset if sourceOffset is given", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: 2 });

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);

            expect(element.currentTime).toBe(2);
        });

        it("element.currentTime not set on each update", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: 2 });

            // We want to trigger a load so that the node attributes will be applied to
            // the video element.
            // advance timeline 1s to do this
            ctx.update(1);
            ctx.update(2);
            ctx.update(3);
            ctx.update(4);

            expect(element._currentTimeSetter).toHaveBeenCalledTimes(1);
        });
    });

    describe("playbackRate", () => {
        const rateElementFactory = () => {
            const element = makeReadyElement();
            element._playbackRateSetter = jest.fn();
            let rate;
            Object.defineProperty(element, "playbackRate", {
                get: () => rate,
                set: v => {
                    rate = v;
                    element._playbackRateSetter(v);
                }
            });
            return element;
        };

        it("applies the node playback rate to the element when playing", () => {
            const element = rateElementFactory();
            const node = ctx.video(element);
            node.start(0);
            node.playbackRate = 2;

            ctx.play();
            ctx.update(1);

            expect(node.playbackRate).toBe(2);
            expect(element.playbackRate).toBe(2);
        });

        it("re-applies the rate only when it changes, not on every frame", () => {
            const element = rateElementFactory();
            const node = ctx.video(element);
            node.start(0);

            ctx.play();
            ctx.update(1);
            ctx.update(1);
            ctx.update(1);
            expect(element._playbackRateSetter).toHaveBeenCalledTimes(1);

            node.playbackRate = 0.5;
            ctx.update(1);

            expect(element.playbackRate).toBe(0.5);
            expect(element._playbackRateSetter).toHaveBeenCalledTimes(2);
        });
    });

    describe("stretchPaused", () => {
        it("pauses the element while stretch-paused and resumes it when released", () => {
            const element = makeReadyElement();
            const node = ctx.video(element);
            node.start(0);
            ctx.play();
            ctx.update(1);
            expect(element.play).toHaveBeenCalledTimes(1);

            node.stretchPaused = true;
            expect(node.stretchPaused).toBe(true);
            expect(element.pause).toHaveBeenCalledTimes(1);

            node.stretchPaused = false;
            expect(element.play).toHaveBeenCalledTimes(2);
        });

        it("does not leave the element playing when playback starts stretch-paused", () => {
            const element = makeReadyElement();
            const node = ctx.video(element);
            node.start(0);
            node.stretchPaused = true;

            ctx.play();
            ctx.update(1);

            // the element must end up paused: the last pause comes after the last play
            const lastPlay = Math.max(...element.play.mock.invocationCallOrder);
            const lastPause = Math.max(...element.pause.mock.invocationCallOrder);
            expect(element.play).toHaveBeenCalled();
            expect(lastPause).toBeGreaterThan(lastPlay);
        });
    });

    describe("buffering", () => {
        it("is not buffering before an element exists", () => {
            const node = ctx.video("http://example.com/video.mp4");

            expect(node._buffering).toBe(false);
        });

        it("reports not ready while the element lacks buffered future data", () => {
            const element = makeReadyElement();
            const node = ctx.video(element);
            node.start(0);
            ctx.update(1);
            expect(node._isReady()).toBe(true);

            // network stall: readyState drops below HAVE_FUTURE_DATA
            element.readyState = 1;

            expect(node._buffering).toBe(true);
            expect(node._isReady()).toBe(false);
        });
    });

    describe("loop", () => {
        it("keeps a looping source endless instead of stopping at the element duration", () => {
            const element = makeReadyElement(5);
            const node = ctx.video(element, 0, 4, { loop: true });
            node.start(0);
            const durationChangeSpy = jest.fn();
            node.registerCallback("durationchange", durationChangeSpy);

            ctx.update(1 / 60);
            ctx.update(1 / 60);

            expect(durationChangeSpy).not.toHaveBeenCalled();
            expect(node.stopTime).toBe(Infinity);
        });
    });

    describe("video element cache", () => {
        it("borrows a pooled element for a URL source and frees it again on unload", () => {
            const canvas = new HTMLCanvasElement(500, 500);
            const cachedCtx = new VideoContext(canvas, undefined, {
                useVideoElementCache: true,
                videoElementCacheSize: 2
            });
            const cache = cachedCtx._videoElementCache;
            // jsdom does not implement media playback; stub the element methods the node drives
            for (const item of cache._cacheItems) {
                item.element.play = jest.fn(() => Promise.resolve());
                item.element.pause = jest.fn();
                item.element.load = jest.fn();
            }
            const node = cachedCtx.video("http://example.com/video.mp4");
            node.start(0);
            expect(cache.unused).toBe(2);

            cachedCtx.update(1);

            expect(node.element).toBe(cache._cacheItems[0].element);
            expect(cache.unused).toBe(1);

            node.clearTimelineState();

            expect(node.element).toBeUndefined();
            expect(cache.unused).toBe(2);
        });
    });

    describe("URL sources", () => {
        it("creates a video element configured for inline cross-origin playback", () => {
            const node = ctx.video("http://example.com/video.mp4");
            // sequence the node inside the preload window so it loads without playing
            node.startAt(3);
            ctx.update(1);

            const element = node.element;
            expect(element.tagName).toBe("VIDEO");
            expect(element.getAttribute("crossorigin")).toBe("anonymous");
            expect(element.hasAttribute("playsinline")).toBe(true);
            expect(element.preload).toBe("auto");
            expect(element.src).toBe("http://example.com/video.mp4");
        });

        it("attaches a MediaStream source via srcObject", () => {
            window.MediaStream = class MediaStream {};
            try {
                const stream = new window.MediaStream();
                const node = ctx.video(stream);
                node.startAt(3);
                ctx.update(1);

                expect(node.element.srcObject).toBe(stream);
            } finally {
                delete window.MediaStream;
            }
        });
    });

    describe("error handling", () => {
        it("enters the error state but stays ready so the graph keeps rendering", () => {
            const { element, node } = nodeFactory(ctx);
            const errorSpy = jest.fn();
            node.registerCallback("error", errorSpy);
            ctx.update(1); // load attaches the element error handler

            const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
            element.onerror();
            debugSpy.mockRestore();

            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(node.state).toBe(SOURCENODESTATE.error);
            expect(node._isReady()).toBe(true);
        });
    });

    describe("ended element", () => {
        it("ends the node when the element reports ended", () => {
            const element = makeReadyElement();
            const node = ctx.video(element);
            node.start(0);
            node.stop(10);
            const endedSpy = jest.fn();
            node.registerCallback("ended", endedSpy);

            ctx.update(1);
            element.ended = true;
            ctx.update(1);

            expect(endedSpy).toHaveBeenCalledTimes(1);
            expect(node.state).toBe(SOURCENODESTATE.ended);
            expect(element.pause).toHaveBeenCalled();
        });
    });

    describe("seek", () => {
        it("moves the element to the seeked time including the source offset", () => {
            const { element } = nodeFactory(ctx, {}, { sourceOffset: 2 });
            ctx.update(1);
            expect(element.currentTime).toBe(2);

            ctx.currentTime = 3;

            expect(element.currentTime).toBe(5); // 3s into the timeline + 2s source offset
        });

        it("unloads a node seeked back before its start", () => {
            const element = makeReadyElement();
            const node = ctx.video(element);
            node.startAt(5);
            node.stopAt(10);
            const destroySpy = jest.fn();
            node.registerCallback("destroy", destroySpy);

            ctx.play();
            ctx.update(6); // node is now playing
            expect(node.state).toBe(SOURCENODESTATE.playing);

            ctx.currentTime = 1; // seek back before the node's start time

            expect(destroySpy).toHaveBeenCalledTimes(1);
            expect(node.state).toBe(SOURCENODESTATE.sequenced);
        });
    });
});
