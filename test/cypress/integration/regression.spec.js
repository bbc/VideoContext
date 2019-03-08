/**
 * to update snapshots run: `yarn run cypress:update`
 */

const takeScreenShotAtTime = (time, { ctx, id }) =>
    new Promise(resolve => {
        ctx.registerTimelineCallback(time, currentTime => {
            console.log("snapshot at time", time, currentTime);
            ctx.pause();
            resolve(
                // we must return a cypress chain
                cy
                    .get("#canvas")
                    .matchImageSnapshot(`${id} at time ${time}`)
                    .then(() => {
                        ctx.play();
                    })
            );
        });
    });

// TODO we should also define the pipeline like this
// only dep in html should be the canvas and window.VideoContext
const takeScreenShotAtTimes = (times = [1, 25, 50], { id }) => {
    // use a closure to access window
    let window;

    // we're going to chain on this promise
    let cyPromise = cy.window();

    // prepare by starting playback and storing the window object
    cyPromise = cyPromise.then(win => {
        win.ctx.play();
        window = win;
    });

    // reduce over the times taking a screen-shot when each time is reached
    times.forEach(time => {
        cyPromise = cyPromise.then(() => takeScreenShotAtTime(time, { ctx: window.ctx, id }));
    });

    // last, rest the context so that playback and updates stop
    return cyPromise.then(() => {
        window.ctx.reset();
    });
};

context("playback tests", () => {
    it("plays back video", () => {
        cy.visit("index.html");
        cy.viewport("macbook-11");

        // set up VideoContext
        cy.window().then(({ ctx }) => {
            const videoNode = ctx.video("../assets/video1.webm"); // path relative to index.html
            videoNode.startAt(0);
            videoNode.connect(ctx.destination);
        });

        // check output  match the snapshots at times on the timeline
        takeScreenShotAtTimes([0.5, 1, 1.5], { id: "playback" });
    });
});
