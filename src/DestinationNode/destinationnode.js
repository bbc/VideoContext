//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "../ProcessingNodes/processingnode";
import fragmentShader from "./destinationnode.frag";
import vertexShader from "./destinationnode.vert";

const TYPE = "DestinationNode";

class DestinationNode extends ProcessingNode {
    /**
     * Initialise an instance of a DestinationNode.
     *
     * There should only be a single instance of a DestinationNode per VideoContext instance. An VideoContext's destination can be accessed like so: videoContext.desitnation.
     *
     * You should not instantiate this directly.
     */
    constructor(gl, renderGraph) {
        let deffinition = {
            fragmentShader,
            vertexShader,
            properties: {},
            inputs: ["u_image"]
        };

        super(gl, renderGraph, deffinition, deffinition.inputs, false);
        this._displayName = TYPE;
    }

    _render() {
        let gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0.0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Set the initial blend function to 'proiritize' the SRC so that the background
        // clearColor doesn't bleed / blend into output
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ZERO);

        this.inputs.forEach(node => {
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

            // Update the blend function to allow for 'default' blend of transparency
            // of the next inputs of the node
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        });
    }
}

export { TYPE as DESTINATIONTYPE };

export default DestinationNode;
