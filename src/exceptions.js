//Matthew Shotton, R&D User Experince,© BBC 2015
export function ConnectException(message){
    this.message = message;
    this.name = "ConnectionException";
}

export function RenderException(message){
    this.message = message;
    this.name = "RenderException";
}
