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

	        this._gl = canvas.getContext("webgl");
	        this._sourceNodes = [];
	        this._processingNodes = [];
	        this._timeline = [];
	        this._currentTime = 0;
	        this._state = STATE.paused;
	        registerUpdateable(this);
	    }

	    _createClass(VideoContext, [{
	        key: "play",
	        value: function play() {
	            console.debug("VideoContext - playing");
	            if (this._state === STATE.ended || this._state === STATE.broken) return false;

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
	            if (this._state === STATE.ended || this._state === STATE.broken) return false;

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

	            var videoNode = new _SourceNodesVideonodeJs2["default"](src, this._gl, sourceOffset);
	            this._sourceNodes.push(videoNode);
	            return videoNode;
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

	var VideoNode = (function (_SourceNode) {
	    _inherits(VideoNode, _SourceNode);

	    function VideoNode(src, gl) {
	        var sourceOffset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	        var preloadTime = arguments.length <= 3 || arguments[3] === undefined ? 4 : arguments[3];

	        _classCallCheck(this, VideoNode);

	        _get(Object.getPrototypeOf(VideoNode.prototype), "constructor", this).call(this, src, gl);
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
	            this._element = document.createElement("video");
	            this._element.src = this._elementURL;
	            this._element.currentTime = this._sourceOffset;
	        }
	    }, {
	        key: "_destroy",
	        value: function _destroy() {
	            this._element.src = "";
	            this._element = undefined;
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
	            if (!_get(Object.getPrototypeOf(VideoNode.prototype), "_update", this).call(this, currentTime)) return false;
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
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var STATE = { "waiting": 0, "sequenced": 1, "playing": 2, "paused": 3, "ended": 4 };

	var SourceNode = (function () {
	    function SourceNode(src) {
	        _classCallCheck(this, SourceNode);

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
	            if (this._state === STATE.waiting || this._state === STATE.ended) return false;

	            if (currentTime < this._startTime) {
	                this._state = STATE.sequenced;
	            }

	            if (currentTime >= this._startTime && this._state !== STATE.paused) {
	                this._state = STATE.playing;
	            }

	            if (currentTime >= this._stopTime) {
	                this._state = STATE.ended;
	            }

	            this._currentTime = currentTime;
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
	})();

	exports["default"] = SourceNode;
	exports.SOURCENODESTATE = STATE;

/***/ }
/******/ ]);