/* eslint-env node */
module.exports = {
    presets: [
        "@babel/preset-env",
        ["@babel/preset-typescript", { allowDeclareFields: true }]
    ],
    env: {
        esm: {
            presets: [
                ["@babel/preset-env", { modules: false }],
                ["@babel/preset-typescript", { allowDeclareFields: true }]
            ]
        }
    }
};
