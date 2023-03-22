import vertexShader from "./colorThreshold.vert";
import fragmentShader from "./colorThreshold.frag";

let colorThreshold = {
    title: "Color Threshold",
    description: "Turns all pixels with a greater value than the specified threshold transparent.",
    vertexShader,
    fragmentShader,
    properties: {
        a: { type: "uniform", value: 0.0 },
        colorAlphaThreshold: { type: "uniform", value: [0.0, 0.55, 0.0] }
    },
    inputs: ["u_image"]
};

export default colorThreshold;
