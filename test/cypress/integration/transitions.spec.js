const TRANSITION_START = 1;
const TRANSITION_END = 2;
const SCREEN_SHOT_TIMES = [0.5, 1.5, 2.5]; // before, during, after

beforeEach(() => {
    cy.visit("index.html");
    cy.viewport("macbook-11");
});

/**
 * All transition tests can be the same but with a different DEFINITION
 *
 * @param {string} definitionName - the name of the DEFINITION
 */
const setupTransitionPipelineForDefinition = definitionName => ({ ctx, VideoContext }) => {
    const videoNode1 = ctx.video("../assets/video1.webm");
    const videoNode2 = ctx.video("../assets/video2.webm");
    const crossFade = ctx.transition(VideoContext.DEFINITIONS[definitionName]);

    // Setup start/stop times for video source nodes
    videoNode1.start(0);
    videoNode1.stop(4);

    videoNode2.start(0);
    videoNode2.stop(4);

    // Configure the crossFade transition node
    crossFade.transition(TRANSITION_START, TRANSITION_END, 0.0, 1.0, "mix");

    // Connect the processing graph together
    videoNode1.connect(crossFade);
    videoNode2.connect(crossFade);
    crossFade.connect(ctx.destination);
};

[
    "CROSSFADE",
    "DREAMFADE",
    "HORIZONTAL_WIPE",
    "VERTICAL_WIPE",
    "RANDOM_DISSOLVE",
    "STATIC_DISSOLVE",
    "TO_COLOR_AND_BACK",
    "STAR_WIPE"
].forEach(definitionName => {
    const testName = definitionName.toLowerCase().replace("_", " ");
    it(testName, () => {
        // setup VideoContext
        cy.window().then(setupTransitionPipelineForDefinition(definitionName));
        return cy.videoContextScreenShotsAtTimes(SCREEN_SHOT_TIMES, {
            id: `transition-${testName}`
        });
    });
});
