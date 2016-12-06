//Matthew Shotton, R&D User Experience,© BBC 2015

import "babel-polyfill";
import VideoNode from "./SourceNodes/videonode.js";
import ImageNode from "./SourceNodes/imagenode.js";
import CanvasNode from "./SourceNodes/canvasnode.js";
import { SOURCENODESTATE } from "./SourceNodes/sourcenode.js";
import CompositingNode from "./ProcessingNodes/compositingnode.js";
import DestinationNode from "./DestinationNode/destinationnode.js";
import EffectNode from "./ProcessingNodes/effectnode.js";
import TransitionNode from "./ProcessingNodes/transitionnode.js";
import RenderGraph from "./rendergraph.js";
import VideoElementCache from "./videoelementcache.js";
import { createSigmaGraphDataFromRenderGraph, visualiseVideoContextTimeline, visualiseVideoContextGraph, createControlFormForNode, UpdateablesManager, exportToJSON } from "./utils.js";
import DEFINITIONS from "./Definitions/definitions.js";

let updateablesManager = new UpdateablesManager();

export default class VideoContext{
    /**
    * Initialise the VideoContext and render to the specific canvas. A 2nd parameter can be passed to the constructor which is a function that get's called if the VideoContext fails to initialise.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement, function(){console.error("Sorry, your browser dosen\'t support WebGL");});
    * var videoNode = ctx.video("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(10);
    * ctx.play();
    *
    */
    constructor(canvas, initErrorCallback, options={"preserveDrawingBuffer":true, "manualUpdate":false, "endOnLastSourceEnd":true, useVideoElementCache:true, videoElementCacheSize:6, webglContextAttributes: {preserveDrawingBuffer: true, alpha: false }}){
        this._canvas = canvas;
        let manualUpdate = false;
        this.endOnLastSourceEnd = true;
        let webglContextAttributes = {preserveDrawingBuffer: true, alpha: false };

        if ("manualUpdate" in options) manualUpdate = options.manualUpdate;
        if ("endOnLastSourceEnd" in options) this.endOnLastSourceEnd = options.endOnLastSourceEnd;
        if ("webglContextAttributes" in options) webglContextAttributes = options.webglContextAttributes;

        if (webglContextAttributes.alpha === undefined) webglContextAttributes.alpha = false;
        if (webglContextAttributes.alpha === true){
            console.error("webglContextAttributes.alpha must be false for correct opeation");
        }


        this._gl = canvas.getContext("experimental-webgl", webglContextAttributes);
        if(this._gl === null){
            console.error("Failed to intialise WebGL.");
            if(initErrorCallback)initErrorCallback();
            return;
        }

        // Initialise the video element cache
        if(!options.useVideoElementCache) options.useVideoElementCache = true;
        this._useVideoElementCache = options.useVideoElementCache;
        if (this._useVideoElementCache){
            if (!options.videoElementCacheSize) options.videoElementCacheSize = 5;
            this._videoElementCache = new VideoElementCache(options.videoElementCacheSize);
        }


        this._renderGraph = new RenderGraph();
        this._sourceNodes = [];
        this._processingNodes = [];
        this._timeline = [];
        this._currentTime = 0;
        this._state = VideoContext.STATE.PAUSED;
        this._playbackRate = 1.0;
        this._destinationNode = new DestinationNode(this._gl, this._renderGraph);

        this._callbacks = new Map();
        this._callbacks.set("stalled", []);
        this._callbacks.set("update", []);
        this._callbacks.set("ended", []);

        this._timelineCallbacks = [];

        if(!manualUpdate){
            updateablesManager.register(this);
        }
    }

    /**
    * Register a callback to happen at a specific point in time.
    * @param {number} time - the time at which to trigger the callback.
    * @param {Function} func - the callback to register.
    * @param {number} ordering - the order in which to call the callback if more than one is registered for the same time.
    */
    registerTimelineCallback(time, func, ordering= 0){
        this._timelineCallbacks.push({"time":time, "func":func, "ordering":ordering});
    }


    /**
    * Unregister a callback which happens at a specific point in time.
    * @param {Function} func - the callback to unregister.
    */
    unregisterTimelineCallback(func){
        let toRemove = [];
        for(let callback of this._timelineCallbacks){
            if (callback.func === func){
                toRemove.push(callback);
            }
        }
        for (let callback of toRemove){
            let index = this._timelineCallbacks.indexOf(callback);
            this._timelineCallbacks.splice(index, 1);
        }
    }

    /**
    * Regsiter a callback to listen to one of the following events: "stalled", "update", "ended"
    *
    * "stalled" happend anytime playback is stopped due to unavailbale data for playing assets (i.e video still loading)
    * . "update" is called any time a frame is rendered to the screen. "ended" is called once plackback has finished
    * (i.e ctx.currentTime == ctx.duration).
    *
    * @param {String} type - the event to register against ("stalled", "update", or "ended").
    * @param {Function} func - the callback to register.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * ctx.registerCallback("stalled", function(){console.log("Playback stalled");});
    * ctx.registerCallback("update", function(){console.log("new frame");});
    * ctx.registerCallback("ended", function(){console.log("Playback ended");});
    */
    registerCallback(type, func){
        if (!this._callbacks.has(type)) return false;
        this._callbacks.get(type).push(func);
    }

    /**
    * Remove a previously registed callback
    *
    * @param {Function} func - the callback to remove.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    *
    * //the callback
    * var updateCallback = function(){console.log("new frame")};
    *
    * //register the callback
    * ctx.registerCallback("update", updateCallback);
    * //then unregister it
    * ctx.unregisterCallback(updateCallback);
    *
    */
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
    * Get the canvas that the VideoContext is using.
    *
    * @return {HTMLElement} The canvas that the VideoContext is using.
    *
    */
    get element(){
        return this._canvas;
    }

    /**
    * Get the current state.
    *
    * This will be either
    *  - VideoContext.STATE.PLAYING: all sources are active
    *  - VideoContext.STATE.PAUSED: all sources are paused
    *  - VideoContext.STATE.STALLED: one or more sources is unable to play
    *  - VideoContext.STATE.ENDED: all sources have finished playing
    *  - VideoContext.STATE.BROKEN: the render graph is in a broken state
    * @return {number} The number representing the state.
    *
    */
    get state(){
        return this._state;
    }

    /**
    * Set the progress through the internal timeline.
    * Setting this can be used as a way to implement a scrubaable timeline.
    *
    * @param {number} currentTime - this is the currentTime to set the context to.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.video("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(20);
    * ctx.currentTime = 10; // seek 10 seconds in
    * ctx.play();
    *
    */
    set currentTime(currentTime){
        console.debug("VideoContext - seeking to", currentTime);
        if (currentTime < this._duration && this._state === VideoContext.STATE.ENDED) this._state = VideoContext.STATE.PAUSED;
        if (typeof currentTime === "string" || currentTime instanceof String){
            currentTime = parseFloat(currentTime);
        }

        for (let i = 0; i < this._sourceNodes.length; i++) {
            this._sourceNodes[i]._seek(currentTime);
        }
        for (let i = 0; i < this._processingNodes.length; i++) {
            this._processingNodes[i]._seek(currentTime);
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
    * var videoNode = ctx.video("video.mp4");
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
    * var videoNode = ctx.video("video.mp4");
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
            if (this._sourceNodes[i].state !== SOURCENODESTATE.waiting &&this._sourceNodes[i]._stopTime > maxTime){
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
    * var videoNode = ctx.video("video.mp4");
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
    *
    * @param {number} rate - this is the playback rate.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.video("video.mp4");
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
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.video("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(10);
    * ctx.play();
    */
    play(){
        console.debug("VideoContext - playing");
        //Initialise the video elemnt cache
        if (this._videoElementCache)this._videoElementCache.init();
        // set the state.
        this._state = VideoContext.STATE.PLAYING;
        return true;
    }

    /**
    * Pause playback of the VideoContext
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.video("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(20);
    * ctx.currentTime = 10; // seek 10 seconds in
    * ctx.play();
    * setTimeout(function(){ctx.pause();}, 1000); //pause playback after roughly one second.
    */
    pause(){
        console.debug("VideoContext - pausing");
        this._state = VideoContext.STATE.PAUSED;
        return true;
    }


    /**
    * Create a new node representing a video source
    *
    * @return {VideoNode} A new video node.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.video("video.mp4");
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var videoElement = document.getElemenyById("video");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.video(videoElement);
    */
    video(src, sourceOffset=0, preloadTime=4, videoElementAttributes={}){
        let videoNode = new VideoNode(src, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime, this._videoElementCache, videoElementAttributes);
        this._sourceNodes.push(videoNode);
        return videoNode;
    }

    /**
    * @depricated
    */
    createVideoSourceNode(src, sourceOffset=0, preloadTime=4, videoElementAttributes={}){
        this._depricate("Warning: createVideoSourceNode will be depricated in v1.0, please switch to using VideoContext.video()");
        return this.video(src, sourceOffset, preloadTime, videoElementAttributes);
    }


    /**
    * Create a new node representing an image source
    *
    * @return {ImageNode} A new image node.
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var imageNode = ctx.image("image.png");
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var imageElement = document.getElemenyById("image");
    * var ctx = new VideoContext(canvasElement);
    * var imageNode = ctx.image(imageElement);
    */
    image(src, sourceOffset=0, preloadTime=4, imageElementAttributes={}){
        let imageNode = new ImageNode(src, this._gl, this._renderGraph, this._currentTime, preloadTime, imageElementAttributes);
        this._sourceNodes.push(imageNode);
        return imageNode;
    }

    /**
    * @depricated
    */
    createImageSourceNode(src, sourceOffset=0, preloadTime=4, imageElementAttributes={}){
        this._depricate("Warning: createImageSourceNode will be depricated in v1.0, please switch to using VideoContext.image()");
        return this.image(src, sourceOffset, preloadTime, imageElementAttributes);
    }


    /**
    * Create a new node representing a canvas source
    *
    * @return {CanvasNode} A new canvas node.
    */
    canvas(canvas, sourceOffset=0, preloadTime=4){
        let canvasNode = new CanvasNode(canvas, this._gl, this._renderGraph, this._currentTime, preloadTime);
        this._sourceNodes.push(canvasNode);
        return canvasNode;
    }    
    
    /**
    * @depricated
    */
    createCanvasSourceNode(canvas, sourceOffset=0, preloadTime=4){
        this._depricate("Warning: createCanvasSourceNode will be depricated in v1.0, please switch to using VideoContext.canvas()");
        return this.canvas(canvas, sourceOffset, preloadTime);
    }


    /**
    * Create a new effect node.
    * @return {EffectNode} A new effect node created from the passed definition
    */
    effect(definition){
        let effectNode = new EffectNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(effectNode);
        return effectNode;
    }
    
    /**
    * @depricated
    */
    createEffectNode(definition){
        this._depricate("Warning: createEffectNode will be depricated in v1.0, please switch to using VideoContext.effect()");
        return this.effect(definition);
    }

    /**
    * Create a new compositiing node.
    *
    * Compositing nodes are used for operations such as combining multiple video sources into a single track/connection for further processing in the graph.
    *
    * A compositing node is slightly different to other processing nodes in that it only has one input in it's definition but can have unlimited connections made to it.
    * The shader in the definition is run for each input in turn, drawing them to the output buffer. This means there can be no interaction between the spearte inputs to a compositing node, as they are individually processed in seperate shader passes.
    *
    * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create.
    *
    * @return {CompositingNode} A new compositing node created from the passed definition.
    *
    * @example
    *
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    *
    * //A simple compositing node definition which just renders all the inputs to the output buffer.
    * var combineDefinition = {
    *     vertexShader : "\
    *         attribute vec2 a_position;\
    *         attribute vec2 a_texCoord;\
    *         varying vec2 v_texCoord;\
    *         void main() {\
    *             gl_Position = vec4(vec2(2.0,2.0)*vec2(1.0, 1.0), 0.0, 1.0);\
    *             v_texCoord = a_texCoord;\
    *         }",
    *     fragmentShader : "\
    *         precision mediump float;\
    *         uniform sampler2D u_image;\
    *         uniform float a;\
    *         varying vec2 v_texCoord;\
    *         varying float v_progress;\
    *         void main(){\
    *             vec4 color = texture2D(u_image, v_texCoord);\
    *             gl_FragColor = color;\
    *         }",
    *     properties:{
    *         "a":{type:"uniform", value:0.0},
    *     },
    *     inputs:["u_image"]
    * };
    * //Create the node, passing in the definition.
    * var trackNode = videoCtx.compositor(combineDefinition);
    *
    * //create two videos which will play at back to back
    * var videoNode1 = ctx.video("video1.mp4");
    * videoNode1.play(0);
    * videoNode1.stop(10);
    * var videoNode2 = ctx.video("video2.mp4");
    * videoNode2.play(10);
    * videoNode2.stop(20);
    *
    * //Connect the nodes to the combine node. This will give a single connection representing the two videos which can
    * //be connected to other effects such as LUTs, chromakeyers, etc.
    * videoNode1.connect(trackNode);
    * videoNode2.connect(trackNode);
    *
    * //Don't do anything exciting, just connect it to the output.
    * trackNode.connect(ctx.destination);
    *
    */
    compositor(definition){
        let compositingNode = new CompositingNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(compositingNode);
        return compositingNode;    
    }

    /**
    * @depricated
    */
    createCompositingNode(definition){
        this._depricate("Warning: createCompositingNode will be depricated in v1.0, please switch to using VideoContext.compositor()");
        return this.compositor(definition);
    }



    /**
    * Create a new transition node.
    *
    * Transistion nodes are a type of effect node which have parameters which can be changed as events on the timeline.
    *
    * For example a transition node which cross-fades between two videos could have a "mix" property which sets the
    * progress through the transistion. Rather than having to write your own code to adjust this property at specfic
    * points in time a transition node has a "transition" function which takes a startTime, stopTime, targetValue, and a
    * propertyName (which will be "mix"). This will linearly interpolate the property from the curernt value to
    * tragetValue between the startTime and stopTime.
    *
    * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the transition node to create.
    * @return {TransitionNode} A new transition node created from the passed definition.
    * @example
    *
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    *
    * //A simple cross-fade node definition which cross-fades between two videos based on the mix property.
    * var crossfadeDefinition = {
    *     vertexShader : "\
    *        attribute vec2 a_position;\
    *        attribute vec2 a_texCoord;\
    *        varying vec2 v_texCoord;\
    *        void main() {\
    *            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
    *            v_texCoord = a_texCoord;\
    *         }",
    *     fragmentShader : "\
    *         precision mediump float;\
    *         uniform sampler2D u_image_a;\
    *         uniform sampler2D u_image_b;\
    *         uniform float mix;\
    *         varying vec2 v_texCoord;\
    *         varying float v_mix;\
    *         void main(){\
    *             vec4 color_a = texture2D(u_image_a, v_texCoord);\
    *             vec4 color_b = texture2D(u_image_b, v_texCoord);\
    *             color_a[0] *= mix;\
    *             color_a[1] *= mix;\
    *             color_a[2] *= mix;\
    *             color_a[3] *= mix;\
    *             color_b[0] *= (1.0 - mix);\
    *             color_b[1] *= (1.0 - mix);\
    *             color_b[2] *= (1.0 - mix);\
    *             color_b[3] *= (1.0 - mix);\
    *             gl_FragColor = color_a + color_b;\
    *         }",
    *     properties:{
    *         "mix":{type:"uniform", value:0.0},
    *     },
    *     inputs:["u_image_a","u_image_b"]
    * };
    *
    * //Create the node, passing in the definition.
    * var transitionNode = videoCtx.transition(crossfadeDefinition);
    *
    * //create two videos which will overlap by two seconds
    * var videoNode1 = ctx.video("video1.mp4");
    * videoNode1.play(0);
    * videoNode1.stop(10);
    * var videoNode2 = ctx.video("video2.mp4");
    * videoNode2.play(8);
    * videoNode2.stop(18);
    *
    * //Connect the nodes to the transistion node.
    * videoNode1.connect(transitionNode);
    * videoNode2.connect(transitionNode);
    *
    * //Set-up a transition which happens at the crossover point of the playback of the two videos
    * transitionNode.transition(8,10,1.0,"mix");
    *
    * //Connect the transition node to the output
    * transitionNode.connect(ctx.destination);
    *
    * //start playback
    * ctx.play();
    */
    transition(definition){
        let transitionNode = new TransitionNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(transitionNode);
        return transitionNode;
    }
    
    /**
    * @depricated
    */
    createTransitionNode(definition){
        this._depricate("Warning: createTransitionNode will be depricated in v1.0, please switch to using VideoContext.transition()");
        return this.transition(definition);
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


    /**
    * This allows manual calling of the update loop of the videoContext.
    *
    * @param {Number} dt - The difference in seconds between this and the previous calling of update.
    * @example
    *
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement, undefined, {"manualUpdate" : true});
    *
    * var previousTime;
    * function update(time){
    *     if (previousTime === undefined) previousTime = time;
    *     var dt = (time - previousTime)/1000;
    *     ctx.update(dt);
    *     previousTime = time;
    *     requestAnimationFrame(update);
    * }
    * update();
    *
    */
    update(dt){
        this._update(dt);
    }


    _update(dt){
        if (this._state === VideoContext.STATE.PLAYING || this._state === VideoContext.STATE.STALLED || this._state === VideoContext.STATE.PAUSED) {
            this._callCallbacks("update");

            if (this._state !== VideoContext.STATE.PAUSED){
                if (this._isStalled()){
                    this._callCallbacks("stalled");
                    this._state = VideoContext.STATE.STALLED;
                }else{
                    this._state = VideoContext.STATE.PLAYING;
                }
            }

            if(this._state === VideoContext.STATE.PLAYING){
                //Handle timeline callbacks.
                let activeCallbacks = new Map();
                for(let callback of this._timelineCallbacks){
                    if (callback.time >= this.currentTime && callback.time < (this._currentTime + dt * this._playbackRate)){
                        //group the callbacks by time
                        if(!activeCallbacks.has(callback.time)) activeCallbacks.set(callback.time, []);
                        activeCallbacks.get(callback.time).push(callback);
                    }
                }


                //Sort the groups of callbacks by the times of the groups
                let timeIntervals = Array.from(activeCallbacks.keys());
                timeIntervals.sort(function(a, b){
                    return a - b;
                });

                for (let t of timeIntervals){
                    let callbacks = activeCallbacks.get(t);
                    callbacks.sort(function(a,b){
                        return a.ordering - b.ordering;
                    });
                    for(let callback of callbacks){
                        callback.func();
                    }
                }

                // activeCallbacks.sort(function(a, b) {
                //     return a.ordering - b.ordering;
                // });
                // for(let callback of activeCallbacks){
                //     callback.func();
                // }


                this._currentTime += dt * this._playbackRate;
                if(this._currentTime > this.duration && this._endOnLastSourceEnd){
                    this._callCallbacks("ended");
                    this._state = VideoContext.STATE.ENDED;
                }
            }

            for (let i = 0; i < this._sourceNodes.length; i++) {
                let sourceNode = this._sourceNodes[i];

                if(this._state === VideoContext.STATE.STALLED){
                    if (sourceNode._isReady() && sourceNode._state === SOURCENODESTATE.playing) sourceNode._pause();
                }
                if(this._state === VideoContext.STATE.PAUSED){
                    sourceNode._pause();
                }
                if(this._state === VideoContext.STATE.PLAYING){
                    sourceNode._play();
                }
                sourceNode._update(this._currentTime);
            }




            /*
            * Itterate the directed acyclic graph using Khan's algorithm (KHAAAAAN!).
            *
            * This has highlighted a bunch of ineffencies in the rendergraph class about how its stores connections.
            * Mainly the fact that to get inputs for a node you have to iterate the full list of connections rather than
            * a node owning it's connections.
            * The trade off with changing this is making/removing connections becomes more costly performance wise, but
            * this is deffinately worth while because getting the connnections is a much more common operation.
            *
            * TL;DR Future matt - refactor this.
            *
            */
            let sortedNodes = [];
            let connections = this._renderGraph.connections.slice();
            let nodes = RenderGraph.getInputlessNodes(connections);


            while (nodes.length > 0) {
                let node = nodes.pop();
                sortedNodes.push(node);
                for (let edge of RenderGraph.outputEdgesFor(node, connections)){
                    let index = connections.indexOf(edge);
                    if (index > -1) connections.splice(index, 1);
                    if (RenderGraph.inputEdgesFor(edge.destination, connections).length === 0){
                        nodes.push(edge.destination);
                    }
                }
            }

            for (let node of sortedNodes){
                if (this._sourceNodes.indexOf(node) === -1){
                    node._update(this._currentTime);
                    node._render();
                }
            }

            /*for (let node of this._processingNodes) {
                node._update(this._currentTime);
                node._render();
            }
            this._destinationNode._render();*/

        }
    }

    _depricate(msg){
        console.log(msg);
    }

    static get DEFINITIONS() {
        return DEFINITIONS;
    }
}

//playing - all sources are active
//paused - all sources are paused
//stalled - one or more sources is unable to play
//ended - all sources have finished playing
//broken - the render graph is in a broken state
VideoContext.STATE = {};
VideoContext.STATE.PLAYING = 0;
VideoContext.STATE.PAUSED = 1;
VideoContext.STATE.STALLED = 2;
VideoContext.STATE.ENDED = 3;
VideoContext.STATE.BROKEN = 4;

VideoContext.visualiseVideoContextTimeline = visualiseVideoContextTimeline;
VideoContext.visualiseVideoContextGraph = visualiseVideoContextGraph;
VideoContext.createControlFormForNode = createControlFormForNode;
VideoContext.createSigmaGraphDataFromRenderGraph = createSigmaGraphDataFromRenderGraph;
VideoContext.exportToJSON = exportToJSON;