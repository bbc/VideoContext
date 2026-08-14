//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode.js";
import type { SourceNodeSource } from "./sourcenode.js";
import type RenderGraph from "../rendergraph.js";
import type VideoElementCache from "../videoelementcache.js";

type MediaElement = HTMLVideoElement | HTMLAudioElement;

class MediaNode extends SourceNode {
    declare _element: MediaElement | undefined;
    _elementType!: "video" | "audio";
    _preloadTime: number;
    _sourceOffset: number;
    _globalPlaybackRate: number;
    _mediaElementCache: VideoElementCache | undefined;
    _playbackRate: number;
    _playbackRateUpdated: boolean;
    _attributes: Record<string, unknown> & { volume: number };
    _loopElement: boolean;
    _isElementPlaying: boolean;
    _loadTriggered: boolean | undefined;

    /**
     * Initialise an instance of a MediaNode.
     * This should not be called directly, but extended by other Node Types which use a `HTMLMediaElement`.
     */
    constructor(
        src: SourceNodeSource,
        gl: WebGLRenderingContext,
        renderGraph: RenderGraph,
        currentTime: number,
        globalPlaybackRate = 1.0,
        sourceOffset = 0,
        preloadTime = 4,
        mediaElementCache: VideoElementCache | undefined = undefined,
        attributes: Record<string, unknown> = {}
    ) {
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._mediaElementCache = mediaElementCache;
        this._playbackRate = 1.0;
        this._playbackRateUpdated = true;
        this._attributes = Object.assign({ volume: 1.0 }, attributes);
        this._loopElement = false;
        this._isElementPlaying = false;
        if (this._attributes.loop) {
            this._loopElement = this._attributes.loop as boolean;
        }
    }

    set playbackRate(playbackRate: number) {
        this._playbackRate = playbackRate;
        this._playbackRateUpdated = true;
    }

    set stretchPaused(stretchPaused: boolean) {
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

    get stretchPaused(): boolean {
        return this._stretchPaused;
    }

    get playbackRate(): number {
        return this._playbackRate;
    }

    get elementURL(): string | MediaStream | undefined {
        return this._elementURL;
    }

    /**
     * @property {Boolean}
     * @summary - Check if the element is waiting on the network to continue playback
     */
    get _buffering(): boolean {
        if (this._element) {
            return this._element.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
        }

        return false;
    }

    set volume(volume: number) {
        this._attributes.volume = volume;
        if (this._element !== undefined) this._element.volume = this._attributes.volume;
    }

    _triggerLoad(): void {
        // If the user hasn't supplied an element, videocontext is responsible for the element
        if (this._isResponsibleForElementLifeCycle) {
            if (this._mediaElementCache) {
                /**
                 * Get a cached video element and also pass this instance so the
                 * cache can access the current play state.
                 */
                this._element = this._mediaElementCache.getElementAndLinkToNode(this);
            } else {
                this._element = document.createElement(this._elementType) as MediaElement;
                this._element.setAttribute("crossorigin", "anonymous");
                this._element.setAttribute("webkit-playsinline", "");
                this._element.setAttribute("playsinline", "");
                // This seems necessary to allow using video as a texture. See:
                // https://bugs.chromium.org/p/chromium/issues/detail?id=898550
                // https://github.com/pixijs/pixi.js/issues/5996
                this._element.preload = "auto";
                this._playbackRateUpdated = true;
            }
            this._element.volume = this._attributes.volume;
            if (window.MediaStream !== undefined && this._elementURL instanceof MediaStream) {
                this._element.srcObject = this._elementURL;
            } else {
                this._element.src = this._elementURL as string;
            }
        }
        // at this stage either the user or the element cache should have provided an element
        if (this._element) {
            for (const key in this._attributes) {
                (this._element as unknown as Record<string, unknown>)[key] = this._attributes[key];
            }

            let currentTimeOffset = 0;
            if (this._currentTime > this._startTime)
                currentTimeOffset = this._currentTime - this._startTime;
            this._element.currentTime = this._sourceOffset + currentTimeOffset;
            this._element.onerror = () => {
                if (this._element === undefined) return;
                console.debug("Error with element", this._element);
                this._state = SOURCENODESTATE.error;
                //Even though there's an error, ready should be set to true so the node can output transparent
                this._ready = true;
                this._triggerCallbacks("error");
            };
        } else {
            // If the element doesn't exist for whatever reason enter the error state.
            this._state = SOURCENODESTATE.error;
            this._ready = true;
            this._triggerCallbacks("error");
        }

        this._loadTriggered = true;
    }

    /**
     * _load has two functions:
     *
     * 1. `_triggerLoad` which ensures the element has the correct src and is at the correct currentTime,
     *     so that the browser can start fetching media.
     *
     * 2.  `shouldPollForElementReadyState` waits until the element has a "readyState" that signals there
     *     is enough media to start playback. This is a little confusing as currently structured.
     *     We're using the _update loop to poll the _load function which checks the element status.
     *     When ready we fire off the "loaded callback"
     */
    _load(): void {
        super._load();

        /**
         * We've got to be careful here as _load is called many times whilst waiting for the element to buffer
         * and this function should only be called once.
         * This is step one in what should be a more thorough refactor
         */
        if (!this._loadTriggered) {
            this._triggerLoad();
        }

        const shouldPollForElementReadyState = this._element !== undefined;
        /**
         * this expression is effectively polling the element, waiting for it to buffer
         * it gets called a lot of times
         */
        if (shouldPollForElementReadyState && this._element) {
            if (this._element.readyState > 3 && !this._element.seeking) {
                // at this point the element has enough data for current playback position
                // and at least a couple of frames into the future

                // Check if the duration has changed. Update if necessary.
                // this could potentially go in the normal update loop but I don't want to change
                // too many things at once
                if (this._loopElement === false) {
                    if (this._stopTime === Infinity || this._stopTime == undefined) {
                        //only fire durationchange when the derived stop time actually
                        //changes, otherwise an endless source (duration === Infinity)
                        //would re-fire it on every update
                        const newStopTime = this._startTime + this._element.duration;
                        if (this._stopTime !== newStopTime) {
                            this._stopTime = newStopTime;
                            this._triggerCallbacks("durationchange", this.duration);
                        }
                    }
                }

                // signal to user that this node has "loaded"
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
        }
    }

    _unload(): void {
        super._unload();
        if (this._element !== undefined) {
            //stop the element error handler retaining (and firing on) an unloaded node
            this._element.onerror = null;
        }
        if (this._isResponsibleForElementLifeCycle && this._element !== undefined) {
            this._element.removeAttribute("src");
            this._element.srcObject = null;
            this._element.load();
            for (const key in this._attributes) {
                this._element.removeAttribute(key);
            }
            // Unlink this from the cache, freeing up the element for another media node
            if (this._mediaElementCache)
                this._mediaElementCache.unlinkNodeFromElement(this._element);
            this._element = undefined;
        }
        // reset class to initial state
        this._ready = false;
        this._isElementPlaying = false;
        // For completeness. I couldn't find a path that required reuse of this._loadTriggered after _unload.
        this._loadTriggered = false;
    }

    _seek(time: number): void {
        super._seek(time);
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused) {
            if (this._element === undefined) this._load();
            const relativeTime = this._currentTime - this._startTime + this._sourceOffset;
            if (this._element) this._element.currentTime = relativeTime;
            this._ready = false;
        }
        if (
            (this._state === SOURCENODESTATE.sequenced || this._state === SOURCENODESTATE.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime: number, triggerTextureUpdate = true): boolean {
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
            if (this._element) {
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
            }
            return true;
        } else if (this._state === SOURCENODESTATE.paused) {
            if (this._element) this._element.pause();
            this._isElementPlaying = false;
            return true;
        } else if (this._state === SOURCENODESTATE.ended && this._element !== undefined) {
            this._element.pause();
            //unload whenever a load happened (even if the node ended while paused);
            //_unload resets _loadCalled so this only runs once
            if (this._loadCalled) {
                this._unload();
            }
            return false;
        }
        return false;
    }

    clearTimelineState(): void {
        super.clearTimelineState();
        if (this._element !== undefined) {
            this._element.pause();
            this._isElementPlaying = false;
        }
        this._unload();
    }

    destroy(): void {
        if (this._element) this._element.pause();
        super.destroy();
    }
}

export default MediaNode;
