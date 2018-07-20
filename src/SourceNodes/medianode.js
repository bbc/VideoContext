//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

class MediaNode extends SourceNode {
    /**
     * Initialise an instance of a MediaNode.
     * This should not be called directly, but extended by other Node Types which use a `HTMLMediaElement`.
     */
    constructor(
        src,
        gl,
        renderGraph,
        currentTime,
        globalPlaybackRate = 1.0,
        sourceOffset = 0,
        preloadTime = 4,
        mediaElementCache = undefined,
        attributes = {}
    ) {
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._mediaElementCache = mediaElementCache;
        this._playbackRate = 1.0;
        this._volume = 1.0;
        this._playbackRateUpdated = true;
        this._attributes = attributes;
        this._loopElement = false;
        this._isElementPlaying = false;
        if (this._attributes.loop) {
            this._loopElement = this._attributes.loop;
        }
    }

    set playbackRate(playbackRate) {
        this._playbackRate = playbackRate;
        this._playbackRateUpdated = true;
    }

    set stretchPaused(stretchPaused) {
        super.stretchPaused = stretchPaused;
        if (this._element) {
            if (this._stretchPaused) {
                this._element.pause();
            } else {
                if (this._state === SOURCENODESTATE.playing) {
                    this._element.play();
                }
            }
        }
    }

    get stretchPaused() {
        return this._stretchPaused;
    }

    get playbackRate() {
        return this._playbackRate;
    }

    get elementURL() {
        return this._elementURL;
    }

    set volume(volume) {
        this._volume = volume;
        if (this._element !== undefined) this._element.volume = this._volume;
    }

    _load() {
        super._load();
        if (this._element !== undefined) {
            for (var key in this._attributes) {
                this._element[key] = this._attributes[key];
            }

            if (this._element.readyState > 3 && !this._element.seeking) {
                if (this._loopElement === false) {
                    if (this._stopTime === Infinity || this._stopTime == undefined) {
                        this._stopTime = this._startTime + this._element.duration;
                        this._triggerCallbacks("durationchange", this.duration);
                    }
                }
                if (this._ready !== true) {
                    this._triggerCallbacks("loaded");
                    this._playbackRateUpdated = true;
                }

                this._ready = true;
            } else {
                if (this._state !== SOURCENODESTATE.error) {
                    this._ready = false;
                }
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle) {
            if (this._mediaElementCache) {
                this._element = this._mediaElementCache.get();
            } else {
                this._element = document.createElement(this._elementType);
                this._element.setAttribute("crossorigin", "anonymous");
                this._element.setAttribute("webkit-playsinline", "");
                this._element.setAttribute("playsinline", "");
                this._playbackRateUpdated = true;
            }
            this._element.volume = this._volume;
            if (window.MediaStream !== undefined && this._elementURL instanceof MediaStream) {
                this._element.srcObject = this._elementURL;
            } else {
                this._element.src = this._elementURL;
            }

            for (let key in this._attributes) {
                this._element[key] = this._attributes[key];
            }
        }
        if (this._element) {
            let currentTimeOffset = 0;
            if (this._currentTime > this._startTime)
                currentTimeOffset = this._currentTime - this._startTime;
            this._element.currentTime = this._sourceOffset + currentTimeOffset;
            this._element.onerror = () => {
                if (this._element === undefined) return;
                console.debug("Error with element", this._element);
                this._state = SOURCENODESTATE.error;
                //Event though there's an error ready should be set to true so the node can output transparenn
                this._ready = true;
                this._triggerCallbacks("error");
            };
        } else {
            //If the element doesn't exist for whatever reason enter the error state.
            this._state = SOURCENODESTATE.error;
            this._ready = true;
            this._triggerCallbacks("error");
        }
    }

    _unload() {
        super._unload();
        if (this._isResponsibleForElementLifeCycle && this._element !== undefined) {
            this._element.src = "";
            this._element.srcObject = undefined;
            for (let key in this._attributes) {
                this._element.removeAttribute(key);
            }
            this._element = undefined;
            if (!this._mediaElementCache) delete this._element;
        }
        this._ready = false;
        this._isElementPlaying = false;
    }

    _seek(time) {
        super._seek(time);
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused) {
            if (this._element === undefined) this._load();
            let relativeTime = this._currentTime - this._startTime + this._sourceOffset;
            this._element.currentTime = relativeTime;
            this._ready = false;
        }
        if (
            (this._state === SOURCENODESTATE.sequenced || this._state === SOURCENODESTATE.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime, triggerTextureUpdate = true) {
        //if (!super._update(currentTime)) return false;
        super._update(currentTime, triggerTextureUpdate);
        //check if the media has ended
        if (this._element !== undefined) {
            if (this._element.ended) {
                this._state = SOURCENODESTATE.ended;
                this._triggerCallbacks("ended");
            }
        }

        if (
            this._startTime - this._currentTime <= this._preloadTime &&
            this._state !== SOURCENODESTATE.waiting &&
            this._state !== SOURCENODESTATE.ended
        )
            this._load();

        if (this._state === SOURCENODESTATE.playing) {
            if (this._playbackRateUpdated) {
                this._element.playbackRate = this._globalPlaybackRate * this._playbackRate;
                this._playbackRateUpdated = false;
            }
            if (!this._isElementPlaying) {
                this._element.play();
                if (this._stretchPaused) {
                    this._element.pause();
                }
                this._isElementPlaying = true;
            }
            return true;
        } else if (this._state === SOURCENODESTATE.paused) {
            this._element.pause();
            this._isElementPlaying = false;
            return true;
        } else if (this._state === SOURCENODESTATE.ended && this._element !== undefined) {
            this._element.pause();
            if (this._isElementPlaying) {
                this._unload();
            }
            return false;
        }
    }

    clearTimelineState() {
        super.clearTimelineState();
        if (this._element !== undefined) {
            this._element.pause();
            this._isElementPlaying = false;
        }
        this._unload();
    }

    destroy() {
        if (this._element) this._element.pause();
        super.destroy();
    }
}

export default MediaNode;
