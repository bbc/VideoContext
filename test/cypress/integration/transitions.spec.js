beforeEach(() => {
    cy.visit("index.html");
    cy.viewport("macbook-11");
});

/**
 * porting
 * 
 * "transition-crossfade.html"
"transition-starWipe.html"
"transition-verticalWipe.html"
"transition-horizontalWipe.html"
"transition-dreamFade.html"
"transition-randomDissolve.html"
"transition-staticDissolve.html"
"transition-toColorAndBackFade.html"
 */

it("crossfades", () => {
    // set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode1 = ctx.video("../assets/video1.webm");
        const videoNode2 = ctx.video("../assets/video2.webm");
        const crossFade = ctx.transition(VideoContext.DEFINITIONS.CROSSFADE);

        // Setup start/stop times for video source nodes
        videoNode1.start(0);
        videoNode1.stop(4);

        videoNode2.start(0);
        videoNode2.stop(4);

        // Configure the crossFade transition node
        crossFade.transition(0.8, 1.2, 0.0, 1.0, "mix");

        // Connect the processing graph together
        videoNode1.connect(crossFade);
        videoNode2.connect(crossFade);
        crossFade.connect(ctx.destination);
    });

    // check output  match the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes([0.5, 1, 1.5], { id: "transition-crossfade" });
});
