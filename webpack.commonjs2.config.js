/* eslint-env node */

const env = process.env.NODE_ENV;

module.exports = {
    mode: env || "development",
    entry: __dirname + "/src/videocontext.js",
    devtool: "source-map",
    stats: { warnings: false },
    output: {
        path: __dirname + "/dist",
        filename: "videocontext.commonjs2.js",
        libraryTarget: "commonjs2",
        library: "VideoContext"
    },
    module: {
        rules: [
            { test: /\.css$/, use: "style!css" },
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
