import type { AxiosInstance } from "axios"

export default class UploadAgent {
    
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    public uploadFile(src: string, dest: string) {
        throw new Error("Method not implemented.");
    }

    private checkRepositoryAvailability() : boolean {
        throw new Error("Method not implemented.");
    }

    private createRepository() : boolean {
        throw new Error("Method not implemented.");
    }

    private ghostStage(repoPath: string, filepath: string) {
        throw new Error("Method not implemented.");
    }

    private switchBranch(repoPath: string, branch: string) {
        throw new Error("Method not implemented.");
    }

    private commit(repoPath: string) {
        throw new Error("Method not implemented.");
    }

    private push(repoPath: string, branch: string) {
        throw new Error("Method not implemented.");
    }
}