
class GraphNode {
    constructor(gl, renderGraph, inputNames, limitConnections=false){
        this._renderGraph = renderGraph;
        this._limitConnections = limitConnections;
        this._inputNames = inputNames;

        //Setup WebGL output texture
        this._gl = gl;
        this._renderGraph = renderGraph;
        this._rendered =false;
    }

    get inputNames(){
        return this._inputNames.slice();
    }

    get maximumConnections(){
        if (this._limitConnections ===false) return Infinity;
        return this._inputNames.length;
    }

    get inputs(){
        let result = this._renderGraph.getInputsForNode(this);
        result = result.filter(function(n){return n !== undefined;});
        return result;
    }

    get outputs(){
        return this._renderGraph.getOutputsForNode(this);
    }

    connect(targetNode, targetPort){
        return (this._renderGraph.registerConnection(this, targetNode, targetPort));
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