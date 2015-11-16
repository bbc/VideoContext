class RenderGraph {
    constructor(){
        this.connections = [];
    }

    getOutputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.output === node){
                results.push({"node":connection.input, "zIndex":connection.zIndex});
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
            if (connection.output=== node){
                results.push({"node":connection.input, "zIndex":connection.zIndex});
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

    registerConnection(inputNode, outputNode, zIndex){
        console.debug("adding connection");
        this.connections.push({"output":outputNode, "zIndex":zIndex, "input":inputNode});

    }
    
    unregsiterConnection(inputNode, outputNode){
        let toRemove = [];
        
        this.connections.forEach(function(connection){
            if (connection.input === inputNode && connection.output === outputNode){
                toRemove.push(connection);
            }
        });

        this.toRemove.forEach(function(removeNode){
            let index = this.connections.indexOf(removeNode);
            this.connections.splice(index, 1);
        });
    }
}

export default RenderGraph;