let crop = {
    title: "Primer Simple Crop",
    description: "A simple crop processors for primer",
    vertexShader:
        "\
        attribute vec2 a_position;\
        attribute vec2 a_texCoord;\
        varying vec2 v_texCoord;\
        void main() {\
            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
            v_texCoord = a_texCoord;\
        }",
    fragmentShader:
        "\
        precision mediump float;\
        uniform sampler2D u_image;\
        uniform float x;\
        uniform float y;\
        uniform float width;\
        uniform float height;\
        varying vec2 v_texCoord;\
        varying float v_progress;\
        void main(){\
            vec2 pos = (((v_texCoord)*vec2(width, height)) + vec2(0, 1.0-height)) +vec2(x,-y);\
            vec4 color = texture2D(u_image, pos);\
            if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
                color = vec4(0.0,0.0,0.0,0.0);\
            }\
            gl_FragColor = color;\
        }",
    properties: {
        x: { type: "uniform", value: 0.0 },
        y: { type: "uniform", value: 0.0 },
        width: { type: "uniform", value: 1.0 },
        height: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

export default crop;
