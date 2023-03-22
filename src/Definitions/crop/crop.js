import vertexShader from "./crop.vert";
import fragmentShader from "./crop.frag";

let crop = {
    title: "Primer Simple Crop",
    description: "A simple crop processors for primer",
    vertexShader,
    fragmentShader,
    properties: {
        x: { type: "uniform", value: 0.0 },
        y: { type: "uniform", value: 0.0 },
        width: { type: "uniform", value: 1.0 },
        height: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

export default crop;
