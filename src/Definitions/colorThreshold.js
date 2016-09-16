let colorThreshold = {
    "title":"Color Threshold",
    "description": "Turns all pixels with a greater value than the specified threshold transparent.",
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
            uniform float a;\
            uniform vec3 colorAlphaThreshold;\
            varying vec2 v_texCoord;\
            varying float v_mix;\
            void main(){\
                vec4 color = texture2D(u_image, v_texCoord);\
                if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){\
                    color = vec4(0.0,0.0,0.0,0.0);\
                }\
                gl_FragColor = color;\
            }",
    "properties":{
        "a":{"type":"uniform", "value":0.0},
        "colorAlphaThreshold":{"type":"uniform", "value":[0.0,0.55,0.0]}
    },
    "inputs":["u_image"]
};

export default colorThreshold;