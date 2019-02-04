/**
 * to update snapshots run: `yarn run cypress:update`
 */

context("playback tests", () => {
    /**
     * @param {String} configuration.file - the .html file to be tested.
     * @param {String} configuration.waitTime - time in ms to wait between action and screenshot
     */
    const playbackTest = ({ file, waitTime }) => {
        cy.visit(file);

        cy.get("#play").click();

        cy.get("#canvas").matchImageSnapshot("after play");

        // pause after a wait
        cy.wait(waitTime);
        cy.get("#pause").click();

        // check snapshot after pause
        return cy.get("#canvas").matchImageSnapshot("after pause");
    };

    it("playback.html", () => {
        playbackTest({
            file: "playback.html",
            waitTime: 1000
        });
    });
});
