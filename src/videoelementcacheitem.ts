import { SOURCENODESTATE } from "./SourceNodes/sourcenode.js";
import type MediaNode from "./SourceNodes/medianode.js";

/**
 * A video element item created and managed by the `VideoElementCache`.
 *
 * This creates and stores a `<video />` element, which is assigned
 * to a `MediaNode` by the `VideoElementCache` for playback. Once
 * playback has completed the `MediaNode` association will be removed
 * and potentially replaced with another.
 */
class VideoElementCacheItem {
    _element: HTMLVideoElement;
    _node: MediaNode | null;

    constructor(node: MediaNode | null = null) {
        this._element = this._createElement();
        this._node = node;
    }

    _createElement(): HTMLVideoElement {
        const videoElement = document.createElement("video");
        videoElement.setAttribute("crossorigin", "anonymous");
        videoElement.setAttribute("webkit-playsinline", "");
        videoElement.setAttribute("playsinline", "");
        // This seems necessary to allow using video as a texture. See:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=898550
        // https://github.com/pixijs/pixi.js/issues/5996
        videoElement.preload = "auto";
        return videoElement;
    }

    get element(): HTMLVideoElement {
        return this._element;
    }

    set element(element: HTMLVideoElement) {
        this._element = element;
    }

    linkNode(node: MediaNode): void {
        this._node = node;
    }

    unlinkNode(): void {
        this._node = null;
    }

    isPlaying(): boolean {
        return this._node !== null && this._node._state === SOURCENODESTATE.playing;
    }
}

export default VideoElementCacheItem;
