module.exports = {
    entry: __dirname + "/src/videocontext.js",
    devtool: "source-map",
    output: {
        path: __dirname+'/dist',
        filename: "videocontext.js", 
        libraryTarget: "var",
        library: "VideoContext"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.js$/, exclude: /node_modules/, loaders: ["babel-loader", "eslint-loader"]}
        ]
    }
};
