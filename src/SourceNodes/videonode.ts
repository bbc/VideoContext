//Matthew Shotton, R&D User Experience,© BBC 2015
import MediaNode from "./medianode.js";

const TYPE = "VideoNode";

class VideoNode extends MediaNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.video();
     */
    constructor(...args: ConstructorParameters<typeof MediaNode>) {
        super(...args);
        this._displayName = TYPE;
        this._elementType = "video";
    }
}

export { TYPE as VIDEOTYPE };

export default VideoNode;
