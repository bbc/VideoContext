//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "./processingnode.js";
import { createElementTexture } from "../utils.js";
import type RenderGraph from "../rendergraph.js";
import type { IDefinition } from "../types.js";

const TYPE = "EffectNode";

class EffectNode extends ProcessingNode {
    _placeholderTexture: WebGLTexture;

    /**
     * Initialise an instance of an EffectNode. You should not instantiate this directly, but use VideoContext.effect().
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

        super(gl, renderGraph, definition, definition.inputs, true);

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
        gl.blendFunc(gl.ONE, gl.ZERO);

        super._render();

        const inputs = this._renderGraph.getInputsForNode(this);

        for (let i = 0; i < this._shaderInputsTextureUnitMapping.length; i++) {
            let inputTexture = this._placeholderTexture;
            const textureUnit = this._shaderInputsTextureUnitMapping[i].textureUnit;
            const input = inputs[i];
            if (i < inputs.length && input !== undefined) {
                inputTexture = (input as unknown as { _texture: WebGLTexture })._texture;
            }

            gl.activeTexture(textureUnit);
            gl.uniform1i(
                this._shaderInputsTextureUnitMapping[i].location,
                this._shaderInputsTextureUnitMapping[i].textureUnitIndex
            );
            gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

export { TYPE as EFFECTYPE };

export default EffectNode;
