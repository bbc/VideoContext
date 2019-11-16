// Only need to capture at one time
const SCREEN_SHOT_TIMES = [1];

beforeEach(() => {
    cy.visit("index.html");
    cy.viewport("macbook-11");
});

it("Color Threshold", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const colorThresholdEffect = ctx.effect(VideoContext.DEFINITIONS.COLORTHRESHOLD);

        // Configure color threshold properties
        colorThresholdEffect.colorAlphaThreshold = [0.5, 0.5, 0.5];

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(colorThresholdEffect);
        colorThresholdEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, { id: "effect-color-threshold" });
});

it("Crop", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const cropEffect = ctx.effect(VideoContext.DEFINITIONS.CROP);

        // Configure crop properties
        cropEffect.height = 0.75;
        cropEffect.width = 0.75;

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(cropEffect);
        cropEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, { id: "effect-crop" });
});

it("Horizontal Blur", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const horizontalBlurEffect = ctx.effect(VideoContext.DEFINITIONS.HORIZONTAL_BLUR);

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(horizontalBlurEffect);
        horizontalBlurEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, { id: "effect-horizontal-blur" });
});

it("Monochrome", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const monochromeEffect = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(monochromeEffect);
        monochromeEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, { id: "effect-monochrome" });
});

it("Opacity", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const opacityEffect = ctx.effect(VideoContext.DEFINITIONS.OPACITY);

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(opacityEffect);
        opacityEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, { id: "effect-opacity" });
});

it("Static", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const staticEffect = ctx.effect(VideoContext.DEFINITIONS.STATIC_EFFECT);

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(staticEffect);
        staticEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, {
        id: "effect-static",
        // Allow a large failure threshold, due to the randomness of this effect
        options: { failureThreshold: 0.8 }
    });
});

it("Vertical Blur", () => {
    // Set up VideoContext
    cy.window().then(({ ctx, VideoContext }) => {
        const videoNode = ctx.video("../assets/video1.webm");
        const verticalBlurEffect = ctx.effect(VideoContext.DEFINITIONS.VERTICAL_BLUR);

        videoNode.startAt(0);

        // Apply effect
        videoNode.connect(verticalBlurEffect);
        verticalBlurEffect.connect(ctx.destination);
    });

    // Check output matches the snapshots at times on the timeline
    cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, { id: "effect-vertical-blur" });
});
