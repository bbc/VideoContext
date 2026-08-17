//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode.js";
import type RenderGraph from "../rendergraph.js";

const TYPE = "CanvasNode";

class CanvasNode extends SourceNode {
    declare _element: HTMLCanvasElement | undefined;
    _preloadTime: number;

    /**
     * Initialise an instance of a CanvasNode.
     * This should not be called directly, but created through a call to videoContext.canvas();
     */
    constructor(
        canvas: HTMLCanvasElement,
        gl: WebGLRenderingContext,
        renderGraph: RenderGraph,
        currentTime: number,
        preloadTime = 4
    ) {
        super(canvas, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._displayName = TYPE;
    }

    _load(): void {
        super._load();
        this._ready = true;
        this._triggerCallbacks("loaded");
    }

    _unload(): void {
        super._unload();
        this._ready = false;
    }

    _seek(time: number): void {
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

    _update(currentTime: number): boolean {
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
            //_unload resets _loadCalled so this only runs once; the canvas element
            //is user-supplied so _element never becomes undefined
            if (this._loadCalled) {
                this._unload();
            }
            return false;
        }
        return false;
    }
}

export { TYPE as CANVASTYPE };

export default CanvasNode;
