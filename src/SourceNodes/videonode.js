//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

export default class VideoNode extends SourceNode {
    /**
    * Initialise an instance of a VideoNode.
    * This should not be called directly, but created through a call to videoContext.createVideoNode();
    */
    constructor(src, gl, renderGraph, currentTime, globalPlaybackRate=1.0, sourceOffset=0, preloadTime = 4, videoElementCache=undefined, attributes = {}){
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._videoElementCache = videoElementCache;
        if (this._videoElementCache){
            this._isResponsibleForElementLifeCycle = true;
            //this._element.currentTime = this._sourceOffset;
        }
        this._playbackRate = 1.0;
        this._playbackRateUpdated = true;
        this._attributes = attributes;
        this._loopElement = false;
        this._isElementPlaying = false;
        if (this._attributes.loop){
            this._loopElement = this._attributes.loop;
        }
    }

    set playbackRate(playbackRate){
        this._playbackRate = playbackRate;
        this._playbackRateUpdated = true;
    }

    set stretchPaused(stretchPaused){
        super.stretchPaused = stretchPaused;
        if(this._element){
            if (this._stretchPaused){
                this._element.pause();
            } else{
                if(this._state === SOURCENODESTATE.playing){
                    this._element.play();
                }
            }    
        }
    }

    get stretchPaused(){
        return this._stretchPaused;
    }

    get playbackRate(){
        return this._playbackRate;
    }

    _load(){
        super._load();
        if (this._element !== undefined){

            for (var key in this._attributes) {
                this._element[key] = this._attributes[key];
            }

            if (this._element.readyState > 3 && !this._element.seeking){
                if(this._loopElement === false){
                    if (this._stopTime === Infinity || this._stopTime == undefined){
                        this._stopTime = this._startTime + this._element.duration;
                        this._triggerCallbacks("durationchange", this.duration);
                    }                
                }
                if(this._ready !== true){
                    this._triggerCallbacks("loaded");
                    this._playbackRateUpdated = true;

                }

                this._ready = true;

            } else{
                this._ready = false;
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle){
            if (this._videoElementCache){
                this._element = this._videoElementCache.get();
            }else{
                this._element = document.createElement("video");
                this._element.setAttribute("crossorigin", "anonymous");
                this._element.setAttribute("webkit-playsinline", "");
                this._playbackRateUpdated = true;
            }
            this._element.src = this._elementURL;

            for (let key in this._attributes) {
                this._element[key] = this._attributes[key];
            }
        }
        this._element.currentTime = this._sourceOffset;
    }

    _destroy(){
        super._destroy();
        if (this._isResponsibleForElementLifeCycle && this._element !== undefined){
            this._element.src = "";
            for (let key in this._attributes){
                this._element.removeAttribute(key);
            }
            this._element = undefined;
            if(!this._videoElementCache) delete this._element;
        }
        this._ready = false;
    }

    _seek(time){
        super._seek(time);
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused){
            if (this._element === undefined) this._load();
            let relativeTime = this._currentTime - this._startTime + this._sourceOffset;
            this._element.currentTime = relativeTime;
            this._ready = false;
        }
        if((this._state === SOURCENODESTATE.sequenced || this._state === SOURCENODESTATE.ended) && this._element !== undefined){
            this._destroy();
        }
    }

    _update(currentTime){
        //if (!super._update(currentTime)) return false;
        super._update(currentTime);
        //check if the video has ended
        if(this._element !== undefined){
            if (this._element.ended){
                this._state = SOURCENODESTATE.ended;
                this._triggerCallbacks("ended");
            }
        }

        if (this._startTime - this._currentTime < this._preloadTime && this._state !== SOURCENODESTATE.waiting && this._state !== SOURCENODESTATE.ended)this._load();

        if (this._state === SOURCENODESTATE.playing){
            if (this._playbackRateUpdated)
            {
                this._element.playbackRate = this._globalPlaybackRate * this._playbackRate;
                this._playbackRateUpdated = false;
            }
            if (!this._isElementPlaying){ 
                this._element.play();
                if (this._stretchPaused){
                    this._element.pause();
                }
                this._isElementPlaying = true;
            }
            return true;
        } else if (this._state === SOURCENODESTATE.paused){
            this._element.pause();
            this._isElementPlaying = false;
            return true;
        }
        else if (this._state === SOURCENODESTATE.ended && this._element !== undefined){
            this._element.pause();
            this._isElementPlaying = false;
            this._destroy();
            return false;
        }
    }

    clearTimelineState(){
        super.clearTimelineState();
        if (this._element !== undefined) {
            this._element.pause();
            this._isElementPlaying = false;
        }
        this._destroy();
    }

}
