precision mediump float;
uniform sampler2D u_image;
uniform vec3 inputMix;
uniform vec3 outputMix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];
    color[0] = mono * outputMix[0];
    color[1] = mono * outputMix[1];
    color[2] = mono * outputMix[2];
    gl_FragColor = color;
}
