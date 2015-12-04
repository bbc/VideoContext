
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