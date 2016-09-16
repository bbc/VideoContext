let aaf_video_scale =  {
    "title":"AAF Video Scale Effect",
    "description": "A scale effect based on the AAF spec.",
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
        uniform float scaleX;\
        uniform float scaleY;\
        varying vec2 v_texCoord;\
        varying float v_progress;\
        void main(){\
            vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));\
                vec4 color = texture2D(u_image, pos);\
                if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
                    color = vec4(0.0,0.0,0.0,0.0);\
                }\
                gl_FragColor = color;\
            }",
    "properties":{
        "scaleX":{"type":"uniform", "value":1.0},
        "scaleY":{"type":"uniform", "value":1.0}
    },
    "inputs":["u_image"]
};

export default aaf_video_scale;