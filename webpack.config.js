/* eslint-env node */

const env = process.env.NODE_ENV;

module.exports = {
    mode: env || "development",
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
