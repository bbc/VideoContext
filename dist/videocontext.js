var VideoContext =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _SourceNodesVideonodeJs = __webpack_require__(1);

	var _SourceNodesVideonodeJs2 = _interopRequireDefault(_SourceNodesVideonodeJs);

	var _SourceNodesImagenodeJs = __webpack_require__(5);

	var _SourceNodesImagenodeJs2 = _interopRequireDefault(_SourceNodesImagenodeJs);

	var _SourceNodesCanvasnodeJs = __webpack_require__(6);

	var _SourceNodesCanvasnodeJs2 = _interopRequireDefault(_SourceNodesCanvasnodeJs);

	var _SourceNodesSourcenodeJs = __webpack_require__(2);

	var _ProcessingNodesCompositingnodeJs = __webpack_require__(7);

	var _ProcessingNodesCompositingnodeJs2 = _interopRequireDefault(_ProcessingNodesCompositingnodeJs);

	var _DestinationNodeDestinationnodeJs = __webpack_require__(10);

	var _DestinationNodeDestinationnodeJs2 = _interopRequireDefault(_DestinationNodeDestinationnodeJs);

	var _ProcessingNodesEffectnodeJs = __webpack_require__(11);

	var _ProcessingNodesEffectnodeJs2 = _interopRequireDefault(_ProcessingNodesEffectnodeJs);

	var _ProcessingNodesTransitionnodeJs = __webpack_require__(12);

	var _ProcessingNodesTransitionnodeJs2 = _interopRequireDefault(_ProcessingNodesTransitionnodeJs);

	var _rendergraphJs = __webpack_require__(13);

	var _rendergraphJs2 = _interopRequireDefault(_rendergraphJs);

	var _utilsJs = __webpack_require__(3);

	var updateables = [];
	var previousTime = undefined;
	function registerUpdateable(updateable) {
	    updateables.push(updateable);
	}
	function update(time) {
	    if (previousTime === undefined) previousTime = time;
	    var dt = (time - previousTime) / 1000;
	    for (var i = 0; i < updateables.length; i++) {
	        updateables[i]._update(dt);
	    }
	    previousTime = time;
	    requestAnimationFrame(update);
	}
	update();

	var STATE = { "playing": 0, "paused": 1, "stalled": 2, "ended": 3, "broken": 4 };
	//playing - all sources are active
	//paused - all sources are paused
	//stalled - one or more sources is unable to play
	//ended - all sources have finished playing
	//broken - the render graph is in a broken state

	var VideoContext = (function () {
	    /**
	    * Initialise the VideoContext and render to the specific canvas.
	    * 
	    * @example
	    * var canvasElement = document.getElemenyById("canvas");
	    * var ctx = new VideoContext(canvasElement);
	    * var videoNode = ctx.createVideoSourceNode("video.mp4");
	    * videoNode.connect(ctx.destination);
	    * videoNode.start(0);
	    * videoNode.stop(10);
	    * ctx.play();
	    * 
	    */

	    function VideoContext(canvas) {
	        _classCallCheck(this, VideoContext);

	        this._canvas = canvas;
	        this._gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, alpha: false });
	        this._renderGraph = new _rendergraphJs2["default"]();
	        this._sourceNodes = [];
	        this._processingNodes = [];
	        this._timeline = [];
	        this._currentTime = 0;
	        this._state = STATE.paused;
	        this._playbackRate = 1.0;
	        this._destinationNode = new _DestinationNodeDestinationnodeJs2["default"](this._gl, this._renderGraph);

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

	    _createClass(VideoContext, [{
	        key: "registerTimelineCallback",
	        value: function registerTimelineCallback(time, func) {
	            var ordering = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

	            this._timelineCallbacks.push({ "time": time, "func": func, "ordering": ordering });
	        }

	        /**
	        * Unregister a callback which happens at a specific point in time.
	        * @param {Function} func - the callback to unregister.
	        */
	    }, {
	        key: "unregisterTimelineCallback",
	        value: function unregisterTimelineCallback(func) {
	            var toRemove = [];
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this._timelineCallbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var callback = _step.value;

	                    if (callback.func === func) {
	                        toRemove.push(callback);
	                    }
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator["return"]) {
	                        _iterator["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;

	            try {
	                for (var _iterator2 = toRemove[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var callback = _step2.value;

	                    var index = this._timelineCallbacks.indexOf(callback);
	                    this._timelineCallbacks.splice(index, 1);
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
	                        _iterator2["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
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
	    }, {
	        key: "registerCallback",
	        value: function registerCallback(type, func) {
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
	    }, {
	        key: "unregisterCallback",
	        value: function unregisterCallback(func) {
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;

	            try {
	                for (var _iterator3 = this._callbacks.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var funcArray = _step3.value;

	                    var index = funcArray.indexOf(func);
	                    if (index !== -1) {
	                        funcArray.splice(index, 1);
	                        return true;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
	                        _iterator3["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }

	            return false;
	        }
	    }, {
	        key: "_callCallbacks",
	        value: function _callCallbacks(type) {
	            var funcArray = this._callbacks.get(type);
	            var _iteratorNormalCompletion4 = true;
	            var _didIteratorError4 = false;
	            var _iteratorError4 = undefined;

	            try {
	                for (var _iterator4 = funcArray[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                    var func = _step4.value;

	                    func(this._currentTime);
	                }
	            } catch (err) {
	                _didIteratorError4 = true;
	                _iteratorError4 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
	                        _iterator4["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError4) {
	                        throw _iteratorError4;
	                    }
	                }
	            }
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
	    }, {
	        key: "play",

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
	        value: function play() {
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
	    }, {
	        key: "pause",
	        value: function pause() {
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
	    }, {
	        key: "createVideoSourceNode",
	        value: function createVideoSourceNode(src) {
	            var sourceOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	            var preloadTime = arguments.length <= 2 || arguments[2] === undefined ? 4 : arguments[2];

	            var videoNode = new _SourceNodesVideonodeJs2["default"](src, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime);
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
	    }, {
	        key: "createImageSourceNode",
	        value: function createImageSourceNode(src) {
	            var sourceOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	            var preloadTime = arguments.length <= 2 || arguments[2] === undefined ? 4 : arguments[2];

	            var imageNode = new _SourceNodesImagenodeJs2["default"](src, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime);
	            this._sourceNodes.push(imageNode);
	            return imageNode;
	        }

	        /**
	        * Create a new node representing a canvas source
	        * 
	        * @return {CanvasNode} A new canvas node.
	        */
	    }, {
	        key: "createCanvasSourceNode",
	        value: function createCanvasSourceNode(canvas) {
	            var sourceOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	            var preloadTime = arguments.length <= 2 || arguments[2] === undefined ? 4 : arguments[2];

	            var canvasNode = new _SourceNodesCanvasnodeJs2["default"](canvas, this._gl, this._renderGraph, this._currentTime, this._playbackRate, sourceOffset, preloadTime);
	            this._sourceNodes.push(canvasNode);
	            return canvasNode;
	        }

	        /**
	        * Create a new effect node.
	        * @return {EffectNode} A new effect node created from the passed definition
	        */
	    }, {
	        key: "createEffectNode",
	        value: function createEffectNode(definition) {
	            var effectNode = new _ProcessingNodesEffectnodeJs2["default"](this._gl, this._renderGraph, definition);
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
	    }, {
	        key: "createCompositingNode",
	        value: function createCompositingNode(definition) {
	            var compositingNode = new _ProcessingNodesCompositingnodeJs2["default"](this._gl, this._renderGraph, definition);
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
	    }, {
	        key: "createTransitionNode",
	        value: function createTransitionNode(definition) {
	            var transitionNode = new _ProcessingNodesTransitionnodeJs2["default"](this._gl, this._renderGraph, definition);
	            this._processingNodes.push(transitionNode);
	            return transitionNode;
	        }
	    }, {
	        key: "_isStalled",
	        value: function _isStalled() {
	            for (var i = 0; i < this._sourceNodes.length; i++) {
	                var sourceNode = this._sourceNodes[i];
	                if (!sourceNode._isReady()) {
	                    return true;
	                }
	            }
	            return false;
	        }
	    }, {
	        key: "_update",
	        value: function _update(dt) {
	            if (this._state === STATE.playing || this._state === STATE.stalled || this._state === STATE.paused) {

	                //utility functions

	                var outputEdgesFor = function outputEdgesFor(node, connections) {
	                    var results = [];
	                    var _iteratorNormalCompletion8 = true;
	                    var _didIteratorError8 = false;
	                    var _iteratorError8 = undefined;

	                    try {
	                        for (var _iterator8 = connections[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	                            var conn = _step8.value;

	                            if (conn.source === node) {
	                                results.push(conn);
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError8 = true;
	                        _iteratorError8 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
	                                _iterator8["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError8) {
	                                throw _iteratorError8;
	                            }
	                        }
	                    }

	                    return results;
	                };

	                var inputEdgesFor = function inputEdgesFor(node, connections) {
	                    var results = [];
	                    var _iteratorNormalCompletion9 = true;
	                    var _didIteratorError9 = false;
	                    var _iteratorError9 = undefined;

	                    try {
	                        for (var _iterator9 = connections[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	                            var conn = _step9.value;

	                            if (conn.destination === node) {
	                                results.push(conn);
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError9 = true;
	                        _iteratorError9 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
	                                _iterator9["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError9) {
	                                throw _iteratorError9;
	                            }
	                        }
	                    }

	                    return results;
	                };

	                var getInputlessNodes = function getInputlessNodes(connections) {
	                    var inputLess = [];
	                    var _iteratorNormalCompletion10 = true;
	                    var _didIteratorError10 = false;
	                    var _iteratorError10 = undefined;

	                    try {
	                        for (var _iterator10 = connections[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	                            var conn = _step10.value;

	                            inputLess.push(conn.source);
	                        }
	                    } catch (err) {
	                        _didIteratorError10 = true;
	                        _iteratorError10 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
	                                _iterator10["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError10) {
	                                throw _iteratorError10;
	                            }
	                        }
	                    }

	                    var _iteratorNormalCompletion11 = true;
	                    var _didIteratorError11 = false;
	                    var _iteratorError11 = undefined;

	                    try {
	                        for (var _iterator11 = connections[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	                            var conn = _step11.value;

	                            var index = inputLess.indexOf(conn.destination);
	                            if (index !== -1) {
	                                inputLess.splice(index, 1);
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError11 = true;
	                        _iteratorError11 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
	                                _iterator11["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError11) {
	                                throw _iteratorError11;
	                            }
	                        }
	                    }

	                    return inputLess;
	                };

	                this._callCallbacks("update");

	                if (this._state !== STATE.paused) {
	                    if (this._isStalled()) {
	                        this._callCallbacks("stalled");
	                        this._state = STATE.stalled;
	                    } else {
	                        this._state = STATE.playing;
	                    }
	                }

	                if (this._state === STATE.playing) {
	                    //Handle timeline callbacks.
	                    var activeCallbacks = new Map();
	                    var _iteratorNormalCompletion5 = true;
	                    var _didIteratorError5 = false;
	                    var _iteratorError5 = undefined;

	                    try {
	                        for (var _iterator5 = this._timelineCallbacks[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	                            var callback = _step5.value;

	                            if (callback.time >= this.currentTime && callback.time < this._currentTime + dt * this._playbackRate) {
	                                //group the callbacks by time
	                                if (!activeCallbacks.has(callback.time)) activeCallbacks.set(callback.time, []);
	                                activeCallbacks.get(callback.time).push(callback);
	                            }
	                        }

	                        //Sort the groups of callbacks by the times of the groups
	                    } catch (err) {
	                        _didIteratorError5 = true;
	                        _iteratorError5 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
	                                _iterator5["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError5) {
	                                throw _iteratorError5;
	                            }
	                        }
	                    }

	                    var timeIntervals = Array.from(activeCallbacks.keys());
	                    timeIntervals.sort(function (a, b) {
	                        return a - b;
	                    });

	                    var _iteratorNormalCompletion6 = true;
	                    var _didIteratorError6 = false;
	                    var _iteratorError6 = undefined;

	                    try {
	                        for (var _iterator6 = timeIntervals[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	                            var t = _step6.value;

	                            var callbacks = activeCallbacks.get(t);
	                            callbacks.sort(function (a, b) {
	                                return a.ordering - b.ordering;
	                            });
	                            var _iteratorNormalCompletion7 = true;
	                            var _didIteratorError7 = false;
	                            var _iteratorError7 = undefined;

	                            try {
	                                for (var _iterator7 = callbacks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	                                    var callback = _step7.value;

	                                    callback.func();
	                                }
	                            } catch (err) {
	                                _didIteratorError7 = true;
	                                _iteratorError7 = err;
	                            } finally {
	                                try {
	                                    if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
	                                        _iterator7["return"]();
	                                    }
	                                } finally {
	                                    if (_didIteratorError7) {
	                                        throw _iteratorError7;
	                                    }
	                                }
	                            }
	                        }

	                        // activeCallbacks.sort(function(a, b) {
	                        //     return a.ordering - b.ordering;
	                        // });
	                        // for(let callback of activeCallbacks){
	                        //     callback.func();
	                        // }
	                    } catch (err) {
	                        _didIteratorError6 = true;
	                        _iteratorError6 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
	                                _iterator6["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError6) {
	                                throw _iteratorError6;
	                            }
	                        }
	                    }

	                    this._currentTime += dt * this._playbackRate;
	                    if (this._currentTime > this.duration) {
	                        this._callCallbacks("ended");
	                        this._state = STATE.ended;
	                    }
	                }

	                for (var i = 0; i < this._sourceNodes.length; i++) {
	                    var sourceNode = this._sourceNodes[i];
	                    sourceNode._update(this._currentTime);

	                    if (this._state === STATE.stalled) {
	                        if (sourceNode._isReady() && sourceNode._state === _SourceNodesSourcenodeJs.SOURCENODESTATE.playing) sourceNode._pause();
	                    }
	                    if (this._state === STATE.paused) {
	                        if (sourceNode._state === _SourceNodesSourcenodeJs.SOURCENODESTATE.playing) sourceNode._pause();
	                    }
	                    if (this._state === STATE.playing) {
	                        if (sourceNode._state === _SourceNodesSourcenodeJs.SOURCENODESTATE.paused) sourceNode._play();
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
	                var sortedNodes = [];
	                var connections = this._renderGraph.connections.slice();

	                var nodes = getInputlessNodes(connections);

	                while (nodes.length > 0) {
	                    var node = nodes.pop();
	                    sortedNodes.push(node);
	                    var _iteratorNormalCompletion12 = true;
	                    var _didIteratorError12 = false;
	                    var _iteratorError12 = undefined;

	                    try {
	                        for (var _iterator12 = outputEdgesFor(node, connections)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	                            var edge = _step12.value;

	                            var index = connections.indexOf(edge);
	                            if (index > -1) connections.splice(index, 1);
	                            if (inputEdgesFor(edge.destination, connections).length === 0) {
	                                nodes.push(edge.destination);
	                            }
	                        }
	                    } catch (err) {
	                        _didIteratorError12 = true;
	                        _iteratorError12 = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
	                                _iterator12["return"]();
	                            }
	                        } finally {
	                            if (_didIteratorError12) {
	                                throw _iteratorError12;
	                            }
	                        }
	                    }
	                }

	                var _iteratorNormalCompletion13 = true;
	                var _didIteratorError13 = false;
	                var _iteratorError13 = undefined;

	                try {
	                    for (var _iterator13 = sortedNodes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
	                        var node = _step13.value;

	                        if (this._sourceNodes.indexOf(node) === -1) {
	                            node._update(this._currentTime);
	                            node._render();
	                        }
	                    }

	                    /*for (let node of this._processingNodes) {
	                        node._update(this._currentTime);
	                        node._render();
	                    }
	                    this._destinationNode._render();*/
	                } catch (err) {
	                    _didIteratorError13 = true;
	                    _iteratorError13 = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion13 && _iterator13["return"]) {
	                            _iterator13["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError13) {
	                            throw _iteratorError13;
	                        }
	                    }
	                }
	            }
	        }
	    }, {
	        key: "currentTime",
	        set: function set(currentTime) {
	            console.debug("VideoContext - seeking to", currentTime);
	            if (currentTime < this._duration && this._state === STATE.ended) this._state = STATE.duration;
	            if (typeof currentTime === 'string' || currentTime instanceof String) {
	                currentTime = parseFloat(currentTime);
	            }

	            for (var i = 0; i < this._sourceNodes.length; i++) {
	                this._sourceNodes[i]._seek(currentTime);
	            }
	            this._currentTime = currentTime;
	        },

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
	        get: function get() {
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
	    }, {
	        key: "duration",
	        get: function get() {
	            var maxTime = 0;
	            for (var i = 0; i < this._sourceNodes.length; i++) {
	                if (this._sourceNodes[i].state !== _SourceNodesSourcenodeJs.SOURCENODESTATE.waiting && this._sourceNodes[i]._stopTime > maxTime) {
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
	    }, {
	        key: "destination",
	        get: function get() {
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
	    }, {
	        key: "playbackRate",
	        set: function set(rate) {
	            var _iteratorNormalCompletion14 = true;
	            var _didIteratorError14 = false;
	            var _iteratorError14 = undefined;

	            try {
	                for (var _iterator14 = this._sourceNodes[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
	                    var node = _step14.value;

	                    if (node.constructor.name === "VideoNode") node._globalPlaybackRate = rate;
	                }
	            } catch (err) {
	                _didIteratorError14 = true;
	                _iteratorError14 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion14 && _iterator14["return"]) {
	                        _iterator14["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError14) {
	                        throw _iteratorError14;
	                    }
	                }
	            }

	            this._playbackRate = rate;
	        },

	        /**
	        *  Return the current playbackRate of the video context.
	        * @return {number} A value representing the playbackRate. 1.0 by default.
	        */
	        get: function get() {
	            return this._playbackRate;
	        }
	    }], [{
	        key: "DEFINITIONS",
	        get: function get() {

	            var aaf_video_scale = {
	                title: "AAF Video Scale Effect",
	                description: "A scale effect based on the AAF spec.",
	                vertexShader: "\
	                attribute vec2 a_position;\
	                attribute vec2 a_texCoord;\
	                varying vec2 v_texCoord;\
	                void main() {\
	                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                    v_texCoord = a_texCoord;\
	                }",
	                fragmentShader: "\
	                precision mediump float;\
	                uniform sampler2D u_image;\
	                uniform float ScaleX;\
	                uniform float ScaleY;\
	                varying vec2 v_texCoord;\
	                varying float v_progress;\
	                void main(){\
	                    vec2 pos = vec2(v_texCoord[0]*1.0/ScaleX - (1.0/ScaleX/2.0 -0.5), v_texCoord[1]*1.0/ScaleY - (1.0/ScaleY/2.0 -0.5));\
	                    vec4 color = texture2D(u_image, pos);\
	                    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
	                        color = vec4(0.0,0.0,0.0,0.0);\
	                    }\
	                    gl_FragColor = color;\
	                }",
	                properties: {
	                    "scaleX": { type: "uniform", value: 1.0 },
	                    "scaleY": { type: "uniform", value: 1.0 }
	                },
	                inputs: ["u_image"]
	            };

	            var aaf_video_position = {
	                title: "AAF Video Position Effect",
	                description: "A position effect based on the AAF spec.",
	                vertexShader: "\
	                attribute vec2 a_position;\
	                attribute vec2 a_texCoord;\
	                varying vec2 v_texCoord;\
	                void main() {\
	                    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                    v_texCoord = a_texCoord;\
	                }",
	                fragmentShader: "\
	                precision mediump float;\
	                uniform sampler2D u_image;\
	                uniform float PositionOffsetX;\
	                uniform float PositionOffsetY;\
	                varying vec2 v_texCoord;\
	                varying float v_progress;\
	                void main(){\
	                    vec2 pos = vec2(v_texCoord[0] - PositionOffsetX/2.0, v_texCoord[1] -  PositionOffsetY/2.0);\
	                    vec4 color = texture2D(u_image, pos);\
	                    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\
	                        color = vec4(0.0,0.0,0.0,0.0);\
	                    }\
	                    gl_FragColor = color;\
	                }",
	                properties: {
	                    "positionOffsetX": { type: "uniform", value: 0.0 },
	                    "positionOffsetY": { type: "uniform", value: 0.0 }
	                },
	                inputs: ["u_image"]
	            };

	            var aaf_video_crop = {
	                title: "AAF Video Crop Effect",
	                description: "A crop effect based on the AAF spec.",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
	                    precision mediump float;\
	                    uniform sampler2D u_image;\
	                    uniform float CropLeft;\
	                    uniform float CropRight;\
	                    uniform float CropTop;\
	                    uniform float CropBottom;\
	                    varying vec2 v_texCoord;\
	                    void main(){\
	                        vec4 color = texture2D(u_image, v_texCoord);\
	                        if (v_texCoord[0] < (CropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
	                        if (v_texCoord[0] > (CropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
	                        if (v_texCoord[1] < (-CropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
	                        if (v_texCoord[1] > (-CropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\
	                        gl_FragColor = color;\
	                    }",
	                properties: {
	                    "cropLeft": { type: "uniform", value: -1.0 },
	                    "cropRight": { type: "uniform", value: 1.0 },
	                    "cropTop": { type: "uniform", value: -1.0 },
	                    "cropBottom": { type: "uniform", value: 1.0 }
	                },
	                inputs: ["u_image"]
	            };

	            var aaf_video_flip = {
	                title: "AAF Video Scale Effect",
	                description: "A flip effect based on the AAF spec. Mirrors the image in the x-axis",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
	                    precision mediump float;\
	                    uniform sampler2D u_image;\
	                    varying vec2 v_texCoord;\
	                    void main(){\
	                        vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);\
	                        vec4 color = texture2D(u_image, coord);\
	                        gl_FragColor = color;\
	                    }",
	                properties: {},
	                inputs: ["u_image"]
	            };

	            var aaf_video_flop = {
	                title: "AAF Video Scale Effect",
	                description: "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
	                    precision mediump float;\
	                    uniform sampler2D u_image;\
	                    varying vec2 v_texCoord;\
	                    void main(){\
	                        vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);\
	                        vec4 color = texture2D(u_image, coord);\
	                        gl_FragColor = color;\
	                    }",
	                properties: {},
	                inputs: ["u_image"]
	            };

	            var crossfade = {
	                title: "Cross-Fade",
	                description: "A cross-fade effect. Typically used as a transistion.",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
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
	                properties: {
	                    "mix": { type: "uniform", value: 0.0 }
	                },
	                inputs: ["u_image_a", "u_image_b"]
	            };

	            var combine = {
	                title: "Combine",
	                description: "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
	                    precision mediump float;\
	                    uniform sampler2D u_image;\
	                    uniform float a;\
	                    varying vec2 v_texCoord;\
	                    varying float v_mix;\
	                    void main(){\
	                        vec4 color = texture2D(u_image, v_texCoord);\
	                        gl_FragColor = color;\
	                    }",
	                properties: {
	                    "a": { type: "uniform", value: 0.0 }
	                },
	                inputs: ["u_image"]
	            };

	            var colorThreshold = {
	                title: "Color Threshold",
	                description: "Turns all pixels with a greater value than the specified threshold transparent.",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
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
	                properties: {
	                    "a": { type: "uniform", value: 0.0 },
	                    "colorAlphaThreshold": { type: "uniform", value: [0.0, 0.55, 0.0] }
	                },
	                inputs: ["u_image"]
	            };

	            var monochrome = {
	                title: "Monochrome",
	                description: "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
	                vertexShader: "\
	                    attribute vec2 a_position;\
	                    attribute vec2 a_texCoord;\
	                    varying vec2 v_texCoord;\
	                    void main() {\
	                        gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                        v_texCoord = a_texCoord;\
	                    }",
	                fragmentShader: "\
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
	                properties: {
	                    "inputMix": { type: "uniform", value: [0.4, 0.6, 0.2] },
	                    "outputMix": { type: "uniform", value: [1.0, 1.0, 1.0] }
	                },
	                inputs: ["u_image"]
	            };

	            return {
	                CROSSFADE: crossfade,
	                COMBINE: combine,
	                COLORTHRESHOLD: colorThreshold,
	                MONOCHROME: monochrome,
	                AAF_VIDEO_CROP: aaf_video_crop,
	                AAF_VIDEO_POSITION: aaf_video_position,
	                AAF_VIDEO_SCALE: aaf_video_scale,
	                AAF_VIDEO_FLIP: aaf_video_flip,
	                AAF_VIDEO_FLOP: aaf_video_flop
	            };
	        }
	    }]);

	    return VideoContext;
	})();

	exports["default"] = VideoContext;

	VideoContext.visualiseVideoContextTimeline = _utilsJs.visualiseVideoContextTimeline;
	VideoContext.visualiseVideoContextGraph = _utilsJs.visualiseVideoContextGraph;
	VideoContext.createControlFormForNode = _utilsJs.createControlFormForNode;
	VideoContext.createSigmaGraphDataFromRenderGraph = _utilsJs.createSigmaGraphDataFromRenderGraph;
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _sourcenode = __webpack_require__(2);

	var _sourcenode2 = _interopRequireDefault(_sourcenode);

	var VideoNode = (function (_SourceNode) {
	    _inherits(VideoNode, _SourceNode);

	    function VideoNode(src, gl, renderGraph, currentTime) {
	        var globalPlaybackRate = arguments.length <= 4 || arguments[4] === undefined ? 1.0 : arguments[4];
	        var sourceOffset = arguments.length <= 5 || arguments[5] === undefined ? 0 : arguments[5];
	        var preloadTime = arguments.length <= 6 || arguments[6] === undefined ? 4 : arguments[6];

	        _classCallCheck(this, VideoNode);

	        _get(Object.getPrototypeOf(VideoNode.prototype), "constructor", this).call(this, src, gl, renderGraph, currentTime);
	        this._preloadTime = preloadTime;
	        this._sourceOffset = sourceOffset;
	        this._globalPlaybackRate = globalPlaybackRate;
	        this._playbackRate = 1.0;
	        this._playbackRateUpdated = true;
	    }

	    _createClass(VideoNode, [{
	        key: "_load",
	        value: function _load() {
	            _get(Object.getPrototypeOf(VideoNode.prototype), "_load", this).call(this);
	            if (this._element !== undefined) {
	                if (this._element.readyState > 3 && !this._element.seeking) {
	                    if (this._stopTime === Infinity || this._stopTime == undefined) this._stopTime = this._startTime + this._element.duration;
	                    this._ready = true;
	                    this._playbackRateUpdated = true;
	                } else {
	                    this._ready = false;
	                }
	                return;
	            }
	            if (this._isResponsibleForElementLifeCycle) {
	                this._element = document.createElement("video");
	                this._element.setAttribute('crossorigin', 'anonymous');
	                this._element.src = this._elementURL;
	                this._playbackRateUpdated = true;
	            }
	            this._element.currentTime = this._sourceOffset;
	        }
	    }, {
	        key: "_destroy",
	        value: function _destroy() {
	            _get(Object.getPrototypeOf(VideoNode.prototype), "_destroy", this).call(this);
	            if (this._isResponsibleForElementLifeCycle) {
	                this._element.src = "";
	                this._element = undefined;
	                delete this._element;
	            }
	            this._ready = false;
	        }
	    }, {
	        key: "_seek",
	        value: function _seek(time) {
	            _get(Object.getPrototypeOf(VideoNode.prototype), "_seek", this).call(this, time);
	            if (this.state === _sourcenode.SOURCENODESTATE.playing || this.state === _sourcenode.SOURCENODESTATE.paused) {
	                if (this._element === undefined) this._load();
	                var relativeTime = this._currentTime - this._startTime + this._sourceOffset;
	                this._element.currentTime = relativeTime;
	                this._ready = false;
	            }
	            if ((this._state === _sourcenode.SOURCENODESTATE.sequenced || this._state === _sourcenode.SOURCENODESTATE.ended) && this._element !== undefined) {
	                this._destroy();
	            }
	        }
	    }, {
	        key: "_update",
	        value: function _update(currentTime) {
	            //if (!super._update(currentTime)) return false;
	            _get(Object.getPrototypeOf(VideoNode.prototype), "_update", this).call(this, currentTime);
	            //check if the video has ended
	            if (this._element !== undefined) {
	                if (this._element.ended) {
	                    this._state = _sourcenode.SOURCENODESTATE.ended;
	                    this._triggerCallbacks("ended");
	                }
	            }

	            if (this._startTime - this._currentTime < this._preloadTime && this._state !== _sourcenode.SOURCENODESTATE.waiting && this._state !== _sourcenode.SOURCENODESTATE.ended) this._load();

	            if (this._state === _sourcenode.SOURCENODESTATE.playing) {
	                if (this._playbackRateUpdated) {
	                    this._element.playbackRate = this._globalPlaybackRate * this._playbackRate;
	                    this._playbackRateUpdated = false;
	                }
	                this._element.play();
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.paused) {
	                this._element.pause();
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.ended && this._element !== undefined) {
	                this._element.pause();
	                this._destroy();
	                return false;
	            }
	        }
	    }, {
	        key: "playbackRate",
	        set: function set(playbackRate) {
	            this._playbackRate = playbackRate;
	            this._playbackRateUpdated = true;
	        },
	        get: function get() {
	            return this._playbackRate;
	        }
	    }]);

	    return VideoNode;
	})(_sourcenode2["default"]);

	exports["default"] = VideoNode;
	module.exports = exports["default"];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _utilsJs = __webpack_require__(3);

	var _graphnode = __webpack_require__(4);

	var _graphnode2 = _interopRequireDefault(_graphnode);

	var STATE = { "waiting": 0, "sequenced": 1, "playing": 2, "paused": 3, "ended": 4 };

	var SourceNode = (function (_GraphNode) {
	    _inherits(SourceNode, _GraphNode);

	    function SourceNode(src, gl, renderGraph, currentTime) {
	        _classCallCheck(this, SourceNode);

	        _get(Object.getPrototypeOf(SourceNode.prototype), "constructor", this).call(this, gl, renderGraph, [], true);
	        this._element = undefined;
	        this._elementURL = undefined;
	        this._isResponsibleForElementLifeCycle = true;
	        if (typeof src === 'string') {
	            //create the node from the passed url
	            this._elementURL = src;
	        } else {
	            //use the passed element to create the SourceNode
	            this._element = src;
	            this._isResponsibleForElementLifeCycle = false;
	        }

	        this._state = STATE.waiting;
	        this._currentTime = currentTime;
	        this._startTime = NaN;
	        this._stopTime = Infinity;
	        this._ready = false;
	        this._texture = (0, _utilsJs.createElementTexutre)(gl);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
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

	    _createClass(SourceNode, [{
	        key: "_load",
	        value: function _load() {
	            this._triggerCallbacks("load");
	        }
	    }, {
	        key: "_destroy",
	        value: function _destroy() {
	            this._triggerCallbacks("destroy");
	        }

	        /**
	        * Register callbacks against one of these events: "load", "destory", "seek", "pause", "play", "ended"
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
	    }, {
	        key: "registerCallback",
	        value: function registerCallback(type, func) {
	            this._callbacks.push({ type: type, func: func });
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
	    }, {
	        key: "unregisterCallback",
	        value: function unregisterCallback(func) {
	            var toRemove = [];
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this._callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var callback = _step.value;

	                    if (callback.func === func) toRemove.push(callback);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator["return"]) {
	                        _iterator["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;

	            try {
	                for (var _iterator2 = toRemove[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var callback = _step2.value;

	                    var index = this._callbacks.indexOf(callback);
	                    this._callbacks.splice(index, 1);
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
	                        _iterator2["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
	            }
	        }
	    }, {
	        key: "_triggerCallbacks",
	        value: function _triggerCallbacks(type, data) {
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;

	            try {
	                for (var _iterator3 = this._callbacks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var callback = _step3.value;

	                    if (callback.type === type) {
	                        if (data !== undefined) {
	                            callback.func(this, data);
	                        } else {
	                            callback.func(this);
	                        }
	                    }
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
	                        _iterator3["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
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
	    }, {
	        key: "start",
	        value: function start(time) {
	            if (this._state !== STATE.waiting) {
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
	    }, {
	        key: "startAt",
	        value: function startAt(time) {
	            if (this._state !== STATE.waiting) {
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
	    }, {
	        key: "stop",
	        value: function stop(time) {
	            if (this._state === STATE.ended) {
	                console.debug("SourceNode has already ended. Cannot call stop.");
	                return false;
	            } else if (this._state === STATE.waiting) {
	                console.debug("SourceNode must have start called before stop is called");
	                return false;
	            }
	            if (this._currentTime + time <= this._startTime) {
	                console.debug("SourceNode must have a stop time after it's start time, not before.");
	                return false;
	            }
	            this._stopTime = this._currentTime + time;
	            return true;
	        }

	        /**
	        * Stop playback at an absolute time ont the VideoContext's timeline.
	        *
	        * @param {number} time - the time on the VideoContexts timeline to stop playing.
	        * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
	        */
	    }, {
	        key: "stopAt",
	        value: function stopAt(time) {
	            if (this._state === STATE.ended) {
	                console.debug("SourceNode has already ended. Cannot call stop.");
	                return false;
	            } else if (this._state === STATE.waiting) {
	                console.debug("SourceNode must have start called before stop is called");
	                return false;
	            }
	            if (time <= this._startTime) {
	                console.debug("SourceNode must have a stop time after it's start time, not before.");
	                return false;
	            }
	            this._stopTime = time;
	            return true;
	        }
	    }, {
	        key: "_seek",
	        value: function _seek(time) {
	            this._triggerCallbacks("seek", time);

	            if (this._state === STATE.waiting) return;
	            if (time < this._startTime) {
	                (0, _utilsJs.clearTexture)(this._gl, this._texture);
	                this._state = STATE.sequenced;
	            }
	            if (time >= this._startTime && this._state !== STATE.paused) {
	                this._state = STATE.playing;
	            }
	            if (time >= this._stopTime) {
	                (0, _utilsJs.clearTexture)(this._gl, this._texture);
	                this._triggerCallbacks("ended");
	                this._state = STATE.ended;
	            }
	            //update the current time
	            this._currentTime = time;
	        }
	    }, {
	        key: "_pause",
	        value: function _pause() {
	            this._triggerCallbacks("pause");

	            if (this._state === STATE.playing) {
	                this._state = STATE.paused;
	            }
	        }
	    }, {
	        key: "_play",
	        value: function _play() {
	            this._triggerCallbacks("play");

	            if (this._state === STATE.paused) {
	                this._state = STATE.playing;
	            }
	        }
	    }, {
	        key: "_isReady",
	        value: function _isReady() {
	            if (this._state === STATE.playing || this._state === STATE.paused) {
	                return this._ready;
	            }
	            return true;
	        }
	    }, {
	        key: "_update",
	        value: function _update(currentTime) {
	            this._rendered = true;

	            //update the current time
	            this._currentTime = currentTime;

	            //update the state
	            if (this._state === STATE.waiting || this._state === STATE.ended) return false;

	            this._triggerCallbacks("render", currentTime);

	            if (currentTime < this._startTime) {
	                (0, _utilsJs.clearTexture)(this._gl, this._texture);
	                this._state = STATE.sequenced;
	            }

	            if (currentTime >= this._startTime && this._state !== STATE.paused) {
	                if (this._state !== STATE.playing) this._triggerCallbacks("play");
	                this._state = STATE.playing;
	            }

	            if (currentTime >= this._stopTime) {
	                (0, _utilsJs.clearTexture)(this._gl, this._texture);
	                this._triggerCallbacks("ended");
	                this._state = STATE.ended;
	            }

	            //update this source nodes texture
	            if (this._element === undefined || this._ready === false) return true;

	            if (this._state === STATE.playing) {
	                (0, _utilsJs.updateTexture)(this._gl, this._texture, this._element);
	            }

	            return true;
	        }

	        /**
	        * Clear any timeline state the node currently has, this puts the node in the "waiting" state, as if neither start nor stop had been called.
	        */
	    }, {
	        key: "clearTimelineState",
	        value: function clearTimelineState() {
	            this._startTime = NaN;
	            this._stopTime = Infinity;
	            this._state = STATE.waiting;
	        }
	    }, {
	        key: "state",
	        get: function get() {
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
	    }, {
	        key: "element",
	        get: function get() {
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
	    }, {
	        key: "duration",
	        get: function get() {
	            if (isNaN(this._startTime)) return undefined;
	            if (this._stopTime === Infinity) return Infinity;
	            return this._stopTime - this._startTime;
	        }
	    }]);

	    return SourceNode;
	})(_graphnode2["default"]);

	exports["default"] = SourceNode;
	exports.SOURCENODESTATE = STATE;

/***/ },
/* 3 */
/***/ function(module, exports) {

	//Matthew Shotton, R&D User Experince,© BBC 2015

	/*
	* Utility function to compile a WebGL Vertex or Fragment shader.
	* 
	* @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
	* @param {String} shaderSource - A string of shader code to compile.
	* @param {number} shaderType - Shader type, either WebGLRenderingContext.VERTEX_SHADER or WebGLRenderingContext.FRAGMENT_SHADER.
	*
	* @return {WebGLShader} A compiled shader.
	*
	*/
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.compileShader = compileShader;
	exports.createShaderProgram = createShaderProgram;
	exports.createElementTexutre = createElementTexutre;
	exports.updateTexture = updateTexture;
	exports.clearTexture = clearTexture;
	exports.createControlFormForNode = createControlFormForNode;
	exports.visualiseVideoContextGraph = visualiseVideoContextGraph;
	exports.createSigmaGraphDataFromRenderGraph = createSigmaGraphDataFromRenderGraph;
	exports.visualiseVideoContextTimeline = visualiseVideoContextTimeline;

	function compileShader(gl, shaderSource, shaderType) {
	    var shader = gl.createShader(shaderType);
	    gl.shaderSource(shader, shaderSource);
	    gl.compileShader(shader);
	    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	    if (!success) {
	        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
	    }
	    return shader;
	}

	/*
	* Create a shader program from a passed vertex and fragment shader source string.
	* 
	* @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
	* @param {String} vertexShaderSource - A string of vertex shader code to compile.
	* @param {String} fragmentShaderSource - A string of fragment shader code to compile.
	*
	* @return {WebGLProgram} A compiled & linkde shader program.
	*/

	function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
	    var vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
	    var fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
	    var program = gl.createProgram();

	    gl.attachShader(program, vertexShader);
	    gl.attachShader(program, fragmentShader);
	    gl.linkProgram(program);

	    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	        throw { "error": 4, "msg": "Can't link shader program for track", toString: function toString() {
	                return this.msg;
	            } };
	    }
	    return program;
	}

	function createElementTexutre(gl) {
	    var type = arguments.length <= 1 || arguments[1] === undefined ? new Uint8Array([0, 0, 0, 0]) : arguments[1];
	    var width = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
	    var height = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

	    var texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    // Set the parameters so we can render any size image.
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    //Initialise the texture untit to clear.
	    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, type);

	    return texture;
	}

	function updateTexture(gl, texture, element) {
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
	}

	function clearTexture(gl, texture) {
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	}

	function createControlFormForNode(node, nodeName) {
	    var rootDiv = document.createElement("div");

	    if (nodeName !== undefined) {
	        var title = document.createElement("h2");
	        title.innerHTML = nodeName;
	        rootDiv.appendChild(title);
	    }

	    var _loop = function (propertyName) {
	        var propertyParagraph = document.createElement("p");
	        var propertyTitleHeader = document.createElement("h3");
	        propertyTitleHeader.innerHTML = propertyName;
	        propertyParagraph.appendChild(propertyTitleHeader);

	        var propertyValue = node._properties[propertyName].value;
	        if (typeof propertyValue === "number") {
	            (function () {
	                var range = document.createElement("input");
	                range.setAttribute("type", "range");
	                range.setAttribute("min", "0");
	                range.setAttribute("max", "1");
	                range.setAttribute("step", "0.01");
	                range.setAttribute("value", propertyValue, toString());
	                var mouseDown = false;
	                range.onmousedown = function () {
	                    mouseDown = true;
	                };
	                range.onmouseup = function () {
	                    mouseDown = false;
	                };
	                range.onmousemove = function () {
	                    if (mouseDown) node[propertyName] = parseFloat(range.value);
	                };
	                range.onchange = function () {
	                    node[propertyName] = parseFloat(range.value);
	                };
	                propertyParagraph.appendChild(range);
	            })();
	        } else if (Object.prototype.toString.call(propertyValue) === '[object Array]') {
	            var _loop2 = function () {
	                var range = document.createElement("input");
	                range.setAttribute("type", "range");
	                range.setAttribute("min", "0");
	                range.setAttribute("max", "1");
	                range.setAttribute("step", "0.01");
	                range.setAttribute("value", propertyValue[i], toString());
	                var index = i;
	                var mouseDown = false;
	                range.onmousedown = function () {
	                    mouseDown = true;
	                };
	                range.onmouseup = function () {
	                    mouseDown = false;
	                };
	                range.onmousemove = function () {
	                    if (mouseDown) node[propertyName][index] = parseFloat(range.value);
	                };
	                range.onchange = function () {
	                    node[propertyName][index] = parseFloat(range.value);
	                };
	                propertyParagraph.appendChild(range);
	            };

	            for (i = 0; i < propertyValue.length; i++) {
	                _loop2();
	            }
	        } else {}

	        rootDiv.appendChild(propertyParagraph);
	    };

	    for (var propertyName in node._properties) {
	        var i;

	        _loop(propertyName);
	    }
	    return rootDiv;
	}

	function calculateNodeDepthFromDestination(videoContext) {
	    var destination = videoContext.destination;
	    var depthMap = new Map();
	    depthMap.set(destination, 0);

	    function itterateBackwards(node) {
	        var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = node.inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var n = _step.value;

	                var d = depth + 1;
	                if (depthMap.has(n)) {
	                    if (d > depthMap.get(n)) {
	                        depthMap.set(n, d);
	                    }
	                } else {
	                    depthMap.set(n, d);
	                }
	                itterateBackwards(n, depthMap.get(n));
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator["return"]) {
	                    _iterator["return"]();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }
	    }

	    itterateBackwards(destination);
	    return depthMap;
	}

	function visualiseVideoContextGraph(videoContext, canvas) {
	    var ctx = canvas.getContext('2d');
	    var w = canvas.width;
	    var h = canvas.height;
	    var renderNodes = [];
	    ctx.clearRect(0, 0, w, h);

	    var nodeDepths = calculateNodeDepthFromDestination(videoContext);
	    var depths = nodeDepths.values();
	    depths = Array.from(depths).sort(function (a, b) {
	        return b - a;
	    });
	    var maxDepth = depths[0];

	    var xStep = w / (maxDepth + 1);

	    var nodeHeight = h / videoContext._sourceNodes.length / 3;
	    var nodeWidth = nodeHeight * 1.618;

	    function calculateNodePos(node, nodeDepths, xStep, nodeHeight) {
	        var depth = nodeDepths.get(node);
	        nodeDepths.values();

	        var count = 0;
	        var _iteratorNormalCompletion2 = true;
	        var _didIteratorError2 = false;
	        var _iteratorError2 = undefined;

	        try {
	            for (var _iterator2 = nodeDepths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                var nodeDepth = _step2.value;

	                if (nodeDepth[0] === node) break;
	                if (nodeDepth[1] === depth) count += 1;
	            }
	        } catch (err) {
	            _didIteratorError2 = true;
	            _iteratorError2 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
	                    _iterator2["return"]();
	                }
	            } finally {
	                if (_didIteratorError2) {
	                    throw _iteratorError2;
	                }
	            }
	        }

	        return { x: xStep * nodeDepths.get(node), y: nodeHeight * 1.5 * count + 50 };
	    }

	    // "video":["#572A72", "#3C1255"],
	    // "image":["#7D9F35", "#577714"],
	    // "canvas":["#AA9639", "#806D15"]

	    for (var i = 0; i < videoContext._renderGraph.connections.length; i++) {
	        var conn = videoContext._renderGraph.connections[i];
	        var source = calculateNodePos(conn.source, nodeDepths, xStep, nodeHeight);
	        var destination = calculateNodePos(conn.destination, nodeDepths, xStep, nodeHeight);
	        if (source !== undefined && destination !== undefined) {
	            ctx.beginPath();
	            //ctx.moveTo(source.x + nodeWidth/2, source.y + nodeHeight/2);
	            var x1 = source.x + nodeWidth / 2;
	            var y1 = source.y + nodeHeight / 2;
	            var x2 = destination.x + nodeWidth / 2;
	            var y2 = destination.y + nodeHeight / 2;
	            var dx = x2 - x1;
	            var dy = y2 - y1;

	            var angle = Math.PI / 2 - Math.atan2(dx, dy);

	            var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

	            var midX = Math.min(x1, x2) + (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
	            var midY = Math.min(y1, y2) + (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

	            var testX = Math.cos(angle + Math.PI / 2) * distance / 1.5 + midX;
	            var testY = Math.sin(angle + Math.PI / 2) * distance / 1.5 + midY;
	            // console.log(testX, testY);

	            ctx.arc(testX, testY, distance / 1.2, angle - Math.PI + 0.95, angle - 0.95);

	            //ctx.arcTo(source.x + nodeWidth/2 ,source.y + nodeHeight/2,destination.x + nodeWidth/2,destination.y + nodeHeight/2,100);
	            //ctx.lineTo(midX, midY);
	            ctx.stroke();
	            //ctx.endPath();
	        }
	    }

	    var _iteratorNormalCompletion3 = true;
	    var _didIteratorError3 = false;
	    var _iteratorError3 = undefined;

	    try {
	        for (var _iterator3 = nodeDepths.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var node = _step3.value;

	            var depth = nodeDepths.get(node);
	            var pos = calculateNodePos(node, nodeDepths, xStep, nodeHeight);
	            var color = "#AA9639";
	            var text = "";
	            if (node.constructor.name === "CompositingNode") {
	                color = "#000000";
	            }
	            if (node.constructor.name === "DestinationNode") {
	                color = "#7D9F35";
	                text = "Output";
	            }
	            if (node.constructor.name === "VideoNode") {
	                color = "#572A72";
	                text = "Video";
	            }
	            if (node.constructor.name === "CanvasNode") {
	                color = "#572A72";
	                text = "Canvas";
	            }
	            if (node.constructor.name === "ImageNode") {
	                color = "#572A72";
	                text = "Image";
	            }
	            ctx.beginPath();
	            ctx.fillStyle = color;
	            ctx.fillRect(pos.x, pos.y, nodeWidth, nodeHeight);
	            ctx.fill();

	            ctx.fillStyle = "#000";
	            ctx.textAlign = "center";
	            ctx.font = "10px Arial";
	            ctx.fillText(text, pos.x + nodeWidth / 2, pos.y + nodeHeight / 2 + 2.5);
	            ctx.fill();
	        }
	    } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
	                _iterator3["return"]();
	            }
	        } finally {
	            if (_didIteratorError3) {
	                throw _iteratorError3;
	            }
	        }
	    }

	    return;
	}

	function createSigmaGraphDataFromRenderGraph(videoContext) {

	    function idForNode(node) {
	        if (videoContext._sourceNodes.indexOf(node) !== -1) {
	            var _id = "source " + node.constructor.name + " " + videoContext._sourceNodes.indexOf(node);
	            return _id;
	        }
	        var id = "processor " + node.constructor.name + " " + videoContext._processingNodes.indexOf(node);
	        return id;
	    }

	    var graph = {
	        nodes: [{
	            id: idForNode(videoContext.destination),
	            label: "Destination Node",
	            x: 2.5,
	            y: 0.5,
	            size: 2,
	            node: videoContext.destination
	        }],
	        edges: []
	    };

	    for (var i = 0; i < videoContext._sourceNodes.length; i++) {
	        var sourceNode = videoContext._sourceNodes[i];
	        var y = i * (1.0 / videoContext._sourceNodes.length);
	        graph.nodes.push({
	            id: idForNode(sourceNode),
	            label: "Source " + i.toString(),
	            x: 0,
	            y: y,
	            size: 2,
	            color: "#572A72",
	            node: sourceNode
	        });
	    }
	    for (var i = 0; i < videoContext._processingNodes.length; i++) {
	        var processingNode = videoContext._processingNodes[i];
	        graph.nodes.push({
	            id: idForNode(processingNode),
	            x: Math.random() * 2.5,
	            y: Math.random(),
	            size: 2,
	            node: processingNode
	        });
	    }

	    for (var i = 0; i < videoContext._renderGraph.connections.length; i++) {
	        var conn = videoContext._renderGraph.connections[i];
	        graph.edges.push({
	            "id": "e" + i.toString(),
	            "source": idForNode(conn.source),
	            "target": idForNode(conn.destination)
	        });
	    }

	    return graph;
	}

	function visualiseVideoContextTimeline(videoContext, canvas, currentTime) {
	    var ctx = canvas.getContext('2d');
	    var w = canvas.width;
	    var h = canvas.height;
	    var trackHeight = h / videoContext._sourceNodes.length;
	    var playlistDuration = videoContext.duration;
	    var pixelsPerSecond = w / playlistDuration;
	    var mediaSourceStyle = {
	        "video": ["#572A72", "#3C1255"],
	        "image": ["#7D9F35", "#577714"],
	        "canvas": ["#AA9639", "#806D15"]
	    };

	    ctx.clearRect(0, 0, w, h);
	    ctx.fillStyle = "#999";

	    var _iteratorNormalCompletion4 = true;
	    var _didIteratorError4 = false;
	    var _iteratorError4 = undefined;

	    try {
	        for (var _iterator4 = videoContext._processingNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var node = _step4.value;

	            if (node.constructor.name !== "TransitionNode") continue;
	            for (var propertyName in node._transitions) {
	                var _iteratorNormalCompletion5 = true;
	                var _didIteratorError5 = false;
	                var _iteratorError5 = undefined;

	                try {
	                    for (var _iterator5 = node._transitions[propertyName][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	                        var transition = _step5.value;

	                        var tW = (transition.end - transition.start) * pixelsPerSecond;
	                        var tH = h;
	                        var tX = transition.start * pixelsPerSecond;
	                        var tY = 0;
	                        ctx.fillStyle = "rgba(0,0,0, 0.3)";
	                        ctx.fillRect(tX, tY, tW, tH);
	                        ctx.fill();
	                    }
	                } catch (err) {
	                    _didIteratorError5 = true;
	                    _iteratorError5 = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
	                            _iterator5["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError5) {
	                            throw _iteratorError5;
	                        }
	                    }
	                }
	            }
	        }
	    } catch (err) {
	        _didIteratorError4 = true;
	        _iteratorError4 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
	                _iterator4["return"]();
	            }
	        } finally {
	            if (_didIteratorError4) {
	                throw _iteratorError4;
	            }
	        }
	    }

	    for (var i = 0; i < videoContext._sourceNodes.length; i++) {
	        var sourceNode = videoContext._sourceNodes[i];
	        var duration = sourceNode._stopTime - sourceNode._startTime;
	        var start = sourceNode._startTime;

	        var msW = duration * pixelsPerSecond;
	        var msH = trackHeight;
	        var msX = start * pixelsPerSecond;
	        var msY = trackHeight * i;
	        ctx.fillStyle = mediaSourceStyle.video[i % mediaSourceStyle.video.length];
	        ctx.fillRect(msX, msY, msW, msH);
	        ctx.fill();
	    }

	    if (currentTime !== undefined) {
	        ctx.fillStyle = "#000";
	        ctx.fillRect(currentTime * pixelsPerSecond, 0, 1, h);
	    }
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GraphNode = (function () {
	    function GraphNode(gl, renderGraph, inputNames) {
	        var limitConnections = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

	        _classCallCheck(this, GraphNode);

	        this._renderGraph = renderGraph;
	        this._limitConnections = limitConnections;
	        this._inputNames = inputNames;

	        //Setup WebGL output texture
	        this._gl = gl;
	        this._renderGraph = renderGraph;
	        this._rendered = false;
	    }

	    /**
	    * Get the names of the inputs to this node.
	    *
	    * @return {String[]} An array of the names of the inputs ot the node.
	    */

	    _createClass(GraphNode, [{
	        key: "connect",

	        /**
	        * Connect this node to the targetNode
	        * 
	        * @param {GraphNode} targetNode - the node to connect.
	        * @param {(number| String)} [targetPort] - the port on the targetNode to connect to, this can be an index, a string identifier, or undefined (in which case the next available port will be connected to).
	        * 
	        */
	        value: function connect(targetNode, targetPort) {
	            return this._renderGraph.registerConnection(this, targetNode, targetPort);
	        }

	        /**
	        * Disconnect this node from the targetNode. If targetNode is undefind remove all out-bound connections.
	        *
	        * @param {GraphNode} [targetNode] - the node to disconnect from. If undefined, disconnect from all nodes.
	        *
	        */
	    }, {
	        key: "disconnect",
	        value: function disconnect(targetNode) {
	            var _this = this;

	            if (targetNode === undefined) {
	                var toRemove = this._renderGraph.getOutputsForNode(this);
	                toRemove.forEach(function (target) {
	                    return _this._renderGraph.unregisterConnection(_this, target);
	                });
	                if (toRemove.length > 0) return true;
	                return false;
	            }
	            return this._renderGraph.unregisterConnection(this, targetNode);
	        }
	    }, {
	        key: "inputNames",
	        get: function get() {
	            return this._inputNames.slice();
	        }

	        /**
	        * The maximum number of connections that can be made to this node. If there is not limit this will return Infinity.
	        *
	        * @return {number} The number of connections which can be made to this node.
	        */
	    }, {
	        key: "maximumConnections",
	        get: function get() {
	            if (this._limitConnections === false) return Infinity;
	            return this._inputNames.length;
	        }

	        /**
	        * Get an array of all the nodes which connect to this node.
	        *
	        * @return {GraphNode[]} An array of nodes which connect to this node.
	        */
	    }, {
	        key: "inputs",
	        get: function get() {
	            var result = this._renderGraph.getInputsForNode(this);
	            result = result.filter(function (n) {
	                return n !== undefined;
	            });
	            return result;
	        }

	        /**
	        * Get an array of all the nodes which this node outputs to.
	        *
	        * @return {GraphNode[]} An array of nodes which this node connects to.
	        */
	    }, {
	        key: "outputs",
	        get: function get() {
	            return this._renderGraph.getOutputsForNode(this);
	        }
	    }]);

	    return GraphNode;
	})();

	exports["default"] = GraphNode;
	module.exports = exports["default"];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _sourcenode = __webpack_require__(2);

	var _sourcenode2 = _interopRequireDefault(_sourcenode);

	var ImageNode = (function (_SourceNode) {
	    _inherits(ImageNode, _SourceNode);

	    function ImageNode(src, gl, renderGraph, currentTime) {
	        var preloadTime = arguments.length <= 4 || arguments[4] === undefined ? 4 : arguments[4];

	        _classCallCheck(this, ImageNode);

	        _get(Object.getPrototypeOf(ImageNode.prototype), 'constructor', this).call(this, src, gl, renderGraph, currentTime);
	        this._preloadTime = preloadTime;
	    }

	    _createClass(ImageNode, [{
	        key: '_load',
	        value: function _load() {
	            var _this2 = this;

	            if (this._element !== undefined) {
	                return;
	            }
	            if (this._isResponsibleForElementLifeCycle) {
	                (function () {
	                    _get(Object.getPrototypeOf(ImageNode.prototype), '_load', _this2).call(_this2);
	                    _this2._element = new Image();
	                    _this2._element.setAttribute('crossorigin', 'anonymous');
	                    _this2._element.src = _this2._elementURL;
	                    var _this = _this2;
	                    _this2._element.onload = function () {
	                        _this._ready = true;
	                    };
	                })();
	            }
	        }
	    }, {
	        key: '_destroy',
	        value: function _destroy() {
	            _get(Object.getPrototypeOf(ImageNode.prototype), '_destroy', this).call(this);
	            if (this._isResponsibleForElementLifeCycle) {
	                this._element.src = "";
	                this._element = undefined;
	                delete this._element;
	            }
	            this._ready = false;
	        }
	    }, {
	        key: '_seek',
	        value: function _seek(time) {
	            _get(Object.getPrototypeOf(ImageNode.prototype), '_seek', this).call(this, time);
	            if (this.state === _sourcenode.SOURCENODESTATE.playing || this.state === _sourcenode.SOURCENODESTATE.paused) {
	                if (this._element === undefined) this._load();
	                this._ready = false;
	            }
	            if ((this._state === _sourcenode.SOURCENODESTATE.sequenced || this._state === _sourcenode.SOURCENODESTATE.ended) && this._element !== undefined) {
	                this._destroy();
	            }
	        }
	    }, {
	        key: '_update',
	        value: function _update(currentTime) {
	            //if (!super._update(currentTime)) return false;
	            _get(Object.getPrototypeOf(ImageNode.prototype), '_update', this).call(this, currentTime);
	            if (this._startTime - this._currentTime < this._preloadTime && this._state !== _sourcenode.SOURCENODESTATE.waiting && this._state !== _sourcenode.SOURCENODESTATE.ended) this._load();

	            if (this._state === _sourcenode.SOURCENODESTATE.playing) {
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.paused) {
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.ended && this._element !== undefined) {
	                this._destroy();
	                return false;
	            }
	        }
	    }]);

	    return ImageNode;
	})(_sourcenode2['default']);

	exports['default'] = ImageNode;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _sourcenode = __webpack_require__(2);

	var _sourcenode2 = _interopRequireDefault(_sourcenode);

	var CanvasNode = (function (_SourceNode) {
	    _inherits(CanvasNode, _SourceNode);

	    function CanvasNode(canvas, gl, renderGraph, currentTime) {
	        var preloadTime = arguments.length <= 4 || arguments[4] === undefined ? 4 : arguments[4];

	        _classCallCheck(this, CanvasNode);

	        _get(Object.getPrototypeOf(CanvasNode.prototype), "constructor", this).call(this, canvas, gl, renderGraph, currentTime);
	        this._preloadTime = preloadTime;
	    }

	    _createClass(CanvasNode, [{
	        key: "_load",
	        value: function _load() {
	            _get(Object.getPrototypeOf(CanvasNode.prototype), "_load", this).call(this);
	            this._ready = true;
	        }
	    }, {
	        key: "_destroy",
	        value: function _destroy() {
	            _get(Object.getPrototypeOf(CanvasNode.prototype), "_destroy", this).call(this);
	            this._ready = false;
	        }
	    }, {
	        key: "_seek",
	        value: function _seek(time) {
	            _get(Object.getPrototypeOf(CanvasNode.prototype), "_seek", this).call(this, time);
	            if (this.state === _sourcenode.SOURCENODESTATE.playing || this.state === _sourcenode.SOURCENODESTATE.paused) {
	                if (this._element === undefined) this._load();
	                this._ready = false;
	            }
	            if ((this._state === _sourcenode.SOURCENODESTATE.sequenced || this._state === _sourcenode.SOURCENODESTATE.ended) && this._element !== undefined) {
	                this._destroy();
	            }
	        }
	    }, {
	        key: "_update",
	        value: function _update(currentTime) {
	            //if (!super._update(currentTime)) return false;
	            _get(Object.getPrototypeOf(CanvasNode.prototype), "_update", this).call(this, currentTime);
	            if (this._startTime - this._currentTime < this._preloadTime && this._state !== _sourcenode.SOURCENODESTATE.waiting && this._state !== _sourcenode.SOURCENODESTATE.ended) this._load();

	            if (this._state === _sourcenode.SOURCENODESTATE.playing) {
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.paused) {
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.ended && this._element !== undefined) {
	                this._destroy();
	                return false;
	            }
	        }
	    }]);

	    return CanvasNode;
	})(_sourcenode2["default"]);

	exports["default"] = CanvasNode;
	module.exports = exports["default"];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _processingnode = __webpack_require__(8);

	var _processingnode2 = _interopRequireDefault(_processingnode);

	var _utilsJs = __webpack_require__(3);

	var CompositingNode = (function (_ProcessingNode) {
	    _inherits(CompositingNode, _ProcessingNode);

	    /**
	    * Initialise an instance of a Compositing Node. You should not instantiate this directly, but use VideoContest.createCompositingNode().
	    */

	    function CompositingNode(gl, renderGraph, definition) {
	        _classCallCheck(this, CompositingNode);

	        var placeholderTexture = (0, _utilsJs.createElementTexutre)(gl);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	        _get(Object.getPrototypeOf(CompositingNode.prototype), "constructor", this).call(this, gl, renderGraph, definition, definition.inputs, false);
	        this._placeholderTexture = placeholderTexture;
	    }

	    _createClass(CompositingNode, [{
	        key: "_render",
	        value: function _render() {
	            var _this = this;

	            var gl = this._gl;
	            gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
	            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);
	            gl.clearColor(0, 0, 0, 0); // green;
	            gl.clear(gl.COLOR_BUFFER_BIT);

	            this.inputs.forEach(function (node) {
	                if (node === undefined) return;
	                _get(Object.getPrototypeOf(CompositingNode.prototype), "_render", _this).call(_this);

	                //map the input textures input the node
	                var texture = node._texture;
	                var textureOffset = 0;

	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = _this._inputTextureUnitMapping[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var mapping = _step.value;

	                        gl.activeTexture(mapping.textureUnit);
	                        var textureLocation = gl.getUniformLocation(_this._program, mapping.name);
	                        gl.uniform1i(textureLocation, _this._parameterTextureCount + textureOffset);
	                        textureOffset += 1;
	                        gl.bindTexture(gl.TEXTURE_2D, texture);
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator["return"]) {
	                            _iterator["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }

	                gl.drawArrays(gl.TRIANGLES, 0, 6);
	            });

	            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	        }
	    }]);

	    return CompositingNode;
	})(_processingnode2["default"]);

	exports["default"] = CompositingNode;
	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _graphnode = __webpack_require__(4);

	var _graphnode2 = _interopRequireDefault(_graphnode);

	var _utilsJs = __webpack_require__(3);

	var _exceptionsJs = __webpack_require__(9);

	var ProcessingNode = (function (_GraphNode) {
	    _inherits(ProcessingNode, _GraphNode);

	    /**
	    * Initialise an instance of a ProcessingNode.
	    *
	    * This class is not used directly, but is extended to create CompositingNodes, TransitionNodes, and EffectNodes.
	    */

	    function ProcessingNode(gl, renderGraph, definition, inputNames, limitConnections) {
	        var _this = this;

	        _classCallCheck(this, ProcessingNode);

	        _get(Object.getPrototypeOf(ProcessingNode.prototype), "constructor", this).call(this, gl, renderGraph, inputNames, limitConnections);
	        this._vertexShader = definition.vertexShader;
	        this._fragmentShader = definition.fragmentShader;
	        this._properties = {}; //definition.properties;
	        //copy definition properties
	        for (var propertyName in definition.properties) {
	            var propertyValue = definition.properties[propertyName].value;
	            //if an array then shallow copy it
	            if (Object.prototype.toString.call(propertyValue) === '[object Array]') {
	                propertyValue = definition.properties[propertyName].value.slice();
	            }
	            var propertyType = definition.properties[propertyName].type;
	            this._properties[propertyName] = { type: propertyType, value: propertyValue };
	        }

	        this._inputTextureUnitMapping = [];
	        this._maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
	        this._boundTextureUnits = 0;
	        this._parameterTextureCount = 0;
	        this._inputTextureCount = 0;
	        this._texture = (0, _utilsJs.createElementTexutre)(gl, null, gl.canvas.width, gl.canvas.height);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	        //compile the shader
	        this._program = (0, _utilsJs.createShaderProgram)(gl, this._vertexShader, this._fragmentShader);

	        //create and setup the framebuffer
	        this._framebuffer = gl.createFramebuffer();
	        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
	        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);
	        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	        //create properties on this object for the passed properties

	        var _loop = function (propertyName) {
	            Object.defineProperty(_this, propertyName, {
	                get: function get() {
	                    return this._properties[propertyName].value;
	                },
	                set: function set(passedValue) {
	                    this._properties[propertyName].value = passedValue;
	                }
	            });
	        };

	        for (var propertyName in this._properties) {
	            _loop(propertyName);
	        }

	        //create texutres for any texture properties
	        for (var propertyName in this._properties) {
	            var propertyValue = this._properties[propertyName].value;
	            if (propertyValue instanceof Image) {
	                this._properties[propertyName].texture = (0, _utilsJs.createElementTexutre)(gl);
	                this._properties[propertyName].texutreUnit = gl.TEXTURE0 + this._boundTextureUnits;
	                this._boundTextureUnits += 1;
	                this._parameterTextureCount += 1;
	                if (this._boundTextureUnits > this._maxTextureUnits) {
	                    throw new _exceptionsJs.RenderException("Trying to bind more than available textures units to shader");
	                }
	            }
	        }

	        //calculate texutre units for input textures
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = definition.inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var inputName = _step.value;

	                this._inputTextureUnitMapping.push({ name: inputName, textureUnit: gl.TEXTURE0 + this._boundTextureUnits });
	                this._boundTextureUnits += 1;
	                this._inputTextureCount += 1;
	                if (this._boundTextureUnits > this._maxTextureUnits) {
	                    throw new _exceptionsJs.RenderException("Trying to bind more than available textures units to shader");
	                }
	            }

	            //find the locations of the properties in the compiled shader
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator["return"]) {
	                    _iterator["return"]();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }

	        for (var propertyName in this._properties) {
	            if (this._properties[propertyName].type === "uniform") {
	                this._properties[propertyName].location = this._gl.getUniformLocation(this._program, propertyName);
	            }
	        }
	        this._currentTimeLocation = this._gl.getUniformLocation(this._program, "currentTime");
	        this._currentTime = 0;

	        //Other setup
	        var positionLocation = gl.getAttribLocation(this._program, "a_position");
	        var buffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	        gl.enableVertexAttribArray(positionLocation);
	        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]), gl.STATIC_DRAW);
	        var texCoordLocation = gl.getAttribLocation(this._program, "a_texCoord");
	        gl.enableVertexAttribArray(texCoordLocation);
	        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	        //console.log(gl.getUniformLocation(this._program, "u_image"));
	    }

	    _createClass(ProcessingNode, [{
	        key: "_update",
	        value: function _update(currentTime) {
	            this._currentTime = currentTime;
	        }
	    }, {
	        key: "_render",
	        value: function _render() {
	            this._rendered = true;
	            var gl = this._gl;
	            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	            gl.useProgram(this._program);

	            //upload the default uniforms
	            //gl.uniform1fv(this._currentTimeLocation, this._currentTime);

	            //upload/update the custom uniforms
	            var textureOffset = 0;

	            for (var propertyName in this._properties) {
	                var propertyValue = this._properties[propertyName].value;
	                var propertyType = this._properties[propertyName].type;
	                var propertyLocation = this._properties[propertyName].location;
	                if (propertyType !== 'uniform') continue;

	                if (typeof propertyValue === "number") {
	                    gl.uniform1f(propertyLocation, propertyValue);
	                } else if (Object.prototype.toString.call(propertyValue) === '[object Array]') {
	                    if (propertyValue.length === 1) {
	                        gl.uniform1fv(propertyLocation, propertyValue);
	                    } else if (propertyValue.length === 2) {
	                        gl.uniform2fv(propertyLocation, propertyValue);
	                    } else if (propertyValue.length === 3) {
	                        gl.uniform3fv(propertyLocation, propertyValue);
	                    } else if (propertyValue.length === 4) {
	                        gl.uniform4fv(propertyLocation, propertyValue);
	                    } else {
	                        console.debug("Shader parameter", propertyName, "is too long an array:", propertyValue);
	                    }
	                } else if (propertyValue instanceof Image) {
	                    var texture = this._properties[propertyName].texture;
	                    var textureUnit = this._properties[propertyName].texutreUnit;
	                    (0, _utilsJs.updateTexture)(gl, texture, propertyValue);

	                    gl.activeTexture(textureUnit);
	                    gl.uniform1i(propertyLocation, textureOffset);
	                    textureOffset += 1;
	                    gl.bindTexture(gl.TEXTURE_2D, texture);
	                } else {
	                    //TODO - add tests for textures
	                    /*gl.activeTexture(gl.TEXTURE0 + textureOffset);
	                    gl.uniform1i(parameterLoctation, textureOffset);
	                    gl.bindTexture(gl.TEXTURE_2D, textures[textureOffset-1]);*/
	                }
	            }
	        }
	    }]);

	    return ProcessingNode;
	})(_graphnode2["default"]);

	exports["default"] = ProcessingNode;
	module.exports = exports["default"];

/***/ },
/* 9 */
/***/ function(module, exports) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ConnectException = ConnectException;
	exports.RenderException = RenderException;

	function ConnectException(message) {
	    this.message = message;
	    this.name = "ConnectionException";
	}

	function RenderException(message) {
	    this.message = message;
	    this.name = "RenderException";
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _SourceNodesSourcenode = __webpack_require__(2);

	//import GraphNode from "../graphnode";

	var _ProcessingNodesProcessingnode = __webpack_require__(8);

	var _ProcessingNodesProcessingnode2 = _interopRequireDefault(_ProcessingNodesProcessingnode);

	var DestinationNode = (function (_ProcessingNode) {
	    _inherits(DestinationNode, _ProcessingNode);

	    /**
	    * Initialise an instance of a DestinationNode. 
	    *
	    * There should only be a single instance of a DestinationNode per VideoContext instance. An VideoContext's destination can be accessed like so: videoContext.desitnation.
	    * 
	    * You should not instantiate this directly.
	    */

	    function DestinationNode(gl, renderGraph) {
	        _classCallCheck(this, DestinationNode);

	        var vertexShader = "\
	            attribute vec2 a_position;\
	            attribute vec2 a_texCoord;\
	            varying vec2 v_texCoord;\
	            void main() {\
	                gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
	                v_texCoord = a_texCoord;\
	            }";

	        var fragmentShader = "\
	            precision mediump float;\
	            uniform sampler2D u_image;\
	            varying vec2 v_texCoord;\
	            varying float v_progress;\
	            void main(){\
	                gl_FragColor = texture2D(u_image, v_texCoord);\
	            }";

	        var deffinition = { fragmentShader: fragmentShader, vertexShader: vertexShader, properties: {}, inputs: ["u_image"] };

	        _get(Object.getPrototypeOf(DestinationNode.prototype), "constructor", this).call(this, gl, renderGraph, deffinition, deffinition.inputs, false);
	    }

	    _createClass(DestinationNode, [{
	        key: "_render",
	        value: function _render() {
	            var _this = this;

	            var gl = this._gl;

	            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	            gl.enable(gl.BLEND);
	            gl.clearColor(0, 0, 0, 0.0); // green;
	            gl.clear(gl.COLOR_BUFFER_BIT);

	            this.inputs.forEach(function (node) {
	                _get(Object.getPrototypeOf(DestinationNode.prototype), "_render", _this).call(_this);
	                //map the input textures input the node
	                var texture = node._texture;
	                var textureOffset = 0;

	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = _this._inputTextureUnitMapping[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var mapping = _step.value;

	                        gl.activeTexture(mapping.textureUnit);
	                        var textureLocation = gl.getUniformLocation(_this._program, mapping.name);
	                        gl.uniform1i(textureLocation, _this._parameterTextureCount + textureOffset);
	                        textureOffset += 1;
	                        gl.bindTexture(gl.TEXTURE_2D, texture);
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator["return"]) {
	                            _iterator["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }

	                gl.drawArrays(gl.TRIANGLES, 0, 6);
	            });
	        }
	    }]);

	    return DestinationNode;
	})(_ProcessingNodesProcessingnode2["default"]);

	exports["default"] = DestinationNode;
	module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _processingnode = __webpack_require__(8);

	var _processingnode2 = _interopRequireDefault(_processingnode);

	var _utilsJs = __webpack_require__(3);

	var EffectNode = (function (_ProcessingNode) {
	    _inherits(EffectNode, _ProcessingNode);

	    /**
	    * Initialise an instance of an EffectNode. You should not instantiate this directly, but use VideoContest.createEffectNode().
	    */

	    function EffectNode(gl, renderGraph, definition) {
	        _classCallCheck(this, EffectNode);

	        var placeholderTexture = (0, _utilsJs.createElementTexutre)(gl);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

	        _get(Object.getPrototypeOf(EffectNode.prototype), "constructor", this).call(this, gl, renderGraph, definition, definition.inputs, true);

	        this._placeholderTexture = placeholderTexture;
	    }

	    _createClass(EffectNode, [{
	        key: "_render",
	        value: function _render() {
	            var gl = this._gl;
	            gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
	            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);
	            gl.clearColor(0, 0, 0, 0); // green;
	            gl.clear(gl.COLOR_BUFFER_BIT);

	            _get(Object.getPrototypeOf(EffectNode.prototype), "_render", this).call(this);

	            var inputs = this._renderGraph.getInputsForNode(this);
	            var textureOffset = 0;

	            for (var i = 0; i < this._inputTextureUnitMapping.length; i++) {
	                var inputTexture = this._placeholderTexture;
	                var textureUnit = this._inputTextureUnitMapping[i].textureUnit;
	                var textureName = this._inputTextureUnitMapping[i].name;
	                if (i < inputs.length && inputs[i] !== undefined) {
	                    inputTexture = inputs[i]._texture;
	                } else {}

	                gl.activeTexture(textureUnit);
	                var textureLocation = gl.getUniformLocation(this._program, textureName);
	                gl.uniform1i(textureLocation, this._parameterTextureCount + textureOffset);
	                textureOffset += 1;
	                gl.bindTexture(gl.TEXTURE_2D, inputTexture);
	            }
	            gl.drawArrays(gl.TRIANGLES, 0, 6);
	            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	        }
	    }]);

	    return EffectNode;
	})(_processingnode2["default"]);

	exports["default"] = EffectNode;
	module.exports = exports["default"];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _effectnode = __webpack_require__(11);

	var _effectnode2 = _interopRequireDefault(_effectnode);

	var TransitionNode = (function (_EffectNode) {
	    _inherits(TransitionNode, _EffectNode);

	    /**
	    * Initialise an instance of a TransitionNode. You should not instantiate this directly, but use VideoContest.createTransitonNode().
	    */

	    function TransitionNode(gl, renderGraph, definition) {
	        _classCallCheck(this, TransitionNode);

	        _get(Object.getPrototypeOf(TransitionNode.prototype), "constructor", this).call(this, gl, renderGraph, definition);
	        this._transitions = {};

	        //save a version of the original property values
	        this._initialPropertyValues = {};
	        for (var propertyName in this._properties) {
	            this._initialPropertyValues[propertyName] = this._properties[propertyName].value;
	        }
	    }

	    _createClass(TransitionNode, [{
	        key: "_doesTransitionFitOnTimeline",
	        value: function _doesTransitionFitOnTimeline(testTransition) {
	            if (this._transitions[testTransition.property] === undefined) return true;
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this._transitions[testTransition.property][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var transition = _step.value;

	                    if (testTransition.start > transition.start && testTransition.start < transition.end) return false;
	                    if (testTransition.end > transition.start && testTransition.end < transition.end) return false;
	                    if (transition.start > testTransition.start && transition.start < testTransition.end) return false;
	                    if (transition.end > testTransition.start && transition.end < testTransition.end) return false;
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator["return"]) {
	                        _iterator["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            return true;
	        }
	    }, {
	        key: "_insertTransitionInTimeline",
	        value: function _insertTransitionInTimeline(transition) {
	            if (this._transitions[transition.property] === undefined) this._transitions[transition.property] = [];
	            this._transitions[transition.property].push(transition);

	            this._transitions[transition.property].sort(function (a, b) {
	                return a.start - b.start;
	            });
	        }

	        /**
	        * Create a transition on the timeline.
	        * 
	        * @param {number} startTime - The time at which the transition should start (relative to currentTime of video context).
	        * @param {number} endTime - The time at which the transition should be completed by (relative to currentTime of video context).
	        * @param {number} targetValue - The value to transition to by endTime.
	        * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
	        */
	    }, {
	        key: "transition",
	        value: function transition(startTime, endTime, targetValue) {
	            var propertyName = arguments.length <= 3 || arguments[3] === undefined ? "mix" : arguments[3];

	            var transition = { start: startTime + this._currentTime, end: endTime + this._currentTime, target: targetValue, property: propertyName };
	            if (!this._doesTransitionFitOnTimeline(transition)) return false;
	            this._insertTransitionInTimeline(transition);
	        }

	        /**
	        * Clear all transistions on the passed property. If no property is defined clear all transitions on the node.
	        * 
	        * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
	        */
	    }, {
	        key: "clearTransitions",
	        value: function clearTransitions(propertyName) {
	            if (propertyName === undefined) {
	                this._transitions = {};
	            } else {
	                this._transitions[propertyName] = [];
	            }
	        }
	    }, {
	        key: "_update",
	        value: function _update(currentTime) {
	            _get(Object.getPrototypeOf(TransitionNode.prototype), "_update", this).call(this, currentTime);
	            for (var propertyName in this._transitions) {
	                var value = this._initialPropertyValues[propertyName];
	                var transitionActive = false;

	                for (var i = 0; i < this._transitions[propertyName].length; i++) {
	                    var transition = this._transitions[propertyName][i];
	                    if (currentTime > transition.end) {
	                        value = transition.target;
	                        continue;
	                    }

	                    if (currentTime > transition.start && currentTime < transition.end) {
	                        var difference = transition.target - value;
	                        var progress = (this._currentTime - transition.start) / (transition.end - transition.start);
	                        transitionActive = true;
	                        this[propertyName] = value + difference * progress;
	                        break;
	                    }
	                }

	                if (!transitionActive) this[propertyName] = value;
	            }
	        }
	    }]);

	    return TransitionNode;
	})(_effectnode2["default"]);

	exports["default"] = TransitionNode;
	module.exports = exports["default"];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	//Matthew Shotton, R&D User Experince,© BBC 2015
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _exceptionsJs = __webpack_require__(9);

	var RenderGraph = (function () {
	    function RenderGraph() {
	        _classCallCheck(this, RenderGraph);

	        this.connections = [];
	    }

	    /**
	    * Get a list of nodes which are connected to the output of the passed node.
	    * 
	    * @param {GraphNode} node - the node to get the outputs for.
	    * @return {GraphNode[]} An array of the nodes which are connected to the output.
	    */

	    _createClass(RenderGraph, [{
	        key: "getOutputsForNode",
	        value: function getOutputsForNode(node) {
	            var results = [];
	            this.connections.forEach(function (connection) {
	                if (connection.source === node) {
	                    results.push(connection.destination);
	                }
	            });
	            return results;
	        }

	        /**
	        * Get a list of nodes which are connected, by input name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"name", "name":inputName, "destination":destinationNode}.
	        *
	        * @param {GraphNode} node - the node to get the named inputs for.
	        * @return {Object[]} An array of objects representing the nodes and connection type, which are connected to the named inputs for the node.
	        */
	    }, {
	        key: "getNamedInputsForNode",
	        value: function getNamedInputsForNode(node) {
	            var results = [];
	            this.connections.forEach(function (connection) {
	                if (connection.destination === node && connection.type === "name") {
	                    results.push(connection);
	                }
	            });
	            return results;
	        }

	        /**
	        * Get a list of nodes which are connected, by z-index name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"zIndex", "zIndex":0, "destination":destinationNode}.
	        * 
	        * @param {GraphNode} node - the node to get the z-index refernced inputs for.
	        * @return {Object[]} An array of objects representing the nodes and connection type, which are connected by z-Index for the node.
	        */
	    }, {
	        key: "getZIndexInputsForNode",
	        value: function getZIndexInputsForNode(node) {
	            var results = [];
	            this.connections.forEach(function (connection) {
	                if (connection.destination === node && connection.type === "zIndex") {
	                    results.push(connection);
	                }
	            });
	            results.sort(function (a, b) {
	                return a.zIndex - b.zIndex;
	            });
	            return results;
	        }

	        /**
	        * Get a list of nodes which are connected as inputs to the given node. The length of the return array is always equal to the number of inputs for the node, with undefined taking the place of any inputs not connected.
	        * 
	        * @param {GraphNode} node - the node to get the inputs for.
	        * @return {GraphNode[]} An array of GraphNodes which are connected to the node.
	        */
	    }, {
	        key: "getInputsForNode",
	        value: function getInputsForNode(node) {
	            var inputNames = node.inputNames;
	            var results = [];
	            var namedInputs = this.getNamedInputsForNode(node);
	            var indexedInputs = this.getZIndexInputsForNode(node);

	            if (node._limitConnections === true) {
	                for (var i = 0; i < inputNames.length; i++) {
	                    results[i] = undefined;
	                }

	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = namedInputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var connection = _step.value;

	                        var index = inputNames.indexOf(connection.name);
	                        results[index] = connection.source;
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator["return"]) {
	                            _iterator["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }

	                var indexedInputsIndex = 0;
	                for (var i = 0; i < results.length; i++) {
	                    if (results[i] === undefined && indexedInputs[indexedInputsIndex] !== undefined) {
	                        results[i] = indexedInputs[indexedInputsIndex].source;
	                        indexedInputsIndex += 1;
	                    }
	                }
	            } else {
	                var _iteratorNormalCompletion2 = true;
	                var _didIteratorError2 = false;
	                var _iteratorError2 = undefined;

	                try {
	                    for (var _iterator2 = namedInputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                        var connection = _step2.value;

	                        results.push(connection.source);
	                    }
	                } catch (err) {
	                    _didIteratorError2 = true;
	                    _iteratorError2 = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
	                            _iterator2["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError2) {
	                            throw _iteratorError2;
	                        }
	                    }
	                }

	                var _iteratorNormalCompletion3 = true;
	                var _didIteratorError3 = false;
	                var _iteratorError3 = undefined;

	                try {
	                    for (var _iterator3 = indexedInputs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                        var connection = _step3.value;

	                        results.push(connection.source);
	                    }
	                } catch (err) {
	                    _didIteratorError3 = true;
	                    _iteratorError3 = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
	                            _iterator3["return"]();
	                        }
	                    } finally {
	                        if (_didIteratorError3) {
	                            throw _iteratorError3;
	                        }
	                    }
	                }
	            }
	            return results;
	        }

	        /**
	        * Check if a named input on a node is available to connect too.
	        * @param {GraphNode} node - the node to check.
	        * @param {String} inputName - the named input to check.
	        */
	    }, {
	        key: "isInputAvailable",
	        value: function isInputAvailable(node, inputName) {
	            if (node._inputNames.indexOf(inputName) === -1) return false;
	            var _iteratorNormalCompletion4 = true;
	            var _didIteratorError4 = false;
	            var _iteratorError4 = undefined;

	            try {
	                for (var _iterator4 = this.connections[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                    var connection = _step4.value;

	                    if (connection.type === "name") {
	                        if (connection.destination === node && connection.name === inputName) {
	                            return false;
	                        }
	                    }
	                }
	            } catch (err) {
	                _didIteratorError4 = true;
	                _iteratorError4 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
	                        _iterator4["return"]();
	                    }
	                } finally {
	                    if (_didIteratorError4) {
	                        throw _iteratorError4;
	                    }
	                }
	            }

	            return true;
	        }

	        /**
	        * Register a connection between two nodes.
	        * 
	        * @param {GraphNode} sourceNode - the node to connect from.
	        * @param {GraphNode} destinationNode - the node to connect to.
	        * @param {(String || number)} [target] - the target port of the conenction, this could be a string to specfiy a specific named port, a number to specify a port by index, or undefined, in which case the next available port will be connected to.
	        * @return {boolean} Will return true if connection succeeds otherwise will throw a ConnectException.
	        */
	    }, {
	        key: "registerConnection",
	        value: function registerConnection(sourceNode, destinationNode, target) {
	            if (destinationNode.inputs.length >= destinationNode.inputNames.length && destinationNode._limitConnections === true) {
	                throw new _exceptionsJs.ConnectException("Node has reached max number of inputs, can't connect");
	            }
	            if (typeof target === "number") {
	                //target is a specific
	                this.connections.push({ "source": sourceNode, "type": "zIndex", "zIndex": target, "destination": destinationNode });
	            } else if (typeof target === "string" && destinationNode._limitConnections) {
	                //target is a named port

	                //make sure named port is free
	                if (this.isInputAvailable(destinationNode, target)) {
	                    this.connections.push({ "source": sourceNode, "type": "name", "name": target, "destination": destinationNode });
	                } else {
	                    throw new _exceptionsJs.ConnectException("Port " + target + " is already connected to");
	                }
	            } else {
	                //target is undefined so just make it a high zIndex
	                var indexedConns = this.getZIndexInputsForNode(destinationNode);
	                var index = 0;
	                if (indexedConns.length > 0) index = indexedConns[indexedConns.length - 1].zIndex + 1;
	                this.connections.push({ "source": sourceNode, "type": "zIndex", "zIndex": index, "destination": destinationNode });
	            }
	            return true;
	        }

	        /**
	        * Remove a connection between two nodes.
	        * @param {GraphNode} sourceNode - the node to unregsiter connection from.
	        * @param {GraphNode} destinationNode - the node to register connection to.
	        * @return {boolean} Will return true if removing connection succeeds, or false if there was no connectionsction to remove.
	        */
	    }, {
	        key: "unregisterConnection",
	        value: function unregisterConnection(sourceNode, destinationNode) {
	            var _this = this;

	            var toRemove = [];

	            this.connections.forEach(function (connection) {
	                if (connection.source === sourceNode && connection.destination === destinationNode) {
	                    toRemove.push(connection);
	                }
	            });

	            if (toRemove.length === 0) return false;

	            toRemove.forEach(function (removeNode) {
	                var index = _this.connections.indexOf(removeNode);
	                _this.connections.splice(index, 1);
	            });

	            return true;
	        }
	    }]);

	    return RenderGraph;
	})();

	exports["default"] = RenderGraph;
	module.exports = exports["default"];

/***/ }
/******/ ]);