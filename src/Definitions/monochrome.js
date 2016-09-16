let monochrome = {
    "title":"Monochrome",
    "description": "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
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
            uniform vec3 inputMix;\
            uniform vec3 outputMix;\
            varying vec2 v_texCoord;\
            varying float v_mix;\
            void main(){\
                vec4 color = texture2D(u_image, v_texCoord);\
                float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];\
                color[0] = mono * outputMix[0];\
                color[1] = mono * outputMix[1];\
                color[2] = mono * outputMix[2];\
                gl_FragColor = color;\
            }",
    "properties":{
        "inputMix":{"type":"uniform", "value":[0.4,0.6,0.2]},
        "outputMix":{"type":"uniform", "value":[1.0,1.0,1.0]}
    },
    "inputs":["u_image"]
};

export default monochrome;