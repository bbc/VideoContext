import VideoNode from "./SourceNodes/videonode.js";
import ImageNode from "./SourceNodes/imagenode.js";
import { SOURCENODESTATE } from "./SourceNodes/sourcenode.js";
import CompositingNode from "./ProcessingNodes/compositingnode.js";
import DestinationNode from "./DestinationNode/destinationnode.js";
import EffectNode from "./ProcessingNodes/effectnode.js";
import TransitionNode from "./ProcessingNodes/transitionnode.js";
import RenderGraph from "./rendergraph.js";
import { createSigmaGraphDataFromRenderGraph, visualiseVideoContextTimeline, visualiseVideoContextGraph, createControlFormForNode } from "./utils.js";

let updateables = [];
let previousTime;
function registerUpdateable(updateable){
    updateables.push(updateable);
}
function update(time){
    if (previousTime === undefined) previousTime = time;
    let dt = (time - previousTime)/1000;
    for(let i = 0; i < updateables.length; i++){
        updateables[i]._update(dt);
    }
    previousTime = time;
    requestAnimationFrame(update);
}
update();


let STATE = {"playing":0, "paused":1, "stalled":2, "ended":3, "broken":4};
//playing - all sources are active
//paused - all sources are paused
//stalled - one or more sources is unable to play
//ended - all sources have finished playing
//broken - the render graph is in a broken state


class VideoContext{
    constructor(canvas){
        this._canvas = canvas;
        this._gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, alpha: false });
        this._renderGraph = new RenderGraph();
        this._sourceNodes = [];
        this._processingNodes = [];
        this._timeline = [];
        this._currentTime = 0;
        this._state = STATE.paused;
        this._playbackRate = 1.0;
        this._destinationNode = new DestinationNode(this._gl, this._renderGraph);

        this._callbacks = new Map();
        this._callbacks.set("stalled", []);
        this._callbacks.set("update", []);
        this._callbacks.set("ended", []);

        registerUpdateable(this);
    }

    registerCallback(type, func){
        if (!this._callbacks.has(type)) return false;
        this._callbacks.get(type).push(func);
    }

    unregisterCallback(func){
        for(let funcArray of this._callbacks.values()){
            let index = funcArray.indexOf(func);
            if (index !== -1){
                funcArray.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    _callCallbacks(type){
        let funcArray = this._callbacks.get(type);
        for (let func of funcArray){
            func(this._currentTime);
        }
    }

    /**
    * Set the progress through the internal timeline.
    * Setting this can be used as a way to implement a scrubaable timeline.
    * 
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(20);
    * ctx.currentTime = 10; // seek 10 seconds in
    * ctx.play();
    *
    */
    set currentTime(currentTime){
        console.debug("VideoContext - seeking to", currentTime);
        if (currentTime < this._duration && this._state === STATE.ended) this._state = STATE.duration;
        if (typeof currentTime === 'string' || currentTime instanceof String){
            currentTime = parseFloat(currentTime);
        }

        for (let i = 0; i < this._sourceNodes.length; i++) {
            this._sourceNodes[i]._seek(currentTime);
        }
        this._currentTime = currentTime;
    }

    /**
    * Get how far through the internal timeline has been played.
    *
    * Getting this value will give the current playhead position. Can be used for updating timelines.
    * @return {number} The time in seconds through the current playlist.
    * 
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(10);
    * ctx.play();
    * setTimeout(funtion(){console.log(ctx.currentTime);},1000); //should print roughly 1.0 
    *
    */
    get currentTime(){
        return this._currentTime;
    }

    /**
    * Get the time at which the last node in the current internal timeline finishes playing.
    *
    * @return {number} The end time in seconds of the last video node to finish playing.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * console.log(ctx.duration); //prints 0 
    *
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(10);
    *
    * console.log(ctx.duration); //prints 10 
    *
    * ctx.play();
    */
    get duration(){
        let maxTime = 0;
        for (let i = 0; i < this._sourceNodes.length; i++) {
            if (this._sourceNodes[i]._stopTime > maxTime){
                maxTime = this._sourceNodes[i]._stopTime;
            }
        }
        return maxTime;
    }


    /**
    * Get the final node in the render graph which represents the canvas to display content on to.
    *
    * This proprety is read-only and there can only ever be one destination node. Other nodes can connect to this but you cannot connect this node to anything.
    *
    * @return {DestinationNode} A graph node represnting the canvas to display the content on.
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.start(0);
    * videoNode.stop(10);
    * videoNode.connect(ctx.destination);
    *
    */
    get destination(){
        return this._destinationNode;
    }

    /**
    * Set the playback rate of the VideoContext instance.
    * This will alter the playback speed of all media elements played through the VideoContext.
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.start(0);
    * videoNode.stop(10);
    * videoNode.connect(ctx.destination);
    * ctx.playbackRate = 2;
    * ctx.play(); // Double playback rate means this will finish playing in 5 seconds.    
    */
    set playbackRate(rate){
        for (let node of this._sourceNodes) {
            if (node.constructor.name === "VideoNode") node._globalPlaybackRate = rate;
        }
        this._playbackRate = rate;
    }


    /**
    *  Return the current playbackRate of the video context.
    * @return {number} A value representing the playbackRate. 1.0 by default.
    */
    get playbackRate(){
        return this._playbackRate;
    }


    /**
    * Start the VideoContext playing
    */
    play(){
        console.debug("VideoContext - playing");
        this._state = STATE.playing;
        return true;
    }

    /**
    * Pause playback of the VideoContext 
    */
    pause(){
        console.debug("VideoContext - pausing");
        this._state = STATE.paused;
        return true;
    }

    /**
    * Create a new node representing a video source
    * @return {VideoNode} A new video node.
    */
    createVideoSourceNode(src, sourceOffset=0, preloadTime=4){
        let videoNode = new VideoNode(src, this._gl, this._renderGraph, this._playbackRate, sourceOffset, preloadTime);
        this._sourceNodes.push(videoNode);
        return videoNode;
    }

    /**
    * Create a new node representing an image source
    * @return {ImageNode} A new image node.
    */
    createImageSourceNode(src, sourceOffset=0, preloadTime=4){
        let imageNode = new ImageNode(src, this._gl, this._renderGraph, this._playbackRate, sourceOffset, preloadTime);
        this._sourceNodes.push(imageNode);
        return imageNode;
    }

    /**
    * Create a new effect node.
    * @return {EffectNode} A new effect node created from the passed definition
    */
    createEffectNode(definition){
        let effectNode = new EffectNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(effectNode);
        return effectNode;
    }

    /**
    * Create a new compositiing node.
    * @return {CompositingNode} A new compositing node created from the passed definition.
    */
    createCompositingNode(definition){
        let compositingNode = new CompositingNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(compositingNode);
        return compositingNode;
    }

    /**
    * Create a new transition node.
    * @return {TransitionNode} A new transition node created from the passed definition.
    */
    createTransitionNode(definition){
        let transitionNode = new TransitionNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(transitionNode);
        return transitionNode;
    }

    _isStalled(){
        for (let i = 0; i < this._sourceNodes.length; i++) {
            let sourceNode = this._sourceNodes[i];
            if (!sourceNode._isReady()){
                return true;
            }
        }
        return false;
    }

    _update(dt){
        if (this._state === STATE.playing || this._state === STATE.stalled || this._state === STATE.paused) {
            this._callCallbacks("update");

            if (this._state !== STATE.paused){
                if (this._isStalled()){
                    this._callCallbacks("stalled");
                    this._state = STATE.stalled;
                }else{
                    this._state = STATE.playing;
                }    
            }
            
            if(this._state === STATE.playing){
                    this._currentTime += dt * this._playbackRate;
                    if(this._currentTime > this.duration){
                        this._callCallbacks("ended");
                        this._state = STATE.ended;
                    }
            }

            for (let i = 0; i < this._sourceNodes.length; i++) {
                let sourceNode = this._sourceNodes[i];
                sourceNode._update(this._currentTime);

                if(this._state === STATE.stalled){
                    if (sourceNode._isReady() && sourceNode._state === SOURCENODESTATE.playing) sourceNode._pause();
                }
                if(this._state === STATE.paused){
                    if (sourceNode._state === SOURCENODESTATE.playing)sourceNode._pause();
                }
                if(this._state === STATE.playing){
                    if (sourceNode._state === SOURCENODESTATE.paused)sourceNode._play();
                }
            }

            for (let node of this._processingNodes) {
                node._update(this._currentTime);
                node._render();
            }
            this._destinationNode._render();
        }
    }


}

VideoContext.visualiseVideoContextTimeline = visualiseVideoContextTimeline;
VideoContext.visualiseVideoContextGraph = visualiseVideoContextGraph;
VideoContext.createControlFormForNode = createControlFormForNode;
VideoContext.createSigmaGraphDataFromRenderGraph = createSigmaGraphDataFromRenderGraph;
export default VideoContext;
