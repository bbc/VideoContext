import vertexShader from "./staticDissolve.vert";
import fragmentShader from "./staticDissolve.frag";

let staticDissolve = {
    title: "Static Dissolve",
    description: "A static dissolve effect. Typically used as a transistion.",
    vertexShader,
    fragmentShader,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

export default staticDissolve;
