/**
 * to update snapshots run: `yarn run cypress:update`
 */

const takeScreenShotAtTime = (time, { ctx }) =>
    new Promise(resolve => {
        ctx.registerTimelineCallback(time, () => {
            ctx.pause();
            resolve(
                // we must return a cypress chain
                cy
                    .get("#canvas")
                    .matchImageSnapshot(`at time ${time}`)
                    .then(() => {
                        ctx.play();
                    })
            );
        });
    });

// TODO we should also define the pipeline like this
// only dep in html should be the canvas and window.VideoContext
const takeScreenShotAtTimes = (times = [1, 25, 50]) => {
    let window;
    let cyPromise = cy.window().then(win => {
        win.ctx.play();
        window = win;
    });

    times.forEach(time => {
        cyPromise = cyPromise.then(() => takeScreenShotAtTime(time, { ctx: window.ctx }));
    });

    return cyPromise.then(() => {
        window.ctx.reset();
    });
};

context("playback tests", () => {
    it("playback.html", () => {
        cy.visit("playback.html");

        // use cy.window to put tests here

        takeScreenShotAtTimes([0.1, 1, 2]);
    });
});
