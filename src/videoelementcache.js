class VideoElementCache {

    constructor(cache_size = 3) {
        this._elements = [];
        this._elementsInitialised = false;
        for (let i = 0; i < cache_size; i++) {
            let element = this._createElement();            
            this._elements.push(element);
        }
    }


    _createElement(){
        let videoElement = document.createElement("video");
        videoElement.setAttribute("crossorigin", "anonymous");
        videoElement.setAttribute("webkit-playsinline", "");
        videoElement.src = "";
        return videoElement;
    }

    init(){
        if (!this._elementsInitialised){
            for(let element of this._elements){
                try {
                    element.play().then(()=>{
                        element.pause();
                    }, (e)=>{
                        if (e.name !== "NotSupportedError")throw(e);
                    });
                } catch(e) {
                    //console.log(e.name);
                }
            }    
        }
        this._elementsInitialised = true;
    }

    get() {
        //Try and get an already intialised element.
        for (let element of this._elements) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (element.src === "" || element.src === undefined || element.src === window.location.href) return element;
        }
        //Fallback to creating a new element if non exists.
        console.debug("No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger.");
        let element = this._createElement();
        this._elements.push(element);
        this._elementsInitialised = false;
        return element;
    }

    get length(){
        return this._elements.length;
    }

    get unused(){
        let count = 0;
        for (let element of this._elements) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (element.src === "" || element.src === undefined || element.src === window.location.href) count += 1;
        }
        return count;
    }

}

export default VideoElementCache;