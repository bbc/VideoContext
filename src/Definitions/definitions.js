import aaf_video_scale from "./aaf_video_scale";
import crossfade from "./crossfade";
import horizontalWipe from "./horizontalWipe";
import verticalWipe from "./verticalWipe";
import randomDissolve from "./randomDissolve";
import toColorAndBackFade from "./toColorAndBackFade";
import starWipe from "./starWipe";
import combine from "./combine";
import colorThreshold from "./colorThreshold";
import monochrome from "./monochrome";
import horizontalBlur from "./horizontalBlur";
import verticalBlur from "./verticalBlur";
import aaf_video_flop from "./aaf_video_flop";
import aaf_video_flip from "./aaf_video_flip";
import aaf_video_position from "./aaf_video_position";
import aaf_video_crop from "./aaf_video_crop";
import staticDissolve from "./staticDissolve";
import staticEffect from "./staticEffect";
import dreamfade from "./dreamfade";
import opacity from "./opacity";
import crop from "./crop";

let DEFINITIONS = {
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
