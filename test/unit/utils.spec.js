import * as Utils from "../../src/utils.js";
import { RenderException } from "../../src/exceptions.js";

describe(`Utils`, () => {
    describe(`compileShader()`, () => {
        it(`Should throw a RenderException when compilation fails`, () => {
            const failingGl = {
                createShader: () => ({}),
                shaderSource: () => {},
                compileShader: () => {},
                getShaderParameter: () => false,
                getShaderInfoLog: () => "shader compile log"
            };

            expect(() => Utils.compileShader(failingGl, "void main(){}", 1)).toThrow(
                RenderException
            );
        });
    });

    describe(`createShaderProgram()`, () => {
        it(`Should throw a RenderException when linking fails`, () => {
            const failingGl = {
                createProgram: () => ({}),
                attachShader: () => {},
                linkProgram: () => {},
                getProgramParameter: () => false,
                getProgramInfoLog: () => "program link log"
            };

            expect(() => Utils.createShaderProgram(failingGl, {}, {})).toThrow(RenderException);
        });
    });
    describe(`UpdateablesManager`, () => {
        it(`Should start the rAF update loop even when Web Workers are unavailable`, () => {
            const originalWorker = window.Worker;
            const originalRAF = window.requestAnimationFrame;
            window.Worker = undefined;
            const rafSpy = jest.fn();
            window.requestAnimationFrame = rafSpy;

            const manager = new Utils.UpdateablesManager();
            manager.register({ _update: () => {} });

            expect(rafSpy).toHaveBeenCalled();

            window.Worker = originalWorker;
            window.requestAnimationFrame = originalRAF;
        });

        it(`Should allow an updateable to be unregistered`, () => {
            const manager = new Utils.UpdateablesManager();
            const updateable = { _update: jest.fn() };
            manager._updateables.push(updateable);

            expect(manager.unregister(updateable)).toBe(true);
            manager._update(1);

            expect(updateable._update).not.toHaveBeenCalled();
            expect(manager.unregister(updateable)).toBe(false);
        });
    });

    describe(`createControlFormForNode()`, () => {
        it(`Should set the initial value of a numeric input from the property value`, () => {
            const node = { _properties: { mix: { type: "uniform", value: 0.4 } } };

            const form = Utils.createControlFormForNode(node);

            const number = form.querySelector("input[type='number']");
            expect(number.getAttribute("value")).toBe("0.4");
        });

        it(`Should set per-element initial values for array properties`, () => {
            const node = { _properties: { inputMix: { type: "uniform", value: [0.1, 0.2, 0.3] } } };

            const form = Utils.createControlFormForNode(node);

            const numbers = form.querySelectorAll("input[type='number']");
            expect(numbers.length).toBe(3);
            expect(numbers[1].getAttribute("value")).toBe("0.2");
        });
    });

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
