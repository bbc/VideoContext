#VideoContext
The VideoContext is an experimental HTML5/WebGL media processing and sequencing library for creating interactive and responsive videos on the web.


It consist of two main components. A graph based, shader accelerated processing pipeline, and a media playback sequencing time-line. 


The design is heavily inspired by the WebAudioAPI so should feel familiar to use for people who've had previous experience in the WebAudio world. 


[Live examples can be found here](http://bbc.github.io/VideoContext/)


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
            var videoNode1 = videoCtx.video("./video1.mp4");
            videoNode1.start(0);
            videoNode1.stop(4);

            var videoNode2 = videoCtx.video("./video2.mp4");
            videoNode2.start(2);
            videoNode2.stop(6);

            var crossFade = videoCtx.transition(VideoContext.DEFINITIONS.CROSSFADE);
            crossFade.transition(2,4,0.0,1.0, "mix");

            videoNode2.connect(crossFade);
            videoNode1.connect(crossFade);
            crossFade.connect(videoCtx.destination);


            videoCtx.play();
        };
    </script>
</body>
</html>
```

![Graph and timeline view](../master/readme-diagram.png?raw=true)

## Debugging
There's two built in tools that help with debugging VideoContext graphs and timelines. The following JavaScript and HTML snippets show how to set these up.

First two canvases for rendering to must be created.
``` HTML
<p>
    <canvas id="visualisation-canvas" width="390", height="20"></canvas>
</p>
<p>
    <canvas id="graph-canvas" width="480", height="150"></canvas>
</p>
```

Then setup the drawing to the canvases using JavaScript.
``` JavaScript
/****************************
* GUI setup
*****************************/
/*
* Create an interactive visualization canvas.
*/

//Render a graph view
var graphCanvas = document.getElementById("graph-canvas");
VideoContext.visualiseVideoContextGraph(videoCtx, graphCanvas);


var visualisationCanvas = document.getElementById("visualisation-canvas");

//Setup up a render function so we can update the playhead position.
function render () {
    //VideoCompositor.renderPlaylist(playlist, visualisationCanvas, videoCompositor.currentTime); 
    VideoContext.visualiseVideoContextTimeline(videoCtx, visualisationCanvas, videoCtx.currentTime);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
//catch mouse events to we can scrub through the timeline.
visualisationCanvas.addEventListener("mousedown", function(evt){
    var x;
    if (evt.x!== undefined){
        x = evt.x - visualisationCanvas.offsetLeft;
    }else{
        //Fix for firefox
        x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;          
    }
    var secondsPerPixel = videoCtx.duration / visualisationCanvas.width;
    videoCtx.currentTime = secondsPerPixel*x;
}, false);

var playButton = document.getElementById("play-button");
var pauseButton = document.getElementById("pause-button");
playButton.onclick = function(){ videoCtx.play(); };
pauseButton.onclick = function(){ videoCtx.pause(); };
```

The above snippets, when rendered, will produce something similar to the following visualization (depending on your render graph).

![Debugging view](../master/readme-debugging.png?raw=true)

## Documentation
API Documentation can be built using [ESDoc](https://esdoc.org/) by running the following commands:
```
npm install
npm run doc
```
The documentation will be generated in the "./doc" folder of the repository.

## Node Types
There are a number of different types of nodes which can be used in the VideoContexts processing graph. Here's a quick list of each one, following that is a more in-depth discussion of each type.

* VideoNode - Plays video.
* ImageNode - Displays images for specified time.
* CanvasNode - Displays output of canvas for specified time.
* EffectNode - Applies shader to limited number of inputs.
* TransisitonNode - Applies shader to limited number of inputs. Modifies properties at specific times.
* CompositingNode - Applies same shader to unlimited inputs, rendering to same output.
* DestinationNode - Node representing output canvas. Can only be one.


### VideoNode
A video source node.
``` JavaScript
var videoNode = videoCtx.video("./video1.mp4");
videoNode.connect(videoCtx.destination);
videoNode.start(0);
videoNode.stop(4);
```

For best results the video played by a VideoNode should be encoded with a fast decode profile. The following avconv line shows how this can be achieved.

```Bash
avconv -i input.mp4 -tune fastdecode -strict experimental output.mp4
```


### ImageNode
An image source node.
``` JavaScript
var imageNode = videoCtx.image("cats.png");
imageNode.connect(videoCtx.destination);
imageNode.start(0);
imageNode.stop(4);
```

### CanvasNode
A canvas source node.
``` JavaScript
var canvas = document.getElementById("input-cavnas");
var canvasNode = videoCtx.canvas(canvas);
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
    title:"Monochrome",
    description: "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
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
var videoNode = ctx.video("./video.mp4");
videoNode.start(0);
videoNode.stop(60);

//Create the sepia effect node (from the above Monochrome effect description).
var sepiaEffect = ctx.effect(monochromDescription);

//Give a sepia tint to the monochrome output (note how shader description properties are automatically bound to the JavaScript object).
sepiaEffect.outputMix = [1.25,1.18,0.9]; 

//Set-up the processing chain.
videoNode.connect(sepiaEffect);
sepiaEffect.connect(ctx.destination);

//start playback.
ctx.play();

```


### TransitionNode

Transition nodes are a type of effect node which allow the automatic modification/tweening of properties in relation to the VideoContexts notion of time. In every respect they are the same as an effect node except they have a "transition" function which can be used to cue the transitioning of a shader property from one value to another.

You can use them to perform a video transition effect (such as cross-fades, wipes, etc) by creating a definition with two inputs and having a property which controls the mix of the two inputs in the output buffer.

The following is an example of a simple cross-fade shader.

```JavaScript
var crossfadeDescription = {
    title:"Cross-Fade",
    description: "A cross-fade effect. Typically used as a transistion.",
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
            uniform sampler2D u_image_a;\
            uniform sampler2D u_image_b;\
            uniform float mix;\
            varying vec2 v_texCoord;\
            varying float v_mix;\
            void main(){\
                vec4 color_a = texture2D(u_image_a, v_texCoord);\
                vec4 color_b = texture2D(u_image_b, v_texCoord);\
                color_a[0] *= mix;\
                color_a[1] *= mix;\
                color_a[2] *= mix;\
                color_a[3] *= mix;\
                color_b[0] *= (1.0 - mix);\
                color_b[1] *= (1.0 - mix);\
                color_b[2] *= (1.0 - mix);\
                color_b[3] *= (1.0 - mix);\
                gl_FragColor = color_a + color_b;\
            }",
        properties:{
            "mix":{type:"uniform", value:0.0}
        },
        inputs:["u_image_a","u_image_b"]
};

```

The shader has two inputs and a mix property.

``` JavaScript
//Setup the video context.
var canvas = document.getElementById("canvas");
var ctx = new VideoContext(canvas);

//Create a video node that plays for 10 seconds from time=0.
var videoNode1 = ctx.video("./video1.mp4");
videoNode1.start(0);
videoNode1.stop(10);

//Create a video node that plays for 10 seconds from time=8, overlapping videoNode1 by two seconds.
var videoNode2 = ctx.video("./video2.mp4");
videoNode2.start(8);
videoNode2.stop(18);

//Create the sepia effect node (from the above Monochrome effect description).
var crossfadeEffect = ctx.transition(crossfadeDescription);

//Setup the transition. This will change the "mix" property of the cross-fade node from 0.0 to 1.0. 
//Transision mix value from 0.0 to 1.0 at time=8 over a period of 2 seconds to time=10.
crossfadeEffect.transition(8.0, 10.0, 0.0, 1.0, "mix");


//Set-up the processing chain.
videoNode1.connect(crossfadeEffect); //this will connect videoNode1 to the "image_a" input of the processing node
videoNode2.connect(crossfadeEffect); //this will connect videoNode2 to the "image_b" input of the processing node


// NOTE: There's multiple ways to connect a node to specific input of a processing node, the 
// following are all equivalent.
//
// By default behavior:
// videoNode1.connect(crossfadeEffect);
// videoNode2.connect(crossfadeEffect);
//
// By named input port:
// videoNode1.connect(crossfadeEffect, "image_a");
// videoNode2.connect(crossfadeEffect, "image_b");
//
// By input port index:
// videoNode1.connect(crossfadeEffect, 0);
// videoNode2.connect(crossfadeEffect, 1);


crossfadeEffect.connect(ctx.destination);

//start playback.
ctx.play();

```



### CompositingNode

Compositing nodes are different from regular effect nodes in that they can have an infinite number of nodes connected to them. They operate by running their effect shader on each connected input in turn and rendering the output to the same texture. This makes them particularly suitable for layering inputs which have alpha channels.  

When compositing nodes are run they map each input in turn to the first input in the definition, this means compositing node definitions typically only have a single input defined. It's also worth noting that an effect node definition with a single input can also be used as a compositing shader with no additional modifications.

A common use for compositing nodes is to collect a series of source nodes which exist at distinct points on a time-line into a single connection for passing onto further processing. This effectively makes the sources into a single video track.

Here's a really simple shader which renders all the inputs to the same output.
``` JavaScript
var combineDecription ={
    title:"Combine",
    description: "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
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
        varying vec2 v_texCoord;\
        varying float v_mix;\
        void main(){\
            vec4 color = texture2D(u_image, v_texCoord);\
            gl_FragColor = color;\
        }",
    properties:{
    },
    inputs:["u_image"]
}; 
```

And here's an example of how it can be used.

``` JavaScript
//Setup the video context.
var canvas = document.getElementById("canvas");
var ctx = new VideoContext(canvas);

//Create a video node that plays for 10 seconds from time=0.
var videoNode1 = ctx.video("./video1.mp4");
videoNode1.start(0);
videoNode1.stop(10);

//Create a video node that plays for 5 seconds from time=10.
var videoNode2 = ctx.video("./video2.mp4");
videoNode2.start(10);
videoNode2.stop(15);

//Create a video node that plays for 12 seconds from time=15.
var videoNode3 = ctx.video("./video3.mp4");
videoNode3.start(15);
videoNode3.stop(27);

//Create the combine compositing node (from the above Combine effect description).
var combineEffect = ctx.compositor(combineDecription);

//Connect all the videos to the combine effect. Collecting them together into a single point which can be connected to further points in the graph. (Making something logically equivalent to a track.)
videoNode1.connect(combineEffect);
videoNode2.connect(combineEffect);
videoNode3.connect(combineEffect);

//Connect all the input sources to the destination.
combineEffect.connect(ctx.destination);

//start playback.
ctx.play();
```


## Writing Custom Effect Definitions

Making custom effect shaders for the VideoContext is fairly simple. The best starting point is to take one of the built in effects and modify it. It's very useful to have an understanding of how shaders work and some experience writing shaders in GLSL.

``` JavaScript
var effectDefinition ={
    title:"",               //A title for the effect.
    description: "",        //A textual description of what the effect does.
    vertexShader : "",      //The vertex shader
    fragmentShader : "",    //The fragment shader
    properties:{            //An object containing uniforms from the fragment shader for mapping onto the effect node.
    },
    inputs:["u_image"]      //the names of the uniform sampler2D's in the fragment shader which represent the texture inputs to the effect. 
}; 
```


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

The library is written in es6 and cross-compiled using babel. 