import { mediaElementHasSource, CachedMedia } from "./utils";

class VideoElementCache {
    constructor({ cache_size = 3, audioCtx }) {
        this._cachedVideos = [];
        this._videosInitialised = false;
        for (let i = 0; i < cache_size; i++) {
            let cachedVideo = new CachedMedia({ audioCtx });
            this._cachedVideos.push(cachedVideo);
        }
        this._audioCtx = audioCtx;
    }

    init() {
        if (!this._videosInitialised) {
            for (let cachedVideo of this._cachedVideos) {
                try {
                    cachedVideo.element.play().then(
                        () => {},
                        e => {
                            if (e.name !== "NotSupportedError") throw e;
                        }
                    );
                } catch (e) {
                    //console.log(e.name);
                }
            }
        }
        this._videosInitialised = true;
    }

    get() {
        //Try and get an already intialised element.
        for (let cachedVideo of this._cachedVideos) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cachedVideo.element)) {
                return cachedVideo;
            }
        }
        //Fallback to creating a new element if non exists.
        console.debug(
            "No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger."
        );
        let cachedVideo = new CachedMedia({ audioCtx: this._audioCtx });
        this._cachedVideos.push(cachedVideo);
        this._cachedVideosInitialised = false;
        return cachedVideo;
    }

    get length() {
        return this._cachedVideos.length;
    }

    get unused() {
        let count = 0;
        for (let cachedVideo of this._cachedVideos) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cachedVideo.element)) count += 1;
        }
        return count;
    }
}

export default VideoElementCache;
