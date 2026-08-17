// utils must be imported before ProcessingNode to avoid the
// processingnode -> utils -> destinationnode -> processingnode require cycle
import "../../src/utils";
import ProcessingNode from "../../src/ProcessingNodes/processingnode";
import RenderGraph from "../../src/rendergraph";
import sinon from "sinon";
import "webgl-mock";

const vertexShader =
    "attribute vec2 a_position; attribute vec2 a_texCoord; varying vec2 v_texCoord;" +
    "void main() { gl_Position = vec4(a_position, 0.0, 1.0); v_texCoord = a_texCoord; }";
const fragmentShader =
    "precision mediump float; uniform sampler2D u_image; uniform sampler2D u_over; varying vec2 v_texCoord;" +
    "void main(){ gl_FragColor = texture2D(u_image, v_texCoord); }";

let gl, renderGraph;

const imagePropertyDefinition = () => ({
    vertexShader,
    fragmentShader,
    properties: {
        u_over: { type: "uniform", value: new Image() }
    },
    inputs: ["u_image"]
});

beforeEach(() => {
    const canvas = new HTMLCanvasElement(500, 500);
    gl = canvas.getContext("webgl");
    renderGraph = new RenderGraph();
});

afterEach(() => {
    sinon.restore();
});

describe("_render", () => {
    test("binds an Image-valued property's sampler to its 0-based texture unit index, not the TEXTURE0 enum", () => {
        const definition = imagePropertyDefinition();
        const node = new ProcessingNode(gl, renderGraph, definition, definition.inputs, true);
        const uniform1iSpy = sinon.spy(gl, "uniform1i");

        node._render();

        const imageProperty = node._properties["u_over"];
        const sentValues = uniform1iSpy.args.map(args => args[1]);

        expect(sentValues).toContain(imageProperty.textureUnitIndex);
        expect(sentValues).not.toContain(gl.TEXTURE0);
    });
});

describe("destroy", () => {
    test("deletes both the property texture and the node's main output texture", () => {
        const definition = imagePropertyDefinition();
        const node = new ProcessingNode(gl, renderGraph, definition, definition.inputs, true);
        const mainTexture = node._texture;
        const propertyTexture = node._properties["u_over"].texture;
        const deleteTextureSpy = sinon.spy(gl, "deleteTexture");

        node.destroy();

        const deleted = deleteTextureSpy.args.map(args => args[0]);
        expect(deleted).toContain(propertyTexture);
        expect(deleted).toContain(mainTexture);
    });

    test("deletes the vertex buffer created in the constructor", () => {
        const definition = imagePropertyDefinition();
        const node = new ProcessingNode(gl, renderGraph, definition, definition.inputs, true);
        const deleteBufferSpy = sinon.spy(gl, "deleteBuffer");

        node.destroy();

        expect(deleteBufferSpy.callCount).toBe(1);
    });
});
