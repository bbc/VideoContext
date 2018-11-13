precision mediump float;
uniform sampler2D u_image;
uniform float opacity;
varying vec2 v_texCoord;
varying float v_opacity;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[3] *= opacity;
    gl_FragColor = color;
}
