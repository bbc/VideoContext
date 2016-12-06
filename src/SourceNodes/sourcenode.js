//Matthew Shotton, R&D User Experience,© BBC 2015
import { updateTexture, clearTexture, createElementTexutre } from "../utils.js";
import GraphNode from "../graphnode";

let STATE = {"waiting":0, "sequenced":1, "playing":2, "paused":3, "ended":4};

export default class SourceNode extends GraphNode{
    /**
    * Initialise an instance of a SourceNode.
    * This is the base class for other Nodes which generate media to be passed into the processing pipeline.
    */
    constructor(src, gl, renderGraph, currentTime){
        super(gl,renderGraph, [], true);
        this._element = undefined;
        this._elementURL = undefined;
        this._isResponsibleForElementLifeCycle = true;
        if (typeof src === "string"){
            //create the node from the passed url
            this._elementURL = src;
        }else{
            //use the passed element to create the SourceNode
            this._element = src;
            this._isResponsibleForElementLifeCycle = false;
        }

        this._state = STATE.waiting;
        this._currentTime = currentTime;
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._ready = false;
        this._loadCalled = false;
        this._stretchPaused = false;
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
    *
    * @example
    * var ctx = new VideoContext();
    * var videoNode = ctx.createVideoSourceNode('video.mp4');
    * console.log(videoNode.state); //will output 0 (for waiting)
    * videoNode.start(5);
    * console.log(videoNode.state); //will output 1 (for sequenced)
    * videoNode.stop(10);
    * ctx.play();
    * console.log(videoNode.state); //will output 2 (for playing)
    * ctx.paused();
    * console.log(videoNode.state); //will output 3 (for paused)
    */
    get state(){        
        return this._state;
    }


    /**
    * Returns the underlying DOM element which represents this source node.
    * Note: If a source node is created with a url rather than passing in an existing element then this will return undefined until the source node preloads the element.
    *
    * @return {Element} The underlying DOM element representing the media for the node. If the lifecycle of the video is owned UNSIGNED_BYTE the node itself, this can return undefined if the element hasn't been loaded yet.
    *
    * @example 
    * //Accessing the Element on a VideoNode created via a URL
    * var ctx = new VideoContext();
    * var videoNode = ctx.createVideoSourceNode('video.mp4');
    * videoNode.start(0);
    * videoNode.stop(5);
    * //When the node starts playing the element should exist so set it's volume to 0
    * videoNode.regsiterCallback("play", function(){videoNode.element.volume = 0;});
    *
    *
    * @example 
    * //Accessing the Element on a VideoNode created via an already existing element
    * var ctx = new VideoContext();
    * var videoElement = document.createElement("video");
    * var videoNode = ctx.createVideoSourceNode(videoElement);
    * videoNode.start(0);
    * videoNode.stop(5);
    * //The elemnt can be accessed any time because it's lifecycle is managed outside of the VideoContext
    * videoNode.element.volume = 0;
    *
    */
    get element(){
        return this._element;
    }


    /**
    * Returns the duration of the node on a timeline. If no start time is set will return undefiend, if no stop time is set will return Infinity.
    *
    * @return {number} The duration of the node in seconds.
    *
    * @example 
    * var ctx = new VideoContext();
    * var videoNode = ctx.createVideoSourceNode('video.mp4');
    * videoNode.start(5);
    * videoNode.stop(10);
    * console.log(videoNode.duration); //will output 10
    */
    get duration(){
        if (isNaN(this._startTime)) return undefined;
        if (this._stopTime === Infinity) return Infinity;
        return this._stopTime - this._startTime;
    }

    set stretchPaused(stretchPaused){
        this._stretchPaused = stretchPaused;
    }

    get stretchPaused(){
        return this._stretchPaused;
    }

    _load(){
        if (!this._loadCalled){
            this._triggerCallbacks("load");
            this._loadCalled = true;
        }
    }

    _destroy(){
        this._triggerCallbacks("destroy");
        this._loadCalled = false;    
    }
    
    /**
    * Register callbacks against one of these events: "load", "destory", "seek", "pause", "play", "ended", "durationchange", "loaded"
    *
    * @param {String} type - the type of event to register the callback against.
    * @param {function} func - the function to call.
    * 
    * @example 
    * var ctx = new VideoContext();
    * var videoNode = ctx.createVideoSourceNode('video.mp4');
    *
    * videoNode.registerCallback("load", function(){"video is loading"});
    * videoNode.registerCallback("play", function(){"video is playing"});
    * videoNode.registerCallback("ended", function(){"video has eneded"});
    *
    */
    registerCallback(type, func){
        this._callbacks.push({type:type, func:func});
    }

    /**
    * Remove callback.
    *
    * @param {function} [func] - the callback to remove, if undefined will remove all callbacks for this node.
    *
    * @example 
    * var ctx = new VideoContext();
    * var videoNode = ctx.createVideoSourceNode('video.mp4');
    *
    * videoNode.registerCallback("load", function(){"video is loading"});
    * videoNode.registerCallback("play", function(){"video is playing"});
    * videoNode.registerCallback("ended", function(){"video has eneded"});
    * videoNode.unregisterCallback(); //remove all of the three callbacks.
    *
    */
    unregisterCallback(func){
        let toRemove = [];
        for(let callback of this._callbacks){
            if (func === undefined){
                toRemove.push(callback);
            } else if (callback.func === func){
                toRemove.push(callback);
            }
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
    
    /**
    * Start playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
    *
    * @param {number} time - the time from the currentTime of the VideoContext which to start playing, if negative will play as soon as possible.
    * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
    */
    start(time){
        if (this._state !== STATE.waiting){
            console.debug("SourceNode is has already been sequenced. Can't sequence twice.");
            return false;
        }

        this._startTime = this._currentTime + time;
        this._state = STATE.sequenced;
        return true;
    }
    
    /**
    * Start playback at an absolute time ont the VideoContext's timeline.
    *
    * @param {number} time - the time on the VideoContexts timeline to start playing.
    * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
    */
    startAt(time){
        if (this._state !== STATE.waiting){
            console.debug("SourceNode is has already been sequenced. Can't sequence twice.");
            return false;
        }
        this._startTime = time;
        this._state = STATE.sequenced;
        return true;
    }
    
    /**
    * Stop playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
    *
    * @param {number} time - the time from the currentTime of the video context which to stop playback.
    * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
    */
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
        this._stretchPaused = false;
        this._triggerCallbacks("durationchange", this.duration);
        return true;
    }
    
    /**
    * Stop playback at an absolute time ont the VideoContext's timeline.
    *
    * @param {number} time - the time on the VideoContexts timeline to stop playing.
    * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
    */
    stopAt(time){
        if (this._state === STATE.ended){
            console.debug("SourceNode has already ended. Cannot call stop.");
            return false;
        } else if (this._state === STATE.waiting){
            console.debug("SourceNode must have start called before stop is called");
            return false;
        }
        if (time <= this._startTime){
            console.debug("SourceNode must have a stop time after it's start time, not before.");
            return false;
        }
        this._stopTime = time;
        this._stretchPaused = false;
        this._triggerCallbacks("durationchange", this.duration);
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

        if(this._state === STATE.playing || (this._currentTime === 0 && this._startTime === 0)){
            this._triggerCallbacks("pause");
            this._state = STATE.paused;
        }
    }
    _play(){

        if(this._state === STATE.paused){
            this._triggerCallbacks("play");
            this._state = STATE.playing;
        }
    }

    _isReady(){
        if (this._state === STATE.playing || this._state === STATE.paused){
            return this._ready;
        }
        return true;
    }

    _update(currentTime, triggerTextureUpdate=true){
        this._rendered = true;
        let timeDelta = currentTime - this._currentTime; 

        //update the current time
        this._currentTime = currentTime;

        //update the state
        if (this._state === STATE.waiting || this._state === STATE.ended) return false;

        this._triggerCallbacks("render", currentTime);


        if (currentTime < this._startTime){
            clearTexture(this._gl, this._texture);
            this._state = STATE.sequenced;
        }


        if (currentTime >= this._startTime && this._state !== STATE.paused){
            if (this._state !== STATE.playing) this._triggerCallbacks("play");
            this._state = STATE.playing;
        }

        if (currentTime >= this._stopTime){
            clearTexture(this._gl, this._texture);
            this._triggerCallbacks("ended");
            this._state = STATE.ended;
        }

        //update this source nodes texture
        if (this._element === undefined || this._ready === false) return true;      
        
        if(this._state === STATE.playing){
            if(triggerTextureUpdate)updateTexture(this._gl, this._texture, this._element);
            if(this._stretchPaused){
                this._stopTime += timeDelta;
            }
        }

        return true;
    }

    /**
    * Clear any timeline state the node currently has, this puts the node in the "waiting" state, as if neither start nor stop had been called.
    */
    clearTimelineState(){
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._state = STATE.waiting;
    }
}

export {STATE as SOURCENODESTATE};