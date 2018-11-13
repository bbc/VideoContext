import vertexShader from "./staticEffect.vert";
import fragmentShader from "./staticEffect.frag";

let staticEffect = {
    title: "Static",
    description: "A static effect to add pseudo random noise to a video",
    vertexShader,
    fragmentShader,
    properties: {
        weight: { type: "uniform", value: [1.0, 1.0, 1.0] },
        amount: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

export default staticEffect;
