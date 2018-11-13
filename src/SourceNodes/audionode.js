//Matthew Shotton, R&D User Experience,© BBC 2015
import MediaNode from "./medianode";

const TYPE = "AudioNode";
class AudioNode extends MediaNode {
    /**
     * Initialise an instance of an AudioNode.
     * This should not be called directly, but created through a call to videoContext.audio();
     */
    constructor() {
        super(...arguments);
        this._displayName = TYPE;
        this._elementType = "audio";
    }

    _update(currentTime) {
        super._update(currentTime, false);
    }
}

export { TYPE as AUDIOTYPE };

export default AudioNode;
