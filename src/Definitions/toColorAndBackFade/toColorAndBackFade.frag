precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
uniform vec4 color;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    float mix_amount = (mix *2.0) - 1.0;
    if(mix_amount < 0.0){
        gl_FragColor = abs(mix_amount) * color_a + (1.0 - abs(mix_amount)) * color;
    } else {
        gl_FragColor = mix_amount * color_b + (1.0 - mix_amount) * color;
    }
}
