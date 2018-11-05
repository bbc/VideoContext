import vertexShader from "./aaf_video_flip.vert";
import fragmentShader from "./aaf_video_flip.frag";

let aaf_video_flip = {
    title: "AAF Video Flip Effect",
    description: "A flip effect based on the AAF spec. Mirrors the image in the x-axis",
    vertexShader,
    fragmentShader,
    properties: {},
    inputs: ["u_image"]
};

export default aaf_video_flip;
