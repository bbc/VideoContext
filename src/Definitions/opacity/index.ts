import type { IDefinition } from "../../types.js";

const vertexShader = `attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}`;

const fragmentShader = `precision mediump float;
uniform sampler2D u_image;
uniform float opacity;
varying vec2 v_texCoord;
varying float v_opacity;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[3] *= opacity;
    gl_FragColor = color;
}`;

const opacity: IDefinition = {
    title: "Opacity",
    description: "Sets the opacity of an input.",
    vertexShader,
    fragmentShader,
    properties: {
        opacity: { type: "uniform", value: 0.7 }
    },
    inputs: ["u_image"]
};

export default opacity;
