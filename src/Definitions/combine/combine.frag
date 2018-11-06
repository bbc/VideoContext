precision mediump float;
uniform sampler2D u_image;
uniform float a;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = color;
}
