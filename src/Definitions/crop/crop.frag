precision mediump float;
uniform sampler2D u_image;
uniform float x;
uniform float y;
uniform float width;
uniform float height;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = (((v_texCoord)*vec2(width, height)) + vec2(0, 1.0-height)) +vec2(x,-y);
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
