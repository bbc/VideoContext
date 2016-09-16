let verticalWipe = {
    "title":"vertical Wipe",
    "description": "A vertical wipe effect. Typically used as a transistion.",
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
            uniform sampler2D u_image_a;\
            uniform sampler2D u_image_b;\
            uniform float mix;\
            varying vec2 v_texCoord;\
            varying float v_mix;\
            void main(){\
                vec4 color_a = texture2D(u_image_a, v_texCoord);\
                vec4 color_b = texture2D(u_image_b, v_texCoord);\
                if (v_texCoord[1] > mix){\
                    gl_FragColor = color_a;\
                } else {\
                    gl_FragColor = color_b;\
                }\
            }",
    "properties":{
        "mix":{"type":"uniform", "value":0.0}
    },
    "inputs":["u_image_a","u_image_b"]
};

export default verticalWipe;