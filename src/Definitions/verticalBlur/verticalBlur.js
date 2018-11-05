import vertexShader from "./verticalBlur.vert";
import fragmentShader from "./verticalBlur.frag";

let verticalBlur = {
    title: "Vertical Blur",
    description:
        "A vertical blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
    vertexShader,
    fragmentShader,
    properties: {
        blurAmount: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

export default verticalBlur;
