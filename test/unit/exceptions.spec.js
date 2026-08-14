import { ConnectException, RenderException } from "../../src/exceptions.js";

describe("Exceptions", () => {
    test("ConnectException should be an Error with a message, name and stack", () => {
        const exception = new ConnectException("can't connect");

        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(ConnectException);
        expect(exception.message).toBe("can't connect");
        expect(exception.name).toBe("ConnectionException");
        expect(typeof exception.stack).toBe("string");
    });

    test("RenderException should be an Error with a message, name and stack", () => {
        const exception = new RenderException("can't render");

        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(RenderException);
        expect(exception.message).toBe("can't render");
        expect(exception.name).toBe("RenderException");
        expect(typeof exception.stack).toBe("string");
    });
});
