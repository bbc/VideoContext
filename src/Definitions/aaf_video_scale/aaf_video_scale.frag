precision mediump float;
uniform sampler2D u_image;
uniform float scaleX;
uniform float scaleY;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
