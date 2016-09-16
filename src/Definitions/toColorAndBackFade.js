let toColorAndBackFade = {
    "title":"To Color And Back Fade",
    "description": "A fade to black and back effect. Setting mix to 0.5 is a fully solid color frame. Typically used as a transistion.",
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
            uniform vec4 color;\
            varying vec2 v_texCoord;\
            varying float v_mix;\
            void main(){\
                vec4 color_a = texture2D(u_image_a, v_texCoord);\
                vec4 color_b = texture2D(u_image_b, v_texCoord);\
                float mix_amount = (mix *2.0) - 1.0;\
                if(mix_amount < 0.0){\
                    gl_FragColor = abs(mix_amount) * color_a + (1.0 - abs(mix_amount)) * color;\
                } else {\
                    gl_FragColor = mix_amount * color_b + (1.0 - mix_amount) * color;\
                }\
            }",
    "properties":{
        "mix":{"type":"uniform", "value":0.0},
        "color":{"type":"uniform", "value":[0.0,0.0,0.0,0.0]}
    },
    "inputs":["u_image_a","u_image_b"]
};
export default toColorAndBackFade;