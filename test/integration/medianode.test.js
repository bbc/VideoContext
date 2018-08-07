import VideoContext from "../../src/videocontext";

let ctx;
require("webgl-mock");

/*
* creates a video node with provided attributes.
* returns: the node instance and the mocked HTMLVideoElement which is controlled by the node
*/
const nodeFactory = (vidCtx, attr = {}) => {
    const element = {
        play: jest.fn(),
        pause: jest.fn()
    };
    const node = vidCtx.video(element, undefined, undefined, attr);
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
});
