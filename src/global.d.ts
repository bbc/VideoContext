interface Window {
    __VIDEOCONTEXT_REFS__?: Record<string, import("./videocontext").default | undefined>;
}

interface WebGLTexture {
    _isTextureCleared?: boolean;
}

declare module "*.frag" {
    const content: string;
    export default content;
}

declare module "*.vert" {
    const content: string;
    export default content;
}
