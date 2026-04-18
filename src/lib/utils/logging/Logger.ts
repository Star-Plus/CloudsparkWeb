import { logStore } from "./logStore";
import LogUnit from "./LogUnit";
import LOG_TYPE from "./LOG_TYPE";

export default class Logger {

    
    public static log(message: string, type: LOG_TYPE = LOG_TYPE.DEBUG): void {
        let source = "unknown";
        
        try {
            const err = new Error();
            if (err.stack) {
                const stackLines = err.stack.split("\n")
                const callerLine = stackLines[2] || "";
                const match = callerLine.match(/\((.*):\d+:\d+\)$/);
                if (match) {
                    source = match[1].split("/").pop()?.split("?")[0] || "unknown";
                }
            }
        } catch (e) {
            // Silently fail source detection
        }

        const logUnit = new LogUnit(message, type, source);
        
        
        // Force update by creating a new array reference
        logStore.update(logs => {
            const newLogs = [...logs, logUnit];
            return newLogs;
        });
    }

    public static info(message: string): void {
        this.log(message, LOG_TYPE.INFO);
    }

    public static warn(message: string): void {
        this.log(message, LOG_TYPE.WARN);
    }

    public static error(message: string): void {
        this.log(message, LOG_TYPE.ERROR);
    }

    public static debug(message: string): void {
        this.log(message, LOG_TYPE.DEBUG);
    }

}