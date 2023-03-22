//Matthew Shotton, R&D User Experience,© BBC 2015
export class ConnectException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConnectException";
    }
}

export class RenderException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RenderException";
    }
}
