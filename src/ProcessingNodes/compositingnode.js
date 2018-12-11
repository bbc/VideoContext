//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "./processingnode";
import { createElementTexture } from "../utils.js";

const TYPE = "CompositingNode";

class CompositingNode extends ProcessingNode {
    /**
     * Initialise an instance of a Compositing Node. You should not instantiate this directly, but use VideoContest.createCompositingNode().
     */
    constructor(gl, renderGraph, definition) {
        let placeholderTexture = createElementTexture(gl);
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

    _render() {
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this._texture,
            0
        );
        gl.clearColor(0, 0, 0, 0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (this.inputs.length == 1) {
            // If there is only 1 input, set the blendFunc to prioritise the SRC rgba values to ensure
            // there is no blending of the background clearColor to a transparent SRC image i.e. no 'bleeding' of background color into transparency
            gl.blendFunc(gl.ONE, gl.ZERO);
        } else {
            // If there is more than 1 input, set the blendFunc to blend the RGB separately from A
            // We blend separately because as you stack layers in a CompositingNode, we don't want to interpolate alpha
            // (i.e. we don't want a mid-point or a weighted average of the alpha channels)
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }

        this.inputs.forEach(node => {
            if (node === undefined) return;
            super._render();

            //map the input textures input the node
            var texture = node._texture;
            let textureOffset = 0;

            for (let mapping of this._inputTextureUnitMapping) {
                gl.activeTexture(mapping.textureUnit);
                let textureLocation = gl.getUniformLocation(this._program, mapping.name);
                gl.uniform1i(textureLocation, this._parameterTextureCount + textureOffset);
                textureOffset += 1;
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

export { TYPE as COMPOSITINGTYPE };

export default CompositingNode;
