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

beforeEach(() => {
    cy.visit("index.html");
    cy.viewport("macbook-11");
});

context("playback tests", () => {
    it("plays back video", () => {
        // set up VideoContext
        cy.window().then(({ ctx }) => {
            const videoNode = ctx.video("../assets/video1.webm"); // path relative to index.html
            videoNode.startAt(0);
            videoNode.connect(ctx.destination);
        });

        // check output  match the snapshots at times on the timeline
        takeScreenShotAtTimes([0.5, 1, 1.5], { id: "playback-video" });
    });

    it("plays back image", () => {
        // set up VideoContext
        cy.window().then(({ ctx }) => {
            const imageNode = ctx.image("../assets/test-image.png");
            imageNode.startAt(0);
            imageNode.connect(ctx.destination);
        });

        // check output  match the snapshots at times on the timeline
        takeScreenShotAtTimes([0.5, 1, 1.5], { id: "playback-image" });
    });

    it("plays back image with no creatImageBitmap", () => {
        // set up VideoContext
        cy.window().then(win => {
            const ctx = win.ctx;
            // remove createImageBitmap to simulate being in a browser with no support
            win.createImageBitmap = undefined;

            const imageNode = ctx.image("../assets/test-image.png");
            imageNode.startAt(0);
            imageNode.connect(ctx.destination);
        });

        // check output  match the snapshots at times on the timeline
        takeScreenShotAtTimes([0.5, 1, 1.5], {
            id: "playback-image-with-no-createImageBitmap"
        });
    });

    it("plays back  with user supplied element and start offset", () => {
        // set up VideoContext
        cy.window().then(win => {
            const ctx = win.ctx;
            const video = win.document.createElement("video");
            video.src = "../assets/video1.webm";
            video.crossOrigin = "anonymous";

            const sourceOffset = 10;
            const videoNode = ctx.video(video, sourceOffset);

            videoNode.startAt(0);
            videoNode.connect(ctx.destination);
        });

        // check output  match the snapshots at times on the timeline
        takeScreenShotAtTimes([0.5, 1, 1.5], { id: "playback-user-supplied-element" });
    });
});
