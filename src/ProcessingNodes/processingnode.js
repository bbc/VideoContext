import GraphNode from "../graphnode";

class ProcessingNode extends GraphNode{
    constructor(gl, renderGraph, definition){
        this._vertexShader = definition.vertexShader;
        this._fragmentShader = definition.fragmentShader;


    }
}


export default ProcessingNode;