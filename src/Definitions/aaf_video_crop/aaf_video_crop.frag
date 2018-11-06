precision mediump float;
uniform sampler2D u_image;
uniform float cropLeft;
uniform float cropRight;
uniform float cropTop;
uniform float cropBottom;
varying vec2 v_texCoord;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    gl_FragColor = color;
}
