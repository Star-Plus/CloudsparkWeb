import type { AxiosInstance } from "axios"

export default class UploadAgent {
    
    private api: AxiosInstance;
    private socket: WebSocket | null = null;

    constructor(api: AxiosInstance, socketUrl?: string) {
        this.api = api;

        if (socketUrl) {
            this.socket = new WebSocket(socketUrl);

            this.socket.onopen = this.handleOnSocketOpen.bind(this);
            this.socket.onclose = this.handleOnClose.bind(this);
            this.socket.onerror = this.handleOnError.bind(this);
            this.socket.onmessage = this.handleOnMessage.bind(this);
        }
    }

    public async openPickDialog() : Promise<string> {
        try {
            const resp = await this.api.get("/fs/pickFile");
            if (resp.status !== 200) throw new Error(resp.data);

            return resp.data;
        }
        catch (err) {
            console.error(err);
            return "";
        }
    }

    public async uploadFile(src: string, dest: string) {
        try {
            const repoPath = dest.split("/").slice(0, 2).join("/");
            
            const remoteUrl = import.meta.env.VITE_VCS_API_URL + "/api/" + repoPath;
            await this.createRepository(repoPath, remoteUrl);

            const relativeFilePath = dest.split("/").slice(2).join("/");
            
            await this.ghostStage(repoPath, src, relativeFilePath);
            await this.switchBranch(repoPath, relativeFilePath);
            await this.commit(repoPath, `Uploading file ${relativeFilePath} at ${new Date()}`);
            await this.push(repoPath, relativeFilePath);
            await this.wash(repoPath);
            await this.prepareAsset(repoPath, src);
        }
        catch (err) {
            console.error(err);
        }
    }

    private async checkRepositoryAvailability(repoPath: string) : Promise<boolean> {
        try {
            const resp = await this.api.get(`/exists/${repoPath}`);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    private async createRepository(repoPath: string, remoteUrl: string) {
        const resp = await this.api.post(`/initialize/repository/${repoPath}?remote=${remoteUrl}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async ghostStage(repoPath: string, filepath: string, ghostName: string) {
        const resp = await this.api.post(`/${repoPath}/ghostStage?filepath=${filepath}&ghostName=${ghostName}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async switchBranch(repoPath: string, branch: string) {
        const resp = await this.api.put(`/${repoPath}/switch?branch=${branch}&worldEffect=false`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async commit(repoPath: string, message?: string) {
        const resp = await this.api.post(`/${repoPath}/commit?message=${message}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async push(repoPath: string, branch: string) {
        const resp = await this.api.post(`/${repoPath}/push?branch=${branch}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async wash(repoPath: string) {
        const resp = await this.api.delete(`/${repoPath}/wash`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async prepareAsset(repoPath: string, filepath: string) {
        const resp = await this.api.post(`/${repoPath}/prepareAsset?filepath=${filepath}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private handleOnSocketOpen(event: Event) {
        if (!this.socket) return;
        
        console.log('Socket opened');
        const payload = JSON.stringify({action: 'greet', message: 'Hello from the client!'});
        this.socket.send(payload);
    }

    private handleOnMessage(event: MessageEvent) {
        try {
            const data = JSON.parse(event.data);
            console.log("Mesasge received from server", data);
        }
        catch (err) {
            console.error(err);
        }
    }

    private handleOnError(event: Event) {
        console.error("WebSocket error observed:", event);
    }

    private handleOnClose(event: CloseEvent) {
        console.log("WebSocket closed", event);
    }
}