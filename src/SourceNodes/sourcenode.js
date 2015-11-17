import GraphNode from "../graphnode";

let STATE = {"waiting":0, "sequenced":1, "playing":2, "paused":3, "ended":4};


class SourceNode extends GraphNode{
    constructor(src, gl, renderGraph){
        super(renderGraph, 0);
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

        //Setup WebGL texture
        this._gl = gl;
        this._renderGraph = renderGraph;
        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
        //this._currentTime = time;
        this._update(time);
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
        //update the state
        if (this._state === STATE.waiting || this._state === STATE.ended) return false;
        
        if (currentTime < this._startTime){
            this._state = STATE.sequenced;
        }
        
        if (currentTime >= this._startTime && this._state !== STATE.paused){
            this._state = STATE.playing;
        }

        if (currentTime >= this._stopTime){
            this._state = STATE.ended;
        }

        //update the current time
        this._currentTime = currentTime;


        //update this source nodes texture
        let gl = this._gl;        
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._element);

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