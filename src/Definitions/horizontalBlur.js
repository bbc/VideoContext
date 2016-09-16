let horizontal_blur = {
    "title":"Horizontal Blur",
    "description": "A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
    "vertexShader" : "\
        attribute vec2 a_position;\
        attribute vec2 a_texCoord;\
        uniform float blurAmount;\
        varying vec2 v_texCoord;\
        varying vec2 v_blurTexCoords[14];\
        void main() {\
            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
            v_texCoord = a_texCoord;\
            v_blurTexCoords[ 0] = v_texCoord + vec2(-0.028 * blurAmount, 0.0);\
            v_blurTexCoords[ 1] = v_texCoord + vec2(-0.024 * blurAmount, 0.0);\
            v_blurTexCoords[ 2] = v_texCoord + vec2(-0.020 * blurAmount, 0.0);\
            v_blurTexCoords[ 3] = v_texCoord + vec2(-0.016 * blurAmount, 0.0);\
            v_blurTexCoords[ 4] = v_texCoord + vec2(-0.012 * blurAmount, 0.0);\
            v_blurTexCoords[ 5] = v_texCoord + vec2(-0.008 * blurAmount, 0.0);\
            v_blurTexCoords[ 6] = v_texCoord + vec2(-0.004 * blurAmount, 0.0);\
            v_blurTexCoords[ 7] = v_texCoord + vec2( 0.004 * blurAmount, 0.0);\
            v_blurTexCoords[ 8] = v_texCoord + vec2( 0.008 * blurAmount, 0.0);\
            v_blurTexCoords[ 9] = v_texCoord + vec2( 0.012 * blurAmount, 0.0);\
            v_blurTexCoords[10] = v_texCoord + vec2( 0.016 * blurAmount, 0.0);\
            v_blurTexCoords[11] = v_texCoord + vec2( 0.020 * blurAmount, 0.0);\
            v_blurTexCoords[12] = v_texCoord + vec2( 0.024 * blurAmount, 0.0);\
            v_blurTexCoords[13] = v_texCoord + vec2( 0.028 * blurAmount, 0.0);\
        }",
    "fragmentShader" : "\
        precision mediump float;\
        uniform sampler2D u_image;\
        varying vec2 v_texCoord;\
        varying vec2 v_blurTexCoords[14];\
        void main(){\
            gl_FragColor = vec4(0.0);\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\
            gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\
            gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\
        }",
    "properties":{
        "blurAmount":{"type":"uniform", "value":1.0}
    },
    "inputs":["u_image"]
};

export default horizontal_blur;