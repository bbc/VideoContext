import * as utils from "../../src/utils";
import SourceNode from "../../src/SourceNodes/sourcenode";
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
