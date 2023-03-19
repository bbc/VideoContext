import vertexShader from "./dreamfade.vert";
import fragmentShader from "./dreamfade.frag";

let dreamfade = {
    title: "Dream-Fade",
    description: "A wobbly dream effect. Typically used as a transistion.",
    vertexShader,
    fragmentShader,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

export default dreamfade;
