import ProcessingNode from "./processingnode";
import { createElementTexutre } from "../utils.js";

class CompositingNode extends ProcessingNode{
    constructor(gl, renderGraph, definition){
        let placeholderTexture = createElementTexutre(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
        super(gl, renderGraph, definition);
        this._placeholderTexture = placeholderTexture;
    }
    _render(){
        let gl = this._gl;        
        let _this = this;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture,0);
        gl.clearColor(0, 0, 0, 0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.inputs.forEach(function(node){
            super._render();

            //map the input textures input the node
            var texture = node._texture;
            let textureOffset = 0;

            for(let mapping of _this._inputTextureUnitMapping ){
                gl.activeTexture(mapping.textureUnit);
                let textureLocation = gl.getUniformLocation(_this._program, mapping.name);
                gl.uniform1i(textureLocation, _this._parameterTextureCount + textureOffset);
                textureOffset += 1;
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}


export default CompositingNode;