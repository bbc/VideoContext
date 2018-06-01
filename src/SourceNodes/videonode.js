//Matthew Shotton, R&D User Experience,© BBC 2015
import MediaNode from "./medianode";

class VideoNode extends MediaNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.createVideoNode();
     */
    constructor() {
        super(...arguments);
        this._displayName = "VideoNode";
        this._elementType = "video";
    }
}

export default VideoNode;
