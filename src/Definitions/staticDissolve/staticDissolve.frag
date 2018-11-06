precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
uniform float currentTime;
varying vec2 v_texCoord;
varying float v_mix;
float rand(vec2 co, float currentTime){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);
}
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (clamp(rand(v_texCoord, currentTime),  0.01, 1.001) > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
