//Matthew Shotton, R&D User Experience,© BBC 2015
import GraphNode from "../graphnode.js";
import {
    compileShader,
    createShaderProgram,
    createElementTexture,
    updateTexture
} from "../utils.js";
import { RenderException } from "../exceptions.js";
import type RenderGraph from "../rendergraph.js";
import type { IDefinition, PropertyValue } from "../types.js";

const TYPE = "ProcessingNode";

interface IProcessingNodeProperty {
    type: string;
    value: PropertyValue;
    texture?: WebGLTexture;
    textureUnit?: number;
    textureUnitIndex?: number;
    location?: WebGLUniformLocation | null;
}

interface IShaderInputTextureUnitMapping {
    name: string;
    textureUnit: number;
    textureUnitIndex: number;
    location: WebGLUniformLocation | null;
}

class ProcessingNode extends GraphNode {
    _vertexShader: WebGLShader;
    _fragmentShader: WebGLShader;
    _definition: IDefinition;
    _properties: Record<string, IProcessingNodeProperty>;
    _shaderInputsTextureUnitMapping: IShaderInputTextureUnitMapping[];
    _maxTextureUnits: number;
    _boundTextureUnits: number;
    _texture: WebGLTexture | undefined;
    _program: WebGLProgram;
    _framebuffer: WebGLFramebuffer | null;
    _currentTimeLocation: WebGLUniformLocation | null;
    _currentTime: number;
    _vertexBuffer: WebGLBuffer | undefined;

    /**
     * Initialise an instance of a ProcessingNode.
     *
     * This class is not used directly, but is extended to create CompositingNodes, TransitionNodes, and EffectNodes.
     */
    constructor(
        gl: WebGLRenderingContext,
        renderGraph: RenderGraph,
        definition: IDefinition,
        inputNames: string[],
        limitConnections: boolean
    ) {
        super(gl, renderGraph, inputNames, limitConnections);
        this._vertexShader = compileShader(gl, definition.vertexShader, gl.VERTEX_SHADER);
        this._fragmentShader = compileShader(gl, definition.fragmentShader, gl.FRAGMENT_SHADER);
        this._definition = definition;
        this._properties = {};
        //copy definition properties
        for (const propertyName in definition.properties) {
            let propertyValue = definition.properties[propertyName].value;
            //if an array then shallow copy it
            if (Array.isArray(propertyValue)) {
                propertyValue = propertyValue.slice();
            }
            const propertyType = definition.properties[propertyName].type;
            this._properties[propertyName] = {
                type: propertyType,
                value: propertyValue
            };
        }

        this._shaderInputsTextureUnitMapping = [];
        this._maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this._boundTextureUnits = 0;
        const texture: WebGLTexture = createElementTexture(gl);
        this._texture = texture;
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.canvas.width,
            gl.canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
        //compile the shader
        this._program = createShaderProgram(gl, this._vertexShader, this._fragmentShader);

        //create and setup the framebuffer
        this._framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        //create properties on this object for the passed properties
        for (const propertyName in this._properties) {
            Object.defineProperty(this, propertyName, {
                get: function (this: ProcessingNode) {
                    return this._properties[propertyName].value;
                },
                set: function (this: ProcessingNode, passedValue: PropertyValue) {
                    this._properties[propertyName].value = passedValue;
                }
            });
        }

        //create textures for any texture properties
        for (const propertyName in this._properties) {
            const propertyValue = this._properties[propertyName].value;
            if (propertyValue instanceof Image) {
                this._properties[propertyName].texture = createElementTexture(gl);
                this._properties[propertyName].textureUnit = gl.TEXTURE0 + this._boundTextureUnits;
                this._properties[propertyName].textureUnitIndex = this._boundTextureUnits;
                this._boundTextureUnits += 1;
                if (this._boundTextureUnits > this._maxTextureUnits) {
                    throw new RenderException(
                        "Trying to bind more than available textures units to shader"
                    );
                }
            }
        }

        // calculate texture units for input textures
        for (const inputName of definition.inputs) {
            this._shaderInputsTextureUnitMapping.push({
                name: inputName,
                textureUnit: gl.TEXTURE0 + this._boundTextureUnits,
                textureUnitIndex: this._boundTextureUnits,
                location: gl.getUniformLocation(this._program, inputName)
            });
            this._boundTextureUnits += 1;
            if (this._boundTextureUnits > this._maxTextureUnits) {
                throw new RenderException(
                    "Trying to bind more than available textures units to shader"
                );
            }
        }

        //find the locations of the properties in the compiled shader
        for (const propertyName in this._properties) {
            if (this._properties[propertyName].type === "uniform") {
                this._properties[propertyName].location = this._gl.getUniformLocation(
                    this._program,
                    propertyName
                );
            }
        }
        this._currentTimeLocation = this._gl.getUniformLocation(this._program, "currentTime");
        this._currentTime = 0;

        //Other setup
        const positionLocation = gl.getAttribLocation(this._program, "a_position");
        this._vertexBuffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]),
            gl.STATIC_DRAW
        );
        const texCoordLocation = gl.getAttribLocation(this._program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        this._displayName = TYPE;
    }

    /**
     * Sets the passed processing node property to the passed value.
     * @param {string} name - The name of the processing node parameter to modify.
     * @param {Object} value - The value to set it to.
     *
     * @example
     * var ctx = new VideoContext();
     * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
     * monoNode.setProperty("inputMix", [1.0,0.0,0.0]); //Just use red channel
     */
    setProperty(name: string, value: PropertyValue): void {
        this._properties[name].value = value;
    }

    /**
     * Gets the value of the passed processing node property.
     * @param {string} name - The name of the processing node parameter to get.
     *
     * @example
     * var ctx = new VideoContext();
     * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
     * console.log(monoNode.getProperty("inputMix")); //Will output [0.4,0.6,0.2], the default value from the effect definition.
     */
    getProperty(name: string): PropertyValue {
        return this._properties[name].value;
    }

    /**
     * Destroy and clean-up the node.
     */
    destroy(): void {
        super.destroy();
        //destroy textures for any texture properties
        for (const propertyName in this._properties) {
            const propertyValue = this._properties[propertyName].value;
            if (propertyValue instanceof Image) {
                const texture = this._properties[propertyName].texture;
                if (texture) this._gl.deleteTexture(texture);
                this._properties[propertyName].texture = undefined;
            }
        }
        //Destroy main
        if (this._texture) this._gl.deleteTexture(this._texture);
        this._texture = undefined;
        //Delete vertex buffer
        if (this._vertexBuffer) this._gl.deleteBuffer(this._vertexBuffer);
        this._vertexBuffer = undefined;
        //Detach shaders
        this._gl.detachShader(this._program, this._vertexShader);
        this._gl.detachShader(this._program, this._fragmentShader);
        //Delete shaders
        this._gl.deleteShader(this._vertexShader);
        this._gl.deleteShader(this._fragmentShader);
        //Delete program
        this._gl.deleteProgram(this._program);
        //Delete Framebuffer
        this._gl.deleteFramebuffer(this._framebuffer);
    }

    _update(currentTime: number): void {
        this._currentTime = currentTime;
    }

    _seek(currentTime: number): void {
        this._currentTime = currentTime;
    }

    _render(): void {
        this._rendered = true;
        const gl = this._gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(this._program);

        //upload the default uniforms
        gl.uniform1f(this._currentTimeLocation, this._currentTime);

        for (const propertyName in this._properties) {
            const propertyValue = this._properties[propertyName].value;
            const propertyType = this._properties[propertyName].type;
            const propertyLocation = this._properties[propertyName].location;
            if (propertyType !== "uniform") continue;

            if (typeof propertyValue === "number") {
                gl.uniform1f(propertyLocation as WebGLUniformLocation, propertyValue);
            } else if (Array.isArray(propertyValue)) {
                if (propertyValue.length === 1) {
                    gl.uniform1fv(propertyLocation as WebGLUniformLocation, propertyValue);
                } else if (propertyValue.length === 2) {
                    gl.uniform2fv(propertyLocation as WebGLUniformLocation, propertyValue);
                } else if (propertyValue.length === 3) {
                    gl.uniform3fv(propertyLocation as WebGLUniformLocation, propertyValue);
                } else if (propertyValue.length === 4) {
                    gl.uniform4fv(propertyLocation as WebGLUniformLocation, propertyValue);
                } else {
                    console.debug(
                        "Shader parameter",
                        propertyName,
                        "is too long an array:",
                        propertyValue
                    );
                }
            } else if (propertyValue instanceof Image) {
                const texture = this._properties[propertyName].texture as WebGLTexture;
                const textureUnit = this._properties[propertyName].textureUnit as number;
                const textureUnitIndex = this._properties[propertyName].textureUnitIndex as number;
                updateTexture(gl, texture, propertyValue);

                gl.activeTexture(textureUnit);
                gl.uniform1i(propertyLocation as WebGLUniformLocation, textureUnitIndex);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }
        }
    }
}

export { TYPE as PROCESSINGTYPE };

export default ProcessingNode;
