import aaf_video_scale from "./aaf_video_scale.js";
import crossfade from "./crossfade.js";
import horizontalWipe from "./horizontalWipe.js";
import verticalWipe from "./verticalWipe.js";
import randomDissolve from "./randomDissolve.js";
import toColorAndBackFade from "./toColorAndBackFade.js";
import starWipe from "./starWipe.js";
import combine from "./combine.js";
import colorThreshold from "./colorThreshold.js";
import monochrome from "./monochrome.js";
import horizontalBlur from "./horizontalBlur.js";
import verticalBlur from "./verticalBlur.js";
import aaf_video_flop from "./aaf_video_flop.js";
import aaf_video_flip from "./aaf_video_flip.js";
import aaf_video_position from "./aaf_video_position.js";
import aaf_video_crop from "./aaf_video_crop.js";
import staticDissolve from "./staticDissolve.js";
import staticEffect from "./staticEffect.js";
import dreamfade from "./dreamfade.js";


let DEFINITIONS = {
    AAF_VIDEO_SCALE: aaf_video_scale,
    CROSSFADE: crossfade,
    DREAMFADE: dreamfade,
    HORIZONTAL_WIPE:horizontalWipe,
    VERTICAL_WIPE:verticalWipe,
    RANDOM_DISSOLVE:randomDissolve,
    STATIC_DISSOLVE:staticDissolve,
    STATIC_EFFECT:staticEffect,
    TO_COLOR_AND_BACK: toColorAndBackFade,
    STAR_WIPE:starWipe,
    COMBINE: combine,
    COLORTHRESHOLD: colorThreshold,
    MONOCHROME: monochrome,
    HORIZONTAL_BLUR:horizontalBlur,
    VERTICAL_BLUR:verticalBlur,
    AAF_VIDEO_CROP: aaf_video_crop,
    AAF_VIDEO_POSITION: aaf_video_position,
    AAF_VIDEO_FLIP: aaf_video_flip,
    AAF_VIDEO_FLOP: aaf_video_flop
};

export default DEFINITIONS;