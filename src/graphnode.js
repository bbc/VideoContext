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
        this._callbacks = [];
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
        const result = this._renderGraph.getInputsForNode(this);
        return result.filter(n => n !== undefined);
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

    get hasAudio() {
        return true;
    }

    /**
     * Register callbacks against one of these events: "load", "destroy", "seek", "pause", "play", "ended", "durationchange", "loaded", "error"
     *
     * @param {String} type - the type of event to register the callback against.
     * @param {function} func - the function to call.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     *
     * videoNode.registerCallback("load", function(){"video is loading"});
     * videoNode.registerCallback("play", function(){"video is playing"});
     * videoNode.registerCallback("ended", function(){"video has eneded"});
     *
     */
    registerCallback(type, func) {
        this._callbacks.push({ type: type, func: func });
    }

    /**
     * Remove callback.
     *
     * @param {function} [func] - the callback to remove, if undefined will remove all callbacks for this node.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     *
     * videoNode.registerCallback("load", function(){"video is loading"});
     * videoNode.registerCallback("play", function(){"video is playing"});
     * videoNode.registerCallback("ended", function(){"video has eneded"});
     * videoNode.unregisterCallback(); //remove all of the three callbacks.
     *
     */
    unregisterCallback(func) {
        let toRemove = [];
        for (let callback of this._callbacks) {
            if (func === undefined) {
                toRemove.push(callback);
            } else if (callback.func === func) {
                toRemove.push(callback);
            }
        }
        for (let callback of toRemove) {
            let index = this._callbacks.indexOf(callback);
            this._callbacks.splice(index, 1);
        }
    }

    _triggerCallbacks(type, data) {
        for (let callback of this._callbacks) {
            if (callback.type === type) {
                if (data !== undefined) {
                    callback.func(this, data);
                } else {
                    callback.func(this);
                }
            }
        }
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
        this.unregisterCallback();
        for (let input of this.inputs) {
            input.disconnect(this);
        }
        this._destroyed = true;
    }
}

export { TYPE as GRAPHTYPE };

export default GraphNode;
