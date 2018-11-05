precision mediump float;
uniform sampler2D u_image;
uniform float a;
uniform vec3 colorAlphaThreshold;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
