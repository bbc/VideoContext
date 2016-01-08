#VideoContext
The VideoContext is an experimental HTML5/WebGL media processing and sequencing library for creating interactive and responsive videos on the web.


It consist of two main components. A graph based, shader accelerated processing pipeline, and a media playback sequencing time-line. 


The design is heavily inspired by the WebAudioAPI so should feel familiar to use for people who've had previous experience in the WebAudio world. 


## Demo

``` JavaScript
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <script type="text/javascript" src="../dist/videocontext.js"></script>
</head>
<body>
    <canvas id="canvas"></canvas>

    <script type="text/javascript">
        window.onload = function(){
            var canvas = document.getElementById("canvas");

            var videoCtx = new VideoContext(canvas);
            var videoNode1 = videoCtx.createVideoSourceNode("./video1.mp4");
            videoNode1.start(0);
            videoNode1.stop(4);

            var videoNode2 = videoCtx.createVideoSourceNode("./video2.mp4");
            videoNode2.start(2);
            videoNode2.stop(6);

            var crossFade = videoCtx.createTransitionNode(VideoContext.DEFINITIONS.CROSSFADE);
            crossFade.transition(2,4,1.0, "mix");

            videoNode1.connect(crossFade);
            videoNode2.connect(crossFade);
            crossFade.connect(videoCtx.destination);


            videoCtx.play();
        };
    </script>
</body>
</html>
```

## Node Types

### VideoNode
A video source node.
``` JavaScript
var videoNode = videoCtx.createVideoSourceNode("./video1.mp4");
videoNode.connect(videoCtx.destination);
videoNode.start(0);
videoNode.stop(4);
```


### ImageNode
An image source node.
``` JavaScript
var imageNode = videoCtx.createImageSourceNode("cats.png");
imageNode.connect(videoCtx.destination);
imageNode.start(0);
imageNode.stop(4);
```

### CanvasNode
A canvas source node.
``` JavaScript
var canvas = document.getElementById("input-cavnas");
var canvasNode = videoCtx.createCanvasSorceNode(canvas);
canvasNode.connect(videoCtx.destination);
canvasNode.start(0);
canvasNode.stop(4);

```


### EffectNode





## Build

Live reload development version
```
npm install
npm run dev
```

Other options
```
npm run build     # build dist packages
npm run doc       # create documentation
npm run build_all # do all of the above
```

