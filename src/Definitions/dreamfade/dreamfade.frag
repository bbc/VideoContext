precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    float wobble = 1.0 - abs((mix*2.0)-1.0);
    vec2 pos = vec2(v_texCoord[0] + ((sin(v_texCoord[1]*(10.0*wobble*3.14) + wobble*10.0)/13.0)), v_texCoord[1]);
    vec4 color_a = texture2D(u_image_a, pos);
    vec4 color_b = texture2D(u_image_b, pos);
    color_a[0] *= (1.0 - mix);
    color_a[1] *= (1.0 - mix);
    color_a[2] *= (1.0 - mix);
    color_a[3] *= (1.0 - mix);
    color_b[0] *= mix;
    color_b[1] *= mix;
    color_b[2] *= mix;
    color_b[3] *= mix;
    gl_FragColor = color_a + color_b;
}
