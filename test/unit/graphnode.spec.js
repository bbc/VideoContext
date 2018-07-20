import Rendergraph from "../../src/rendergraph.js";
import GraphNode from "../../src/graphnode.js";
import { ConnectException } from "../../src/exceptions.js";

describe("GraphNode", () => {
    describe("#inputNames", () => {
        let node_a, node_b;

        beforeEach(() => {
            node_a = new GraphNode(undefined, undefined, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, undefined, [], true);
        });

        test("should return a list of the input names for the node", () => {
            expect(node_a.inputNames).toEqual(["input_a", "input_b"]);
            expect(node_b.inputNames).toEqual([]);
        });
    });

    describe("#maximumConnections", () => {
        let node_a, node_b, node_c;

        beforeEach(() => {
            node_a = new GraphNode(undefined, undefined, ["input_a", "input_b"], false);
            node_b = new GraphNode(undefined, undefined, [], true);
            node_c = new GraphNode(undefined, undefined, ["input_a", "input_b"], true);
        });

        test("should return the maximum number of connections that can be made to the node (Infinity if number of connections is not limited)", () => {
            expect(node_a.maximumConnections).toBe(Infinity);
            expect(node_b.maximumConnections).toBe(0);
            expect(node_c.maximumConnections).toBe(2);
        });
    });

    describe("#inputs", () => {
        let rendergraph, node_a, node_b, node_c;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return an array of the nodes connected as inputs", () => {
            expect(node_a.inputs).toEqual([]);

            node_b.connect(node_a);
            expect(node_a.inputs).toEqual([node_b]);

            node_c.connect(node_a);
            expect(node_a.inputs).toEqual([node_b, node_c]);
        });
    });

    describe("#outputs", () => {
        let rendergraph, node_a, node_b, node_c;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return the nodes this node connects to as outputs", () => {
            expect(node_a.outputs).toEqual([]);

            node_a.connect(node_b);
            expect(node_a.outputs).toEqual([node_b]);

            node_a.connect(node_c);
            expect(node_a.outputs).toEqual([node_b, node_c]);
        });
    });

    describe("#connect()", () => {
        let rendergraph, node_a, node_b, node_c, node_d;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return true if connection was successful", () => {
            expect(node_a.connect(node_b)).toBe(true);
        });

        test("should allow connecting via a specified input port name", () => {
            expect(
                node_a.connect(
                    node_b,
                    "input_b"
                )
            ).toBe(true);

            const expected_result = [
                {
                    destination: node_b,
                    source: node_a,
                    type: "name",
                    name: "input_b"
                }
            ];

            expect(rendergraph.getNamedInputsForNode(node_b)).toEqual(expected_result);
        });

        test("should throw ConnectException if target input is taken", () => {
            node_c.connect(
                node_b,
                "input_a"
            );

            expect(node_a.connect.bind(node_a, node_b, "input_a")).toThrow(ConnectException);
        });

        test("should throw ConnectException if target inputs are all in use", () => {
            node_c.connect(node_b);
            node_d.connect(node_b);

            expect(node_a.connect.bind(node_a, node_b)).toThrow(ConnectException);
        });

        test("should throw ConnectException if named input dosen't exist", () => {
            expect(node_a.connect.bind(node_a, node_b, "non-existant port")).toThrow(
                ConnectException
            );
        });
    });

    describe("#disconnect()", () => {
        let rendergraph, node_a, node_b, node_c, node_d;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should remove node from input list of target node", () => {
            node_a.connect(node_b);
            expect(node_b.inputs).toEqual([node_a]);

            node_a.disconnect(node_b);
            expect(node_b.inputs).toEqual([]);
        });

        test("should remove node from output list of this node", () => {
            node_a.connect(node_b);
            expect(node_a.outputs).toEqual([node_b]);

            node_a.disconnect(node_b);
            expect(node_a.outputs).toEqual([]);
        });

        test("should return true if disconnection was successful", () => {
            node_a.connect(node_b);
            expect(node_a.disconnect(node_b)).toBe(true);
        });

        test("should remove all outputs if no connection is specified", () => {
            node_a.connect(node_b);
            node_a.connect(node_c);
            node_a.connect(node_d);
            node_a.disconnect();

            expect(node_a.outputs).toEqual([]);
        });
    });
});
