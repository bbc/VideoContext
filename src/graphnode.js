class GraphNode {
    constructor(gl, renderGraph, maxInputs){
        this._renderGraph = renderGraph;
        this._maxInputs = maxInputs;

        //Setup WebGL output texture
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
        //Initialise the texture untit to clear.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
    }

    get inputs(){
        let inputConnections = this._renderGraph.getSortedInputsForNode(this);
        let results = [];
        inputConnections.forEach(function(connection){
            results.push(connection.node);
        });
        return results;
    }

    get outputs(){
        let outputConnections = this._renderGraph.getSortedOutputsForNode(this);
        let results = [];
        outputConnections.forEach(function(connection){
            results.push(connection.node);
        });
        return results; 
    }

    connect(targetNode, zIndex){
        if (zIndex === undefined){
            let targetInputs = this._renderGraph.getSortedInputsForNode(targetNode);
            zIndex = targetInputs[targetInputs.length-1] + 1.0;
        }
        return (this._renderGraph.registerConnection(this, targetNode, zIndex));
    }
    
    disconnect(targetNode){
        if (targetNode === undefined){
            let toRemove = this._renderGraph.getOutputsForNode(this);
            toRemove.forEach(function(target){
                this._renderGraph.unregisterConnection(this, target);
            });
            if (toRemove.length > 0) return true;
            return false;
        }
        return this._renderGraph.unregisterConnection(this, targetNode);
    }
}

export default GraphNode;