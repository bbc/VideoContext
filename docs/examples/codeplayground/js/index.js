 function evalInContext(js, context) {
    //# Return the results of the in-line anonymous function we .call with the passed context
    return function() { return eval(js); }.call(context);
}

 window.onload = function(){
    let visualisationCanvas = document.getElementById("visualisation-canvas");  
    let editor = ace.edit("editor");
    let playButton = document.getElementById("play-button");
    let pauseButton = document.getElementById("pause-button");

    function render () {
        if (window.vc !== undefined){
            VideoContext.visualiseVideoContextTimeline(window.vc, visualisationCanvas, window.vc.currentTime);
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

    let code =undefined
    //code = localStorage.getItem("code");
    if(code) {
        editor.setValue(code, -1);
    }

    playButton.onclick = function(){
        window.vc = undefined;
        evalInContext(editor.getValue(), this);
    }

    pauseButton.onclick = function(){
        if(window.vc){
            window.vc.pause();
        };
    }

    function run(){
        window.vc = undefined;
        // localStorage.setItem("code", editor.getValue());
        evalInContext(editor.getValue(), this);
        event.preventDefault();
    }

    $(document).bind('keydown', function(e) {
      if(e.ctrlKey && (e.which == 83)) {
        e.preventDefault();
        run();
        return false;
      }
    });

    $(window).keypress(function(event) {
        if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
        run();
        return false;
    });

    run();

 }
 