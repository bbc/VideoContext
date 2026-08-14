import VideoContext from "../../src/videocontext";

let videocontext;
require("webgl-mock");

beforeEach(function () {
    const canvas = new HTMLCanvasElement(500, 500);
    videocontext = new VideoContext(canvas);
});

describe("VideoContext", function () {
    describe("#effect()", function () {
        it("should create an EffectNode from the passed definition", function () {
            var effectNode = videocontext.effect(VideoContext.DEFINITIONS.MONOCHROME);

            expect(effectNode.maximumConnections).not.toBe(Infinity); // effect nodes limit connections
            expect(effectNode.inputNames).toEqual(["u_image"]);
        });
    });

    describe("#transition()", function () {
        it("should create a TransitionNode from the passed definition", function () {
            var transitionNode = videocontext.transition(VideoContext.DEFINITIONS.CROSSFADE);

            expect(transitionNode.maximumConnections).not.toEqual(Infinity); // transition nodes limit connections
            expect(transitionNode.transition).not.toEqual(undefined);
            expect(transitionNode.clearTransitions).not.toEqual(undefined);
            expect(transitionNode.inputNames).toEqual(["u_image_a", "u_image_b"]);
        });
    });

    describe("#compositor()", function () {
        it("should create a CompositingNode from the passed definition", function () {
            var compositingNode = videocontext.compositor(VideoContext.DEFINITIONS.MONOCHROME);

            expect(compositingNode.maximumConnections).toEqual(Infinity);
            expect(compositingNode.inputNames).toEqual(["u_image"]);
        });
    });

    describe("#playbackRate", function () {
        it("should update the playback rate of video and audio nodes alike", function () {
            const videoNode = videocontext.video(document.createElement("video"));
            const audioNode = videocontext.audio(document.createElement("audio"));

            videocontext.playbackRate = 2;

            expect(videoNode._globalPlaybackRate).toBe(2);
            expect(audioNode._globalPlaybackRate).toBe(2);
        });
    });

    describe("#volume", function () {
        it("should apply the volume to custom MediaNode subclasses", function () {
            class CustomMediaNode extends VideoContext.NODES.MediaNode {}
            const node = videocontext.customSourceNode(
                CustomMediaNode,
                document.createElement("video")
            );

            videocontext.volume = 0.25;

            expect(node._attributes.volume).toBe(0.25);
        });
    });

    describe("#audio()", function () {
        it("should give audio nodes access to the media element cache", function () {
            const audioNode = videocontext.audio("test.mp3");

            expect(audioNode._mediaElementCache).toBe(videocontext._videoElementCache);
        });
    });

    describe("#endOnLastSourceEnd", function () {
        it("should expose the endOnLastSourceEnd option as a readable property", function () {
            expect(videocontext.endOnLastSourceEnd).toBe(true);

            const canvas = new HTMLCanvasElement(500, 500);
            const otherContext = new VideoContext(canvas, undefined, {
                endOnLastSourceEnd: false
            });
            expect(otherContext.endOnLastSourceEnd).toBe(false);
        });
    });

    describe("#destroy()", function () {
        it("should unregister the context from the update manager and the debug references", function () {
            expect(VideoContext.updateablesManager._updateables).toContain(videocontext);
            const id = videocontext.id;

            videocontext.destroy();

            expect(VideoContext.updateablesManager._updateables).not.toContain(videocontext);
            expect(window.__VIDEOCONTEXT_REFS__[id]).toBeUndefined();
        });
    });

    describe("#reset()", function () {
        it("should clear registered event callbacks", function () {
            const updateSpy = jest.fn();
            videocontext.registerCallback(VideoContext.EVENTS.UPDATE, updateSpy);

            videocontext.reset();
            videocontext.update(1 / 60);

            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe("#snapshot()", function () {
        it("should record the actual input port index for named connections", function () {
            const transitionNode = videocontext.transition(VideoContext.DEFINITIONS.CROSSFADE);
            const videoNode = videocontext.video(document.createElement("video"));
            videoNode.connect(transitionNode, "u_image_b");
            transitionNode.connect(videocontext.destination);

            const snap = videocontext.snapshot();

            expect(snap.nodes.processor0.inputs).toEqual([{ id: "source0", index: 1 }]);
        });
    });

    describe("#duration", function () {
        it("should return the time in seconds between time=0 and the stop time of the last SourceNode", function () {
            var videoElement = document.createElement("video");
            var videoNode1 = videocontext.video(videoElement);
            var videoNode2 = videocontext.video(videoElement);

            videoNode1.start(10);
            videoNode1.stop(20.245);
            videoNode2.start(0);
            videoNode2.stop(10);
            expect(videocontext.duration).toEqual(20.245);
        });

        it("should return Infinity if no stop time has been specified on one of the Nodes", function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);

            imageNode.start(0);
            expect(videocontext.duration).toBe(Infinity);
        });

        it("should return 0 if all source nodes have had clearTimelineState called on them", function () {
            var videoElement = document.createElement("video");
            var videoNode = videocontext.video(videoElement);

            videoNode.start(0);
            videoNode.stop(10);
            videoNode.clearTimelineState();
            expect(videocontext.duration).toEqual(0);
        });
    });
});
