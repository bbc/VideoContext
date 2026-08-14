import * as utils from "../../src/utils";
import SourceNode from "../../src/SourceNodes/sourcenode";
import RenderGraph from "../../src/rendergraph";
import sinon from "sinon";
import "webgl-mock";

global.window = {}; // eslint-disable-line

let mockGLContext;

const PAUSED_STATE = 3;
const ELEMENT = { mock: "videoElement" };
const mockRenderGraph = {};

beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    mockGLContext = canvas.getContext("webgl");
});

describe("_update", () => {
    test("updatesTexture if currentTime is changed and ctx is PAUSED and node is ready", () => {
        const updateTextureSpy = sinon.spy(utils, "updateTexture");
        const currentTime = 0;
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, currentTime);

        node.startAt(currentTime);

        // force into paused state
        node._state = PAUSED_STATE;
        expect(node.state).toEqual(PAUSED_STATE);

        // force to be ready
        node._ready = true;

        // Expect updateTexture to not be called at this point
        expect(updateTextureSpy.calledOnce).toBeFalsy();

        // force an update
        node._update(currentTime + 1);

        // Expect updateTexture to be called after update
        expect(updateTextureSpy.calledOnce).toBeTruthy();
    });
});

describe("_seek", () => {
    test("updates the node's clock even in the waiting state so start() offsets are computed from the seeked time", () => {
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, 0);

        // seek while the node is still waiting (start() not yet called)
        node._seek(10);

        // start 5 seconds after the current (seeked) time
        node.start(5);

        expect(node.startTime).toBe(15);
    });
});

describe("destroy", () => {
    test("a destroyed node refuses to be re-sequenced by start()/startAt()", () => {
        const renderGraph = new RenderGraph();
        const node = new SourceNode(ELEMENT, mockGLContext, renderGraph, 0);

        node.destroy();

        expect(node.start(0)).toBe(false);
        expect(node.startAt(0)).toBe(false);
        expect(node.state).toBe(0); // still waiting, not sequenced
    });
});
