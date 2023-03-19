import vertexShader from "./monochrome.vert";
import fragmentShader from "./monochrome.frag";

let monochrome = {
    title: "Monochrome",
    description:
        "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
    vertexShader,
    fragmentShader,
    properties: {
        inputMix: { type: "uniform", value: [0.4, 0.6, 0.2] },
        outputMix: { type: "uniform", value: [1.0, 1.0, 1.0] }
    },
    inputs: ["u_image"]
};

export default monochrome;
