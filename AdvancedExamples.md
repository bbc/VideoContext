# Advanced Examples

## Table of Contents

- [Extracting an image at a given time](#extracting-an-image-at-a-given-time)
- [Supporting Media Fragments with `customSourceNode`](#supporting-media-fragments-with-customsourcenode)

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

## Supporting Media Fragments with `customSourceNode`

Browsers are beginning to support some of the Media Fragments spec. 

In this example we add support for defining a loop within a `VideoNode` using the
media fragments syntax. eg

```JavaScript
/**
 * URL for requesting a fragments of `BigBuckBunny.mp4` that starts at
 * 5 seconds and ends at 12 seconds.
 * 
 * In our example we want to loop between these points in time
 */
const urlForMediaFragment = "./BigBuckBunny.mp4#t=5,12"
```

The loop itself is handled by extending the `VideoNode._update` method.

- Intro to media fragments: <https://gingertech.net/tag/media-fragment-uri/>
- The Media Fragments Specification: <https://www.w3.org/TR/media-frags/>
- Browser support: <https://caniuse.com/#feat=media-fragments>

> View on [CodeSandbox](https://codesandbox.io/embed/videocontext-customsourcenode-mediafragmentvideonode-rymtf).

```JavaScript
import VideoContext from "videocontext";
import parse from "url-parse";

class MediaFragmentVideoNode extends VideoContext.NODES.VideoNode {
  constructor(
    src,
    gl,
    renderGraph,
    currentTime,
    sourceOffset,
    preloadTime,
    options
  ) {
    /**
     * In this example we're just supporting part of media fragments
     * spec, and only when the element is set to `loop`.
     *
     * First, parse the start and end loop times from the src url
     */
    const fragment =
      options.loop &&
      parse(src)
        .hash.split("&")
        .filter(str => str.includes("t="))
        .map(str => str.split("t=")[1])
        .map(values => values.split(",").map(parseFloat))
        .map(([start, end]) => ({ start, end }))[0];

    /**
     * We follow the VideoNode implementation pretty closely when
     * calling `super`.
     *
     * The only difference:
     *   - hard code values for playback rate and mediaelement cache
     *   - add our fragement `start` time to the the `sourceOffset`
     **/
    super(
      src,
      gl,
      renderGraph,
      currentTime,
      1 /* playback rate */,
      sourceOffset + (fragment && fragment.start),
      preloadTime,
      undefined /* mediaelement cache */,
      options
    );

    /**
     * Next we update add a couple of custom properties to
     * our class. These will only be accessed within our subclass
     */
    if (fragment) {
      this._loopStart = fragment.start;
      this._loopDuration = fragment.end - fragment.start;
    }

    this._displayName = "MediaFragmentVideoNode";
  }

  /**
   * We extend the VideoNode `_update` method to implement our loop.
   *
   *
   * Normal caveat with custom source nodes: you are tying your
   * code to a private API, be careful when upgrading videocontext! accessed
   *
   * Our `_update` signature matches that of `VideoNode._update`
   * @param {number} currentTime
   * @param {boolean} triggerTextureUpdate
   */
  _update(currentTime, triggerTextureUpdate = true) {
    super._update(currentTime, triggerTextureUpdate);

    /**
     * if no fragment is set `_update` behaves as before.
     * otherwise:
     */
    if (this._loopStart) {
      const loopEndTime = this._startTime + this._loopDuration;
      if (this._currentTime >= loopEndTime) {
        // tell the node that it should start again from now
        this._startTime = loopEndTime;
        // seek the element back to the start
        // sourceOffset already has the loop start included
        this._element.currentTime = this._sourceOffset || 0;
      }
    }
  }
}

const START_LOOP_TIME = 19;
const END_LOOP_TIME = 21;
const MEDIA_FRAGMENT_URL = `http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#t=${START_LOOP_TIME},${END_LOOP_TIME}`;

// Setup the video context.
const canvas = document.getElementById("canvas");
const ctx = new VideoContext(canvas);

const videoNode1 = ctx.customSourceNode(
  MediaFragmentVideoNode,
  MEDIA_FRAGMENT_URL,
  0,
  4,
  {
    volume: 0,
    loop: true
  }
);

videoNode1.startAt(0);
videoNode1.connect(ctx.destination);

ctx.play();
```