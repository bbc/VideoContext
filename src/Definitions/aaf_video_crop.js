let aaf_video_crop = {
    "title":"AAF Video Crop Effect",
    "description": "A crop effect based on the AAF spec.",
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
            uniform float cropLeft;\
            uniform float cropRight;\
            uniform float cropTop;\
            uniform float cropBottom;\
            varying vec2 v_texCoord;\
            void main(){\
                vec4 color = texture2D(u_image, v_texCoord);\
                if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                gl_FragColor = color;\
            }",
    "properties":{
        "cropLeft":{"type":"uniform", "value":-1.0},
        "cropRight":{"type":"uniform", "value":1.0},
        "cropTop":{"type":"uniform", "value": -1.0},
        "cropBottom":{"type":"uniform", "value": 1.0}
    },
    "inputs":["u_image"]
};

export default aaf_video_crop;