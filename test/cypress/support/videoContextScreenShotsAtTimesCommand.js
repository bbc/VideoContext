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

/**
 * videoContextScreenShotsAtTimes
 *
 * Play the ctx from 0 and take snapshots at certain times.
 *
 * Note: the higher the times the longer the test will take to run!
 * In some circumstances you may prefer to scrub to a time to make things faster
 *
 *
 * @param {Array<number>} times at which to take snapshots (in seconds)
 * @param {{ id: string }} options `id`: unique id to name snapshots
 */
const videoContextScreenShotsAtTimes = (times = [1, 25, 50], { id }) => {
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

const videoContextScreenShotsAtTimesCommand = () => {
    Cypress.Commands.add("videoContextScreenShotsAtTimes", videoContextScreenShotsAtTimes);
};

export default videoContextScreenShotsAtTimesCommand;
