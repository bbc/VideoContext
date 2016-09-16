let starWipe = {
    "title":"Star Wipe Fade",
    "description": "A classic star wipe transistion. Typically used as a transistion.",
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
            float sign (vec2 p1, vec2 p2, vec2 p3){\
                return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);\
            }\
            bool pointInTriangle(vec2 pt, vec2 v1, vec2 v2, vec2 v3){\
                bool b1, b2, b3;\
                b1 = sign(pt, v1, v2) < 0.0;\
                b2 = sign(pt, v2, v3) < 0.0;\
                b3 = sign(pt, v3, v1) < 0.0;\
                return ((b1 == b2) && (b2 == b3));\
            }\
            vec2 rotatePointAboutPoint(vec2 point, vec2 pivot, float angle){\
                float s = sin(angle);\
                float c = cos(angle);\
                float x = point[0] - pivot[0];\
                float y = point[1] - pivot[1];\
                float new_x = x * c - y * s;\
                float new_y = x * s + y * c;\
                return vec2(new_x + pivot[0], new_y+pivot[1]);\
            }\
            \
            void main(){\
                vec4 color_a = texture2D(u_image_a, v_texCoord);\
                vec4 color_b = texture2D(u_image_b, v_texCoord);\
                vec2 t0_p0,t0_p1,t0_p2,t1_p0,t1_p1,t1_p2,t2_p0,t2_p1,t2_p2,t3_p0,t3_p1,t3_p2;\
                vec2 t4_p0,t4_p1,t4_p2,t5_p0,t5_p1,t5_p2,t6_p0,t6_p1,t6_p2,t7_p0,t7_p1,t7_p2;\
                \
                \
                t0_p0 = vec2(0.0, 0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);\
                t0_p1 = vec2(0.0, -0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);\
                t0_p2 = vec2(1.0, 0.0) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);\
                \
                t1_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854);\
                t1_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854);\
                t1_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854);\
                \
                t2_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 2.0);\
                t2_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 2.0);\
                t2_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 2.0);\
                \
                t3_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 3.0);\
                t3_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 3.0);\
                t3_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 3.0);\
                \
                t4_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 4.0);\
                t4_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 4.0);\
                t4_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 4.0);\
                \
                t5_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 5.0);\
                t5_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 5.0);\
                t5_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 5.0);\
                \
                t6_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 6.0);\
                t6_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 6.0);\
                t6_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 6.0);\
                \
                t7_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 7.0);\
                t7_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 7.0);\
                t7_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 7.0);\
                \
                if(mix > 0.99){\
                    gl_FragColor = color_a;\
                    return;\
                }\
                if(mix < 0.01){\
                    gl_FragColor = color_b;\
                    return;\
                }\
                if(pointInTriangle(v_texCoord, t0_p0, t0_p1, t0_p2) || pointInTriangle(v_texCoord, t1_p0, t1_p1, t1_p2) || pointInTriangle(v_texCoord, t2_p0, t2_p1, t2_p2) || pointInTriangle(v_texCoord, t3_p0, t3_p1, t3_p2) || pointInTriangle(v_texCoord, t4_p0, t4_p1, t4_p2) || pointInTriangle(v_texCoord, t5_p0, t5_p1, t5_p2) || pointInTriangle(v_texCoord, t6_p0, t6_p1, t6_p2) || pointInTriangle(v_texCoord, t7_p0, t7_p1, t7_p2)){\
                    gl_FragColor = color_a;\
                } else {\
                    gl_FragColor = color_b;\
                }\
            }",
    "properties":{
        "mix":{"type":"uniform", "value":1.0}
    },
    "inputs":["u_image_a","u_image_b"]
};

export default starWipe;