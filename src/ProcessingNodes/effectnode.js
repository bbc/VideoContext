import ProcessingNode from "./processingnode";
import { createElementTexutre } from "../utils.js";

class EffectNode extends ProcessingNode{
    constructor(gl, renderGraph, definition){
        let maxInputs = definition.inputs.length;
        super(gl, renderGraph, definition, maxInputs);
        this._placeholderTexture = createElementTexutre(gl);
    }
    _render(){
        let gl = this._gl;
        super._render();

        let inputs = this.inputs;
        let textureOffset = 0;

        for (var i = 0; i < this._inputTextureUnitMapping.length; i++) {
            let inputTexture = this._placeholderTexture; 
            let textureUnit = this._inputTextureUnitMapping[i].textureUnit;
            let textureName = this._inputTextureUnitMapping[i].name;
            if (i < inputs.length){
                inputTexture = inputs[i]._texture;
                console.log(textureName, textureUnit);
            }else{
                console.debug("VideoContext:Warning - not all inputs to effect node are connected");
            }

            gl.activeTexture(textureUnit);
            let textureLocation = gl.getUniformLocation(this._program, textureName);
            gl.uniform1i(textureLocation, this._parameterTextureCount + textureOffset);
            textureOffset += 1;
            gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}


export default EffectNode;