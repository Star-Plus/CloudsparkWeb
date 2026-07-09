import type { AxiosInstance } from "axios"

export default class UploadAgent {
    
    private api: AxiosInstance;
    private socket: WebSocket;

    constructor(api: AxiosInstance, socketUrl: string) {
        this.api = api;
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = this.handleOnSocketOpen.bind(this);
        this.socket.onclose = this.handleOnClose.bind(this);
        this.socket.onerror = this.handleOnError.bind(this);
        this.socket.onmessage = this.handleOnMessage.bind(this);
    }

    public async uploadFile(src: string, dest: string) {
        try {
            const repoPath = dest.split("/").slice(0, 2).join("/");
            
            if (!await this.checkRepositoryAvailability(repoPath)) {
                await this.createRepository(repoPath);
            }
            
            await this.ghostStage(src, dest);
            await this.switchBranch(src, dest);
            await this.commit(src);
            await this.push(src, dest);
        }
        catch (err) {
            console.error(err);
        }
    }

    private async checkRepositoryAvailability(repoPath: string) : Promise<boolean> {
        const resp = await this.api.get(`/exists/${repoPath}`);
        if (resp.status == 404) return false;
        if (resp.status !== 200) throw new Error(resp.data);

        return true;
    }

    private async createRepository(repoPath: string) {
        const resp = await this.api.post(`/initialize/repository/${repoPath}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async ghostStage(repoPath: string, filepath: string) {
        const resp = await this.api.post(`/${repoPath}/ghostStage?filepath=${filepath}`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async switchBranch(repoPath: string, branch: string) {
        const resp = await this.api.put(`/${repoPath}/switch?branch=${branch}?worldEffect=false`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async commit(repoPath: string) {
        const resp = await this.api.post(`/${repoPath}/commit`);
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

    private handleOnSocketOpen(event: Event) {
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