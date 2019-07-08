import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";
import videoContextScreenShotsAtTimesCommand from "./videoContextScreenShotsAtTimesCommand";

addMatchImageSnapshotCommand({
    // Threshold for entire image
    failureThreshold: 0.06,
    // Percent of image or number of pixels
    failureThresholdType: "percent",
    // Threshold for each pixel
    customDiffConfig: { threshold: 0.1 },
    // Capture viewport in screenshot
    capture: "viewport",
    // We always pause before taking screenshots
    disableTimersAndAnimations: false,
    // Directory the snapshot images are written to, defaults to <rootDir>/cypress/snapshots
    customSnapshotsDir: Cypress.env("local")
        ? "test/cypress/snapshots/local"
        : "test/cypress/snapshots/ci"
});

videoContextScreenShotsAtTimesCommand();
