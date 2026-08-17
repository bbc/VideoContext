//Matthew Shotton, R&D User Experience,© BBC 2015
import SourceNode, { SOURCENODESTATE } from "./sourcenode.js";
import type RenderGraph from "../rendergraph.js";

const TYPE = "ImageNode";

class ImageNode extends SourceNode {
    declare _element: HTMLImageElement | ImageBitmap | undefined;
    _preloadTime: number;
    _attributes: Record<string, unknown>;
    _textureUploaded: boolean;
    _image: HTMLImageElement | undefined;

    /**
     * Initialise an instance of an ImageNode.
     * This should not be called directly, but created through a call to videoContext.image();
     */
    constructor(
        src: string | HTMLImageElement | ImageBitmap,
        gl: WebGLRenderingContext,
        renderGraph: RenderGraph,
        currentTime: number,
        preloadTime = 4,
        attributes: Record<string, unknown> = {}
    ) {
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._attributes = attributes;
        this._textureUploaded = false;
        this._displayName = TYPE;
    }

    get elementURL(): string | MediaStream | undefined {
        return this._elementURL;
    }

    _load(): void {
        if (this._image !== undefined) {
            for (const key in this._attributes) {
                (this._image as unknown as Record<string, unknown>)[key] = this._attributes[key];
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle) {
            super._load();
            const image = new Image();
            this._image = image;
            image.setAttribute("crossorigin", "anonymous");
            // It's important to set the `onload` and `onerror` events before the `src` property
            // https://stackoverflow.com/questions/12354865/image-onload-event-and-browser-cache?answertab=active#tab-top
            image.onload = () => {
                this._ready = true;
                if (window.createImageBitmap) {
                    window
                        .createImageBitmap(image, 0, 0, image.width, image.height, {
                            imageOrientation: "flipY"
                        })
                        .then(imageBitmap => {
                            this._element = imageBitmap;
                            this._triggerCallbacks("loaded");
                        });
                } else {
                    this._element = image;
                    this._triggerCallbacks("loaded");
                }
            };
            image.onerror = () => {
                console.error("ImageNode failed to load. url:", this._elementURL);
                this._state = SOURCENODESTATE.error;
                //Even though there's an error, ready should be set to true so the node can output transparent
                this._ready = true;
                this._triggerCallbacks("error");
            };
            image.src = this._elementURL as string;

            for (const key in this._attributes) {
                (image as unknown as Record<string, unknown>)[key] = this._attributes[key];
            }
        } else if (!this._ready && this._element !== undefined) {
            //the element was supplied by the user; it is ready once it has finished loading
            const complete = (this._element as HTMLImageElement).complete;
            if (complete === undefined || complete) {
                super._load();
                this._ready = true;
                this._triggerCallbacks("loaded");
            }
        }
    }

    _unload(): void {
        super._unload();
        if (this._isResponsibleForElementLifeCycle) {
            if (this._image !== undefined) {
                this._image.src = "";
                this._image.onload = null;
                this._image.onerror = null;
                this._image = undefined;
            }
            if (window.ImageBitmap !== undefined && this._element instanceof window.ImageBitmap) {
                this._element.close();
                this._element = undefined;
            }
        }
        this._ready = false;
        this._textureUploaded = false;
    }

    _seek(time: number): void {
        super._seek(time);
        //the texture may have been cleared by the seek, so force a re-upload on the next update
        this._textureUploaded = false;
        if (this.state === SOURCENODESTATE.playing || this.state === SOURCENODESTATE.paused) {
            if (!this._ready) this._load();
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
        if (this._textureUploaded) {
            super._update(currentTime, false);
        } else {
            super._update(currentTime);
            //the image is static, so once its texture has been uploaded there is no
            //need to re-upload it on every frame
            if (
                this._ready &&
                this._element !== undefined &&
                (this._state === SOURCENODESTATE.playing || this._state === SOURCENODESTATE.paused)
            ) {
                this._textureUploaded = true;
            }
        }

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
        } else if (this._state === SOURCENODESTATE.ended && this._image !== undefined) {
            this._unload();
            return false;
        }
        return false;
    }
}

export { TYPE as IMAGETYPE };

export default ImageNode;
