import type { AxiosInstance } from "axios"

export default class UploadAgent {
    
    private api: AxiosInstance;
    private socketBaseUrl?: string;

    constructor(api: AxiosInstance, socketUrl?: string) {
        this.api = api;
        this.socketBaseUrl = socketUrl;
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

            const relativePath = dest.split("/").slice(2).filter(p => p !== "").join("/");
            
            await this.switchBranch(repoPath, relativePath);
            await this.ghostStage(repoPath, src, relativePath);
            await this.commit(repoPath, `Uploading file ${relativePath} at ${new Date()}`);

            const socket = this.openPushSocket(repoPath);
            await this.push(repoPath, relativePath);
            socket?.close();

            await this.wash(repoPath);
            await this.prepareAsset(repoPath, src);
        }
        catch (err) {
            console.error(err);
        }
    }

    private openPushSocket(repoPath: string): WebSocket | null {
        if (!this.socketBaseUrl) return null;

        const url = `${this.socketBaseUrl}/?repo=${encodeURIComponent(repoPath)}`;
        const socket = new WebSocket(url);

        socket.onopen = () => console.log("Push socket opened for", repoPath);
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Push progress:", data);
            } catch (err) {
                console.error(err);
            }
        };
        socket.onerror = (event) => console.error("Push socket error:", event);
        socket.onclose = (event) => console.log("Push socket closed", event);

        return socket;
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
}