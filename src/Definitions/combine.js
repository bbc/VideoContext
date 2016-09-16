let combine = {
    "title":"Combine",
    "description": "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
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
            varying vec2 v_texCoord;\
            varying float v_mix;\
            void main(){\
                vec4 color = texture2D(u_image, v_texCoord);\
                gl_FragColor = color;\
            }",
    "properties":{
        "a":{"type":"uniform", "value":0.0}
    },
    "inputs":["u_image"]
};

export default combine;