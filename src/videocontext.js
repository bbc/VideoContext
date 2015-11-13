let updateables = [];
let previousTime;
function registerUpdateable(updateable){
    updateables.push(updateable);
}
function update(time){
    if (previousTime === undefined) previousTime = time;
    let dt = (time - previousTime)/1000;
    for(let i = 0; i < updateables.length; i++){
        updateables[i]._update(dt);
    }
    previousTime = time;
    requestAnimationFrame(update);
}
update();


class VideoCompositor(){
    constructor(){
        this._sourceNodes = [];
        this._processingNodes = [];
        this._timeline = [];
        this._currentTime = 0;

        registerUpdateable(this);        
    }

    set currentTime(currentTime){
        if (typeof currentTime === 'string' || currentTime instanceof String){
            currentTime = parseFloat(currentTime);
        }
        console.debug("Seeking to", currentTime);
        this._currentTime = currentTime;
    }

    
    /**
    * Get how far through the internal timeline has been played.
    *
    * Getting this value will give the current playhead position. Can be used for updating timelines.
    * @return {number} The time in seconds through the current playlist.
    * 
    * @example
    * var ctx = new VideoContext();
    * var canvasElement = document.getElemenyById("canvas");
    * var videoNode = ctx.createVideoSourceNode("video.mp4");
    * var outputNode =ctx.createOutputNode(cavnasElement);
    * videoNode.connect(outputNode);
    * videoNode.start();
    * videoCtx.play();
    *
    */
    get currentTime(){
        return this._currentTime;
    }

    _update(){

    }


}

