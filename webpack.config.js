/* eslint-env node */

const env = process.env.TEST_SUITE;

module.exports = {
    mode: env === "build" ? "production" : "development",
    entry: __dirname + "/src/videocontext.js",
    devtool: "source-map",
    stats: { warnings: false },
    output: {
        path: __dirname + "/dist",
        filename: "videocontext.js",
        libraryTarget: "umd",
        library: "VideoContext"
    },
    module: {
        rules: [
            { test: /\.css$/, use: "style!css" },
            { test: /\.(frag|vert)$/, use: "raw-loader" },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: "babel-loader" },
                    { loader: "eslint-loader" }
                ]
            }
        ]
    }
};
