/* eslint-disable */

module.exports = {
    mode: "production",
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
