import vertexShader from "./randomDissolve.vert";
import fragmentShader from "./randomDissolve.frag";

let randomDissolve = {
    title: "Random Dissolve",
    description: "A random dissolve effect. Typically used as a transistion.",
    vertexShader,
    fragmentShader,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

export default randomDissolve;
