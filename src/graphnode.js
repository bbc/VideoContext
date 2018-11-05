//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE = "GraphNode";

class GraphNode {
    /**
     * Base class from which all processing and source nodes are derrived.
     */
    constructor(gl, renderGraph, inputNames, limitConnections = false) {
        this._renderGraph = renderGraph;
        this._limitConnections = limitConnections;
        this._inputNames = inputNames;
        this._destroyed = false;

        //Setup WebGL output texture
        this._gl = gl;
        this._renderGraph = renderGraph;
        this._rendered = false;
        this._displayName = TYPE;
    }

    /**
     * Get a string representation of the class name.
     *
     * @return String A string of the class name.
     */

    get displayName() {
        return this._displayName;
    }

    /**
     * Get the names of the inputs to this node.
     *
     * @return {String[]} An array of the names of the inputs ot the node.
     */

    get inputNames() {
        return this._inputNames.slice();
    }

    /**
     * The maximum number of connections that can be made to this node. If there is not limit this will return Infinity.
     *
     * @return {number} The number of connections which can be made to this node.
     */
    get maximumConnections() {
        if (this._limitConnections === false) return Infinity;
        return this._inputNames.length;
    }

    /**
     * Get an array of all the nodes which connect to this node.
     *
     * @return {GraphNode[]} An array of nodes which connect to this node.
     */
    get inputs() {
        let result = this._renderGraph.getInputsForNode(this);
        result = result.filter(function(n) {
            return n !== undefined;
        });
        return result;
    }

    /**
     * Get an array of all the nodes which this node outputs to.
     *
     * @return {GraphNode[]} An array of nodes which this node connects to.
     */
    get outputs() {
        return this._renderGraph.getOutputsForNode(this);
    }

    /**
     * Get whether the node has been destroyed or not.
     *
     * @return {boolean} A true/false value of whather the node has been destoryed or not.
     */
    get destroyed() {
        return this._destroyed;
    }

    /**
     * Connect this node to the targetNode
     *
     * @param {GraphNode} targetNode - the node to connect.
     * @param {(number| String)} [targetPort] - the port on the targetNode to connect to, this can be an index, a string identifier, or undefined (in which case the next available port will be connected to).
     *
     */
    connect(targetNode, targetPort) {
        return this._renderGraph.registerConnection(this, targetNode, targetPort);
    }

    /**
     * Disconnect this node from the targetNode. If targetNode is undefind remove all out-bound connections.
     *
     * @param {GraphNode} [targetNode] - the node to disconnect from. If undefined, disconnect from all nodes.
     *
     */
    disconnect(targetNode) {
        if (targetNode === undefined) {
            let toRemove = this._renderGraph.getOutputsForNode(this);
            toRemove.forEach(target => this._renderGraph.unregisterConnection(this, target));
            if (toRemove.length > 0) return true;
            return false;
        }
        return this._renderGraph.unregisterConnection(this, targetNode);
    }

    /**
     * Destory this node, removing it from the graph.
     */
    destroy() {
        this.disconnect();
        for (let input of this.inputs) {
            input.disconnect(this);
        }
        this._destroyed = true;
    }
}

export { TYPE as GRAPHTYPE };

export default GraphNode;
