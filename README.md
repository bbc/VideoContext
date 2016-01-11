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
An EffectNode is the simplest form of processing node. It's built from a definition object, which is a combination of fragment shader code, vertex shader code, input descriptions, and property descriptions. There are a number of common operations available as node descriptions accessible as static properties on the VideoContext at VideoContext.DESCRIPTIONS.*

The vertex and shader code is GLSL code which gets compiled to produce the shader program. The input descriptio ntells the VideoContext how many ports there are to connect to and the name of the image associated with the port within the shader code. Inputs are always render-able textures (i.e images, videos, canvases). The property descriptions tell the VideoContext what controls to attached to the EffectNode and the name, type, and default value of the control within the shader code.

The following is a an example of a simple shader description used to describe a monochrome effect. It has one input (the image to be processed) and two modifiable properties to control the color RGB mix for the processing result.


``` JavaScript
var monochromeDescription = {
    vertexShader : "\
        attribute vec2 a_position;\
        attribute vec2 a_texCoord;\
        varying vec2 v_texCoord;\
        void main() {\
            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
            v_texCoord = a_texCoord;\
        }",
    fragmentShader : "\
        precision mediump float;\
        uniform sampler2D u_image;\
        uniform vec3 inputMix;\
        uniform vec3 outputMix;\
        varying vec2 v_texCoord;\
        varying float v_mix;\
        void main(){\
            vec4 color = texture2D(u_image, v_texCoord);\
            float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];\
            color[0] = mono * outputMix[0];\
            color[1] = mono * outputMix[1];\
            color[2] = mono * outputMix[2];\
            gl_FragColor = color;\
        }",
    properties:{
        "inputMix":{type:"uniform", value:[0.4,0.6,0.2]},
        "outputMix":{type:"uniform", value:[1.0,1.0,1.0]}
    },
    inputs:["u_image"]
};

```

Here's an example of how the above node description might be used to apply sepia like effect to a video.

``` JavaScript
//Setup the video context.
var canvas = document.getElementById("canvas");
var ctx = new VideoContext(canvas);

//Create a video node and play it for 60 seconds.
var videoNode = ctx.createVideoSourceNode("./video.mp4");
videoNode.start(0);
videoNode.stop(60);

//Create the sepia effect node (from the above Monochrome effect description).
var sepiaEffect = ctx.createEffectNode(monochromDescription);

//Give a sepia tint to the monochrome output (note how shader description properties are automatically bound to the JavaScript object).
sepiaEffect.outputMix = [1.25,1.18,0.9]; 

//Set-up the processing chain.
videoNode.connect(sepiaEffect);
sepiaEffect.connect(ctx.destination);


//start playback.
ctx.play();

```

## Writing Custom Effect Shaders




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

