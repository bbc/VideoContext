//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode";

export default class ImageNode extends SourceNode {
    /**
    * Initialise an instance of an ImageNode.
    * This should not be called directly, but created through a call to videoContext.createImageNode();
    */
    constructor(src, gl, renderGraph, currentTime, preloadTime = 4, attributes = {}){
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._attributes = attributes;
        this._textureUploaded = false;
    }

    _load(){

        if (this._element !== undefined){
            for (var key in this._attributes) {
                this._element[key] = this._attributes[key];
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle){
            super._load();
            this._element = new Image();
            this._element.setAttribute("crossorigin", "anonymous");
            this._element.src = this._elementURL;
            this._element.onload = () => {
                this._ready = true;
                this._triggerCallbacks("loaded");
            };
            this._element.onerror = () => {
                console.error("ImageNode failed to load. url:", this._elementURL);
            };

            for (let key in this._attributes) {
                this._element[key] = this._attributes[key];
            }
        }
    }

    _destroy(){
        super._destroy();
        if (this._isResponsibleForElementLifeCycle){
            this._element.src = "";
            this._element.onerror = undefined;
            this._element = undefined;
            delete this._element;
        }
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
        if (this._textureUploaded){
            super._update(currentTime, false);
        }else{
            super._update(currentTime);
        }
        
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
