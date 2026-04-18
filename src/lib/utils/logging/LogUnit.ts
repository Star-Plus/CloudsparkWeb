import type LOG_TYPE from "./LOG_TYPE";

export default class LogUnit {

    message: string;
    type: LOG_TYPE;

    constructor(message: string, type: LOG_TYPE, source?: string) {
        this.message = `[${new Date().toUTCString().replace("GMT", "")}] [${source}] ${message}`;
        this.type = type;
    }

}