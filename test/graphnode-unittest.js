var chai = require('../node_modules/chai/chai.js');
var Rendergraph = require('../src/rendergraph.js');
var GraphNode = require('../src/graphnode.js');
import { ConnectException } from "../src/exceptions.js";

describe('GraphNode', function() {
    describe('#inputNames', function () {
        var node_a, node_b;
        beforeEach(function() {
            node_a = new GraphNode(undefined, undefined, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, undefined, [], true);
        });

        it('should return a list of the input names for the node', function () {
            chai.assert.deepEqual(["input_a", "input_b"], node_a.inputNames);
            chai.assert.deepEqual([], node_b.inputNames);
        });
    });

    describe('#maximumConnections', function () {
        var node_a, node_b, node_c;
        beforeEach(function() {
            node_a = new GraphNode(undefined, undefined, ["input_a", "input_b"], false);
            node_b = new GraphNode(undefined, undefined, [], true);
            node_c = new GraphNode(undefined, undefined, ["input_a", "input_b"], true);
        });

        it('should return the maximum number of connections that can be made to the node, (Infinity if number of connections is not limited)', function () {
            chai.assert.deepEqual(Infinity, node_a.maximumConnections);
            chai.assert.deepEqual(0, node_b.maximumConnections);
            chai.assert.deepEqual(2, node_c.maximumConnections);
        });
    });


    describe('#inputs', function () {
        var rendergraph, node_a, node_b, node_c;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return an array of the nodes connected as inputs', function () {
            chai.assert.deepEqual([], node_a.inputs);
            node_b.connect(node_a);
            chai.assert.deepEqual([node_b], node_a.inputs);
            node_c.connect(node_a);
            chai.assert.deepEqual([node_b, node_c], node_a.inputs);
        });
    });

    describe('#outputs', function () {
        var rendergraph, node_a, node_b, node_c;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return the nodes this node connects to as outputs', function () {
            chai.assert.deepEqual([], node_a.outputs);
            node_a.connect(node_b);
            chai.assert.deepEqual([node_b], node_a.outputs);
            node_a.connect(node_c);
            chai.assert.deepEqual([node_b, node_c], node_a.outputs);
        });
    });

    describe('#connect()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return true if connection was successful', function () {
            chai.assert.equal(true, node_a.connect(node_b));
        });

        it('should allow connecting via a specified input port name', function () {
            chai.assert.equal(true, node_a.connect(node_b, "input_b"));
            var expected_result = [{destination:node_b, source:node_a, type:"name", "name":"input_b"}];
            chai.assert.deepEqual(expected_result, rendergraph.getNamedInputsForNode(node_b));
        });


        it('should throw ConnectException if target input is taken', function () {
            node_c.connect(node_b, "input_a");
            chai.expect(
                node_a.connect.bind(node_a, node_b, "input_a")
            ).to.throw(ConnectException);
        });

        it('should throw ConnectException if target inputs are all in use', function () {
            node_c.connect(node_b);
            node_d.connect(node_b);
            chai.expect(
                node_a.connect.bind(node_a, node_b)
            ).to.throw(ConnectException);
        });
        
        it('should throw ConnectException if named input dosen\'t exist', function () {
            chai.expect(
                node_a.connect.bind(node_a, node_b, "non-existant port")
            ).to.throw(ConnectException);
        });
    });


    describe('#disconnect()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should remove node from input list of target node', function () {
            node_a.connect(node_b);
            chai.assert.deepEqual([node_a], node_b.inputs);
            node_a.disconnect(node_b);
            chai.assert.deepEqual([], node_b.inputs);
        });


        it('should remove node from output list of this node', function () {
            node_a.connect(node_b);
            chai.assert.deepEqual([node_b], node_a.outputs);
            node_a.disconnect(node_b);
            chai.assert.deepEqual([], node_a.outputs);
        });

        it('should return true if disconnection was successful', function () {
            node_a.connect(node_b);
            chai.assert.equal(true, node_a.disconnect(node_b));
        });

        it('should remove all outputs if no connection is specified', function () {
            node_a.connect(node_b);
            node_a.connect(node_c);
            node_a.connect(node_d);
            node_a.disconnect();
            chai.assert.deepEqual([],node_a.outputs);
        });

    });
    
});