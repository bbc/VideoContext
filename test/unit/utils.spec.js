import * as Utils from "../../src/utils.js";

describe(`Utils`, () => {
    describe(`mediaElementHasSource()`, () => {
        it(`Should return true if the element has a src`, () => {
            const mockMediaElement = { src: "http://bbc.co.uk" };
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(true);
            mockMediaElement.src = "https://google.com";
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(true);
            mockMediaElement.src = "fgdfgdfgdg";
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(true);

            delete mockMediaElement.src;
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(false);
        });

        it(`Should return true if the element has a srcObject`, () => {
            const mockMediaElement = { srcObject: {} };
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(true);
        });

        it(`Should return false if the src is an empty string or undefined`, () => {
            const mockMediaElement = { src: "" };
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(false);
            mockMediaElement.src = undefined;
            expect(Utils.mediaElementHasSource(mockMediaElement)).toBe(false);
        });

        it(`Should return false if the src and srcObject do not exist`, () => {
            expect(Utils.mediaElementHasSource({})).toBe(false);
        });

        it(`Should throw given empty argument`, () => {
            expect(() => Utils.mediaElementHasSource()).toThrow();
            expect(() => Utils.mediaElementHasSource(null)).toThrow();
            expect(() => Utils.mediaElementHasSource(undefined)).toThrow();
        });
    });
});
