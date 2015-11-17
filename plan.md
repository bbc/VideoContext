# VideoContext

## VideoContextAPI

```JavaScript
var ctx = new VideoContext()
```

A video context will synchronise all the media being played through it.


```JavaScript
ctx.play();     //play all
ctx.pause();    //pause all
ctx.currentTime //set to seek through timeline
```


## SourceNodeAPI

3 Basic types of nodes are supported. Image, Video, & Canvas. There will be an API for registering custom types and/or a method for attaching listeners to a SourceNode.

Creating via passing a url string implies the context handles the creation/deletion of the underlying element. Creating via passing an elemenet implies the user is responsible for the creation/deletion of the underlying element.

```JavaScript
var videoNode  = ctx.createVideoSourceNode(element);
var videoNode  = ctx.createVideoSourceNode(str);

var imageNode  = ctx.createImageSourceNode(element);
var imageNode  = ctx.createImageSourceNode(str);

var canvasNode = ctx.createCanvasSourceNode(element);
```


SourceNodes have a read-only "state" property which is either "waiting", "sequenced", "playing", or "ended".
```JavaScript
enum SourceNodePlaybackState {"waiting", "sequenced", "playing", "ended"};
```


* An individual node can only exist on the global timeline once.
* Calling start on a source node will add it to the global contexts timeline.
* Calling stop on a source node will signal the end of the playback on the global timeline, but not remove it.

* Calling start() sets nodes state from "waiting" to "sequenced".
* When the node plays its state changes from "sequenced" to "playing".
* Once playback has finished the state changes from "playing" to "ended".

* start() can only be called when the state of the node is "wating".
* stop() can only be called when the state of the node is "sequenced" or "playing".
* If stop() is called on a node in the "sequenced" state. The nodes state is set back to "waiting"
* Calling clearTimelineState() will set a nodes state to "waiting" and remove it from the timeline.


```JavaScript
videoNode.start();              //start playback now.

videoNode.start(10);            //start playback in 10 seconds.
videoNode.clearTimelineState(); // stops any upcoming start events and sets state to "waiting"

videoNode.stop();               //stop playback now.
videoNode.stop(10);             //stop playback in 10 seconds.
videoNode.clearTimelineState(); // stops playback and sets state to "waiting"
```






## ProcessingNode API

### Sketch
```
ProcessingNode
    |_TransitionNode
    |_EffectNode
    |_CompositingNode


TransitionNode - 2 inputs, 1 output, 1 required parameter.
    Inputs:
        0 - Video to transistion from.
        1 - Video to transistion to.
    Required parameters:
        progress - value from 0 to 1. 0 is full input 0, 1 is full input 1.
    Outputs:
        0 - The result of the transition process


EffectNode - 1 Input, 1 Output, 0 required parameters.
    Inputs:
        0 - Video to apply effect too.
    Output:
        0 - The results of the effect.


CompositionNode - * inputs, 1 output, 0 required parameters
    Inputs:
        * - Any number of input nodes, render order is determined by index, which can be a float.
    Output:
        0 - The result of the composition.
```
### Issues
Max number of 8 framebuffers & 16 or 32 texture units for a single WebGL context. Will need to heavily optimize the render graph. Maybe have a central manager for processing nodes to request free framebuffers or textures.

To minimise resource use effects should be defined as webgl functions 


```
var presenterSource = ctx.createVideoSourceNode("presenter.mp4");
var backgroundSource = ctx.createVideoSourceNode("background.png");
var titleSource = ctx.createVideoSourceNode("title.mp4");


var effectNode = ctx.createEffectNode(VideoContext.Effects.GreenScreen);
var transitionNode = ctx.createTransitionNode(VideoContext.Transitions.Crossfade);
var compositingNode = ctx.createCompositingNode(VideoContext.Composit.AlphaBlend);


presenterSource.connect(effectNode);
effectNode.connect(compositingNode,0);
backgroundSource.connect(compositingNode,1)
```



```
0           2      3           5      6           8
 _________________________________________________
| V1        |V1->V2| V2        |V2->V3| V3        |
|___________|______|___________|______|___________|




var v1Node, v2Node, v3Node; //SourcesNodes
var v1v2Tranisition, v2v3Transition = ctx.createTransition(VideoContext.Transitions.XFADE); //Tr
var outputComposit;

v1Node.connect(v1v2Transition, 0);
v2Node.connect(v1v2Transition, 1);

v1v2Transition.transistion(2,1);


v2Node.connect(v2v3Transition, 0);
v3Node.connect(v2v3Transition, 1);

v2v3Transition.transition(5,1);


v1v2Tranisition.connect(outputComposit,0);
v2v3Tranisition.connect(outputComposit,1);




ctx.registeLisner("render", function(currentTime){
   tranistionNode.progres = 0.0 - 1.0; 
});


transistion.transition(time, duration, function(progress){
    return 0.0-10;
});
transiston.progress = 0.5;
```

## Utils
```JavaScript
VideoContext.Utils.renderTimeline(videoCtx, canvasCtx);
```
