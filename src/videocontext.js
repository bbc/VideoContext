import VideoNode from "./SourceNodes/videonode.js";


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


let STATE = {"playing":0, "paused":1, "stalled":2, "ended":3, "broken":4};
//playing - all sources are active
//paused - all sources are paused
//stalled - one or more sources is unable to play
//ended - all sources have finished playing
//broken - the render graph is in a broken state


class VideoContext{
    constructor(){
        this._sourceNodes = [];
        this._processingNodes = [];
        this._timeline = [];
        this._currentTime = 0;
        this._state = STATE.paused;
        registerUpdateable(this);        
    }

    set currentTime(currentTime){
        if (typeof currentTime === 'string' || currentTime instanceof String){
            currentTime = parseFloat(currentTime);
        }
        console.debug("Seeking to", currentTime);

        for (let i = 0; i < this._sourceNodes.length; i++) {
            this._sourceNodes[i]._seek(this._currentTime);
        }
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

    play(){
        for (let i = 0; i < this._sourceNodes.length; i++) {
            this._sourceNodes[i]._play();
        }
        this._state = STATE.playing;
    }

    pause(){
        for (let i = 0; i < this._sourceNodes.length; i++) {
            this._sourceNodes[i]._pause();
        }
        this._state = STATE.paused;
    }


    createVideoSourceNode(src){
        let videoNode = new VideoNode(src);
        this._sourceNodes.push(videoNode);
        return videoNode;
    }

    _isStalled(){
        for (let i = 0; i < this._sourceNodes.length; i++) {
            let sourceNode = this._sourceNodes[i];
            if (!sourceNode._isReady()){
                return true;
            }
        }
        return false;
    }

    _update(dt){

        if (this._state === STATE.playing || this._state === STATE.stalled) {
            
            if (this._isStalled()){
                this._state = STATE.stalled;
            }else{
                this._state = STATE.playing;
            }

            if(this._state === STATE.stalled){
                for (let i = 0; i < this._sourceNodes.length; i++) {
                    let sourceNode = this._sourceNodes[i];
                    if (sourceNode._isReady()) sourceNode.pause();
                }
            }
            if(this._state === STATE.playing){
                this._currentTime += dt;

                for (let i = 0; i < this._sourceNodes.length; i++) {
                    let sourceNode = this._sourceNodes[i];
                    sourceNode.update(this._currentTime);
                }   
            }
        }
    }


}

export default VideoContext;