import ProcessingNode from "../processingnode";

class CompositingNode extends ProcessingNode{
    constructor(gl, renderGraph, definition){
        super(gl, renderGraph, definition);

    }
    _render(){
        let gl = this._gl;        
        let _this = this;

        this.inputs.forEach(function(node){
            super._render();

            //map the input textures input the node
            var texture = node._texture;
            let textureOffset = 0;

            for(let mapping of _this._inputTextureUnitMapping ){
                gl.activeTexture(mapping.textureUnit);
                let textureLocation = gl.getUniformLocation(_this._program, mapping.name);
                gl.uniform1i(textureLocation, this._parameterTextureCount + textureOffset);
                textureOffset += 1;
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }
}


export default CompositingNode;