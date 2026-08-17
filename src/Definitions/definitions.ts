import aaf_video_scale from "./aaf_video_scale/index.js";
import crossfade from "./crossfade/index.js";
import horizontalWipe from "./horizontalWipe/index.js";
import verticalWipe from "./verticalWipe/index.js";
import randomDissolve from "./randomDissolve/index.js";
import toColorAndBackFade from "./toColorAndBackFade/index.js";
import starWipe from "./starWipe/index.js";
import combine from "./combine/index.js";
import colorThreshold from "./colorThreshold/index.js";
import monochrome from "./monochrome/index.js";
import horizontalBlur from "./horizontalBlur/index.js";
import verticalBlur from "./verticalBlur/index.js";
import aaf_video_flop from "./aaf_video_flop/index.js";
import aaf_video_flip from "./aaf_video_flip/index.js";
import aaf_video_position from "./aaf_video_position/index.js";
import aaf_video_crop from "./aaf_video_crop/index.js";
import staticDissolve from "./staticDissolve/index.js";
import staticEffect from "./staticEffect/index.js";
import dreamfade from "./dreamfade/index.js";
import opacity from "./opacity/index.js";
import crop from "./crop/index.js";

const DEFINITIONS = {
    AAF_VIDEO_SCALE: aaf_video_scale,
    CROSSFADE: crossfade,
    DREAMFADE: dreamfade,
    HORIZONTAL_WIPE: horizontalWipe,
    VERTICAL_WIPE: verticalWipe,
    RANDOM_DISSOLVE: randomDissolve,
    STATIC_DISSOLVE: staticDissolve,
    STATIC_EFFECT: staticEffect,
    TO_COLOR_AND_BACK: toColorAndBackFade,
    STAR_WIPE: starWipe,
    COMBINE: combine,
    COLORTHRESHOLD: colorThreshold,
    MONOCHROME: monochrome,
    HORIZONTAL_BLUR: horizontalBlur,
    VERTICAL_BLUR: verticalBlur,
    AAF_VIDEO_CROP: aaf_video_crop,
    AAF_VIDEO_POSITION: aaf_video_position,
    AAF_VIDEO_FLIP: aaf_video_flip,
    AAF_VIDEO_FLOP: aaf_video_flop,
    OPACITY: opacity,
    CROP: crop
};

export default DEFINITIONS;
