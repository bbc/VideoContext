import aaf_video_scale from "./aaf_video_scale/aaf_video_scale";
import crossfade from "./crossfade/crossfade";
import horizontalWipe from "./horizontalWipe/horizontalWipe";
import verticalWipe from "./verticalWipe/verticalWipe";
import randomDissolve from "./randomDissolve/randomDissolve";
import toColorAndBackFade from "./toColorAndBackFade/toColorAndBackFade";
import starWipe from "./starWipe/starWipe";
import combine from "./combine/combine";
import colorThreshold from "./colorThreshold/colorThreshold";
import monochrome from "./monochrome/monochrome";
import horizontalBlur from "./horizontalBlur/horizontalBlur";
import verticalBlur from "./verticalBlur/verticalBlur";
import aaf_video_flop from "./aaf_video_flop/aaf_video_flop";
import aaf_video_flip from "./aaf_video_flip/aaf_video_flip";
import aaf_video_position from "./aaf_video_position/aaf_video_position";
import aaf_video_crop from "./aaf_video_crop/aaf_video_crop";
import staticDissolve from "./staticDissolve/staticDissolve";
import staticEffect from "./staticEffect/staticEffect";
import dreamfade from "./dreamfade/dreamfade";
import opacity from "./opacity/opacity";
import crop from "./crop/crop";

export interface IDefinition {
    title?: string;
    description?: string;
    vertexShader: string;
    fragmentShader: string;
    properties: {
        [key: string]: {
            type: string;
            value: any;
        };
    };
    inputs: string[];
}

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
