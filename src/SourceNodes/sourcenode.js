import { updateTexture, clearTexture, createElementTexutre } from "../utils.js";
import GraphNode from "../graphnode";

let STATE = {"waiting":0, "sequenced":1, "playing":2, "paused":3, "ended":4};


class SourceNode extends GraphNode{
    constructor(src, gl, renderGraph){
        super(gl,renderGraph, [], true);
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
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._ready = false;
        this._texture = createElementTexutre(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
        this._callbacks = [];
    }

    /**
    * Returns the state of the node.
    * 0 - Waiting, start() has not been called on it yet.
    * 1 - Sequenced, start() has been called but it is not playing yet. 
    * 2 - Playing, the node is playing.
    * 3 - Paused, the node is paused.
    * 4 - Ended, playback of the node has finished.
    */
    get state(){        
        return this._state;
    }

    _load(){
        this._triggerCallbacks("load");
    }

    _destroy(){
        this._triggerCallbacks("destroy");
    }

    registerCallback(type, func){
        this._callbacks.push({type:type, func:func});
    }

    unregisterCallback(func){
        let toRemove = [];
        for(let callback of this._callbacks){
            if (callback.func === func)toRemove.push(callback);
        }
        for(let callback of toRemove){
            let index = this._callbacks.indexOf(callback);
            this._callbacks.splice(index, 1);
        }
    }

    _triggerCallbacks(type, data){
        for(let callback of this._callbacks){
            if (callback.type === type){
                if (data!== undefined){
                    callback.func(this, data);
                }else{
                    callback.func(this);
                }
            }
        }
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
        return true;
    }

    _seek(time){
        this._triggerCallbacks("seek", time);

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
            this._triggerCallbacks("ended");
            this._state = STATE.ended;
        }
        //update the current time
        this._currentTime = time;
    }

    _pause(){
        this._triggerCallbacks("pause");

        if(this._state === STATE.playing){
            this._state = STATE.paused;
        }
    }
    _play(){
        this._triggerCallbacks("play");

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

        this._triggerCallbacks("render", currentTime);


        
        if (currentTime < this._startTime){
            clearTexture(this._gl, this._texture);
            this._state = STATE.sequenced;
        }
        
        if (currentTime >= this._startTime && this._state !== STATE.paused){
            this._state = STATE.playing;
        }

        if (currentTime >= this._stopTime){
            clearTexture(this._gl, this._texture);
            this._triggerCallbacks("ended");
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
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._state = STATE.waiting;
    }
}

export default SourceNode;
export {STATE as SOURCENODESTATE};