import VideoContext from "../../src/videocontext";

let videocontext;
require("webgl-mock");

beforeEach(function() {
    const canvas = new HTMLCanvasElement(500, 500);
    videocontext = new VideoContext(canvas);
});

describe("VideoContext", function() {
    describe("#effect()", function() {
        it("should create an EffectNode from the passed definition", function() {
            var effectNode = videocontext.effect(VideoContext.DEFINITIONS.MONOCHROME);

            expect(effectNode.maximumConnections).not.toBe(Infinity); // effect nodes limit connections
            expect(effectNode.inputNames).toEqual(["u_image"]);
        });
    });

    describe("#transition()", function() {
        it("should create a TransitionNode from the passed definition", function() {
            var transitionNode = videocontext.transition(VideoContext.DEFINITIONS.CROSSFADE);

            expect(transitionNode.maximumConnections).not.toEqual(Infinity); // transition nodes limit connections
            expect(transitionNode.transition).not.toEqual(undefined);
            expect(transitionNode.clearTransitions).not.toEqual(undefined);
            expect(transitionNode.inputNames).toEqual(["u_image_a", "u_image_b"]);
        });
    });

    describe("#compositor()", function() {
        it("should create a CompositingNode from the passed definition", function() {
            var compositingNode = videocontext.compositor(VideoContext.DEFINITIONS.MONOCHROME);

            expect(compositingNode.maximumConnections).toEqual(Infinity);
            expect(compositingNode.inputNames).toEqual(["u_image"]);
        });
    });

    describe("#duration", function() {
        it("should return the time in seconds between time=0 and the stop time of the last SourceNode", function() {
            var videoElement = document.createElement("video");
            var videoNode1 = videocontext.video(videoElement);
            var videoNode2 = videocontext.video(videoElement);

            videoNode1.start(10);
            videoNode1.stop(20.245);
            videoNode2.start(0);
            videoNode2.stop(10);
            expect(videocontext.duration).toEqual(20.245);
        });

        it("should return Infinity if no stop time has been specified on one of the Nodes", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);

            imageNode.start(0);
            expect(videocontext.duration).toBe(Infinity);
        });

        it("should return 0 if all source nodes have had clearTimelineState called on them", function() {
            var videoElement = document.createElement("video");
            var videoNode = videocontext.video(videoElement);

            videoNode.start(0);
            videoNode.stop(10);
            videoNode.clearTimelineState();
            expect(videocontext.duration).toEqual(0);
        });
    });
});
