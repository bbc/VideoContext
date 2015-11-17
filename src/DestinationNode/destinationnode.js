import { createShaderProgram } from "../utils.js";
import { SOURCENODESTATE } from "../SourceNodes/sourcenode";
import GraphNode from "../graphnode";

class DestinationNode extends GraphNode {
    constructor(gl, renderGraph){
        super(gl, renderGraph, undefined);
        
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

        this._program = createShaderProgram(gl, vertexShader, fragmentShader);

        let positionLocation = gl.getAttribLocation(this._program, "a_position");
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 0.0]),
            gl.STATIC_DRAW);
        let texCoordLocation = gl.getAttribLocation(this._program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    }

    _render(){
        let gl = this._gl;        
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let _this = this;
        this.inputs.forEach(function(node){
            if (node.state !== SOURCENODESTATE.playing && node.state !== SOURCENODESTATE.paused) return;
            gl.useProgram(_this._program);
            var texture = node._texture;
            gl.activeTexture(gl.TEXTURE0);
            let textureLocation = gl.getUniformLocation(_this._program, "u_image");
            gl.uniform1i(textureLocation, 0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }
}

export default DestinationNode;
