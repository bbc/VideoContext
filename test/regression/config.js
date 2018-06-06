export default {
    testTimeout: 60000,
    /**
     * Puppeteer configuration that allows us to run webgl in
     * "headless" mode, see: https://bit.ly/2xKt1tQ.
     *
     * 1. Improves performance: https://bit.ly/2JyZvf4.
     * 2. Necessary to allow cross-origin requests from local files.
     */
    puppeteerParams: {
        headless: false,
        args: [
            "--proxy-server='direct://'" /* [1] */,
            "--proxy-bypass-list=*" /* [1] */,
            "--headless",
            "--hide-scrollbars",
            "--disable-web-security" /* [2] */
        ]
    },
    imageSnapshotParams: {
        customDiffConfig: {
            threshold: 1
        }
    },
    /**
     * 1. Necessary to work with `jest-image-snapshot`, depsite the slower
     *    (puppeteer) performance compared to "jpeg".
     */
    screenshotParams: {
        clip: { x: 0, y: 0, width: 800, height: 600 },
        type: "png" /* [1] */
    }
};
