//Matthew Shotton, R&D User Experience,© BBC 2015
import DEFINITIONS from "./Definitions/definitions.js";
import { RenderException } from "./exceptions.js";
import { SOURCENODESTATE } from "./SourceNodes/sourcenode.js";
import { VIDEOTYPE } from "./SourceNodes/videonode.js";
import { CANVASTYPE } from "./SourceNodes/canvasnode.js";
import { IMAGETYPE } from "./SourceNodes/imagenode.js";
import { DESTINATIONTYPE } from "./DestinationNode/destinationnode.js";
import { TRANSITIONTYPE } from "./ProcessingNodes/transitionnode.js";
import { COMPOSITINGTYPE } from "./ProcessingNodes/compositingnode.js";
import type VideoContext from "./videocontext.js";
import type GraphNode from "./graphnode.js";
import type SourceNode from "./SourceNodes/sourcenode.js";
import type ProcessingNode from "./ProcessingNodes/processingnode.js";
import type TransitionNode from "./ProcessingNodes/transitionnode.js";
import type MediaNode from "./SourceNodes/medianode.js";

/**
 * A WebGLTexture with the small piece of bookkeeping VideoContext keeps on it:
 * whether the texture is currently cleared (to skip redundant texImage2D calls).
 */
export interface ManagedTexture extends WebGLTexture {
    _isTextureCleared?: boolean;
}

/*
 * Utility function to compile a WebGL Vertex or Fragment shader.
 *
 * @param {WebGLRenderingContext} gl - the webgl context for which to build the shader.
 * @param {String} shaderSource - A string of shader code to compile.
 * @param {number} shaderType - Shader type, either WebGLRenderingContext.VERTEX_SHADER or WebGLRenderingContext.FRAGMENT_SHADER.
 *
 * @return {WebGLShader} A compiled shader.
 */
export function compileShader(
    gl: WebGLRenderingContext,
    shaderSource: string,
    shaderType: number
): WebGLShader {
    const shader = gl.createShader(shaderType) as WebGLShader;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw new RenderException("could not compile shader:" + gl.getShaderInfoLog(shader));
    }
    return shader;
}

/*
 * Create a shader program from a passed vertex and fragment shader.
 *
 * @param {WebGLRenderingContext} gl - the webgl context for which to build the shader program.
 * @param {WebGLShader} vertexShader - A compiled vertex shader.
 * @param {WebGLShader} fragmentShader - A compiled fragment shader.
 *
 * @return {WebGLProgram} A compiled & linked shader program.
 */
export function createShaderProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram {
    const program = gl.createProgram() as WebGLProgram;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new RenderException("Can't link shader program for track");
    }
    return program;
}

export function createElementTexture(gl: WebGLRenderingContext): WebGLTexture {
    const texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

export function updateTexture(
    gl: WebGLRenderingContext,
    texture: ManagedTexture,
    element: (TexImageSource | HTMLMediaElement) & { readyState?: number }
): void {
    if (element.readyState !== undefined && element.readyState === 0) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element as TexImageSource);

    texture._isTextureCleared = false;
}

export function clearTexture(gl: WebGLRenderingContext, texture: ManagedTexture): void {
    // A quick check to ensure we don't call 'texImage2D' when the texture has already been 'cleared' #performance
    if (!texture._isTextureCleared) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])
        );

        texture._isTextureCleared = true;
    }
}

export function generateRandomId(): string {
    const appearanceAdjective = [
        "adorable",
        "alert",
        "average",
        "beautiful",
        "blonde",
        "bloody",
        "blushing",
        "bright",
        "clean",
        "clear",
        "cloudy",
        "colourful",
        "concerned",
        "crowded",
        "curious",
        "cute",
        "dark",
        "dirty",
        "drab",
        "distinct",
        "dull",
        "elegant",
        "fancy",
        "filthy",
        "glamorous",
        "gleaming",
        "graceful",
        "grotesque",
        "homely",
        "light",
        "misty",
        "motionless",
        "muddy",
        "plain",
        "poised",
        "quaint",
        "scary",
        "shiny",
        "smoggy",
        "sparkling",
        "spotless",
        "stormy",
        "strange",
        "ugly",
        "unsightly",
        "unusual"
    ];
    const conditionAdjective = [
        "alive",
        "brainy",
        "broken",
        "busy",
        "careful",
        "cautious",
        "clever",
        "crazy",
        "damaged",
        "dead",
        "difficult",
        "easy",
        "fake",
        "false",
        "famous",
        "forward",
        "fragile",
        "guilty",
        "helpful",
        "helpless",
        "important",
        "impossible",
        "infamous",
        "innocent",
        "inquisitive",
        "mad",
        "modern",
        "open",
        "outgoing",
        "outstanding",
        "poor",
        "powerful",
        "puzzled",
        "real",
        "rich",
        "right",
        "robust",
        "sane",
        "scary",
        "shy",
        "sleepy",
        "stupid",
        "super",
        "tame",
        "thick",
        "tired",
        "wild",
        "wrong"
    ];
    const nounAnimal = [
        "manatee",
        "gila monster",
        "nematode",
        "seahorse",
        "slug",
        "koala bear",
        "giant tortoise",
        "garden snail",
        "starfish",
        "sloth",
        "american woodcock",
        "coral",
        "swallowtail butterfly",
        "house sparrow",
        "sea anemone"
    ];

    function randomChoice<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    function capitalize(word: string): string {
        word = word.replace(/\b\w/g, l => l.toUpperCase());
        return word;
    }

    let name =
        randomChoice(appearanceAdjective) +
        " " +
        randomChoice(conditionAdjective) +
        " " +
        randomChoice(nounAnimal);
    name = capitalize(name);
    name = name.replace(/ /g, "-");
    return name;
}

export function exportToJSON(vc: VideoContext): string {
    console.warn(
        "VideoContext.exportToJSON has been deprecated. Please use VideoContext.snapshot instead."
    );
    return JSON.stringify(snapshotNodes(vc));
}

export function snapshot(vc: VideoContext) {
    return {
        nodes: snapshotNodes(vc),
        videoContext: snapshotVideoContext(vc)
    };
}

function snapshotVideoContext(vc: VideoContext) {
    return {
        currentTime: vc.currentTime,
        duration: vc.duration,
        state: vc.state,
        playbackRate: vc.playbackRate
    };
}

export interface ISnapshotNode {
    type: string;
    url?: string;
    start?: number;
    stop?: number;
    state?: string;
    currentTime?: number | null;
    sourceOffset?: number;
    definition?: unknown;
    inputs?: Array<{ id: string | undefined; index: number }>;
    properties?: Record<string, unknown>;
    transitions?: unknown;
}

let warningExportSourceLogged = false;
function snapshotNodes(vc: VideoContext): Record<string, ISnapshotNode> {
    function qualifyURL(url: string): string {
        const a = document.createElement("a");
        a.href = url;
        return a.href;
    }

    function getInputIDs(node: GraphNode, vc: VideoContext) {
        const inputs: Array<{ id: string | undefined; index: number }> = [];
        //use the raw (unfiltered) input list so the index reflects the actual port,
        //not the position amongst only the connected inputs
        const rawInputs = node._renderGraph.getInputsForNode(node);
        for (let inputIndex = 0; inputIndex < rawInputs.length; inputIndex++) {
            const input = rawInputs[inputIndex];
            if (input === undefined) continue;
            let inputID;
            let index = vc._processingNodes.indexOf(input as ProcessingNode);
            if (index > -1) {
                inputID = "processor" + index;
            } else {
                index = vc._sourceNodes.indexOf(input as SourceNode);
                if (index > -1) {
                    inputID = "source" + index;
                } else {
                    console.log("Warning, can't find input", input);
                }
            }
            inputs.push({ id: inputID, index: inputIndex });
        }
        return inputs;
    }

    const result: Record<string, ISnapshotNode> = {};

    const sourceNodeStateMapping: string[] = [];
    for (const state in SOURCENODESTATE) {
        sourceNodeStateMapping[SOURCENODESTATE[state as keyof typeof SOURCENODESTATE]] = state;
    }

    for (let index = 0; index < vc._sourceNodes.length; index++) {
        const source = vc._sourceNodes[index];
        const id = "source" + index;
        let node_url = "";

        if (!source._isResponsibleForElementLifeCycle) {
            if (!warningExportSourceLogged) {
                console.debug(
                    "Warning - Trying to export source created from an element not a URL. URL of export will be set to the element's src attribute and may be incorrect",
                    source
                );
                warningExportSourceLogged = true;
            }
            node_url = (source.element as HTMLVideoElement).src;
        } else {
            node_url = qualifyURL(source._elementURL as string);
        }

        const node: ISnapshotNode = {
            type: source.displayName,
            url: node_url,
            start: source.startTime,
            stop: source.stopTime,
            state: sourceNodeStateMapping[source.state]
        };
        if (node.type === VIDEOTYPE) {
            node.currentTime = null;
            const element = source.element as HTMLVideoElement | undefined;
            if (element && element.currentTime) {
                node.currentTime = element.currentTime;
            }
        }

        const sourceOffset = (source as MediaNode)._sourceOffset;
        if (sourceOffset) {
            node.sourceOffset = sourceOffset;
        }
        result[id] = node;
    }

    for (let index = 0; index < vc._processingNodes.length; index++) {
        const processor = vc._processingNodes[index];
        const id = "processor" + index;
        const node: ISnapshotNode = {
            type: processor.displayName,
            definition: processor._definition,
            inputs: getInputIDs(processor, vc),
            properties: {}
        };

        for (const property in processor._definition.properties) {
            (node.properties as Record<string, unknown>)[property] = (
                processor as unknown as Record<string, unknown>
            )[property];
        }

        if (node.type === TRANSITIONTYPE) {
            node.transitions = (processor as TransitionNode)._transitions;
        }

        result[id] = node;
    }

    result["destination"] = {
        type: "Destination",
        inputs: getInputIDs(vc.destination, vc)
    };

    return result;
}

export function createControlFormForNode(node: ProcessingNode, nodeName?: string): HTMLElement {
    const rootDiv = document.createElement("div");

    if (nodeName !== undefined) {
        const title = document.createElement("h2");
        title.textContent = nodeName;
        rootDiv.appendChild(title);
    }

    for (const propertyName in node._properties) {
        const propertyParagraph = document.createElement("p");
        const propertyTitleHeader = document.createElement("h3");
        propertyTitleHeader.textContent = propertyName;
        propertyParagraph.appendChild(propertyTitleHeader);

        const propertyValue = node._properties[propertyName].value;
        if (typeof propertyValue === "number") {
            const range = document.createElement("input");
            range.setAttribute("type", "range");
            range.setAttribute("min", "0");
            range.setAttribute("max", "1");
            range.setAttribute("step", "0.01");
            range.setAttribute("value", propertyValue.toString());

            const number = document.createElement("input");
            number.setAttribute("type", "number");
            number.setAttribute("min", "0");
            number.setAttribute("max", "1");
            number.setAttribute("step", "0.01");
            number.setAttribute("value", propertyValue.toString());

            let mouseDown = false;
            range.onmousedown = function () {
                mouseDown = true;
            };
            range.onmouseup = function () {
                mouseDown = false;
            };
            range.onmousemove = function () {
                if (mouseDown) {
                    (node as unknown as Record<string, number>)[propertyName] = parseFloat(
                        range.value
                    );
                    number.value = range.value;
                }
            };
            range.onchange = function () {
                (node as unknown as Record<string, number>)[propertyName] = parseFloat(range.value);
                number.value = range.value;
            };
            number.onchange = function () {
                (node as unknown as Record<string, number>)[propertyName] = parseFloat(
                    number.value
                );
                range.value = number.value;
            };
            propertyParagraph.appendChild(range);
            propertyParagraph.appendChild(number);
        } else if (Array.isArray(propertyValue)) {
            for (let i = 0; i < propertyValue.length; i++) {
                const range = document.createElement("input");
                range.setAttribute("type", "range");
                range.setAttribute("min", "0");
                range.setAttribute("max", "1");
                range.setAttribute("step", "0.01");
                range.setAttribute("value", propertyValue[i].toString());

                const number = document.createElement("input");
                number.setAttribute("type", "number");
                number.setAttribute("min", "0");
                number.setAttribute("max", "1");
                number.setAttribute("step", "0.01");
                number.setAttribute("value", propertyValue[i].toString());

                const index = i;
                let mouseDown = false;
                range.onmousedown = function () {
                    mouseDown = true;
                };
                range.onmouseup = function () {
                    mouseDown = false;
                };
                range.onmousemove = function () {
                    if (mouseDown) {
                        (node as unknown as Record<string, number[]>)[propertyName][index] =
                            parseFloat(range.value);
                        number.value = range.value;
                    }
                };
                range.onchange = function () {
                    (node as unknown as Record<string, number[]>)[propertyName][index] = parseFloat(
                        range.value
                    );
                    number.value = range.value;
                };

                number.onchange = function () {
                    (node as unknown as Record<string, number[]>)[propertyName][index] = parseFloat(
                        number.value
                    );
                    range.value = number.value;
                };
                propertyParagraph.appendChild(range);
                propertyParagraph.appendChild(number);
            }
        }

        rootDiv.appendChild(propertyParagraph);
    }
    return rootDiv;
}

function calculateNodeDepthFromDestination(videoContext: VideoContext): Map<GraphNode, number> {
    const destination = videoContext.destination;
    const depthMap = new Map<GraphNode, number>();
    depthMap.set(destination, 0);

    function iterateBackwards(node: GraphNode, depth = 0): void {
        for (const n of node.inputs) {
            const d = depth + 1;
            const existing = depthMap.get(n);
            if (existing !== undefined) {
                if (d > existing) {
                    depthMap.set(n, d);
                }
            } else {
                depthMap.set(n, d);
            }
            iterateBackwards(n, depthMap.get(n));
        }
    }

    iterateBackwards(destination);
    return depthMap;
}

export function visualiseVideoContextGraph(
    videoContext: VideoContext,
    canvas: HTMLCanvasElement
): void {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const nodeDepths = calculateNodeDepthFromDestination(videoContext);
    const depths = Array.from(nodeDepths.values()).sort(function (a, b) {
        return b - a;
    });
    const maxDepth = depths[0];

    const xStep = w / (maxDepth + 1);

    const nodeHeight = h / videoContext._sourceNodes.length / 3;
    const nodeWidth = nodeHeight * 1.618;

    function calculateNodePos(
        node: GraphNode,
        nodeDepths: Map<GraphNode, number>,
        xStep: number,
        nodeHeight: number
    ): { x: number; y: number } {
        const depth = nodeDepths.get(node);

        let count = 0;
        for (const nodeDepth of nodeDepths) {
            if (nodeDepth[0] === node) break;
            if (nodeDepth[1] === depth) count += 1;
        }
        return {
            x: xStep * (depth as number),
            y: nodeHeight * 1.5 * count + 50
        };
    }

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        const conn = videoContext._renderGraph.connections[i];
        const source = calculateNodePos(conn.source, nodeDepths, xStep, nodeHeight);
        const destination = calculateNodePos(conn.destination, nodeDepths, xStep, nodeHeight);
        if (source !== undefined && destination !== undefined) {
            ctx.beginPath();
            const x1 = source.x + nodeWidth / 2;
            const y1 = source.y + nodeHeight / 2;
            const x2 = destination.x + nodeWidth / 2;
            const y2 = destination.y + nodeHeight / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;

            const angle = Math.PI / 2 - Math.atan2(dx, dy);

            const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

            const midX = Math.min(x1, x2) + (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
            const midY = Math.min(y1, y2) + (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

            const testX = (Math.cos(angle + Math.PI / 2) * distance) / 1.5 + midX;
            const testY = (Math.sin(angle + Math.PI / 2) * distance) / 1.5 + midY;

            ctx.arc(testX, testY, distance / 1.2, angle - Math.PI + 0.95, angle - 0.95);

            ctx.stroke();
        }
    }

    for (const node of nodeDepths.keys()) {
        const pos = calculateNodePos(node, nodeDepths, xStep, nodeHeight);
        let color = "#AA9639";
        let text = "";
        if (node.displayName === COMPOSITINGTYPE) {
            color = "#000000";
        }
        if (node.displayName === DESTINATIONTYPE) {
            color = "#7D9F35";
            text = "Output";
        }
        if (node.displayName === VIDEOTYPE) {
            color = "#572A72";
            text = "Video";
        }
        if (node.displayName === CANVASTYPE) {
            color = "#572A72";
            text = "Canvas";
        }
        if (node.displayName === IMAGETYPE) {
            color = "#572A72";
            text = "Image";
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(pos.x, pos.y, nodeWidth, nodeHeight);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "10px Arial";
        ctx.fillText(text, pos.x + nodeWidth / 2, pos.y + nodeHeight / 2 + 2.5);
        ctx.fill();
    }

    return;
}

export interface ISigmaGraphNode {
    id: string;
    label?: string;
    x: number;
    y: number;
    size: number;
    color?: string;
    node: GraphNode;
}

export function createSigmaGraphDataFromRenderGraph(videoContext: VideoContext): {
    nodes: ISigmaGraphNode[];
    edges: Array<{ id: string; source: string; target: string }>;
} {
    function idForNode(node: GraphNode): string {
        if (videoContext._sourceNodes.indexOf(node as SourceNode) !== -1) {
            const id =
                "source " +
                node.displayName +
                " " +
                videoContext._sourceNodes.indexOf(node as SourceNode);
            return id;
        }
        const id =
            "processor " +
            node.displayName +
            " " +
            videoContext._processingNodes.indexOf(node as ProcessingNode);
        return id;
    }

    const graph = {
        nodes: [
            {
                id: idForNode(videoContext.destination),
                label: "Destination Node",
                x: 2.5,
                y: 0.5,
                size: 2,
                node: videoContext.destination as GraphNode
            }
        ] as ISigmaGraphNode[],
        edges: [] as Array<{ id: string; source: string; target: string }>
    };

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        const sourceNode = videoContext._sourceNodes[i];
        const y = i * (1.0 / videoContext._sourceNodes.length);
        graph.nodes.push({
            id: idForNode(sourceNode),
            label: "Source " + i.toString(),
            x: 0,
            y: y,
            size: 2,
            color: "#572A72",
            node: sourceNode
        });
    }
    for (let i = 0; i < videoContext._processingNodes.length; i++) {
        const processingNode = videoContext._processingNodes[i];
        graph.nodes.push({
            id: idForNode(processingNode),
            x: Math.random() * 2.5,
            y: Math.random(),
            size: 2,
            node: processingNode
        });
    }

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        const conn = videoContext._renderGraph.connections[i];
        graph.edges.push({
            id: "e" + i.toString(),
            source: idForNode(conn.source),
            target: idForNode(conn.destination)
        });
    }

    return graph;
}

export interface IEDLClip {
    type: string;
    src: string;
    start: number;
    duration: number;
    sourceStart?: number;
}

export function importSimpleEDL(ctx: VideoContext, playlist: IEDLClip[]) {
    // Create a "track" node to connect all the clips to.
    const trackNode = ctx.compositor(DEFINITIONS.COMBINE);

    // Create a source node for each of the clips.
    for (const clip of playlist) {
        let node;
        if (clip.type === "video") {
            node = ctx.video(clip.src, clip.sourceStart);
        } else if (clip.type === "image") {
            node = ctx.image(clip.src, clip.sourceStart);
        } else {
            console.debug(`Clip type ${clip.type} not recognised, skipping.`);
            continue;
        }
        node.startAt(clip.start);
        node.stopAt(clip.start + clip.duration);
        node.connect(trackNode);
    }
    return trackNode;
}

export function visualiseVideoContextTimeline(
    videoContext: VideoContext,
    canvas: HTMLCanvasElement,
    currentTime: number
): void {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const w = canvas.width;
    const h = canvas.height;
    const trackHeight = h / videoContext._sourceNodes.length;
    let playlistDuration = videoContext.duration;

    if (currentTime > playlistDuration && !videoContext.endOnLastSourceEnd)
        playlistDuration = currentTime;

    if (videoContext.duration === Infinity) {
        let total = 0;
        for (let i = 0; i < videoContext._sourceNodes.length; i++) {
            const sourceNode = videoContext._sourceNodes[i];
            if (sourceNode._stopTime !== Infinity) total += sourceNode._stopTime;
        }

        if (total > videoContext.currentTime) {
            playlistDuration = total + 5;
        } else {
            playlistDuration = videoContext.currentTime + 5;
        }
    }
    const pixelsPerSecond = w / playlistDuration;
    const mediaSourceStyle = {
        video: ["#572A72", "#3C1255"],
        image: ["#7D9F35", "#577714"],
        canvas: ["#AA9639", "#806D15"]
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#999";

    for (const node of videoContext._processingNodes) {
        if (node.displayName !== TRANSITIONTYPE) continue;
        const transitions = (node as TransitionNode)._transitions;
        for (const propertyName in transitions) {
            for (const transition of transitions[propertyName]) {
                const tW = (transition.end - transition.start) * pixelsPerSecond;
                const tH = h;
                const tX = transition.start * pixelsPerSecond;
                const tY = 0;
                ctx.fillStyle = "rgba(0,0,0, 0.3)";
                ctx.fillRect(tX, tY, tW, tH);
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        const sourceNode = videoContext._sourceNodes[i];
        let duration = sourceNode._stopTime - sourceNode._startTime;
        if (duration === Infinity) duration = videoContext.currentTime;
        const start = sourceNode._startTime;

        const msW = duration * pixelsPerSecond;
        const msH = trackHeight;
        const msX = start * pixelsPerSecond;
        const msY = trackHeight * i;
        ctx.fillStyle = mediaSourceStyle.video[i % mediaSourceStyle.video.length];

        ctx.fillRect(msX, msY, msW, msH);
        ctx.fill();
    }

    if (currentTime !== undefined) {
        ctx.fillStyle = "#000";
        ctx.fillRect(currentTime * pixelsPerSecond, 0, 1, h);
    }
}

interface IUpdateable {
    _update(dt: number): void;
}

export class UpdateablesManager {
    _updateables: IUpdateable[];
    _useWebworker: boolean;
    _active: boolean;
    _previousRAFTime: number | undefined;
    _previousWorkerTime: number | undefined;
    _webWorkerString: string;
    _webWorker: Worker | undefined;

    constructor() {
        this._updateables = [];
        this._useWebworker = false;
        this._active = false;
        this._previousRAFTime = undefined;
        this._previousWorkerTime = undefined;

        this._webWorkerString =
            "\
            var running = false;\
            function tick(){\
                postMessage(Date.now());\
                if (running){\
                    setTimeout(tick, 1000/20);\
                }\
            }\
            self.addEventListener('message',function(msg){\
                var data = msg.data;\
                if (data === 'start'){\
                    running = true;\
                    tick();\
                }\
                if (data === 'stop') running = false;\
            });";
        this._webWorker = undefined;
    }

    _initWebWorker(): void {
        window.URL = window.URL || window.webkitURL;
        const blob = new Blob([this._webWorkerString], {
            type: "application/javascript"
        });
        this._webWorker = new Worker(URL.createObjectURL(blob));
        this._webWorker.onmessage = msg => {
            const time = msg.data;
            this._updateWorkerTime(time);
        };
    }

    _lostVisibility(): void {
        this._previousWorkerTime = Date.now();
        this._useWebworker = true;
        if (!this._webWorker) {
            this._initWebWorker();
        }
        this._webWorker?.postMessage("start");
    }

    _gainedVisibility(): void {
        this._useWebworker = false;
        this._previousRAFTime = undefined;
        if (this._webWorker) this._webWorker.postMessage("stop");
        requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _init(): void {
        //The webworker keeps updates ticking while the page is hidden, but it's only an
        //enhancement; the rAF update loop must start regardless of Worker support.
        if (window.Worker) {
            if (typeof document.hidden !== "undefined") {
                //use the visibility API to do the lose/gain focus properly
                document.addEventListener(
                    "visibilitychange",
                    () => {
                        if (document.hidden === true) {
                            this._lostVisibility();
                        } else {
                            this._gainedVisibility();
                        }
                    },
                    false
                );
            } else {
                //If page visibility API not present fallback to using "focus" and "blur" event listeners.
                window.addEventListener("focus", this._gainedVisibility.bind(this));
                window.addEventListener("blur", this._lostVisibility.bind(this));
            }
        }

        if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(this._updateRAFTime.bind(this));
        }
    }

    _updateWorkerTime(time: number): void {
        const dt = (time - (this._previousWorkerTime as number)) / 1000;
        if (dt !== 0) this._update(dt);
        this._previousWorkerTime = time;
    }

    _updateRAFTime(time: number): void {
        if (this._previousRAFTime === undefined) this._previousRAFTime = time;
        const dt = (time - this._previousRAFTime) / 1000;
        if (dt !== 0) this._update(dt);
        this._previousRAFTime = time;
        if (!this._useWebworker) requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _update(dt: number): void {
        for (let i = 0; i < this._updateables.length; i++) {
            this._updateables[i]._update(dt);
        }
    }

    register(updateable: IUpdateable): void {
        this._updateables.push(updateable);
        if (this._active === false) {
            this._active = true;
            this._init();
        }
    }

    unregister(updateable: IUpdateable): boolean {
        const index = this._updateables.indexOf(updateable);
        if (index === -1) return false;
        this._updateables.splice(index, 1);
        return true;
    }
}

export function mediaElementHasSource({
    src,
    srcObject
}: {
    src?: string;
    srcObject?: unknown;
}): boolean {
    return !((src === "" || src === undefined) && srcObject == null);
}
