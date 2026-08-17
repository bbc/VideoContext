import * as utils from "../../src/utils";
import ImageNode, { IMAGETYPE } from "../../src/SourceNodes/imagenode";
import { CANVASTYPE } from "../../src/SourceNodes/canvasnode";
import RenderGraph from "../../src/rendergraph";
import sinon from "sinon";
import "webgl-mock";

let mockGLContext, renderGraph;

const PLAYING_STATE = 2;

beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    mockGLContext = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
});

afterEach(() => {
    sinon.restore();
});

describe("IMAGETYPE", () => {
    test(`should be "ImageNode" and distinct from CANVASTYPE`, () => {
        const node = new ImageNode({ complete: true }, mockGLContext, renderGraph, 0);

        expect(IMAGETYPE).toBe("ImageNode");
        expect(IMAGETYPE).not.toBe(CANVASTYPE);
        expect(node.displayName).toBe("ImageNode");
    });
});

describe("_load", () => {
    test("should not throw for a node created from a user-supplied element", () => {
        const element = { complete: true };
        const node = new ImageNode(element, mockGLContext, renderGraph, 0);

        expect(() => node._load()).not.toThrow();
    });

    test("should mark a node created from a complete user-supplied element as ready", () => {
        const element = { complete: true };
        const node = new ImageNode(element, mockGLContext, renderGraph, 0);

        node._load();

        expect(node._isReady()).toBe(true);
    });
});

describe("_update", () => {
    test("uploads a static image texture once, not on every frame", () => {
        const updateTextureSpy = sinon.spy(utils, "updateTexture");
        const element = { complete: true };
        const node = new ImageNode(element, mockGLContext, renderGraph, 0);

        node.startAt(0);
        node._ready = true;

        node._update(0.1);
        expect(node.state).toBe(PLAYING_STATE);
        node._update(0.2);
        node._update(0.3);

        expect(updateTextureSpy.callCount).toBe(1);
    });

    test("re-uploads the texture after a seek cleared it", () => {
        const updateTextureSpy = sinon.spy(utils, "updateTexture");
        const element = { complete: true };
        const node = new ImageNode(element, mockGLContext, renderGraph, 1);

        node.startAt(1);
        node._ready = true;

        node._update(1.5);
        expect(updateTextureSpy.callCount).toBe(1);

        // seeking before the start time clears the texture
        node._seek(0);
        // seeking back into the playback range must re-upload it
        node._seek(1.5);
        node._update(1.6);

        expect(updateTextureSpy.callCount).toBe(2);
    });
});
