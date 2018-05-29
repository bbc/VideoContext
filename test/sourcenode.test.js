import chai from "chai";
import SourceNode from "../src/SourceNodes/sourcenode";
import sinon from "sinon";
import * as utils from "../src/utils";
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
    it("updatesTexture if currentTime is changed and ctx is PAUSED and node is ready", () => {
        const updateTextureSpy = sinon.spy(utils, "updateTexture");

        const currentTime = 0;
        const node = new SourceNode(ELEMENT, mockGLContext, mockRenderGraph, currentTime);

        node.startAt(currentTime);

        // force into paused state
        node._state = PAUSED_STATE;
        chai.assert.equal(node.state, PAUSED_STATE);

        // force to be ready
        node._ready = true;

        chai.assert.isNotTrue(
            updateTextureSpy.calledOnce,
            "expected updateTexture to not be called at this point"
        );

        // force an update
        node._update(currentTime + 1);

        chai.assert.isTrue(
            updateTextureSpy.calledOnce,
            "expected updateTexture to be called after update"
        );
    });
});
