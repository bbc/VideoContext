/* eslint-env node */
const ESLintPlugin = require("eslint-webpack-plugin");

const env = process.env.TEST_SUITE;

module.exports = {
    mode: env === "build" ? "production" : "development",
    entry: __dirname + "/src/videocontext.ts",
    devtool: "source-map",
    stats: { warnings: false },
    output: {
        path: __dirname + "/dist",
        filename: "videocontext.js",
        libraryTarget: "umd",
        library: "VideoContext"
    },
    resolve: {
        extensions: [".ts", "..."],
    },
    module: {
        rules: [
            { test: /\.css$/, use: "style!css" },
            { test: /\.(frag|vert)$/, use: "raw-loader" },
            {
                test: /\.(js|ts)$/,
                exclude: /node_modules/,
                use: [
                    { loader: "babel-loader" },
                    { loader: "ts-loader" },
                ]
            }
        ]
    },
    plugins: [new ESLintPlugin()]
};
