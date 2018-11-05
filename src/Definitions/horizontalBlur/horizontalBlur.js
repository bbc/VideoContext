import vertexShader from "./horizontalBlur.vert";
import fragmentShader from "./horizontalBlur.frag";

let horizontal_blur = {
    title: "Horizontal Blur",
    description:
        "A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
    vertexShader,
    fragmentShader,
    properties: {
        blurAmount: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

export default horizontal_blur;
