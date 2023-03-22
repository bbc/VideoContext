import vertexShader from "./aaf_video_position.vert";
import fragmentShader from "./aaf_video_position.frag";

let aaf_video_position = {
    title: "AAF Video Position Effect",
    description: "A position effect based on the AAF spec.",
    vertexShader,
    fragmentShader,
    properties: {
        positionOffsetX: { type: "uniform", value: 0.0 },
        positionOffsetY: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image"]
};

export default aaf_video_position;
