#VideoContext


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


## Demo

```
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
            var videoNode = videoCtx.createVideoSourceNode("./wtf_greenscreen_fast.mp4", 0);
            videoNode.start(0);
            videoNode.stop(2);
            videoNode.connect(videoCtx.destination,0.0);

            var videoNode2 = videoCtx.createVideoSourceNode("./wtf_greenscreen_fast.mp4", 0);
            videoNode2.start(2);
            videoNode2.stop(4);
            videoNode2.connect(videoCtx.destination,1.0);

            videoCtx.play();
        };
    </script>
</body>
</html>
```