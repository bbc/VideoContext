//Matthew Shotton, R&D User Experince,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

class CanvasNode extends SourceNode {
    constructor(canvas, gl, renderGraph, preloadTime = 4){
        super(canvas, gl, renderGraph);
        this._preloadTime = preloadTime;
    }

    _destroy(){
        super._destroy();
        this._ready = false;
    }

    _seek(time){
        super._seek(time);
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused){
            if (this._element === undefined) this._load();
            this._ready = false;
        }
        if((this._state === SOURCENODESTATE.sequenced || this._state === SOURCENODESTATE.ended) && this._element !== undefined){
            this._destroy();
        }
    }
    
    _update(currentTime){
        //if (!super._update(currentTime)) return false;
        super._update(currentTime);
        if (this._startTime - this._currentTime < this._preloadTime && this._state !== SOURCENODESTATE.waiting && this._state !== SOURCENODESTATE.ended)this._load();

        if (this._state === SOURCENODESTATE.playing){
            return true;
        } else if (this._state === SOURCENODESTATE.paused){
            return true;
        }
        else if (this._state === SOURCENODESTATE.ended && this._element !== undefined){
            this._destroy();
            return false;
        }

    }

}
