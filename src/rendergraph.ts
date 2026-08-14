//Matthew Shotton, R&D User Experience,© BBC 2015
import { ConnectException } from "./exceptions.js";
import type GraphNode from "./graphnode.js";

export interface INamedConnection {
    source: GraphNode;
    type: "name";
    name: string;
    destination: GraphNode;
}

export interface IZIndexConnection {
    source: GraphNode;
    type: "zIndex";
    zIndex: number;
    destination: GraphNode;
}

export type IConnection = INamedConnection | IZIndexConnection;

class RenderGraph {
    connections: IConnection[];

    /**
     * Manages the rendering graph.
     */
    constructor() {
        this.connections = [];
    }

    /**
     * Get a list of nodes which are connected to the output of the passed node.
     *
     * @param {GraphNode} node - the node to get the outputs for.
     * @return {GraphNode[]} An array of the nodes which are connected to the output.
     */
    getOutputsForNode(node: GraphNode): GraphNode[] {
        const results: GraphNode[] = [];
        this.connections.forEach(function (connection) {
            if (connection.source === node) {
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
    getNamedInputsForNode(node: GraphNode): INamedConnection[] {
        const results: INamedConnection[] = [];
        this.connections.forEach(function (connection) {
            if (connection.destination === node && connection.type === "name") {
                results.push(connection);
            }
        });
        return results;
    }

    /**
     * Get a list of nodes which are connected, by z-index name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"zIndex", "zIndex":0, "destination":destinationNode}.
     *
     * @param {GraphNode} node - the node to get the z-index referenced inputs for.
     * @return {Object[]} An array of objects representing the nodes and connection type, which are connected by z-Index for the node.
     */
    getZIndexInputsForNode(node: GraphNode): IZIndexConnection[] {
        const results: IZIndexConnection[] = [];
        this.connections.forEach(function (connection) {
            if (connection.destination === node && connection.type === "zIndex") {
                results.push(connection);
            }
        });
        results.sort(function (a, b) {
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
    getInputsForNode(node: GraphNode): Array<GraphNode | undefined> {
        const inputNames = node.inputNames;
        const results: Array<GraphNode | undefined> = [];
        const namedInputs = this.getNamedInputsForNode(node);
        const indexedInputs = this.getZIndexInputsForNode(node);

        if (node._limitConnections === true) {
            for (let i = 0; i < inputNames.length; i++) {
                results[i] = undefined;
            }

            for (const connection of namedInputs) {
                const index = inputNames.indexOf(connection.name);
                results[index] = connection.source;
            }

            //place index-connected inputs on the port matching their zIndex
            const unplacedIndexedInputs: IZIndexConnection[] = [];
            for (const connection of indexedInputs) {
                if (
                    connection.zIndex < results.length &&
                    results[connection.zIndex] === undefined
                ) {
                    results[connection.zIndex] = connection.source;
                } else {
                    unplacedIndexedInputs.push(connection);
                }
            }
            //fall back to the first free port for out-of-range or clashing indexes
            for (const connection of unplacedIndexedInputs) {
                for (let i = 0; i < results.length; i++) {
                    if (results[i] === undefined) {
                        results[i] = connection.source;
                        break;
                    }
                }
            }
        } else {
            for (const connection of namedInputs) {
                results.push(connection.source);
            }
            for (const connection of indexedInputs) {
                results.push(connection.source);
            }
        }
        return results;
    }

    /**
     * Check if a named input on a node is available to connect to.
     * @param {GraphNode} node - the node to check.
     * @param {String} inputName - the named input to check.
     */
    isInputAvailable(node: GraphNode, inputName: string): boolean {
        if (node._inputNames.indexOf(inputName) === -1) return false;
        for (const connection of this.connections) {
            if (connection.type === "name") {
                if (connection.destination === node && connection.name === inputName) {
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
     * @param {(String | number)} [target] - the target port of the connection, this could be a string to specify a specific named port, a number to specify a port by index, or undefined, in which case the next available port will be connected to.
     * @return {boolean} Will return true if connection succeeds otherwise will throw a ConnectException.
     */
    registerConnection(
        sourceNode: GraphNode,
        destinationNode: GraphNode,
        target?: number | string
    ): boolean {
        if (
            destinationNode.inputs.length >= destinationNode.inputNames.length &&
            destinationNode._limitConnections === true
        ) {
            throw new ConnectException("Node has reached max number of inputs, can't connect");
        }

        if (destinationNode._limitConnections === false) {
            //check if connection is already made, if so raise a warning
            const inputs = this.getInputsForNode(destinationNode);
            if (inputs.includes(sourceNode)) {
                console.debug(
                    "WARNING - node connected multiple times, removing previous connection"
                );
                this.unregisterConnection(sourceNode, destinationNode);
            }
        }

        if (typeof target === "number") {
            //target is a specific port index
            this.connections.push({
                source: sourceNode,
                type: "zIndex",
                zIndex: target,
                destination: destinationNode
            });
        } else if (typeof target === "string" && destinationNode._limitConnections) {
            //target is a named port

            //make sure named port is free
            if (this.isInputAvailable(destinationNode, target)) {
                this.connections.push({
                    source: sourceNode,
                    type: "name",
                    name: target,
                    destination: destinationNode
                });
            } else {
                throw new ConnectException("Port " + target + " is already connected to");
            }
        } else {
            if (typeof target === "string") {
                //target is a named port on a node which doesn't limit connections; port
                //names aren't exclusive here, so treat it as an ordinary connection, but
                //surface typos rather than silently ignoring an unknown name.
                if (destinationNode.inputNames.indexOf(target) === -1) {
                    throw new ConnectException("Node does not have an input port named " + target);
                }
            }
            //target is undefined so just make it a high zIndex
            const indexedConns = this.getZIndexInputsForNode(destinationNode);
            let index = 0;
            if (indexedConns.length > 0) index = indexedConns[indexedConns.length - 1].zIndex + 1;
            this.connections.push({
                source: sourceNode,
                type: "zIndex",
                zIndex: index,
                destination: destinationNode
            });
        }
        return true;
    }

    /**
     * Remove a connection between two nodes.
     * @param {GraphNode} sourceNode - the node to unregister connection from.
     * @param {GraphNode} destinationNode - the node to unregister connection to.
     * @return {boolean} Will return true if removing connection succeeds, or false if there was no connection to remove.
     */
    unregisterConnection(sourceNode: GraphNode, destinationNode: GraphNode): boolean {
        const toRemove: IConnection[] = [];

        this.connections.forEach(function (connection) {
            if (connection.source === sourceNode && connection.destination === destinationNode) {
                toRemove.push(connection);
            }
        });

        if (toRemove.length === 0) return false;

        toRemove.forEach(removeNode => {
            const index = this.connections.indexOf(removeNode);
            this.connections.splice(index, 1);
        });

        return true;
    }

    static outputEdgesFor(node: GraphNode, connections: IConnection[]): IConnection[] {
        const results: IConnection[] = [];
        for (const conn of connections) {
            if (conn.source === node) {
                results.push(conn);
            }
        }
        return results;
    }

    static inputEdgesFor(node: GraphNode, connections: IConnection[]): IConnection[] {
        const results: IConnection[] = [];
        for (const conn of connections) {
            if (conn.destination === node) {
                results.push(conn);
            }
        }
        return results;
    }

    static getInputlessNodes(connections: IConnection[]): GraphNode[] {
        const inputLess: GraphNode[] = [];
        for (const conn of connections) {
            inputLess.push(conn.source);
        }
        for (const conn of connections) {
            const index = inputLess.indexOf(conn.destination);
            if (index !== -1) {
                inputLess.splice(index, 1);
            }
        }
        return inputLess;
    }
}

export default RenderGraph;
