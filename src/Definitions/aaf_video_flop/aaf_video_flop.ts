import vertexShader from "./aaf_video_flop.vert";
import fragmentShader from "./aaf_video_flop.frag";

let aaf_video_flop = {
    title: "AAF Video Flop Effect",
    description: "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
    vertexShader,
    fragmentShader,
    properties: {},
    inputs: ["u_image"]
};

export default aaf_video_flop;
