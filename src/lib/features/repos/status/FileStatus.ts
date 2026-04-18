import type FILE_STATUS from "./STATUS";

export default class FileStatus {
    name: string;
    status: FILE_STATUS;

    constructor(name: string, status: FILE_STATUS) {
        this.name = name;
        this.status = status;
    }
}