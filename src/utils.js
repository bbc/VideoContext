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
