# Advanced Examples

## Table of Contents

- [Extracting an image at a given time](#extracting-an-image-at-a-given-time)

## Extracting an image at a given time

This example captures the middle frame from a horizontal wipe transition.

> View on [CodeSandbox](https://codesandbox.io/embed/summer-architecture-74d1t).

```js
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <script type="text/javascript" src="../dist/videocontext.js"></script>
</head>
<body>
    <!--
        A canvas needs to define its width and height to know how many pixels you can draw onto it.
        Its CSS width and height will define the space it takes on screen
        If omitted, the canvas dimensions will be 300x150 and your videos will not rendered at their
        optimal definition
        https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
    -->
    <canvas id="canvas" width="1280" height="720" style="width: 852px; height: 480px"></canvas>

    <!-- This image element will be populated with the captured frame -->
    <img id="snapshot" />

    <script type="text/javascript">
        window.onload = function() {
            // we're going to capture halfway through a horizontal wipe transition
            var TIME_TO_CAPTURE = 3;

            var canvas = document.getElementById("canvas");
            var videoCtx = new VideoContext(canvas);

            // set the first video to run from 0 - 4 seconds
            var videoNode1 = videoCtx.video("./video1.mp4");
            videoNode1.start(0);
            videoNode1.stop(5);

            // set the second video to run from 0 - 4 seconds
            var videoNode2 = videoCtx.video("./video2.mp4");
            videoNode2.start(0);
            videoNode2.stop(5);

            /**
             * add a horizontal wipe transition from `videoNode1` to `videoNode2`
             * to start 2 seconds in and finish 2 seconds later.
             */
            var horizontalWipe = videoCtx.transition(
                VideoContext.DEFINITIONS.HORIZONTAL_WIPE
            );
            horizontalWipe.transition(2, 4, 0.0, 1.0, "mix");

            // set-up the processing chain
            videoNode1.connect(horizontalWipe);
            videoNode2.connect(horizontalWipe);
            horizontalWipe.connect(videoCtx.destination);

            // register a callback at the time we want to capture
            videoCtx.registerTimelineCallback(TIME_TO_CAPTURE, () => {
            // stop the player from progressing past this frame
            videoCtx.pause();

            // capture the canvas as an image
            var img = canvas.toDataURL("image/jpeg", 1.0);

            // apply it to our image tag
            document.getElementById("snapshot").setAttribute("src", img);
            });

            /**
             * We slow down the playback rate to increase the chance of the registered
             * timeline callback always executing on exactly the same frame.
             *
             * This value must be within the range 0.0625 - 16, otherwise Chrome will throw
             * an error, see https://developers.google.com/web/updates/2017/12/chrome-63-64-media-updates#unsupported-playbackRate-raises-exception
             */
            videoCtx.playbackRate = 0.0625;

            /**
             * Seeking directly to the time won't execute the registered
             * callback, so we seek to just before the target time and play
             * through.
             */
            videoCtx.currentTime = TIME_TO_CAPTURE - 0.05;

            // start playback and wait for the callback
            videoCtx.play();

        };
    </script>
</body>
</html>
```
