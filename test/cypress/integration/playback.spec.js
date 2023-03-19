beforeEach(() => {
    cy.visit("index.html");
    cy.viewport("macbook-11");
});

it("plays back video", () => {
    // Set up VideoContext
    cy.window().then(({ ctx }) => {
        const videoNode = ctx.video("../assets/video1.webm"); // Path relative to index.html
        videoNode.startAt(0);
        videoNode.connect(ctx.destination);
    });

    // Check output  match the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes([0.5, 1, 1.5], { id: "playback-video" });
});

it("plays back image", () => {
    // Set up VideoContext
    cy.window().then(({ ctx }) => {
        const imageNode = ctx.image("../assets/test-image.png");
        imageNode.startAt(0);
        imageNode.connect(ctx.destination);
    });

    // Check output  match the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes([0.5, 1, 1.5], { id: "playback-image" });
});

it("plays back image with no creatImageBitmap", () => {
    // Set up VideoContext
    cy.window().then((win) => {
        const ctx = win.ctx;
        // Remove createImageBitmap to simulate being in a browser with no support
        win.createImageBitmap = undefined;

        const imageNode = ctx.image("../assets/test-image.png");
        imageNode.startAt(0);
        imageNode.connect(ctx.destination);
    });

    // Check output  match the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes([0.5, 1, 1.5], {
        id: "playback-image-with-no-createImageBitmap"
    });
});

it("plays back  with user supplied element and start offset", () => {
    // Set up VideoContext
    cy.window().then((win) => {
        const ctx = win.ctx;
        const video = win.document.createElement("video");
        video.src = "../assets/video1.webm";
        video.crossOrigin = "anonymous";

        const sourceOffset = 10;
        const videoNode = ctx.video(video, sourceOffset);

        videoNode.startAt(0);
        videoNode.connect(ctx.destination);
    });

    // Check output  match the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes([0.5, 1, 1.5], {
        id: "playback-user-supplied-element"
    });
});
