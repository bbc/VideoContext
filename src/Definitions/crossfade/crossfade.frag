precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
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
