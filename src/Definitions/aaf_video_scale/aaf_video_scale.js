import vertexShader from "./aaf_video_scale.vert";
import fragmentShader from "./aaf_video_scale.frag";

let aaf_video_scale = {
    title: "AAF Video Scale Effect",
    description: "A scale effect based on the AAF spec.",
    vertexShader,
    fragmentShader,
    properties: {
        scaleX: { type: "uniform", value: 1.0 },
        scaleY: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

export default aaf_video_scale;
