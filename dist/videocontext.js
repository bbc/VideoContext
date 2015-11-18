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

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _SourceNodesVideonodeJs = __webpack_require__(1);

	var _SourceNodesVideonodeJs2 = _interopRequireDefault(_SourceNodesVideonodeJs);

	var _ProcessingNodesProcessingnodeJs = __webpack_require__(4);

	var _ProcessingNodesProcessingnodeJs2 = _interopRequireDefault(_ProcessingNodesProcessingnodeJs);

	var _DestinationNodeDestinationnodeJs = __webpack_require__(6);

	var _DestinationNodeDestinationnodeJs2 = _interopRequireDefault(_DestinationNodeDestinationnodeJs);

	var _ProcessingNodesEffectnodeJs = __webpack_require__(9);

	var _ProcessingNodesEffectnodeJs2 = _interopRequireDefault(_ProcessingNodesEffectnodeJs);

	var _rendergraphJs = __webpack_require__(7);

	var _rendergraphJs2 = _interopRequireDefault(_rendergraphJs);

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
	    function VideoContext(canvas) {
	        _classCallCheck(this, VideoContext);

	        this._gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, alpha: false });;
	        this._renderGraph = new _rendergraphJs2["default"]();
	        this._sourceNodes = [];
	        this._processingNodes = [];
	        this._timeline = [];
	        this._currentTime = 0;
	        this._state = STATE.paused;
	        this._destinationNode = new _DestinationNodeDestinationnodeJs2["default"](this._gl, this._renderGraph);
	        registerUpdateable(this);
	    }

	    _createClass(VideoContext, [{
	        key: "play",
	        value: function play() {
	            console.debug("VideoContext - playing");
	            for (var i = 0; i < this._sourceNodes.length; i++) {
	                this._sourceNodes[i]._play();
	            }
	            this._state = STATE.playing;
	            return true;
	        }
	    }, {
	        key: "pause",
	        value: function pause() {
	            console.debug("VideoContext - pausing");
	            for (var i = 0; i < this._sourceNodes.length; i++) {
	                this._sourceNodes[i]._pause();
	            }
	            this._state = STATE.paused;
	            return true;
	        }
	    }, {
	        key: "createVideoSourceNode",
	        value: function createVideoSourceNode(src) {
	            var sourceOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

	            var videoNode = new _SourceNodesVideonodeJs2["default"](src, this._gl, this._renderGraph, sourceOffset);
	            this._sourceNodes.push(videoNode);
	            return videoNode;
	        }
	    }, {
	        key: "createEffectNode",
	        value: function createEffectNode(definition) {
	            var effectNode = new _ProcessingNodesEffectnodeJs2["default"](this._gl, this._renderGraph, definition);
	            this._processingNodes.push(effectNode);
	            return effectNode;
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

	                if (this._state !== STATE.paused) {
	                    if (this._isStalled()) {
	                        this._state = STATE.stalled;
	                    } else {
	                        this._state = STATE.playing;
	                    }
	                }

	                if (this._state === STATE.playing) {
	                    this._currentTime += dt;
	                    if (this._currentTime > this.duration) this._state = STATE.ended;
	                }

	                for (var i = 0; i < this._sourceNodes.length; i++) {
	                    var sourceNode = this._sourceNodes[i];
	                    sourceNode._update(this._currentTime);

	                    if (this._state === STATE.stalled) {
	                        if (sourceNode._isReady()) sourceNode._pause();
	                    }
	                    if (this._state === STATE.paused) {
	                        sourceNode._pause();
	                    }
	                    if (this._state === STATE.playing) {
	                        sourceNode._play();
	                    }
	                }

	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = this._processingNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var node = _step.value;

	                        node._render();
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

	                this._destinationNode._render();
	            }
	        }
	    }, {
	        key: "currentTime",
	        set: function set(currentTime) {
	            console.debug("VideoContext - seeking to", currentTime);

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
	        * var ctx = new VideoContext();
	        * var canvasElement = document.getElemenyById("canvas");
	        * var videoNode = ctx.createVideoSourceNode("video.mp4");
	        * var outputNode =ctx.createOutputNode(cavnasElement);
	        * videoNode.connect(outputNode);
	        * videoNode.start();
	        * videoCtx.play();
	        *
	        */
	        get: function get() {
	            return this._currentTime;
	        }
	    }, {
	        key: "duration",
	        get: function get() {
	            var maxTime = 0;
	            for (var i = 0; i < this._sourceNodes.length; i++) {
	                if (this._sourceNodes[i]._stopTime > maxTime) {
	                    maxTime = this._sourceNodes[i]._stopTime;
	                }
	            }
	            return maxTime;
	        }
	    }, {
	        key: "destination",
	        get: function get() {
	            return this._destinationNode;
	        }
	    }]);

	    return VideoContext;
	})();

	exports["default"] = VideoContext;
	module.exports = exports["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _sourcenode = __webpack_require__(2);

	var _sourcenode2 = _interopRequireDefault(_sourcenode);

	var _utilsJs = __webpack_require__(5);

	var VideoNode = (function (_SourceNode) {
	    _inherits(VideoNode, _SourceNode);

	    function VideoNode(src, gl, renderGraph) {
	        var sourceOffset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
	        var preloadTime = arguments.length <= 4 || arguments[4] === undefined ? 4 : arguments[4];

	        _classCallCheck(this, VideoNode);

	        _get(Object.getPrototypeOf(VideoNode.prototype), "constructor", this).call(this, src, gl, renderGraph);
	        this._preloadTime = preloadTime;
	        this._sourceOffset = sourceOffset;
	    }

	    _createClass(VideoNode, [{
	        key: "_load",
	        value: function _load() {
	            if (this._element !== undefined) {
	                if (this._element.readyState > 3) {
	                    this._ready = true;
	                }
	                return;
	            }
	            if (this._isResponsibleForElementLifeCycle) {
	                this._element = document.createElement("video");
	                this._element.src = this._elementURL;
	            }
	            this._element.currentTime = this._sourceOffset;
	        }
	    }, {
	        key: "_destroy",
	        value: function _destroy() {
	            if (this._isResponsibleForElementLifeCycle) {
	                this._element.src = "";
	                this._element = undefined;
	            }
	            this._ready = false;
	        }
	    }, {
	        key: "_seek",
	        value: function _seek(time) {
	            _get(Object.getPrototypeOf(VideoNode.prototype), "_seek", this).call(this, time);
	            if (this.state === _sourcenode.SOURCENODESTATE.playing || this.state === _sourcenode.SOURCENODESTATE.paused) {
	                this._element.currentTime = this._currentTime - this._startTime + this._sourceOffset;
	            }
	        }
	    }, {
	        key: "_update",
	        value: function _update(currentTime) {
	            //if (!super._update(currentTime)) return false;
	            _get(Object.getPrototypeOf(VideoNode.prototype), "_update", this).call(this, currentTime);
	            if (this._startTime - this._currentTime < this._preloadTime) this._load();

	            if (this._state === _sourcenode.SOURCENODESTATE.playing) {
	                this._element.play();
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.paused) {
	                this._element.pause();
	                return true;
	            } else if (this._state === _sourcenode.SOURCENODESTATE.ended) {
	                this._element.pause();
	                this._destroy();
	                return false;
	            }
	        }
	    }]);

	    return VideoNode;
	})(_sourcenode2["default"]);

	exports["default"] = VideoNode;
	module.exports = exports["default"];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _utilsJs = __webpack_require__(5);

	var _graphnode = __webpack_require__(3);

	var _graphnode2 = _interopRequireDefault(_graphnode);

	var STATE = { "waiting": 0, "sequenced": 1, "playing": 2, "paused": 3, "ended": 4 };

	var SourceNode = (function (_GraphNode) {
	    _inherits(SourceNode, _GraphNode);

	    function SourceNode(src, gl, renderGraph) {
	        _classCallCheck(this, SourceNode);

	        _get(Object.getPrototypeOf(SourceNode.prototype), "constructor", this).call(this, gl, renderGraph, 0);
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
	        this._currentTime = 0;
	        this._startTime = 0;
	        this._stopTime = 0;
	        this._ready = false;
	        this._texture = (0, _utilsJs.createElementTexutre)(gl);
	        //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,512,512, gl.RGBA, gl.UNSIGNED_BYTE, this._element);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	    }

	    _createClass(SourceNode, [{
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
	            console.debug("stop time", this._stopTime);
	            return true;
	        }
	    }, {
	        key: "_seek",
	        value: function _seek(time) {
	            //this._currentTime = time;
	            this._update(time);
	        }
	    }, {
	        key: "_pause",
	        value: function _pause() {
	            if (this._state === STATE.playing) {
	                this._state = STATE.paused;
	            }
	        }
	    }, {
	        key: "_play",
	        value: function _play() {
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
	            //update the state
	            if (this._state === STATE.waiting || this._state === STATE.ended) return false;

	            if (currentTime < this._startTime) {
	                this._state = STATE.sequenced;
	            }

	            if (currentTime >= this._startTime && this._state !== STATE.paused) {
	                this._state = STATE.playing;
	            }

	            if (currentTime >= this._stopTime) {
	                (0, _utilsJs.clearTexture)(this._gl, this._texture);
	                this._state = STATE.ended;
	            }

	            //update the current time
	            this._currentTime = currentTime;

	            //update this source nodes texture
	            if (this._element === undefined || this._ready === false) return true;

	            if (this._state === STATE.playing) {
	                (0, _utilsJs.updateTexture)(this._gl, this._texture, this._element);
	            }

	            return true;
	        }
	    }, {
	        key: "clearTimelineState",
	        value: function clearTimelineState() {
	            this._startTime = 0;
	            this._stopTime = 0;
	            this._state = STATE.waiting;
	        }
	    }, {
	        key: "state",
	        get: function get() {
	            return this._state;
	        }
	    }]);

	    return SourceNode;
	})(_graphnode2["default"]);

	exports["default"] = SourceNode;
	exports.SOURCENODESTATE = STATE;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GraphNode = (function () {
	    function GraphNode(gl, renderGraph, maxInputs) {
	        _classCallCheck(this, GraphNode);

	        this._renderGraph = renderGraph;
	        this._maxInputs = maxInputs;

	        //Setup WebGL output texture
	        this._gl = gl;
	        this._renderGraph = renderGraph;
	    }

	    _createClass(GraphNode, [{
	        key: "connect",
	        value: function connect(targetNode, zIndex) {
	            if (zIndex === undefined) {
	                var targetInputs = this._renderGraph.getSortedInputsForNode(targetNode);
	                zIndex = targetInputs[targetInputs.length - 1] + 1.0;
	            }
	            return this._renderGraph.registerConnection(this, targetNode, zIndex);
	        }
	    }, {
	        key: "disconnect",
	        value: function disconnect(targetNode) {
	            if (targetNode === undefined) {
	                var toRemove = this._renderGraph.getOutputsForNode(this);
	                toRemove.forEach(function (target) {
	                    this._renderGraph.unregisterConnection(this, target);
	                });
	                if (toRemove.length > 0) return true;
	                return false;
	            }
	            return this._renderGraph.unregisterConnection(this, targetNode);
	        }
	    }, {
	        key: "inputs",
	        get: function get() {
	            var inputConnections = this._renderGraph.getSortedInputsForNode(this);
	            var results = [];
	            inputConnections.forEach(function (connection) {
	                results.push(connection.node);
	            });
	            return results;
	        }
	    }, {
	        key: "outputs",
	        get: function get() {
	            var outputConnections = this._renderGraph.getSortedOutputsForNode(this);
	            var results = [];
	            outputConnections.forEach(function (connection) {
	                results.push(connection.node);
	            });
	            return results;
	        }
	    }]);

	    return GraphNode;
	})();

	exports["default"] = GraphNode;
	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _graphnode = __webpack_require__(3);

	var _graphnode2 = _interopRequireDefault(_graphnode);

	var _utilsJs = __webpack_require__(5);

	var _exceptionsJs = __webpack_require__(8);

	var ProcessingNode = (function (_GraphNode) {
	    _inherits(ProcessingNode, _GraphNode);

	    function ProcessingNode(gl, renderGraph, definition, maxInputs) {
	        var _this = this;

	        _classCallCheck(this, ProcessingNode);

	        _get(Object.getPrototypeOf(ProcessingNode.prototype), "constructor", this).call(this, gl, renderGraph, maxInputs);
	        this._vertexShader = definition.vertexShader;
	        this._fragmentShader = definition.fragmentShader;
	        this._properties = definition.properties;
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
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.compileShader = compileShader;
	exports.createShaderProgram = createShaderProgram;
	exports.createElementTexutre = createElementTexutre;
	exports.updateTexture = updateTexture;
	exports.clearTexture = clearTexture;

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

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

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

	var _ProcessingNodesProcessingnode = __webpack_require__(4);

	var _ProcessingNodesProcessingnode2 = _interopRequireDefault(_ProcessingNodesProcessingnode);

	var DestinationNode = (function (_ProcessingNode) {
	    _inherits(DestinationNode, _ProcessingNode);

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

	        _get(Object.getPrototypeOf(DestinationNode.prototype), "constructor", this).call(this, gl, renderGraph, { fragmentShader: fragmentShader, vertexShader: vertexShader, properties: {}, inputs: ["u_image"] });
	    }

	    _createClass(DestinationNode, [{
	        key: "_render",
	        value: function _render() {
	            var _this2 = this;

	            var gl = this._gl;
	            var _this = this;

	            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	            gl.enable(gl.BLEND);
	            gl.clearColor(0, 0, 0, 0.0); // green;
	            gl.clear(gl.COLOR_BUFFER_BIT);

	            this.inputs.forEach(function (node) {
	                _get(Object.getPrototypeOf(DestinationNode.prototype), "_render", _this2).call(_this2);
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _exceptionsJs = __webpack_require__(8);

	var RenderGraph = (function () {
	    function RenderGraph() {
	        _classCallCheck(this, RenderGraph);

	        this.connections = [];
	    }

	    _createClass(RenderGraph, [{
	        key: "getOutputsForNode",
	        value: function getOutputsForNode(node) {
	            var results = [];
	            this.connections.forEach(function (connection) {
	                if (connection.source === node) {
	                    results.push({ "node": connection.destination, "zIndex": connection.zIndex });
	                }
	            });
	            return results;
	        }
	    }, {
	        key: "getSortedOutputsForNode",
	        value: function getSortedOutputsForNode(node) {
	            var outputs = this.getOutputsForNode(node);
	            outputs.sort(function (a, b) {
	                return a.zIndex - b.zIndex;
	            });
	            return outputs;
	        }
	    }, {
	        key: "getInputsForNode",
	        value: function getInputsForNode(node) {
	            var results = [];
	            this.connections.forEach(function (connection) {
	                if (connection.destination === node) {
	                    results.push({ "node": connection.source, "zIndex": connection.zIndex });
	                }
	            });
	            return results;
	        }
	    }, {
	        key: "getSortedInputsForNode",
	        value: function getSortedInputsForNode(node) {
	            var inputs = this.getInputsForNode(node);
	            inputs.sort(function (a, b) {
	                return a.zIndex - b.zIndex;
	            });
	            return inputs;
	        }
	    }, {
	        key: "registerConnection",
	        value: function registerConnection(sourceNode, destinationNode, zIndex) {
	            console.debug("adding connection");
	            if (destinationNode._maxInputs !== undefined && destinationNode.inputs.length >= destinationNode._maxInputs) {
	                throw new _exceptionsJs.ConnectException("Node has reached max number of inputs, can't connect");
	            }
	            this.connections.push({ "source": sourceNode, "zIndex": zIndex, "destination": destinationNode });
	            return true;
	        }
	    }, {
	        key: "unregsiterConnection",
	        value: function unregsiterConnection(sourceNode, destinationNode) {
	            var toRemove = [];

	            this.connections.forEach(function (connection) {
	                if (connection.source === sourceNode && connection.destination === destinationNode) {
	                    toRemove.push(connection);
	                }
	            });

	            if (toRemove.length === 0) return false;

	            this.toRemove.forEach(function (removeNode) {
	                var index = this.connections.indexOf(removeNode);
	                this.connections.splice(index, 1);
	            });

	            return true;
	        }
	    }]);

	    return RenderGraph;
	})();

	exports["default"] = RenderGraph;
	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports) {

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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _processingnode = __webpack_require__(4);

	var _processingnode2 = _interopRequireDefault(_processingnode);

	var _utilsJs = __webpack_require__(5);

	var EffectNode = (function (_ProcessingNode) {
	    _inherits(EffectNode, _ProcessingNode);

	    function EffectNode(gl, renderGraph, definition) {
	        _classCallCheck(this, EffectNode);

	        var maxInputs = definition.inputs.length;
	        var placeholderTexture = (0, _utilsJs.createElementTexutre)(gl);
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

	        _get(Object.getPrototypeOf(EffectNode.prototype), "constructor", this).call(this, gl, renderGraph, definition, maxInputs);

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

	            var inputs = this.inputs;
	            var textureOffset = 0;

	            for (var i = 0; i < this._inputTextureUnitMapping.length; i++) {
	                var inputTexture = this._placeholderTexture;
	                var textureUnit = this._inputTextureUnitMapping[i].textureUnit;
	                var textureName = this._inputTextureUnitMapping[i].name;
	                if (i < inputs.length) {
	                    inputTexture = inputs[i]._texture;
	                    //console.log(textureName, textureUnit);
	                } else {
	                        //console.debug("VideoContext:Warning - not all inputs to effect node are connected");
	                    }

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

/***/ }
/******/ ]);