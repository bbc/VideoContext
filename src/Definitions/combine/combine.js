import vertexShader from "./combine.vert";
import fragmentShader from "./combine.frag";

let combine = {
    title: "Combine",
    description:
        "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
    vertexShader,
    fragmentShader,
    properties: {
        a: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image"]
};

export default combine;
