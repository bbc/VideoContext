export function compileShader(gl, shaderSource, shaderType) {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}


export function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource){
    let vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    let fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
   
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw {"error":4,"msg":"Can't link shader program for track", toString:function(){return this.msg;}};
    }
    return program;
}

export function createElementTexutre(gl, type=new Uint8Array([0,0,0,0]), width=1, height=1){
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //Initialise the texture untit to clear.
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, type);

    return texture;
}

export function updateTexture(gl, texture, element){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
}

export function clearTexture(gl, texture){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
}


export function visualiseVideoContext(videoContext, canvas, currentTime){
        let ctx = canvas.getContext('2d');
        let w = canvas.width;
        let h = canvas.height;
        let trackHeight = h / videoContext._sourceNodes.length;
        let playlistDuration = videoContext.duration;
        let pixelsPerSecond = w / playlistDuration;
        let mediaSourceStyle = {
            "video":["#572A72", "#3C1255"],
            "image":["#7D9F35", "#577714"],
            "canvas":["#AA9639", "#806D15"]
        };


        ctx.clearRect(0,0,w,h);
        ctx.fillStyle = "#999";
        for (let i = 0; i < videoContext._sourceNodes.length; i++) {
            let sourceNode = videoContext._sourceNodes[i];
            let duration = sourceNode._stopTime - sourceNode._startTime;
            let start = sourceNode._startTime;

            let msW = duration * pixelsPerSecond;
            let msH = trackHeight;
            let msX = start * pixelsPerSecond;
            let msY = trackHeight * i;
            ctx.fillStyle = mediaSourceStyle.video[i%mediaSourceStyle.video.length];
            ctx.fillRect(msX,msY,msW,msH);
            ctx.fill();
        }

        if (currentTime !== undefined){
            ctx.fillStyle = "#000";
            ctx.fillRect(currentTime*pixelsPerSecond, 0, 1, h);
        }
    }