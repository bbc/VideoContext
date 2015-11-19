import { updateTexture, clearTexture, createElementTexutre } from "../utils.js";
import GraphNode from "../graphnode";

let STATE = {"waiting":0, "sequenced":1, "playing":2, "paused":3, "ended":4};


class SourceNode extends GraphNode{
    constructor(src, gl, renderGraph){
        super(gl,renderGraph, 0);
        this._element = undefined;
        this._elementURL = undefined;
        this._isResponsibleForElementLifeCycle = true;
        if (typeof src === 'string'){
            //create the node from the passed url
            this._elementURL = src;
        }else{
            //use the passed element to create the SourceNode
            this._element = src;
            this._isResponsibleForElementLifeCycle = false;
        }

        this._state = STATE.waiting;
        this._currentTime = 0;
        this._startTime = 0;
        this._stopTime = 0;
        this._ready = false;
        this._texture = createElementTexutre(gl);
        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,512,512, gl.RGBA, gl.UNSIGNED_BYTE, this._element);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));

    }

    get state(){        
        return this._state;
    }

    start(time){
        if (this._state !== STATE.waiting){
            console.debug("SourceNode is has already been sequenced. Can't sequence twice.");
            return false;
        }

        this._startTime = this._currentTime + time;
        this._state = STATE.sequenced;
        return true;
    }

    stop(time){
        if (this._state === STATE.ended){
            console.debug("SourceNode has already ended. Cannot call stop.");
            return false;
        } else if (this._state === STATE.waiting){
            console.debug("SourceNode must have start called before stop is called");
            return false;
        }
        if (this._currentTime + time <= this._startTime){
            console.debug("SourceNode must have a stop time after it's start time, not before.");
            return false;
        }
        this._stopTime = this._currentTime + time;
        console.debug("stop time", this._stopTime);
        return true;
    }

    _seek(time){
        if (this._state === STATE.waiting) return;
        if (time < this._startTime){
            clearTexture(this._gl, this._texture);
            this._state = STATE.sequenced;
        }
        if (time >= this._startTime && this._state !== STATE.paused){
            this._state = STATE.playing;
        }
        if (time >= this._stopTime){
            clearTexture(this._gl, this._texture);
            this._state = STATE.ended;
        }
        //update the current time
        this._currentTime = time;
    }

    _pause(){
        if(this._state === STATE.playing){
            this._state = STATE.paused;
        }
    }
    _play(){
        if(this._state === STATE.paused){
            this._state = STATE.playing;
        }
    }

    _isReady(){
        if (this._state === STATE.playing || this._state === STATE.paused){
            return this._ready;
        }
        return true;
    }

    _update(currentTime){
        this._rendered = true;

        //update the state
        if (this._state === STATE.waiting || this._state === STATE.ended) return false;
        
        if (currentTime < this._startTime){
            clearTexture(this._gl, this._texture);
            this._state = STATE.sequenced;
        }
        
        if (currentTime >= this._startTime && this._state !== STATE.paused){
            this._state = STATE.playing;
        }

        if (currentTime >= this._stopTime){
            clearTexture(this._gl, this._texture);
            this._state = STATE.ended;
        }

        //update the current time
        this._currentTime = currentTime;


        //update this source nodes texture
        if (this._element === undefined || this._ready === false) return true;      
        
        if(this._state === STATE.playing){
            updateTexture(this._gl, this._texture, this._element);
        }

        return true;
    }

    clearTimelineState(){
        this._startTime = 0;
        this._stopTime = 0;
        this._state = STATE.waiting;
    }
}

export default SourceNode;
export {STATE as SOURCENODESTATE};