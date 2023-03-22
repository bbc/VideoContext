import MediaNode from "./SourceNodes/medianode";
import { SOURCENODESTATE } from "./SourceNodes/sourcenode";

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

    _createElement() {
        let videoElement = document.createElement("video");
        videoElement.setAttribute("crossorigin", "anonymous");
        videoElement.setAttribute("webkit-playsinline", "");
        videoElement.setAttribute("playsinline", "");
        // This seems necessary to allow using video as a texture. See:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=898550
        // https://github.com/pixijs/pixi.js/issues/5996
        videoElement.preload = "auto";
        return videoElement;
    }

    get element() {
        return this._element;
    }

    set element(element) {
        this._element = element;
    }

    linkNode(node: MediaNode) {
        this._node = node;
    }

    unlinkNode() {
        this._node = null;
    }

    isPlaying() {
        return this._node && this._node._state === SOURCENODESTATE.playing;
    }
}

export default VideoElementCacheItem;
