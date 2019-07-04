import VideoElementCacheItem from "./videoelementcacheitem";
import { mediaElementHasSource } from "./utils";

class VideoElementCache {
    constructor(cache_size = 3) {
        this._elements = [];
        this._elementsInitialised = false;
        for (let i = 0; i < cache_size; i++) {
            // Create a video element and cache
            this._elements.push(new VideoElementCacheItem());
        }
    }

    init() {
        if (!this._elementsInitialised) {
            for (let cacheItem of this._elements) {
                try {
                    cacheItem.element.play().then(
                        () => {
                            // Pause any elements not in the "playing" state
                            if (!cacheItem.isPlaying()) {
                                cacheItem.element.pause();
                            }
                        },
                        e => {
                            if (e.name !== "NotSupportedError") throw e;
                        }
                    );
                } catch (e) {
                    //console.log(e.name);
                }
            }
        }
        this._elementsInitialised = true;
    }

    /**
     * Find and return an empty initialised element or, if the cache is
     * empty, create a new one.
     *
     * @param {Object} mediaNode A `MediaNode` instance
     */
    get(mediaNode) {
        // Try and get an already intialised element.
        for (let elementItem of this._elements) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(elementItem.element)) {
                // attach node to the element
                elementItem.linkNode(mediaNode);
                return elementItem.element;
            }
        }
        // Fallback to creating a new element if none exist or are available
        console.debug(
            "No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger."
        );
        let cacheItem = new VideoElementCacheItem(mediaNode);
        this._elements.push(cacheItem);
        this._elementsInitialised = false;
        return cacheItem.element;
    }

    /**
     * Unlink any media node currently linked to a cached video element.
     *
     * @param {VideoElement} element The element to unlink from any media nodes
     */
    unlink(element) {
        for (let cacheItem of this._elements) {
            // Unlink the node from the element
            if (element === cacheItem._element) {
                cacheItem.unlinkNode();
            }
        }
    }

    get length() {
        return this._elements.length;
    }

    get unused() {
        let count = 0;
        for (let cacheItem of this._elements) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cacheItem.element)) count += 1;
        }
        return count;
    }
}

export default VideoElementCache;
