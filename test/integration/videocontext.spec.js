/* eslint-disable */

/**
 * These tests are run in the browser (and are written in ES5 for maximum support).
 * Mocha & Chai are the tools of choice here, since Jest (our unit-testing framework)
 * does not support brower-based tests.
 *
 * Currently there is no automated workflow in place for integration tests.
 * To run the tests:
 *
 * 1. Start the local server by running: `npm run dev`
 * 2. Visit: http://localhost:8081/test/integration/
 *
 * TODO: configure Karma for automated browser-based test running
 */

describe("VideoContext", function() {
    describe("#createEffectNode()", function() {
        var videocontext;

        beforeEach(function() {
            var canvas = document.getElementById("videocontext-canvas");
            videocontext = new VideoContext(canvas);
        });

        it("should create an EffectNode from the passed definition", function() {
            var effectNode = videocontext.createEffectNode(VideoContext.DEFINITIONS.MONOCHROME);

            chai.assert.notEqual(effectNode.maximumConnections, Infinity);
            chai.assert.deepEqual(effectNode.inputNames, ["u_image"]);
        });
    });

    describe("#createTransitionNode()", function() {
        var videocontext;

        beforeEach(function() {
            var canvas = document.getElementById("videocontext-canvas");
            videocontext = new VideoContext(canvas);
        });

        it("should create a TransitionNode from the passed definition", function() {
            var transitionNode = videocontext.createTransitionNode(
                VideoContext.DEFINITIONS.CROSSFADE
            );

            chai.assert.notEqual(transitionNode.maximumConnections, Infinity);
            chai.assert.notEqual(transitionNode.transition, undefined);
            chai.assert.notEqual(transitionNode.clearTransitions, undefined);
            chai.assert.deepEqual(transitionNode.inputNames, ["u_image_a", "u_image_b"]);
        });
    });

    describe("#createCompositingNode()", function() {
        var videocontext;

        beforeEach(function() {
            var canvas = document.getElementById("videocontext-canvas");
            videocontext = new VideoContext(canvas);
        });

        it("should create a CompositingNode from the passed definition", function() {
            var compositingNode = videocontext.createCompositingNode(
                VideoContext.DEFINITIONS.MONOCHROME
            );

            chai.assert.equal(compositingNode.maximumConnections, Infinity);
            chai.assert.deepEqual(compositingNode.inputNames, ["u_image"]);
        });
    });

    describe("#duration", function() {
        var videocontext;

        beforeEach(function() {
            var canvas = document.getElementById("videocontext-canvas");
            videocontext = new VideoContext(canvas);
        });

        it("should return the time in seconds between time=0 and the stop time of the last SourceNode", function() {
            var videoElement = document.createElement("video");
            var videoNode1 = videocontext.createVideoSourceNode(videoElement);
            var videoNode2 = videocontext.createVideoSourceNode(videoElement);

            videoNode1.start(10);
            videoNode1.stop(20.245);
            videoNode2.start(0);
            videoNode2.stop(10);
            chai.assert.equal(videocontext.duration, 20.245);
        });

        it("should return Infinity if no stop time has been specified on one of the Nodes", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);

            imageNode.start(0);
            chai.assert.equal(videocontext.duration, Infinity);
        });

        it("should return 0 if all source nodes have had clearTimelineState called on them", function() {
            var videoElement = document.createElement("video");
            var videoNode = videocontext.createVideoSourceNode(videoElement);

            videoNode.start(0);
            videoNode.stop(10);
            videoNode.clearTimelineState();
            chai.assert.equal(videocontext.duration, 0);
        });
    });
});
