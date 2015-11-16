import SourceNode, { SOURCENODESTATE } from "./sourcenode";

class RenderableSourceNode extends SourceNode {
    constructor(src, gl, renderGraph){
        super(src);
        this._gl = gl;
        this._renderGraph = renderGraph;

        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    _update(currentTime){
        if (!super._update(currentTime))return false;
        let gl = this._gl;        
        //update this source nodes texture
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._element);
        return true;
    }

    connect(targetNode, zIndex){
        if (zIndex === undefined){
            let targetInputs = this._renderGraph.getSortedInputsForNode(targetNode);
            zIndex = targetInputs[targetInputs.length-1] + 1.0;
        }
        this._renderGraph.registerConnection(this, targetNode, zIndex);
    }
    
    disconnect(targetNode){
        if (targetNode === undefined){
            let toRemove = this._renderGraph.getOutputsForNode(this);
            toRemove.forEach(function(targetNode){
                this._renderGraph.unregisterConnection(this, targetNode);
            });
            return;
        }
        this._renderGraph.unregisterConnection(this, targetNode);

    }
}


export default RenderableSourceNode;
