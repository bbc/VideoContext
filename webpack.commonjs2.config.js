/* eslint-env node */

const env = process.env.NODE_ENV;

module.exports = {
    mode: env || "development",
    entry: __dirname + "/src/videocontext.ts",
    devtool: "source-map",
    stats: { warnings: false },
    output: {
        path: __dirname + "/dist",
        filename: "videocontext.commonjs2.js",
        library: {
            type: "commonjs2",
            export: "default"
        }
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
