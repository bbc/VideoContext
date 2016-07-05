//Matthew Shotton, R&D User Experience,© BBC 2015
import ProcessingNode from "../ProcessingNodes/processingnode";

export default class DestinationNode extends ProcessingNode {
    /**
    * Initialise an instance of a DestinationNode. 
    *
    * There should only be a single instance of a DestinationNode per VideoContext instance. An VideoContext's destination can be accessed like so: videoContext.desitnation.
    * 
    * You should not instantiate this directly.
    */
    constructor(gl, renderGraph){        
  
        let vertexShader = "\
            attribute vec2 a_position;\
            attribute vec2 a_texCoord;\
            varying vec2 v_texCoord;\
            void main() {\
                gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                v_texCoord = a_texCoord;\
            }";

        let fragmentShader = "\
            precision mediump float;\
            uniform sampler2D u_image;\
            varying vec2 v_texCoord;\
            varying float v_progress;\
            void main(){\
                gl_FragColor = texture2D(u_image, v_texCoord);\
            }";

        let deffinition = {fragmentShader:fragmentShader, vertexShader:vertexShader, properties:{}, inputs:["u_image"]};

        super(gl, renderGraph, deffinition, deffinition.inputs, false);
    }

    _render(){
        let gl = this._gl;        

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0.0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.inputs.forEach((node)=>{
            super._render();
            //map the input textures input the node
            var texture = node._texture;
            let textureOffset = 0;

            for(let mapping of this._inputTextureUnitMapping ){
                gl.activeTexture(mapping.textureUnit);
                let textureLocation = gl.getUniformLocation(this._program, mapping.name);
                gl.uniform1i(textureLocation, this._parameterTextureCount + textureOffset);
                textureOffset += 1;
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }
}
