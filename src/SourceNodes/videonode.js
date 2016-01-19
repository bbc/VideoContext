//Matthew Shotton, R&D User Experince,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

export default class VideoNode extends SourceNode {
    constructor(src, gl, renderGraph, globalPlaybackRate=1.0, sourceOffset=0, preloadTime = 4){
        super(src, gl, renderGraph);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._playbackRate = 1.0;
    }

    set playbackRate(playbackRate){
        this._playbackRate = playbackRate;
    }

    get playbackRate(){
        return this._playbackRate;
    }

    _load(){
        if (this._element !== undefined){
            if (this._element.readyState > 3 && !this._element.seeking){
                if (this._stopTime === Infinity || this._stopTime == undefined) this._stopTime = this._startTime + this._element.duration;
                this._ready = true;
            } else{
                this._ready = false;
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle){
            super._load();
            this._element = document.createElement("video");
            this._element.setAttribute('crossorigin', 'anonymous');
            this._element.src = this._elementURL;
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
            this._element.playbackRate = this._globalPlaybackRate * this._playbackRate;
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

}
