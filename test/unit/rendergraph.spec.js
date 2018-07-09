import Rendergraph from "../../src/rendergraph.js";
import GraphNode from "../../src/graphnode.js";
import { ConnectException } from "../../src/exceptions.js";

describe("Rendergraph", () => {
    describe("#registerConnection()", () => {
        let rendergraph, node_a, node_b, node_c, node_d;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return true when connection is successful", () => {
            expect(rendergraph.registerConnection(node_a, node_b)).toBe(true);
        });

        test("should throw a ConnectionException if all input ports of connected to node are taken", () => {
            rendergraph.registerConnection(node_a, node_d);
            rendergraph.registerConnection(node_b, node_d);

            expect(rendergraph.registerConnection.bind(rendergraph, node_c, node_d)).toThrow(
                ConnectException
            );
        });

        test("should throw a ConnectionException if named input dosen't exist", () => {
            expect(
                rendergraph.registerConnection.bind(
                    rendergraph,
                    node_a,
                    node_b,
                    "non-existant input"
                )
            ).toThrow(ConnectException);
        });

        test("should throw a ConnectionException if connection to named input is already made", () => {
            rendergraph.registerConnection(node_a, node_b, "input_a");

            expect(
                rendergraph.registerConnection.bind(rendergraph, node_c, node_b, "input_a")
            ).toThrow(ConnectException);
        });

        test("should throw a ConnectionException if connection is already made", () => {
            rendergraph.registerConnection(node_a, node_b, "input_a");

            expect(
                rendergraph.registerConnection.bind(rendergraph, node_a, node_b, "input_a")
            ).toThrow(ConnectException);
        });
    });

    describe("#unregisterConnection()", () => {
        let rendergraph, node_a, node_b, node_c;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return true when disconnection is successful", () => {
            rendergraph.registerConnection(node_a, node_b);
            rendergraph.registerConnection(node_a, node_c);

            expect(rendergraph.unregisterConnection(node_a, node_b)).toBe(true);
            expect(node_a.outputs).toEqual([node_c]);
            expect(node_b.inputs).toEqual([]);
        });

        test("should return false if connection dosen't exit", () => {
            rendergraph.registerConnection(node_a, node_b);

            expect(rendergraph.unregisterConnection(node_a, node_c)).toBe(false);
            expect(node_a.outputs).toEqual([node_b]);
        });
    });

    describe("#isInputAvailable()", () => {
        let rendergraph, node_a, node_b;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return true if input is free", () => {
            expect(rendergraph.isInputAvailable(node_b, "input_a")).toBe(true);
        });

        test("should return false if input is taken", () => {
            rendergraph.registerConnection(node_a, node_b, "input_a");

            expect(rendergraph.isInputAvailable(node_b, "input_a")).toBe(false);
        });

        test("should return false if input dosen't exist", () => {
            expect(rendergraph.isInputAvailable(node_b, "non-existant input")).toBe(false);
        });
    });

    describe("#getInputsForNode()", () => {
        let rendergraph, node_a, node_b, node_c;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a", "input_b"], true);
        });

        test("should return array of connected nodes, with 'undefined' for inputs which have no connection", () => {
            expect(rendergraph.getInputsForNode(node_a)).toEqual([undefined, undefined]);

            rendergraph.registerConnection(node_b, node_a, "input_b");
            expect(rendergraph.getInputsForNode(node_a)).toEqual([undefined, node_b]);

            rendergraph.registerConnection(node_c, node_a);
            expect(rendergraph.getInputsForNode(node_a)).toEqual([node_b, node_c]);
        });
    });

    describe("#getZIndexInputsForNode()", () => {
        let rendergraph, node_a, node_b, node_c, node_d;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b", "input_c"], true);
            node_b = new GraphNode(undefined, rendergraph, [], true);
            node_c = new GraphNode(undefined, rendergraph, [], true);
            node_d = new GraphNode(undefined, rendergraph, [], true);
        });

        test("should return array of nodes which have been connected by z-index, or port/z-index not specified.", () => {
            rendergraph.registerConnection(node_b, node_a, "input_a");
            rendergraph.registerConnection(node_c, node_a, 1);
            rendergraph.registerConnection(node_d, node_a);

            const expected_result = [
                {
                    source: node_c,
                    destination: node_a,
                    type: "zIndex",
                    zIndex: 1
                },
                {
                    source: node_d,
                    destination: node_a,
                    type: "zIndex",
                    zIndex: 2
                }
            ];

            expect(rendergraph.getZIndexInputsForNode(node_a)).toEqual(expected_result);
        });
    });

    describe("#getNamedInputsForNode()", () => {
        let rendergraph, node_a, node_b, node_c, node_d;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b", "input_c"], true);
            node_b = new GraphNode(undefined, rendergraph, [], true);
            node_c = new GraphNode(undefined, rendergraph, [], true);
            node_d = new GraphNode(undefined, rendergraph, [], true);
        });

        test("should return array of nodes which have been connected by name", () => {
            rendergraph.registerConnection(node_b, node_a, "input_a");
            rendergraph.registerConnection(node_c, node_a, 1);
            rendergraph.registerConnection(node_d, node_a);

            const expected_result = [
                {
                    source: node_b,
                    destination: node_a,
                    type: "name",
                    name: "input_a"
                }
            ];

            expect(rendergraph.getNamedInputsForNode(node_a)).toEqual(expected_result);
        });
    });

    describe("#getOutputsForNode()", () => {
        let rendergraph, node_a, node_b, node_c, node_d;

        beforeEach(() => {
            rendergraph = new Rendergraph();
            node_a = new GraphNode(undefined, rendergraph, ["input_a", "input_b", "input_c"], true);
            node_b = new GraphNode(undefined, rendergraph, ["input_a"], true);
            node_c = new GraphNode(undefined, rendergraph, ["input_a"], true);
            node_d = new GraphNode(undefined, rendergraph, ["input_a"], true);
        });

        test("should return array of nodes connected to the output of the passed node", () => {
            expect(rendergraph.getOutputsForNode(node_a)).toEqual([]);

            rendergraph.registerConnection(node_a, node_b, "input_a");
            expect(rendergraph.getOutputsForNode(node_a)).toEqual([node_b]);

            rendergraph.registerConnection(node_a, node_c, 1);
            expect(rendergraph.getOutputsForNode(node_a)).toEqual([node_b, node_c]);

            rendergraph.registerConnection(node_a, node_d);
            expect(rendergraph.getOutputsForNode(node_a)).toEqual([node_b, node_c, node_d]);
        });
    });
});
