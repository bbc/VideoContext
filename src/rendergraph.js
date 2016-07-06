//Matthew Shotton, R&D User Experience,© BBC 2015
import { ConnectException } from "./exceptions.js";


export default class RenderGraph {
    /**
    * Manages the rendering graph.
    */
    constructor(){
        this.connections = [];
    }

    /**
    * Get a list of nodes which are connected to the output of the passed node.
    * 
    * @param {GraphNode} node - the node to get the outputs for.
    * @return {GraphNode[]} An array of the nodes which are connected to the output.
    */
    getOutputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.source === node){
                results.push(connection.destination);
            }
        });
        return results;
    }
    
    /**
    * Get a list of nodes which are connected, by input name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"name", "name":inputName, "destination":destinationNode}.
    *
    * @param {GraphNode} node - the node to get the named inputs for.
    * @return {Object[]} An array of objects representing the nodes and connection type, which are connected to the named inputs for the node.
    */
    getNamedInputsForNode(node){
        let results = [];
        this.connections.forEach(function(connection){
            if (connection.destination === node && connection.type === "name"){
                results.push(connection);
            }
        });
        return results;
    }

    /**
    * Get a list of nodes which are connected, by z-index name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"zIndex", "zIndex":0, "destination":destinationNode}.
    * 
    * @param {GraphNode} node - the node to get the z-index refernced inputs for.
    * @return {Object[]} An array of objects representing the nodes and connection type, which are connected by z-Index for the node.
    */
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

    /**
    * Get a list of nodes which are connected as inputs to the given node. The length of the return array is always equal to the number of inputs for the node, with undefined taking the place of any inputs not connected.
    * 
    * @param {GraphNode} node - the node to get the inputs for.
    * @return {GraphNode[]} An array of GraphNodes which are connected to the node.
    */
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

    /**
    * Check if a named input on a node is available to connect too.
    * @param {GraphNode} node - the node to check.
    * @param {String} inputName - the named input to check.
    */
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

    /**
    * Register a connection between two nodes.
    * 
    * @param {GraphNode} sourceNode - the node to connect from.
    * @param {GraphNode} destinationNode - the node to connect to.
    * @param {(String | number)} [target] - the target port of the conenction, this could be a string to specfiy a specific named port, a number to specify a port by index, or undefined, in which case the next available port will be connected to.
    * @return {boolean} Will return true if connection succeeds otherwise will throw a ConnectException.
    */
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
        }
        return true;
    }
    
    /**
    * Remove a connection between two nodes.
    * @param {GraphNode} sourceNode - the node to unregsiter connection from.
    * @param {GraphNode} destinationNode - the node to register connection to.
    * @return {boolean} Will return true if removing connection succeeds, or false if there was no connectionsction to remove.
    */
    unregisterConnection(sourceNode, destinationNode){
        let toRemove = [];
        
        this.connections.forEach(function(connection){
            if (connection.source === sourceNode && connection.destination === destinationNode){
                toRemove.push(connection);
            }
        });

        if (toRemove.length === 0) return false;

        toRemove.forEach((removeNode) => {
            let index = this.connections.indexOf(removeNode);
            this.connections.splice(index, 1);
        });

        return true;
    }

    static outputEdgesFor(node, connections){
        let results = [];
        for(let conn of connections){
            if (conn.source === node){
                results.push(conn);
            }
        }
        return results;
    }

    static inputEdgesFor(node, connections){
        let results = [];
        for(let conn of connections){
            if (conn.destination === node){
                results.push(conn);
            }
        }
        return results;
    }

    static getInputlessNodes(connections){
        let inputLess = [];
        for (let conn of connections){
            inputLess.push(conn.source);
        }
        for (let conn of connections){
            let index = inputLess.indexOf(conn.destination);
            if (index !== -1){
                inputLess.splice(index, 1);
            }
        }
        return inputLess;
    }
}
