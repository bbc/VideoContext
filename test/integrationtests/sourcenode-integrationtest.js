
describe('SourceNode', function() {
    describe('#duration', function () {
        var videocontext;
        beforeEach(function() {
            var canvas = document.getElementById('videocontext-canvas')
            videocontext = new VideoContext(canvas);
        });
        it('should return the time the node is playing for', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(10);
            imageNode.stop(20);
            chai.assert.equal(imageNode.duration, 10);
        });
        it('should return Infinity if no stop time has been specified', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(10);
            chai.assert.equal(imageNode.duration, Infinity);
        });
        it('should return undefined if start hasn\'t been called', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            chai.assert.equal(imageNode.duration, undefined);
        });
        it('should return undefined if source nodes has had clearTimelineState called on it', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(10);
            imageNode.stop(20);
            imageNode.clearTimelineState();
            chai.assert.equal(imageNode.duration, undefined);
        });
    });

    describe('#start()', function(){
        var videocontext;
        beforeEach(function() {
            var canvas = document.getElementById('videocontext-canvas')
            videocontext = new VideoContext(canvas);
        });
        it('should return true if setting start time was successful', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            chai.assert.equal(true, imageNode.start(10));
        });
        it('should return false if start hase already been called without first calling clearTimelineState', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            chai.assert.equal(false, imageNode.start(10));
        });
        it('should return true if start has already been called followed be calling clearTimelineState', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            imageNode.clearTimelineState();
            chai.assert.equal(true, imageNode.start(10));
        });
        it('duration should be Infinity if stop hasn\'t been called', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            chai.assert.equal(Infinity, imageNode.duration);
        });
        it('sourceNode state should be set to sequenced', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            chai.assert.equal(1, imageNode.state);
        });
    });

    describe('#stop()', function(){
        var videocontext;
        beforeEach(function() {
            var canvas = document.getElementById('videocontext-canvas')
            videocontext = new VideoContext(canvas);
        });
        it('should return true if setting stop time was successful', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(10);
            chai.assert.equal(true, imageNode.stop(20));
        });
        it('should return false if start hasn\'t been called first', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            chai.assert.equal(false, imageNode.stop(10));
        });
        it('should return false if time is before startTime ', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(10);
            chai.assert.equal(false, imageNode.stop(2));
        });
        it('duration should be less than Infinity', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            imageNode.stop(10);
            chai.expect(imageNode.duration).to.be.below(Infinity);
        });
    });

    describe('#clearTimelineState()', function(){
        var videocontext;
        beforeEach(function() {
            var canvas = document.getElementById('videocontext-canvas')
            videocontext = new VideoContext(canvas);
        });
        it('should set a SourceNodes state to waiting', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            imageNode.stop(10);
            imageNode.clearTimelineState();
            chai.assert.equal(0, imageNode.state);
        });
        it('should set a SourceNodes duration to undefined', function () {
            var imageElement = document.createElement("img");
            var imageNode = videocontext.createImageSourceNode(imageElement);
            imageNode.start(0);
            imageNode.stop(10);
            imageNode.clearTimelineState();
            chai.assert.equal(undefined, imageNode.duration);
        });
    });
});
