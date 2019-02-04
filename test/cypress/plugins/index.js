const { addMatchImageSnapshotPlugin } = require("cypress-image-snapshot/plugin");

// eslint-disable-next-line
module.exports = (on, config) => {
    addMatchImageSnapshotPlugin(on, config);
};
