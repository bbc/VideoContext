import { ConnectException } from "./exceptions.js";


class RenderGraph {
    constructor(){
        this.connections = [];
    }

    getOutputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.source === node){
                results.push(connection.destination);
            }
        });
        return results;
    }
    
    getNamedInputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.destination === node && connection.type === "name"){
                results.push(connection);
            }
        });
        return results;
    }


    getZIndexInputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.destination === node && connection.type === "zIndex"){
                results.push(connection);
            }
        });
        results.sort(function(a,b){
            return a.zIndex - b.zIndex;
        });
        return results;   
    }


    getInputsForNode(node){
        let inputNames = node.inputNames;        
        let results = [];
        let namedInputs = this.getNamedInputsForNode(node);
        let indexedInputs = this.getZIndexInputsForNode(node);

        if(node._limitConnections === true){
            for (let i = 0; i < inputNames.length; i++) {
                results[i] = undefined;
            }
            
            for(let connection of namedInputs){
                let index = inputNames.indexOf(connection.name);
                results[index] = connection.source;
            }
            let indexedInputsIndex = 0;
            for (let i = 0; i < results.length; i++) {
                if (results[i] === undefined && indexedInputs[indexedInputsIndex]!== undefined){
                    results[i] = indexedInputs[indexedInputsIndex].source;
                    indexedInputsIndex += 1;
                }
            }
        }else{
            for(let connection of namedInputs){
                results.push(connection.source);
            }
            for(let connection of indexedInputs){
                results.push(connection.source);
            }
        }
        return results;
    }

    isInputAvailable(node, inputName){
        if (node._inputNames.indexOf(inputName) === -1) return false;
        for(let connection of this.connections){
            if (connection.type === "name"){
                if (connection.destination === node && connection.name === inputName){
                    return false;
                }
            }
        }
        return true;
    }

    registerConnection(sourceNode, destinationNode, target){
        if (destinationNode.inputs.length >= destinationNode.inputNames.length && destinationNode._limitConnections === true){
            throw new ConnectException("Node has reached max number of inputs, can't connect");
        }
        if (typeof target === "number"){
            //target is a specific
            this.connections.push({"source":sourceNode, "type":"zIndex", "zIndex":target, "destination":destinationNode});
        } else if (typeof target === "string" && destinationNode._limitConnections){
            //target is a named port

            //make sure named port is free
            if (this.isInputAvailable(destinationNode, target)){
                this.connections.push({"source":sourceNode, "type":"name", "name":target, "destination":destinationNode});
            }else{
                throw new ConnectException("Port "+target+" is already connected to");
            }

        } else{
            //target is undefined so just make it a high zIndex
            let indexedConns = this.getZIndexInputsForNode(destinationNode);
            let index = 0;
            if (indexedConns.length > 0)index = indexedConns[indexedConns.length-1].zIndex +1;
            this.connections.push({"source":sourceNode, "type":"zIndex", "zIndex":index, "destination":destinationNode});
            

            /*console.log(destinationNode._limitConnections);
            console.log(destinationNode);
            console.log("num_inputs",destinationNode.inputNames.length);
            console.log(destinationNode.inputs);*/
        }
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