//Matthew Shotton, R&D User Experience,© BBC 2015

/*
 * Error subclasses thrown by VideoContext. These are real `Error`s (with stack
 * traces) — safe as native classes now that browser targets all support ES2015.
 */
export class ConnectException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConnectionException";
    }
}

export class RenderException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RenderException";
    }
}
