//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "../ProcessingNodes/processingnode.js";
import type RenderGraph from "../rendergraph.js";
import type { IDefinition } from "../types.js";

const vertexShader = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}`;

const fragmentShader = `precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    gl_FragColor = texture2D(u_image, v_texCoord);
}`;

const TYPE = "DestinationNode";

class DestinationNode extends ProcessingNode {
    /**
     * Initialise an instance of a DestinationNode.
     *
     * There should only be a single instance of a DestinationNode per VideoContext instance. A VideoContext's destination can be accessed like so: videoContext.destination.
     *
     * You should not instantiate this directly.
     */
    constructor(gl: WebGLRenderingContext, renderGraph: RenderGraph) {
        const definition: IDefinition = {
            fragmentShader,
            vertexShader,
            properties: {},
            inputs: ["u_image"]
        };

        super(gl, renderGraph, definition, definition.inputs, false);
        this._displayName = TYPE;
    }

    _render(): void {
        const gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.inputs.forEach(node => {
            super._render();
            //map the input textures input the node
            const texture = (node as unknown as { _texture: WebGLTexture })._texture;

            for (const mapping of this._shaderInputsTextureUnitMapping) {
                gl.activeTexture(mapping.textureUnit);
                gl.uniform1i(mapping.location, mapping.textureUnitIndex);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }
}

export { TYPE as DESTINATIONTYPE };

export default DestinationNode;
