//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

const TYPE = "CanvasNode";
class CanvasNode extends SourceNode {
    /**
     * Initialise an instance of a CanvasNode.
     * This should not be called directly, but created through a call to videoContext.createCanvasNode();
     */
    constructor(canvas, gl, renderGraph, currentTime, preloadTime = 4) {
        super(canvas, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._displayName = TYPE;
    }

    _load() {
        super._load();
        this._ready = true;
        this._triggerCallbacks("loaded");
    }

    _unload() {
        super._unload();
        this._ready = false;
    }

    _seek(time) {
        super._seek(time);
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused) {
            if (this._element === undefined) this._load();
            this._ready = false;
        }
        if (
            (this._state === SOURCENODESTATE.sequenced || this._state === SOURCENODESTATE.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime) {
        //if (!super._update(currentTime)) return false;
        super._update(currentTime);
        if (
            this._startTime - this._currentTime <= this._preloadTime &&
            this._state !== SOURCENODESTATE.waiting &&
            this._state !== SOURCENODESTATE.ended
        )
            this._load();

        if (this._state === SOURCENODESTATE.playing) {
            return true;
        } else if (this._state === SOURCENODESTATE.paused) {
            return true;
        } else if (this._state === SOURCENODESTATE.ended && this._element !== undefined) {
            this._unload();
            return false;
        }
    }
}

export { TYPE as CANVASTYPE };

export default CanvasNode;
