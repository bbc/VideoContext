//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

export default class VideoNode extends SourceNode {
    constructor(src, gl, renderGraph, currentTime, globalPlaybackRate=1.0, sourceOffset=0, preloadTime = 4){
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._playbackRate = 1.0;
        this._playbackRateUpdated = true;
        this._loopElement = false;
    }

    set playbackRate(playbackRate){
        this._playbackRate = playbackRate;
        this._playbackRateUpdated = true;
    }

    get playbackRate(){
        return this._playbackRate;
    }

    set loopElement(loopElement){
        this._loopElement = loopElement;
        if (this._element) this._element.loop = loopElement;
    }

    get loopElement(){
        return this._loopElement;
    }

    _load(){
        super._load();
        if (this._element !== undefined){
            this._loopElement = this._element.loop; 
            if (this._element.readyState > 3 && !this._element.seeking){
                //if (this._stopTime === Infinity || this._stopTime == undefined) this._stopTime = this._startTime + this._element.duration;
                this._ready = true;
                this._playbackRateUpdated = true;
            } else{
                this._ready = false;
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle){
            this._element = document.createElement("video");
            this._element.setAttribute('crossorigin', 'anonymous');
            this._element.src = this._elementURL;
            this._element.loop = this._loopElement;
            this._playbackRateUpdated = true;

        }
        this._element.currentTime = this._sourceOffset;
    }

    _destroy(){
        super._destroy();
        if (this._isResponsibleForElementLifeCycle){
            this._element.src = "";
            this._element = undefined;    
            delete this._element;
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
            this._element.play();
            return true;
        } else if (this._state === SOURCENODESTATE.paused){
            this._element.pause();
            return true;
        }
        else if (this._state === SOURCENODESTATE.ended && this._element !== undefined){
            this._element.pause();
            this._destroy();
            return false;
        }
    }

    clearTimelineState(){
        super.clearTimelineState();
        if (this._element !== undefined) this._element.pause();
        this._destroy();
    }

}
