/* eslint-disable */

import jest from "jest";
import puppeteer from "puppeteer";
import path from "path";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { testTimeout, puppeteerParams, screenshotParams, imageSnapshotParams } from "./config.js";

expect.extend({ toMatchImageSnapshot });

let browser = null;
let page = null;

/**
 * @param {Object} configuration - test configuration parameters.
 * @param {String} configuration.file - the .html file to be tested.
 * @param {Number} configuration.seqLength - the length of the test sequence
 *        specified in the .html file (in seconds).
 */
const transitionTest = async ({ file, seqLength }) => {
    await page.goto(`file:${path.join(__dirname, `test-pages/${file}`)}`, {
        waitUntil: "networkidle0",
        timeout: 60000
    });

    // Start playback sequence
    await page.click("#canvas");

    // Take a screenshot every second, for the duration of the sequence
    for (let i = 0; i < seqLength; i++) {
        await page.waitFor(Number(`#{i}000`));
        const image = await page.screenshot(screenshotParams);
        expect(image).toMatchImageSnapshot(imageSnapshotParams);
    }
};

beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerParams);
    page = await browser.newPage();
});

afterEach(async () => {
    await page.close();
    await browser.close();
});

describe("Visual regressions: transitions", () => {
    test(
        "Crossfade",
        async () => {
            await transitionTest({
                file: "transition-crossfade.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "Star wipe",
        async () => {
            await transitionTest({
                file: "transition-starWipe.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "Vertical wipe",
        async () => {
            await transitionTest({
                file: "transition-verticalWipe.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "Horizontal wipe",
        async () => {
            await transitionTest({
                file: "transition-horizontalWipe.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "Dreamfade",
        async () => {
            await transitionTest({
                file: "transition-dreamFade.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "Random Dissolve",
        async () => {
            await transitionTest({
                file: "transition-randomDissolve.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "Static Dissolve",
        async () => {
            await transitionTest({
                file: "transition-staticDissolve.html",
                seqLength: 6
            });
        },
        testTimeout
    );

    test(
        "To Color and Back Fade",
        async () => {
            await transitionTest({
                file: "transition-toColorAndBackFade.html",
                seqLength: 6
            });
        },
        testTimeout
    );
});
