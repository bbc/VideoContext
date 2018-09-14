import vertexShader from "./toColorAndBackFade.vert";
import fragmentShader from "./toColorAndBackFade.frag";

let toColorAndBackFade = {
    title: "To Color And Back Fade",
    description:
        "A fade to black and back effect. Setting mix to 0.5 is a fully solid color frame. Typically used as a transistion.",
    vertexShader,
    fragmentShader,
    properties: {
        mix: { type: "uniform", value: 0.0 },
        color: { type: "uniform", value: [0.0, 0.0, 0.0, 0.0] }
    },
    inputs: ["u_image_a", "u_image_b"]
};
export default toColorAndBackFade;
