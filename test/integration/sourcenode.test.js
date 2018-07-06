import VideoContext from "../../src/videocontext";

let videocontext;
require("webgl-mock");

beforeEach(function() {
    const canvas = new HTMLCanvasElement(500, 500);
    videocontext = new VideoContext(canvas);
});

describe("SourceNode", function() {
    describe("#duration", function() {
        it("should return the time the node is playing for", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(10);
            imageNode.stop(20);
            expect(imageNode.duration).toBe(10);
        });

        it("should return Infinity if no stop time has been specified", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(10);
            expect(imageNode.duration).toBe(Infinity);
        });

        it("should return undefined if start hasn't been called", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            expect(imageNode.duration).toBe(undefined);
        });

        it("should return undefined if source nodes has had clearTimelineState called on it", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(10);
            imageNode.stop(20);
            imageNode.clearTimelineState();
            expect(imageNode.duration).toBe(undefined);
        });
    });

    describe("#start()", function() {
        it("should return true if setting start time was successful", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            expect(imageNode.start(10)).toBe(true);
        });

        it("should return false if start hase already been called without first calling clearTimelineState", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            expect(imageNode.start(10)).toBe(false);
        });

        it("should return true if start has already been called followed be calling clearTimelineState", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            imageNode.clearTimelineState();
            expect(imageNode.start(10)).toBe(true);
        });

        it("duration should be Infinity if stop hasn't been called", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            expect(imageNode.duration).toBe(Infinity);
        });

        it("sourceNode state should be set to sequenced", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            expect(imageNode.state).toBe(1);
        });
    });

    describe("#stop()", function() {
        it("should return true if setting stop time was successful", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(10);
            expect(imageNode.stop(20)).toBe(true);
        });

        it("should return false if start hasn't been called first", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            expect(imageNode.stop(10)).toBe(false);
        });

        it("should return false if time is before startTime ", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(10);
            expect(imageNode.stop(2)).toBe(false);
        });

        it("duration should be less than Infinity", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            imageNode.stop(10);
            expect(imageNode.duration).toBeLessThan(Infinity);
        });
    });

    describe("#clearTimelineState()", function() {
        it("should set a SourceNodes state to waiting", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            imageNode.stop(10);
            imageNode.clearTimelineState();
            expect(imageNode.state).toBe(0);
        });

        it("should set a SourceNodes duration to undefined", function() {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.image(imageElement);

            imageNode.start(0);
            imageNode.stop(10);
            imageNode.clearTimelineState();
            expect(imageNode.duration).toBe(undefined);
        });
    });
});
