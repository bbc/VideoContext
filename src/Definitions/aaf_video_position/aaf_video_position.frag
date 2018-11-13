precision mediump float;
uniform sampler2D u_image;
uniform float positionOffsetX;
uniform float positionOffsetY;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = vec2(v_texCoord[0] - positionOffsetX/2.0, v_texCoord[1] -  positionOffsetY/2.0);
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
