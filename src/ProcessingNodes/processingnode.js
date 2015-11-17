import GraphNode from "../graphnode";
import { createShaderProgram } from "../utils.js";

class ProcessingNode extends GraphNode{
    constructor(gl, renderGraph, definition, maxInputs){
        super(gl, renderGraph, maxInputs);
        this._vertexShader = definition.vertexShader;
        this._fragmentShader = definition.fragmentShader;
        this._properties = definition.properties;

        //compile the shader
        this._program = createShaderProgram(gl, this._vertexShader, this._fragmentShader);

        //create properties on this object for the passed properties
        for (let propertyName in this._properties){
            let propertyValue = this._properties[propertyName];
            Object.defineProperty(this, propertyName, {
                get:function(){return this._properties[propertyName].value;},
                set:function(passedValue){this._properties[propertyName].value = passedValue;}
            });
        }

        //find the locations of the properties in the compiled shader
        for (let propertyName in this._properties){
            if (this._properties[propertyName].type === "uniform"){
                this._properties[propertyName].location = this._gl.getUniformLocation(this._program, propertyName);
                console.debug(propertyName, this._properties[propertyName].location);
            }
        }

        this._currentTime = 0;
    }

    _update(currentTime){
        this._currentTime = currentTime;
    }

    _render(){
        this.gl.useProgram(this._program);
        for (let propertyName in this._properties){
            let propertyValue = this._properties[propertyName].value;
            let propertyType = this._properties[propertyName].type;
            let propertyLocation = this._properties[propertyName].location;
            if (propertyType !== 'uniform') continue;
            
            if (typeof propertyValue === "number"){
                this.gl.uniform1f(propertyLocation, propertyValue);
            }
            else if( Object.prototype.toString.call(propertyValue) === '[object Array]'){
                if(propertyValue.length === 1){
                    this.gl.uniform1fv(propertyLocation, propertyValue);
                } else if(propertyValue.length === 2){
                    this.gl.uniform2fv(propertyLocation, propertyValue);
                } else if(propertyValue.length === 3){
                    this.gl.uniform3fv(propertyLocation, propertyValue);
                } else if(propertyValue.length === 4){
                    this.gl.uniform4fv(propertyLocation, propertyValue);
                } else{
                    console.debug("Shader parameter", propertyName, "is too long an array:", propertyValue);
                }
            }
            else{
                //TODO - add tests for textures
                /*this.gl.activeTexture(this.gl.TEXTURE0 + textureOffset);
                this.gl.uniform1i(parameterLoctation, textureOffset);
                this.gl.bindTexture(this.gl.TEXTURE_2D, textures[textureOffset-1]);*/
            }
        }
    }
}


export default ProcessingNode;