/**
 * to update snapshots run: `yarn run cypress:update`
 */
const takeScreenShotAtTime = (time, { ctx, id, options }) =>
    new Promise(resolve => {
        /**
         * Seeking directly to the time won't execute the registered
         * callback, so we seek to just before the target time and wait
         * for it to play through.
         */
        ctx.currentTime = time - 0.005;

        // start playback
        ctx.play();

        // register a callback at the time we want to snapshot
        ctx.registerTimelineCallback(time, () => {
            console.log("snapshot at time", time, ctx.currentTime - time);
            // stop the player from progressing past this frame
            ctx.pause();

            resolve(
                // we must return a cypress chain
                cy
                    .get("#canvas")
                    // compare this frame with the snapshot
                    .matchImageSnapshot(`${id} at time ${time}`, options)
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
const videoContextScreenShotsAtTimes = (times = [1, 25, 50], { id, options }) => {
    // use a closure to access window
    let window;

    // we're going to chain on this promise
    let cyPromise = cy.window();

    // prepare by starting playback and storing the window object
    cyPromise = cyPromise.then(win => {
        /**
         * We slow down the playback rate to increase the chance of the registered
         * timeline callback always executing on exactly the same frame.
         *
         * This value must be within the range 0.0625 - 16, otherwise Chrome will throw an error, see:
         * - https://developers.google.com/web/updates/2017/12/chrome-63-64-media-updates#unsupported-playbackRate-raises-exception
         * - https://www.chromestatus.com/feature/5750156230131712
         */
        win.ctx.playbackRate = Cypress.browser.name === "chrome" ? 0.0625 : 0.01;

        window = win;
    });

    // reduce over the times taking a screen-shot when each time is reached
    times.forEach(time => {
        cyPromise = cyPromise.then(() =>
            takeScreenShotAtTime(time, { ctx: window.ctx, id, options })
        );
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
