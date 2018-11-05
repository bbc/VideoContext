precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    gl_FragColor = texture2D(u_image, v_texCoord);
}
