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

        // Set the initial blend function to 'proiritize' the SRC so that the background
        // clearColor doesn't bleed / blend into output
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ZERO);

        this.inputs.forEach(node => {
            if (node === undefined) return;
            super._render();

            //map the input textures input the node
            var texture = node._texture;

            for (let mapping of this._shaderInputsTextureUnitMapping) {
                gl.activeTexture(mapping.textureUnit);
                gl.uniform1i(mapping.location, mapping.textureUnitIndex);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // Update the blend function to allow for 'default' blend of transparency
            // of the next inputs of the node
            gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA
            );
            // We blend RGB and Alpha separately because as you stack layers in a CompositionNode, we don’t want to interpolate alpha
            // (i.e. we don’t want a mid-point or a weighted average of the alpha channels)
            // Transparent things in real life don’t blend. The colors blend, but the opacity gets monotonically more opaque as things pile up
            // (i.e. stack two transparent gels and the result is more opaque than either one individually)
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

export { TYPE as COMPOSITINGTYPE };

export default CompositingNode;
