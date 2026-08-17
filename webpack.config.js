/* eslint-env node */

const env = process.env.TEST_SUITE;

module.exports = {
    mode: env === "build" ? "production" : "development",
    entry: __dirname + "/src/videocontext.ts",
    devtool: "source-map",
    stats: { warnings: false },
    output: {
        path: __dirname + "/dist",
        filename: "videocontext.js",
        library: {
            name: "VideoContext",
            type: "umd",
            export: "default"
        },
        globalObject: "this"
    },
    resolve: {
        extensions: [".ts", ".js"],
        extensionAlias: {
            ".js": [".ts", ".js"]
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: [{ loader: "babel-loader" }]
            }
        ]
    }
};
