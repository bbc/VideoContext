const { addMatchImageSnapshotPlugin } = require("cypress-image-snapshot/plugin");

// eslint-disable-next-line
module.exports = (on, config) => {
    addMatchImageSnapshotPlugin(on, config);

    on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.family === "chromium") {
            // Chrome 137+ disables the SwiftShader software-WebGL fallback by
            // default, so on GPU-less CI runners getContext("webgl") returns
            // null without this flag.
            launchOptions.args.push("--enable-unsafe-swiftshader");
        }
        return launchOptions;
    });
};
