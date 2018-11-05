precision mediump float;
uniform sampler2D u_image;
uniform float currentTime;
uniform float amount;
varying vec2 v_texCoord;
uniform vec3 weight;
float rand(vec2 co, float currentTime){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);
}
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[0] = color[0] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[0] * amount;
    color[1] = color[1] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[1] * amount;
    color[2] = color[2] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[2] *amount;
    gl_FragColor = color;
}
