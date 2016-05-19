//Matthew Shotton, R&D User Experience,© BBC 2015

import VideoNode from "./SourceNodes/videonode.js";
import ImageNode from "./SourceNodes/imagenode.js";
import CanvasNode from "./SourceNodes/canvasnode.js";
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


export default class VideoContext{
    /**
    * Initialise the VideoContext and render to the specific canvas. A 2nd parameter can be passed to the constructor which is a function that get's called if the VideoContext fails to initialise.
    * 
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement, function(){console.error("Sorry, your browser dosen\'t support WebGL");});
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(10);
    * ctx.play();
    * 
    */
    constructor(canvas, initErrorCallback){
        this._canvas = canvas;
        this._gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, alpha: false });
        if(this._gl === null){
            console.error("Failed to intialise WebGL.");
            if(initErrorCallback)initErrorCallback();
            return;
        }

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

        this._timelineCallbacks = [];

        registerUpdateable(this);
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
    get canvas(){
        return this._canvas;
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
    *
    * @param {number} rate - this is the playback rate.
    *
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
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(10);
    * ctx.play();
    */
    play(){
        console.debug("VideoContext - playing");
        this._state = STATE.playing;
        return true;
    }

    /**
    * Pause playback of the VideoContext 
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * videoNode.connect(ctx.destination);
    * videoNode.start(0);
    * videoNode.stop(20);
    * ctx.currentTime = 10; // seek 10 seconds in
    * ctx.play();
    * setTimeout(function(){ctx.pause();}, 1000); //pause playback after roughly one second.
    */
    pause(){
        console.debug("VideoContext - pausing");
        this._state = STATE.paused;
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
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var videoElement = document.getElemenyById("video");
    * var ctx = new VideoContext(canvasElement);
    * var videoNode = ctx.createVideoSourceNode(videoElement);
    */
    createVideoSourceNode(src, sourceOffset=0, preloadTime=4, loop=false){
        let videoNode = new VideoNode(src, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime, loop);
        this._sourceNodes.push(videoNode);
        return videoNode;
    }

    /**
    * Create a new node representing an image source
    * 
    * @return {ImageNode} A new image node.
    * 
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var ctx = new VideoContext(canvasElement);
    * var imageNode = ctx.createVideoSourceNode("image.png");
    *
    * @example
    * var canvasElement = document.getElemenyById("canvas");
    * var imageElement = document.getElemenyById("image");
    * var ctx = new VideoContext(canvasElement);
    * var imageNode = ctx.createVideoSourceNode(imageElement);
    */
    createImageSourceNode(src, sourceOffset=0, preloadTime=4){
        let imageNode = new ImageNode(src, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime);
        this._sourceNodes.push(imageNode);
        return imageNode;
    }

    /**
    * Create a new node representing a canvas source
    * 
    * @return {CanvasNode} A new canvas node.
    */
    createCanvasSourceNode(canvas, sourceOffset=0, preloadTime=4){
        let canvasNode = new CanvasNode(canvas, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime);
        this._sourceNodes.push(canvasNode);
        return canvasNode;
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
    * var trackNode = videoCtx.createCompositingNode(combineDefinition);
    *
    * //create two videos which will play at back to back
    * var videoNode1 = ctx.createVideoSourceNode("video1.mp4");
    * videoNode1.play(0);
    * videoNode1.stop(10);
    * var videoNode2 = ctx.createVideoSourceNode("video2.mp4");
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
    createCompositingNode(definition){
        let compositingNode = new CompositingNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(compositingNode);
        return compositingNode;
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
    * var transitionNode = videoCtx.createTransitionNode(crossfadeDefinition);
    *
    * //create two videos which will overlap by two seconds
    * var videoNode1 = ctx.createVideoSourceNode("video1.mp4");
    * videoNode1.play(0);
    * videoNode1.stop(10);
    * var videoNode2 = ctx.createVideoSourceNode("video2.mp4");
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

            //utility functions
            function outputEdgesFor(node, connections){
                let results = [];
                for(let conn of connections){
                    if (conn.source === node){
                        results.push(conn);
                    }
                }
                return results;
            }
            function inputEdgesFor(node, connections){
                let results = [];
                for(let conn of connections){
                    if (conn.destination === node){
                        results.push(conn);
                    }
                }
                return results;   
            }
            function getInputlessNodes(connections){
                let inputLess = [];
                for (let conn of connections){
                    inputLess.push(conn.source);
                }
                for (let conn of connections){
                    let index = inputLess.indexOf(conn.destination);
                    if (index !== -1){
                        inputLess.splice(index, 1);
                    }
                }
                return inputLess;
            }


            let nodes = getInputlessNodes(connections);


            while (nodes.length > 0) {
                let node = nodes.pop();
                sortedNodes.push(node);
                for (let edge of outputEdgesFor(node, connections)){
                    let index = connections.indexOf(edge);
                    if (index > -1) connections.splice(index, 1);
                    if (inputEdgesFor(edge.destination, connections).length === 0){
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

    static get DEFINITIONS() {

        var aaf_video_scale = {
            title:"AAF Video Scale Effect",
            description: "A scale effect based on the AAF spec.",
            vertexShader : "\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                void main() {\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }",
            fragmentShader : "\
                precision mediump float;\
                uniform sampler2D u_image;\
                uniform float scaleX;\
                uniform float scaleY;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                void main(){\
                    vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));\
                    vec4 color = texture2D(u_image, pos);\
                    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
                        color = vec4(0.0,0.0,0.0,0.0);\
                    }\
                    gl_FragColor = color;\
                }",
            properties:{
                "scaleX":{type:"uniform", value:1.0},
                "scaleY":{type:"uniform", value:1.0},
            },
            inputs:["u_image"]
        };


        var aaf_video_position = {
            title:"AAF Video Position Effect",
            description: "A position effect based on the AAF spec.",
            vertexShader : "\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                void main() {\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                }",
            fragmentShader : "\
                precision mediump float;\
                uniform sampler2D u_image;\
                uniform float positionOffsetX;\
                uniform float positionOffsetY;\
                varying vec2 v_texCoord;\
                varying float v_progress;\
                void main(){\
                    vec2 pos = vec2(v_texCoord[0] - positionOffsetX/2.0, v_texCoord[1] -  positionOffsetY/2.0);\
                    vec4 color = texture2D(u_image, pos);\
                    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
                        color = vec4(0.0,0.0,0.0,0.0);\
                    }\
                    gl_FragColor = color;\
                }",
            properties:{
                "positionOffsetX":{type:"uniform", value:0.0},
                "positionOffsetY":{type:"uniform", value:0.0},
            },
            inputs:["u_image"]
        };


        var aaf_video_crop = {
            title:"AAF Video Crop Effect",
            description: "A crop effect based on the AAF spec.",
            vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform float cropLeft;\
                    uniform float cropRight;\
                    uniform float cropTop;\
                    uniform float cropBottom;\
                    varying vec2 v_texCoord;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                        if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                        if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                        if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
                        gl_FragColor = color;\
                    }",
                properties:{
                    "cropLeft":{type:"uniform", value:-1.0},
                    "cropRight":{type:"uniform", value:1.0},
                    "cropTop":{type:"uniform", value: -1.0},
                    "cropBottom":{type:"uniform", value: 1.0}
                },
                inputs:["u_image"]
        };


        var aaf_video_flip = {
            title:"AAF Video Scale Effect",
            description: "A flip effect based on the AAF spec. Mirrors the image in the x-axis",
            vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    void main(){\
                        vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);\
                        vec4 color = texture2D(u_image, coord);\
                        gl_FragColor = color;\
                    }",
                properties:{
                },
                inputs:["u_image"]
        };

        var aaf_video_flop = {
            title:"AAF Video Scale Effect",
            description: "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
            vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    varying vec2 v_texCoord;\
                    void main(){\
                        vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);\
                        vec4 color = texture2D(u_image, coord);\
                        gl_FragColor = color;\
                    }",
                properties:{
                },
                inputs:["u_image"]
        };



        var crossfade = {
            title:"Cross-Fade",
            description: "A cross-fade effect. Typically used as a transistion.",
            vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image_a;\
                    uniform sampler2D u_image_b;\
                    uniform float mix;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color_a = texture2D(u_image_a, v_texCoord);\
                        vec4 color_b = texture2D(u_image_b, v_texCoord);\
                        color_a[0] *= mix;\
                        color_a[1] *= mix;\
                        color_a[2] *= mix;\
                        color_a[3] *= mix;\
                        color_b[0] *= (1.0 - mix);\
                        color_b[1] *= (1.0 - mix);\
                        color_b[2] *= (1.0 - mix);\
                        color_b[3] *= (1.0 - mix);\
                        gl_FragColor = color_a + color_b;\
                    }",
                properties:{
                    "mix":{type:"uniform", value:0.0}
                },
                inputs:["u_image_a","u_image_b"]
        };

        var combine ={
                title:"Combine",
                description: "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
                vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform float a;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        gl_FragColor = color;\
                    }",
                properties:{
                    "a":{type:"uniform", value:0.0},
                },
                inputs:["u_image"]
        };

        var colorThreshold = {
                title:"Color Threshold",
                description: "Turns all pixels with a greater value than the specified threshold transparent.",
                vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform float a;\
                    uniform vec3 colorAlphaThreshold;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){\
                            color = vec4(0.0,0.0,0.0,0.0);\
                        }\
                        gl_FragColor = color;\
                    }",
                properties:{
                    "a":{type:"uniform", value:0.0},
                    "colorAlphaThreshold":{type:"uniform", value:[0.0,0.55,0.0]}
                },
                inputs:["u_image"]
            };

        var monochrome = {
                title:"Monochrome",
                description: "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
                vertexShader : "\
                    attribute vec2 a_position;\
                    attribute vec2 a_texCoord;\
                    varying vec2 v_texCoord;\
                    void main() {\
                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                        v_texCoord = a_texCoord;\
                    }",
                fragmentShader : "\
                    precision mediump float;\
                    uniform sampler2D u_image;\
                    uniform vec3 inputMix;\
                    uniform vec3 outputMix;\
                    varying vec2 v_texCoord;\
                    varying float v_mix;\
                    void main(){\
                        vec4 color = texture2D(u_image, v_texCoord);\
                        float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];\
                        color[0] = mono * outputMix[0];\
                        color[1] = mono * outputMix[1];\
                        color[2] = mono * outputMix[2];\
                        gl_FragColor = color;\
                    }",
                properties:{
                    "inputMix":{type:"uniform", value:[0.4,0.6,0.2]},
                    "outputMix":{type:"uniform", value:[1.0,1.0,1.0]}
                },
                inputs:["u_image"]
            };

        var hoizontalBlur = {
            title:"Horizontal Blur",
            description: "A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
            vertexShader : "\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                uniform float blurAmount;\
                varying vec2 v_texCoord;\
                varying vec2 v_blurTexCoords[14];\
                void main() {\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                    v_blurTexCoords[ 0] = v_texCoord + vec2(-0.028 * blurAmount, 0.0);\
                    v_blurTexCoords[ 1] = v_texCoord + vec2(-0.024 * blurAmount, 0.0);\
                    v_blurTexCoords[ 2] = v_texCoord + vec2(-0.020 * blurAmount, 0.0);\
                    v_blurTexCoords[ 3] = v_texCoord + vec2(-0.016 * blurAmount, 0.0);\
                    v_blurTexCoords[ 4] = v_texCoord + vec2(-0.012 * blurAmount, 0.0);\
                    v_blurTexCoords[ 5] = v_texCoord + vec2(-0.008 * blurAmount, 0.0);\
                    v_blurTexCoords[ 6] = v_texCoord + vec2(-0.004 * blurAmount, 0.0);\
                    v_blurTexCoords[ 7] = v_texCoord + vec2( 0.004 * blurAmount, 0.0);\
                    v_blurTexCoords[ 8] = v_texCoord + vec2( 0.008 * blurAmount, 0.0);\
                    v_blurTexCoords[ 9] = v_texCoord + vec2( 0.012 * blurAmount, 0.0);\
                    v_blurTexCoords[10] = v_texCoord + vec2( 0.016 * blurAmount, 0.0);\
                    v_blurTexCoords[11] = v_texCoord + vec2( 0.020 * blurAmount, 0.0);\
                    v_blurTexCoords[12] = v_texCoord + vec2( 0.024 * blurAmount, 0.0);\
                    v_blurTexCoords[13] = v_texCoord + vec2( 0.028 * blurAmount, 0.0);\
                }",
            fragmentShader : "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying vec2 v_blurTexCoords[14];\
                void main(){\
                    gl_FragColor = vec4(0.0);\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\
                }",
            properties:{
                "blurAmount":{type:"uniform", value:1.0},
            },
            inputs:["u_image"]
        };

        var verticalBlur = {
            title:"Vertical Blur",
            description: "A vertical blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
            vertexShader : "\
                attribute vec2 a_position;\
                attribute vec2 a_texCoord;\
                varying vec2 v_texCoord;\
                uniform float blurAmount;\
                varying vec2 v_blurTexCoords[14];\
                void main() {\
                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
                    v_texCoord = a_texCoord;\
                    v_blurTexCoords[ 0] = v_texCoord + vec2(0.0,-0.028 * blurAmount);\
                    v_blurTexCoords[ 1] = v_texCoord + vec2(0.0,-0.024 * blurAmount);\
                    v_blurTexCoords[ 2] = v_texCoord + vec2(0.0,-0.020 * blurAmount);\
                    v_blurTexCoords[ 3] = v_texCoord + vec2(0.0,-0.016 * blurAmount);\
                    v_blurTexCoords[ 4] = v_texCoord + vec2(0.0,-0.012 * blurAmount);\
                    v_blurTexCoords[ 5] = v_texCoord + vec2(0.0,-0.008 * blurAmount);\
                    v_blurTexCoords[ 6] = v_texCoord + vec2(0.0,-0.004 * blurAmount);\
                    v_blurTexCoords[ 7] = v_texCoord + vec2(0.0, 0.004 * blurAmount);\
                    v_blurTexCoords[ 8] = v_texCoord + vec2(0.0, 0.008 * blurAmount);\
                    v_blurTexCoords[ 9] = v_texCoord + vec2(0.0, 0.012 * blurAmount);\
                    v_blurTexCoords[10] = v_texCoord + vec2(0.0, 0.016 * blurAmount);\
                    v_blurTexCoords[11] = v_texCoord + vec2(0.0, 0.020 * blurAmount);\
                    v_blurTexCoords[12] = v_texCoord + vec2(0.0, 0.024 * blurAmount);\
                    v_blurTexCoords[13] = v_texCoord + vec2(0.0, 0.028 * blurAmount);\
                }",
            fragmentShader : "\
                precision mediump float;\
                uniform sampler2D u_image;\
                varying vec2 v_texCoord;\
                varying vec2 v_blurTexCoords[14];\
                void main(){\
                    gl_FragColor = vec4(0.0);\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\
                    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\
                }",
            properties:{
                "blurAmount":{type:"uniform", value:1.0},
            },
            inputs:["u_image"]
        };

        return {
            CROSSFADE: crossfade,
            COMBINE: combine,
            COLORTHRESHOLD: colorThreshold,
            MONOCHROME: monochrome,
            HORIZONTAL_BLUR:hoizontalBlur,
            VERTICAL_BLUR:verticalBlur,
            AAF_VIDEO_CROP: aaf_video_crop,
            AAF_VIDEO_POSITION: aaf_video_position,
            AAF_VIDEO_SCALE: aaf_video_scale,
            AAF_VIDEO_FLIP: aaf_video_flip,
            AAF_VIDEO_FLOP: aaf_video_flop
        };
    }


}

VideoContext.visualiseVideoContextTimeline = visualiseVideoContextTimeline;
VideoContext.visualiseVideoContextGraph = visualiseVideoContextGraph;
VideoContext.createControlFormForNode = createControlFormForNode;
VideoContext.createSigmaGraphDataFromRenderGraph = createSigmaGraphDataFromRenderGraph;
