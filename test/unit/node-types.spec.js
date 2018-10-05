import { VIDEOTYPE } from "../../src/SourceNodes/videonode.js";
import { CANVASTYPE } from "../../src/SourceNodes/canvasnode.js";
import { IMAGETYPE } from "../../src/SourceNodes/imagenode.js";
import { DESTINATIONTYPE } from "../../src/DestinationNode/destinationnode.js";
import { TRANSITIONTYPE } from "../../src/ProcessingNodes/transitionnode.js";
import { COMPOSITINGTYPE } from "../../src/ProcessingNodes/compositingnode.js";

test("all types are defined", () => {
    expect(VIDEOTYPE).toBeDefined();
    expect(CANVASTYPE).toBeDefined();
    expect(IMAGETYPE).toBeDefined();
    expect(DESTINATIONTYPE).toBeDefined();
    expect(TRANSITIONTYPE).toBeDefined();
    expect(COMPOSITINGTYPE).toBeDefined();
});
