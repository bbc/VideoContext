//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "./processingnode";
import { createElementTexutre } from "../utils.js";

export default class EffectNode extends ProcessingNode{
    /**
    * Initialise an instance of an EffectNode. You should not instantiate this directly, but use VideoContest.createEffectNode().
    */
    constructor(gl, renderGraph, definition){
        let placeholderTexture = createElementTexutre(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));

        super(gl, renderGraph, definition, definition.inputs, true);
        
        this._placeholderTexture = placeholderTexture;
    }
    
    _render(){
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture,0);
        gl.clearColor(0, 0, 0, 0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);

        super._render();

        let inputs = this._renderGraph.getInputsForNode(this);
        let textureOffset = 0;

        for (var i = 0; i < this._inputTextureUnitMapping.length; i++) {
            let inputTexture = this._placeholderTexture; 
            let textureUnit = this._inputTextureUnitMapping[i].textureUnit;
            let textureName = this._inputTextureUnitMapping[i].name;
            if (i < inputs.length && inputs[i] !== undefined){
                inputTexture = inputs[i]._texture;
            }

            gl.activeTexture(textureUnit);
            let textureLocation = gl.getUniformLocation(this._program, textureName);
            gl.uniform1i(textureLocation, this._parameterTextureCount + textureOffset);
            textureOffset += 1;
            gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
