precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
void main(){
    vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);
    vec4 color = texture2D(u_image, coord);
    gl_FragColor = color;
}
