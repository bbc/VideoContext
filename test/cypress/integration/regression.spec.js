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

        console.log("todo, remove waitTime", waitTime);

        // TODO must pull out in a way that ensure the event listeners are added first
        const resolveAfterFrames = num =>
            new Promise(resolve => {
                let updateCount = 0;
                cy.window().then(win => {
                    win.addEventListener("cy:update", () => {
                        updateCount++;
                        if (updateCount === num) {
                            resolve();
                        }
                    });
                });
            });

        const afterFirstFrame = resolveAfterFrames(1);
        const afterAFewSeconds = resolveAfterFrames(25 * 3);

        cy.get("#play").click();

        cy.window()
            .then(() => console.log("play"))
            .then(() => afterFirstFrame);

        cy.window().then(() => console.log("waited for play"));

        cy.get("#canvas").matchImageSnapshot("after play");

        // pause after a wait
        // should count ticks here instead
        // cy.wait(waitTime);

        cy.window()
            .then(() => console.log("waited"))
            .then(() => afterAFewSeconds);

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
