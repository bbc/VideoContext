let staticEffect = {
    "title":"Static",
    "description": "A static effect to add pseudo random noise to a video",
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
            uniform float currentTime;\
            uniform float amount;\
            varying vec2 v_texCoord;\
            uniform vec3 weight;\
            float rand(vec2 co, float currentTime){\
               return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);\
            }\
            void main(){\
                vec4 color = texture2D(u_image, v_texCoord);\
                color[0] = color[0] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[0] * amount;\
                color[1] = color[1] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[1] * amount;\
                color[2] = color[2] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[2] *amount;\
                gl_FragColor = color;\
            }",
    "properties":{
        "weight":{"type":"uniform", "value":[1.0,1.0,1.0]},
        "amount":{"type":"uniform", "value":1.0}
    },
    "inputs":["u_image"]
};

export default staticEffect;