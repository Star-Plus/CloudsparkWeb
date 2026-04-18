export interface UploadIntentResponse {
    intentId: string;
    expiry: Date;
    uploadUrls: {name: string, url: string}[]
}

export interface FileEntry {
    name: string;
    size: number;
}

export class UploadIntentRequest {
    remoteId: string;
    files: FileEntry[];

    constructor(remoteId: string, files: FileEntry[]) {
        this.remoteId = remoteId;
        this.files = files;
    }
}