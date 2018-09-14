precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (v_texCoord[1] > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
