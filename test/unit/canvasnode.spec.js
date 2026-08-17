//import utils before the node under test to avoid the circular-import crash
//(canvasnode → sourcenode → utils → videonode → medianode → sourcenode)
import "../../src/utils";
import CanvasNode, { CANVASTYPE } from "../../src/SourceNodes/canvasnode";
import RenderGraph from "../../src/rendergraph";
import "webgl-mock";

let mockGLContext, renderGraph, canvasElement;

const SEQUENCED_STATE = 1;
const PLAYING_STATE = 2;
const ENDED_STATE = 4;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    mockGLContext = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
    canvasElement = new HTMLCanvasElement(100, 100);
});

describe("CANVASTYPE", () => {
    test(`should be "CanvasNode"`, () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0);

        expect(CANVASTYPE).toBe("CanvasNode");
        expect(node.displayName).toBe("CanvasNode");
    });
});

describe("_load", () => {
    test("marks the node ready and fires the loaded callback", () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0);
        const loadedSpy = jest.fn();
        node.registerCallback("loaded", loadedSpy);

        node._load();

        expect(node._ready).toBe(true);
        expect(loadedSpy).toHaveBeenCalledTimes(1);
    });
});

describe("_update", () => {
    test("loads within the preload window before its start time, not sooner", () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0, 4);
        const loadedSpy = jest.fn();
        node.registerCallback("loaded", loadedSpy);
        node.startAt(5);

        // 4.5s before the start time: outside the 4s preload window
        node._update(0.5);
        expect(loadedSpy).not.toHaveBeenCalled();

        // 3.5s before the start time: inside the window
        node._update(1.5);
        expect(loadedSpy).toHaveBeenCalledTimes(1);
        expect(node.state).toBe(SEQUENCED_STATE);
    });

    test("returns true and plays once the timeline enters its range", () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0);
        node.startAt(0);

        expect(node._update(0.1)).toBe(true);
        expect(node.state).toBe(PLAYING_STATE);
    });

    test("unloads exactly once when playback passes the stop time", () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0);
        const destroySpy = jest.fn();
        node.registerCallback("destroy", destroySpy);
        node.startAt(0);
        node.stopAt(2);

        node._update(1);
        expect(node.state).toBe(PLAYING_STATE);

        // passing the stop time ends the node and unloads it
        expect(node._update(3)).toBe(false);
        expect(node.state).toBe(ENDED_STATE);
        expect(destroySpy).toHaveBeenCalledTimes(1);

        // subsequent updates while ended must not unload again
        node._update(4);
        expect(destroySpy).toHaveBeenCalledTimes(1);
    });
});

describe("_seek", () => {
    test("unloads when seeked back before its start time", () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0);
        const destroySpy = jest.fn();
        node.registerCallback("destroy", destroySpy);
        node.startAt(2);

        node._update(3);
        expect(node._ready).toBe(true);

        node._seek(0);

        expect(destroySpy).toHaveBeenCalledTimes(1);
        expect(node._ready).toBe(false);
        expect(node.state).toBe(SEQUENCED_STATE);
    });

    test("re-loads after an in-range seek cleared readiness", () => {
        const node = new CanvasNode(canvasElement, mockGLContext, renderGraph, 0);
        node.startAt(0);
        node._update(0.5);
        expect(node._ready).toBe(true);

        // an in-range seek must invalidate the current texture...
        node._seek(1);
        expect(node._ready).toBe(false);

        // ...and the next update re-loads it
        node._update(1.1);
        expect(node._ready).toBe(true);
    });
});
