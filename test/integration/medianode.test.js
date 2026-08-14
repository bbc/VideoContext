import VideoContext from "../../src/videocontext";

let ctx;
require("webgl-mock");

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
});
