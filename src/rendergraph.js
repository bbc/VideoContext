function ConnectException(message){
    this.message = message;
    this.name = "ConnectionException";
}


class RenderGraph {
    constructor(){
        this.connections = [];
    }

    getOutputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.source === node){
                results.push({"node":connection.destination, "zIndex":connection.zIndex});
            }
        });
        return results;
    }
    
    getSortedOutputsForNode(node){
        let outputs = this.getOutputsForNode(node);
        outputs.sort(function(a,b){
            return a.zIndex - b.zIndex;
        });
        return outputs;
    }
    
    getInputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.destination === node){
                results.push({"node":connection.source, "zIndex":connection.zIndex});
            }
        });
        return results;
    }
    
    getSortedInputsForNode(node){
        let inputs = this.getInputsForNode(node);
        inputs.sort(function(a,b){
            return a.zIndex - b.zIndex;
        });
        return inputs;
    }

    registerConnection(sourceNode, destinationNode, zIndex){
        console.debug("adding connection");
        if (destinationNode._maxInputs !== undefined && destinationNode.inputs.length >= destinationNode._maxInputs){
            throw new ConnectException("Node has reached max number of inputs, can't connect");
        }
        this.connections.push({"source":sourceNode, "zIndex":zIndex, "destination":destinationNode});
        return true;
    }
    
    unregsiterConnection(sourceNode, destinationNode){
        let toRemove = [];
        
        this.connections.forEach(function(connection){
            if (connection.source === sourceNode && connection.destination === destinationNode){
                toRemove.push(connection);
            }
        });

        if (toRemove.length === 0) return false;

        this.toRemove.forEach(function(removeNode){
            let index = this.connections.indexOf(removeNode);
            this.connections.splice(index, 1);
        });

        return true;
    }
}

export default RenderGraph;