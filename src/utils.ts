//Matthew Shotton, R&D User Experience,© BBC 2015
import DEFINITIONS from "./Definitions/definitions";
import SourceNode, { SOURCENODESTATE } from "./SourceNodes/sourcenode";
import { VIDEOTYPE } from "./SourceNodes/videonode";
import { CANVASTYPE } from "./SourceNodes/canvasnode";
import { IMAGETYPE } from "./SourceNodes/imagenode";
import { DESTINATIONTYPE } from "./DestinationNode/destinationnode";
import TransitionNode, { TRANSITIONTYPE } from "./ProcessingNodes/transitionnode";
import { COMPOSITINGTYPE } from "./ProcessingNodes/compositingnode";
import VideoContext from "./videocontext";
import GraphNode from "./graphnode";
import MediaNode from "./SourceNodes/medianode";
import ProcessingNode from "./ProcessingNodes/processingnode";

/*
 * Utility function to compile a WebGL Vertex or Fragment shader.
 *
 * @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
 * @param {String} shaderSource - A string of shader code to compile.
 * @param {number} shaderType - Shader type, either WebGLRenderingContext.VERTEX_SHADER or WebGLRenderingContext.FRAGMENT_SHADER.
 *
 * @return {WebGLShader} A compiled shader.
 *
 */
export function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
    let shader = gl.createShader(shaderType)!;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}

/*
 * Create a shader program from a passed vertex and fragment shader source string.
 *
 * @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
 * @param {WebGLShader} vertexShader - A compiled vertex shader.
 * @param {WebGLShader} fragmentShader - A compiled fragment shader.
 *
 * @return {WebGLProgram} A compiled & linkde shader program.
 */
export function createShaderProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
) {
    let program = gl.createProgram()!;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw {
            error: 4,
            msg: "Can't link shader program for track",
            toString: function () {
                return this.msg;
            }
        };
    }
    return program;
}

export function createElementTexture(gl: WebGLRenderingContext) {
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

export function updateTexture(
    gl: WebGLRenderingContext,
    texture: WebGLTexture,
    element: HTMLImageElement | ImageBitmap | HTMLCanvasElement | HTMLVideoElement
) {
    if (
        (element as HTMLMediaElement).readyState !== undefined &&
        (element as HTMLMediaElement).readyState === 0
    )
        return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);

    texture._isTextureCleared = false;
}

export function clearTexture(gl: WebGLRenderingContext, texture: WebGLTexture) {
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

export function generateRandomId() {
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

    function randomChoice<T>(array: T[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function capitalize(word: string): string {
        word = word.replace(/\b\w/g, (l) => l.toUpperCase());
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

export function exportToJSON(vc: VideoContext) {
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

let warningExportSourceLogged = false;
function snapshotNodes(vc: VideoContext) {
    function qualifyURL(url: string): string {
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    }

    function getInputIDs(node: GraphNode, vc: VideoContext) {
        let inputs: Array<{ id: string | undefined; index: number }> = [];
        for (let input of node.inputs) {
            if (input === undefined) continue;
            let inputID;
            let inputIndex = node.inputs.indexOf(input);
            let index = vc._processingNodes.indexOf(input as ProcessingNode);
            if (index > -1) {
                inputID = "processor" + index;
            } else {
                let index = vc._sourceNodes.indexOf(input as SourceNode);
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

    let result: Record<string, any> = {};

    let sourceNodeStateMapping = [];
    for (let state in SOURCENODESTATE) {
        sourceNodeStateMapping[SOURCENODESTATE[state as keyof typeof SOURCENODESTATE]] = state;
    }

    for (let index in vc._sourceNodes) {
        let source = vc._sourceNodes[index];
        let id = "source" + index;
        let node_url = "";

        if (!source._isResponsibleForElementLifeCycle) {
            if (!warningExportSourceLogged) {
                console.debug(
                    "Warning - Trying to export source created from an element not a URL. URL of export will be set to the elements src attribute and may be incorrect",
                    source
                );
                warningExportSourceLogged = true;
            }
            node_url = (source.element as HTMLImageElement)!.src;
        } else {
            node_url = qualifyURL(source._elementURL as string);
        }

        let node = {
            type: source.displayName,
            url: node_url,
            start: source.startTime,
            stop: source.stopTime,
            state: sourceNodeStateMapping[source.state],
            currentTime: undefined as null | undefined | number,
            sourceOffset: undefined as undefined | number
        };
        if (node.type === VIDEOTYPE) {
            node.currentTime = null;
            if (source.element && (source.element as HTMLVideoElement).currentTime) {
                node.currentTime = (source.element as HTMLVideoElement).currentTime;
            }
        }

        if ((source as MediaNode)._sourceOffset) {
            node.sourceOffset = (source as MediaNode)._sourceOffset;
        }
        result[id] = node;
    }

    for (let index in vc._processingNodes) {
        let processor = vc._processingNodes[index];
        let id = "processor" + index;
        let node = {
            type: processor.displayName,
            definition: processor._definition,
            inputs: getInputIDs(processor, vc),
            properties: {} as Record<string, any>,
            transitions: undefined as TransitionNode["_transitions"] | undefined
        };

        for (let property in node.definition.properties) {
            node.properties[property] = (processor as any)[property];
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

export function createControlFormForNode(node: ProcessingNode, nodeName?: string) {
    let rootDiv = document.createElement("div");

    if (nodeName !== undefined) {
        var title = document.createElement("h2");
        title.innerHTML = nodeName;
        rootDiv.appendChild(title);
    }

    for (let propertyName in node._properties) {
        let propertyParagraph = document.createElement("p");
        let propertyTitleHeader = document.createElement("h3");
        propertyTitleHeader.innerHTML = propertyName;
        propertyParagraph.appendChild(propertyTitleHeader);

        let propertyValue = node._properties[propertyName].value;
        if (typeof propertyValue === "number") {
            let range = document.createElement("input");
            range.setAttribute("type", "range");
            range.setAttribute("min", "0");
            range.setAttribute("max", "1");
            range.setAttribute("step", "0.01");
            range.setAttribute("value", propertyValue.toString());

            let number = document.createElement("input");
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
                    (node as any)[propertyName] = parseFloat(range.value);
                    number.value = range.value;
                }
            };
            range.onchange = function () {
                (node as any)[propertyName] = parseFloat(range.value);
                number.value = range.value;
            };
            number.onchange = function () {
                (node as any)[propertyName] = parseFloat(number.value);
                range.value = number.value;
            };
            propertyParagraph.appendChild(range);
            propertyParagraph.appendChild(number);
        } else if (Object.prototype.toString.call(propertyValue) === "[object Array]") {
            for (var i = 0; i < propertyValue.length; i++) {
                let range = document.createElement("input");
                range.setAttribute("type", "range");
                range.setAttribute("min", "0");
                range.setAttribute("max", "1");
                range.setAttribute("step", "0.01");
                range.setAttribute("value", propertyValue[i]);

                let number = document.createElement("input");
                number.setAttribute("type", "number");
                number.setAttribute("min", "0");
                number.setAttribute("max", "1");
                number.setAttribute("step", "0.01");
                number.setAttribute("value", propertyValue);

                let index = i;
                let mouseDown = false;
                range.onmousedown = function () {
                    mouseDown = true;
                };
                range.onmouseup = function () {
                    mouseDown = false;
                };
                range.onmousemove = function () {
                    if (mouseDown) {
                        (node as any)[propertyName][index] = parseFloat(range.value);
                        number.value = range.value;
                    }
                };
                range.onchange = function () {
                    (node as any)[propertyName][index] = parseFloat(range.value);
                    number.value = range.value;
                };

                number.onchange = function () {
                    (node as any)[propertyName][index] = parseFloat(number.value);
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

function calculateNodeDepthFromDestination(videoContext: VideoContext) {
    let destination = videoContext.destination;
    let depthMap = new Map<GraphNode, number>();
    depthMap.set(destination, 0);

    function itterateBackwards(node: GraphNode, depth = 0) {
        for (let n of node.inputs) {
            let d = depth + 1;
            if (depthMap.has(n)) {
                if (d > depthMap.get(n)!) {
                    depthMap.set(n, d);
                }
            } else {
                depthMap.set(n, d);
            }
            itterateBackwards(n, depthMap.get(n));
        }
    }

    itterateBackwards(destination);
    return depthMap;
}

export function visualiseVideoContextGraph(videoContext: VideoContext, canvas: HTMLCanvasElement) {
    let ctx = canvas.getContext("2d")!;
    let w = canvas.width;
    let h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    let nodeDepths = calculateNodeDepthFromDestination(videoContext);
    const depths = Array.from(nodeDepths.values()).sort(function (a, b) {
        return b - a;
    });
    let maxDepth = depths[0];

    let xStep = w / (maxDepth + 1);

    let nodeHeight = h / videoContext._sourceNodes.length / 3;
    let nodeWidth = nodeHeight * 1.618;

    function calculateNodePos(
        node: GraphNode,
        nodeDepths: Map<GraphNode, number>,
        xStep: number,
        nodeHeight: number
    ) {
        let depth = nodeDepths.get(node);
        nodeDepths.values();

        let count = 0;
        for (let nodeDepth of nodeDepths) {
            if (nodeDepth[0] === node) break;
            if (nodeDepth[1] === depth) count += 1;
        }
        return {
            x: xStep * nodeDepths.get(node)!,
            y: nodeHeight * 1.5 * count + 50
        };
    }

    // "video":["#572A72", "#3C1255"],
    // "image":["#7D9F35", "#577714"],
    // "canvas":["#AA9639", "#806D15"]

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        let conn = videoContext._renderGraph.connections[i];
        let source = calculateNodePos(conn.source, nodeDepths, xStep, nodeHeight);
        let destination = calculateNodePos(conn.destination, nodeDepths, xStep, nodeHeight);
        if (source !== undefined && destination !== undefined) {
            ctx.beginPath();
            //ctx.moveTo(source.x + nodeWidth/2, source.y + nodeHeight/2);
            let x1 = source.x + nodeWidth / 2;
            let y1 = source.y + nodeHeight / 2;
            let x2 = destination.x + nodeWidth / 2;
            let y2 = destination.y + nodeHeight / 2;
            let dx = x2 - x1;
            let dy = y2 - y1;

            let angle = Math.PI / 2 - Math.atan2(dx, dy);

            let distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

            let midX = Math.min(x1, x2) + (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
            let midY = Math.min(y1, y2) + (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

            let testX = (Math.cos(angle + Math.PI / 2) * distance) / 1.5 + midX;
            let testY = (Math.sin(angle + Math.PI / 2) * distance) / 1.5 + midY;
            // console.log(testX, testY);

            ctx.arc(testX, testY, distance / 1.2, angle - Math.PI + 0.95, angle - 0.95);

            //ctx.arcTo(source.x + nodeWidth/2 ,source.y + nodeHeight/2,destination.x + nodeWidth/2,destination.y + nodeHeight/2,100);
            //ctx.lineTo(midX, midY);
            ctx.stroke();
            //ctx.endPath();
        }
    }

    for (let node of nodeDepths.keys()) {
        let pos = calculateNodePos(node, nodeDepths, xStep, nodeHeight);
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

export function createSigmaGraphDataFromRenderGraph(videoContext: VideoContext) {
    function idForNode(node: GraphNode) {
        if (videoContext._sourceNodes.indexOf(node as SourceNode) !== -1) {
            let id =
                "source " +
                node.displayName +
                " " +
                videoContext._sourceNodes.indexOf(node as SourceNode);
            return id;
        }
        let id =
            "processor " +
            node.displayName +
            " " +
            videoContext._processingNodes.indexOf(node as ProcessingNode);
        return id;
    }

    let graph = {
        nodes: [
            {
                id: idForNode(videoContext.destination),
                label: "Destination Node",
                x: 2.5,
                y: 0.5,
                size: 2,
                node: videoContext.destination
            }
        ],
        edges: [] as Array<{ id: string; source: string; target: string }>
    };

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        let sourceNode = videoContext._sourceNodes[i];
        let y = i * (1.0 / videoContext._sourceNodes.length);
        graph.nodes.push({
            id: idForNode(sourceNode),
            label: "Source " + i.toString(),
            x: 0,
            y: y,
            size: 2,
            color: "#572A72",
            node: sourceNode
        } as any);
    }
    for (let i = 0; i < videoContext._processingNodes.length; i++) {
        let processingNode = videoContext._processingNodes[i];
        graph.nodes.push({
            id: idForNode(processingNode),
            x: Math.random() * 2.5,
            y: Math.random(),
            size: 2,
            node: processingNode
        } as any);
    }

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        let conn = videoContext._renderGraph.connections[i];
        graph.edges.push({
            id: "e" + i.toString(),
            source: idForNode(conn.source),
            target: idForNode(conn.destination)
        });
    }

    return graph;
}

export function importSimpleEDL(
    ctx: VideoContext,
    playlist: Array<{
        type: "video" | "image";
        sourceStart: number;
        start: number;
        duration: number;
        src: any;
    }>
) {
    // Create a "track" node to connect all the clips to.
    let trackNode = ctx.compositor(DEFINITIONS.COMBINE);

    // Create a source node for each of the clips.
    for (let clip of playlist) {
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
) {
    let ctx = canvas.getContext("2d")!;
    let w = canvas.width;
    let h = canvas.height;
    let trackHeight = h / videoContext._sourceNodes.length;
    let playlistDuration = videoContext.duration;

    // FIXME: spelling
    if (currentTime > playlistDuration && !videoContext._endOnLastSourceEnd)
        playlistDuration = currentTime;

    if (videoContext.duration === Infinity) {
        let total = 0;
        for (let i = 0; i < videoContext._sourceNodes.length; i++) {
            let sourceNode = videoContext._sourceNodes[i];
            if (sourceNode._stopTime !== Infinity) total += sourceNode._stopTime;
        }

        if (total > videoContext.currentTime) {
            playlistDuration = total + 5;
        } else {
            playlistDuration = videoContext.currentTime + 5;
        }
    }
    let pixelsPerSecond = w / playlistDuration;
    let mediaSourceStyle = {
        video: ["#572A72", "#3C1255"],
        image: ["#7D9F35", "#577714"],
        canvas: ["#AA9639", "#806D15"]
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#999";

    for (let node of videoContext._processingNodes) {
        if (node.displayName !== TRANSITIONTYPE) continue;
        for (let propertyName in (node as TransitionNode)._transitions) {
            for (let transition of (node as TransitionNode)._transitions[propertyName]) {
                let tW = (transition.end - transition.start) * pixelsPerSecond;
                let tH = h;
                let tX = transition.start * pixelsPerSecond;
                let tY = 0;
                ctx.fillStyle = "rgba(0,0,0, 0.3)";
                ctx.fillRect(tX, tY, tW, tH);
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        let sourceNode = videoContext._sourceNodes[i];
        let duration = sourceNode._stopTime - sourceNode._startTime;
        if (duration === Infinity) duration = videoContext.currentTime;
        let start = sourceNode._startTime;

        let msW = duration * pixelsPerSecond;
        let msH = trackHeight;
        let msX = start * pixelsPerSecond;
        let msY = trackHeight * i;
        ctx.fillStyle = mediaSourceStyle.video[i % mediaSourceStyle.video.length];

        ctx.fillRect(msX, msY, msW, msH);
        ctx.fill();
    }

    if (currentTime !== undefined) {
        ctx.fillStyle = "#000";
        ctx.fillRect(currentTime * pixelsPerSecond, 0, 1, h);
    }
}

interface Updatable {
    _update(time: number): void;
}

export class UpdateablesManager {
    _updateables: Updatable[];
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

    _initWebWorker() {
        window.URL = window.URL || window.webkitURL;
        let blob = new Blob([this._webWorkerString], {
            type: "application/javascript"
        });
        this._webWorker = new Worker(URL.createObjectURL(blob));
        this._webWorker.onmessage = (msg) => {
            let time = msg.data;
            this._updateWorkerTime(time);
        };
    }

    _lostVisibility() {
        this._previousWorkerTime = Date.now();
        this._useWebworker = true;
        if (!this._webWorker) {
            this._initWebWorker();
        }
        this._webWorker!.postMessage("start");
    }

    _gainedVisibility() {
        this._useWebworker = false;
        this._previousRAFTime = undefined;
        if (this._webWorker) this._webWorker.postMessage("stop");
        requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _init() {
        if (!window.Worker) return;

        //If page visibility API not present fallback to using "focus" and "blur" event listeners.
        if (typeof document.hidden === "undefined") {
            window.addEventListener("focus", this._gainedVisibility.bind(this));
            window.addEventListener("blur", this._lostVisibility.bind(this));
            return;
        }
        //Otherwise we can use the visibility API to do the loose/gain focus properly
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

        requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _updateWorkerTime(time: number) {
        let dt = (time - this._previousWorkerTime!) / 1000;
        if (dt !== 0) this._update(dt);
        this._previousWorkerTime = time;
    }

    _updateRAFTime(time: number) {
        if (this._previousRAFTime === undefined) this._previousRAFTime = time;
        let dt = (time - this._previousRAFTime!) / 1000;
        if (dt !== 0) this._update(dt);
        this._previousRAFTime = time;
        if (!this._useWebworker) requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _update(dt: number) {
        for (let i = 0; i < this._updateables.length; i++) {
            this._updateables[i]._update(parseFloat(dt as any));
        }
    }

    register(updateable: Updatable) {
        this._updateables.push(updateable);
        if (this._active === false) {
            this._active = true;
            this._init();
        }
    }
}

export function mediaElementHasSource({ src, srcObject }: { src: any; srcObject: any }) {
    return !((src === "" || src === undefined) && srcObject == null);
}
