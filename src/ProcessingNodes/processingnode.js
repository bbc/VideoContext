//Matthew Shotton, R&D User Experience,© BBC 2015
import GraphNode from "../graphnode";
import { createShaderProgram, createElementTexutre, updateTexture } from "../utils.js";
import { RenderException } from "../exceptions.js";

export default class ProcessingNode extends GraphNode{
    /**
    * Initialise an instance of a ProcessingNode.
    *
    * This class is not used directly, but is extended to create CompositingNodes, TransitionNodes, and EffectNodes.
    */
    constructor(gl, renderGraph, definition, inputNames, limitConnections){
        super(gl, renderGraph, inputNames, limitConnections);
        this._vertexShader = definition.vertexShader;
        this._fragmentShader = definition.fragmentShader;
        this._definition = definition;
        this._properties = {};//definition.properties;
        //copy definition properties
        for(let propertyName in definition.properties){
            let propertyValue = definition.properties[propertyName].value;
            //if an array then shallow copy it
            if(Object.prototype.toString.call(propertyValue) === "[object Array]"){
                propertyValue = definition.properties[propertyName].value.slice();
            }
            let propertyType = definition.properties[propertyName].type;
            this._properties[propertyName] = {type:propertyType, value:propertyValue};
        }

        this._inputTextureUnitMapping =[];
        this._maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this._boundTextureUnits = 0;
        this._parameterTextureCount = 0;
        this._inputTextureCount = 0;
        this._texture = createElementTexutre(gl);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        //compile the shader
        this._program = createShaderProgram(gl, this._vertexShader, this._fragmentShader);

        //create and setup the framebuffer
        this._framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture,0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        //create properties on this object for the passed properties
        for (let propertyName in this._properties){
            Object.defineProperty(this, propertyName, {
                get:function(){return this._properties[propertyName].value;},
                set:function(passedValue){this._properties[propertyName].value = passedValue;}
            });
        }

        //create texutres for any texture properties
        for (let propertyName in this._properties){
            let propertyValue = this._properties[propertyName].value;
            if (propertyValue instanceof Image){
                this._properties[propertyName].texture = createElementTexutre(gl);
                this._properties[propertyName].texutreUnit = gl.TEXTURE0 + this._boundTextureUnits;
                this._boundTextureUnits += 1;
                this._parameterTextureCount +=1;
                if (this._boundTextureUnits > this._maxTextureUnits){
                    throw new RenderException("Trying to bind more than available textures units to shader");
                }
            }
        }

        //calculate texutre units for input textures
        for(let inputName of definition.inputs){
            this._inputTextureUnitMapping.push({name:inputName, textureUnit:gl.TEXTURE0 + this._boundTextureUnits});
            this._boundTextureUnits += 1;
            this._inputTextureCount += 1;
            if (this._boundTextureUnits > this._maxTextureUnits){
                throw new RenderException("Trying to bind more than available textures units to shader");
            }
        }


        //find the locations of the properties in the compiled shader
        for (let propertyName in this._properties){
            if (this._properties[propertyName].type === "uniform"){
                this._properties[propertyName].location = this._gl.getUniformLocation(this._program, propertyName);
            }
        }
        this._currentTimeLocation = this._gl.getUniformLocation(this._program, "currentTime");
        this._currentTime = 0;


        //Other setup
        let positionLocation = gl.getAttribLocation(this._program, "a_position");
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 0.0]),
            gl.STATIC_DRAW);
        let texCoordLocation = gl.getAttribLocation(this._program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        //console.log(gl.getUniformLocation(this._program, "u_image"));
    }

    _update(currentTime){
        this._currentTime = currentTime;
    }

    _seek(currentTime){
        this._currentTime = currentTime;
    }

    _render(){
        this._rendered = true;
        let gl = this._gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(this._program);

        //upload the default uniforms
        gl.uniform1f(this._currentTimeLocation, parseFloat(this._currentTime));

        //upload/update the custom uniforms
        let textureOffset = 0;

        for (let propertyName in this._properties){
            let propertyValue = this._properties[propertyName].value;
            let propertyType = this._properties[propertyName].type;
            let propertyLocation = this._properties[propertyName].location;
            if (propertyType !== "uniform") continue;

            if (typeof propertyValue === "number"){
                gl.uniform1f(propertyLocation, propertyValue);
            }
            else if( Object.prototype.toString.call(propertyValue) === "[object Array]"){
                if(propertyValue.length === 1){
                    gl.uniform1fv(propertyLocation, propertyValue);
                } else if(propertyValue.length === 2){
                    gl.uniform2fv(propertyLocation, propertyValue);
                } else if(propertyValue.length === 3){
                    gl.uniform3fv(propertyLocation, propertyValue);
                } else if(propertyValue.length === 4){
                    gl.uniform4fv(propertyLocation, propertyValue);
                } else{
                    console.debug("Shader parameter", propertyName, "is too long an array:", propertyValue);
                }
            } else if(propertyValue instanceof Image){
                let texture =  this._properties[propertyName].texture;
                let textureUnit = this._properties[propertyName].texutreUnit;
                updateTexture(gl, texture, propertyValue);

                gl.activeTexture(textureUnit);
                gl.uniform1i(propertyLocation, textureOffset);
                textureOffset += 1;
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }
            else{
                //TODO - add tests for textures
                /*gl.activeTexture(gl.TEXTURE0 + textureOffset);
                gl.uniform1i(parameterLoctation, textureOffset);
                gl.bindTexture(gl.TEXTURE_2D, textures[textureOffset-1]);*/
            }
        }

    }
}
