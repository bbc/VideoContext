let aaf_video_flop = {
    "title":"AAF Video Flop Effect",
    "description": "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
    "vertexShader" : "\
            attribute vec2 a_position;\
            attribute vec2 a_texCoord;\
            varying vec2 v_texCoord;\
            void main() {\
                gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                v_texCoord = a_texCoord;\
            }",
    "fragmentShader" : "\
            precision mediump float;\
            uniform sampler2D u_image;\
            varying vec2 v_texCoord;\
            void main(){\
                vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);\
                vec4 color = texture2D(u_image, coord);\
                gl_FragColor = color;\
            }",
    "properties":{
    },
    "inputs":["u_image"]
};

export default aaf_video_flop;