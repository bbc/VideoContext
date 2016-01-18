var chai = require('../node_modules/chai/chai.js');
var Rendergraph = require('../src/rendergraph.js');
var GraphNode = require('../src/graphnode.js');
import { ConnectException } from "../src/exceptions.js";


describe('Rendergraph', function() {

    describe('#registerConnection()', function () {
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return true when connection is successful', function () {
            chai.assert.equal(true, rendergraph.registerConnection(node_a, node_b));
        });

        it('should throw a ConnectionException if all input ports of connected to node are taken', function () {
            rendergraph.registerConnection(node_a, node_d);
            rendergraph.registerConnection(node_b, node_d);
            chai.expect(
                rendergraph.registerConnection.bind(rendergraph, node_c, node_d)
            ).to.throw(ConnectException);
        });

        it('should throw a ConnectionException if named input dosen\'t exist', function () {
            chai.expect(
                rendergraph.registerConnection.bind(rendergraph, node_a, node_b, "non-existant input")
            ).to.throw(ConnectException);
        });

        it('should throw a ConnectionException if connection to named input is already made', function () {
            rendergraph.registerConnection(node_a, node_b, "input_a");
            chai.expect(
                rendergraph.registerConnection.bind(rendergraph, node_c, node_b, "input_a")
            ).to.throw(ConnectException);
        });

        it('should throw a ConnectionException if connection is already made', function () {
            rendergraph.registerConnection(node_a, node_b, "input_a");
            chai.expect(
                rendergraph.registerConnection.bind(rendergraph, node_a, node_b, "input_a")
            ).to.throw(ConnectException);
        });
    });


    describe('#unregisterConnection()', function () {
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return true when disconnection is successful', function () {
            rendergraph.registerConnection(node_a, node_b);
            rendergraph.registerConnection(node_a, node_c);
            chai.assert.equal(true, rendergraph.unregisterConnection(node_a, node_b));
            chai.assert.deepEqual([node_c], node_a.outputs);
            chai.assert.deepEqual([], node_b.inputs);
        });

        it('should return false if connection dosen\'t exit', function () {
            rendergraph.registerConnection(node_a, node_b);
            chai.assert.equal(false, rendergraph.unregisterConnection(node_a, node_c));
            chai.assert.deepEqual([node_b], node_a.outputs);
        });
    });


    describe('#isInputAvailable()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return true if input is free', function () {
            chai.assert.equal(true, rendergraph.isInputAvailable(node_b, "input_a"));
        });

        it('should return false if input is taken', function () {
            rendergraph.registerConnection(node_a, node_b, "input_a");
            chai.assert.equal(false, rendergraph.isInputAvailable(node_b, "input_a"));
        });

        it('should return false if input dosen\'t exist', function () {
            chai.assert.equal(false, rendergraph.isInputAvailable(node_b, "non-existant input"));
        });
    });

    describe('#getInputsForNode()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        it('should return array of connected nodes, with \'undefined\' for inputs which have no connection', function () {
            chai.assert.deepEqual([undefined, undefined], rendergraph.getInputsForNode(node_a));
            
            rendergraph.registerConnection(node_b, node_a, "input_b");
            chai.assert.deepEqual([undefined, node_b], rendergraph.getInputsForNode(node_a));

            rendergraph.registerConnection(node_c, node_a);
            chai.assert.deepEqual([node_b, node_c], rendergraph.getInputsForNode(node_a));
        });
    });

    describe('#getZIndexInputsForNode()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b", "input_c"], true);
            node_b = new GraphNode(undefined, rendergraph, [], true);
            node_c = new GraphNode(undefined, rendergraph, [], true);
            node_d = new GraphNode(undefined, rendergraph, [], true);
        });

        it('should return array of nodes which have been connected by z-index, or port/z-index not specified.', function () {
            rendergraph.registerConnection(node_b, node_a, "input_a");
            rendergraph.registerConnection(node_c, node_a,1);
            rendergraph.registerConnection(node_d, node_a);
            var expected_result = [{source:node_c, destination:node_a, type:"zIndex", "zIndex":1},{source:node_d, destination:node_a, type:"zIndex", "zIndex":2}];
            chai.assert.deepEqual(expected_result, rendergraph.getZIndexInputsForNode(node_a));
        });
    });

    describe('#getNamedInputsForNode()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b", "input_c"], true);
            node_b = new GraphNode(undefined, rendergraph, [], true);
            node_c = new GraphNode(undefined, rendergraph, [], true);
            node_d = new GraphNode(undefined, rendergraph, [], true);
        });

        it('should return array of nodes which have been connected by name', function () {
            rendergraph.registerConnection(node_b, node_a, "input_a");
            rendergraph.registerConnection(node_c, node_a,1);
            rendergraph.registerConnection(node_d, node_a);
            var expected_result = [{source:node_b, destination:node_a, type:"name", "name":"input_a"}];
            chai.assert.deepEqual(expected_result, rendergraph.getNamedInputsForNode(node_a));
        });
    });

    describe('#getOutputsForNode()', function(){
        var rendergraph, node_a, node_b, node_c, node_d;
        beforeEach(function() {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b", "input_c"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a"], true);
        });

        it('should return array of nodes connected to the output of the passed node', function () {
            chai.assert.deepEqual([], rendergraph.getOutputsForNode(node_a));
            
            rendergraph.registerConnection(node_a, node_b, "input_a");
            chai.assert.deepEqual([node_b], rendergraph.getOutputsForNode(node_a));
            
            rendergraph.registerConnection(node_a, node_c,1);
            chai.assert.deepEqual([node_b,node_c], rendergraph.getOutputsForNode(node_a));
            
            rendergraph.registerConnection(node_a, node_d);
            chai.assert.deepEqual([node_b,node_c, node_d], rendergraph.getOutputsForNode(node_a));
        });
    });
});