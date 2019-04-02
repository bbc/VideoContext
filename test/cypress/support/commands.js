import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";
import videoContextScreenShotsAtTimesCommand from "./videoContextScreenShotsAtTimesCommand";

addMatchImageSnapshotCommand({
    failureThreshold: 0.06, // threshold for entire image
    failureThresholdType: "percent", // percent of image or number of pixels
    customDiffConfig: { threshold: 0.2 }, // threshold for each pixel
    capture: "viewport", // capture viewport in screenshot
    disableTimersAndAnimations: false // we always pause before taking screenshots
});

videoContextScreenShotsAtTimesCommand();
