//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "./processingnode.js";
import { createElementTexture } from "../utils.js";
import type RenderGraph from "../rendergraph.js";
import type { IDefinition } from "../types.js";

const TYPE = "CompositingNode";

class CompositingNode extends ProcessingNode {
    _placeholderTexture: WebGLTexture;

    /**
     * Initialise an instance of a CompositingNode. You should not instantiate this directly, but use VideoContext.compositor().
     */
    constructor(gl: WebGLRenderingContext, renderGraph: RenderGraph, definition: IDefinition) {
        const placeholderTexture = createElementTexture(gl);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])
        );
        super(gl, renderGraph, definition, definition.inputs, false);
        this._placeholderTexture = placeholderTexture;
        this._displayName = TYPE;
    }

    _render(): void {
        const gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this._texture as WebGLTexture,
            0
        );
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        this.inputs.forEach(node => {
            if (node === undefined) return;
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

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

export { TYPE as COMPOSITINGTYPE };

export default CompositingNode;
