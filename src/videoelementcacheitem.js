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
    constructor(node = null) {
        this._element = this._createElement();
        this._node = node;
    }

    _createElement() {
        let videoElement = document.createElement("video");
        videoElement.setAttribute("crossorigin", "anonymous");
        videoElement.setAttribute("webkit-playsinline", "");
        videoElement.setAttribute("playsinline", "");
        return videoElement;
    }

    get element() {
        return this._element;
    }

    set element(element) {
        this._element = element;
    }

    linkNode(node) {
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
