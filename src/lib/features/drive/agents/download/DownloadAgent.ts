import type AuthService from "$lib/features/auth/AuthService";
import BoxTask from "$lib/features/tasks/BoxTask.svelte";
import ConfirmableTask from "$lib/features/tasks/ConfirmableTask.svelte";
import ProgressingTask from "$lib/features/tasks/ProgressingTask.svelte";
import TaskManager from "$lib/features/tasks/TaskManager.svelte";
import type { AxiosInstance } from "axios";

export default class DownloadAgent {

    private api: AxiosInstance;
    private authService: AuthService;
    private socketBaseUrl?: string;
    private vcsUrl?: string;

    constructor(api: AxiosInstance, authService: AuthService, socketUrl?: string, vcsUrl?: string) {
        this.api = api;
        this.authService = authService;
        this.socketBaseUrl = socketUrl;
        this.vcsUrl = vcsUrl;
    }

    async openSaveFileDialog(filename: string) : Promise<string> {
        try {
            const resp = await this.api.get("/fs/saveFile", { params: { filename }});
            if (resp.status !== 200) throw new Error(resp.data);

            return resp.data;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    async download(filepath: string, destination: string) : Promise<void> {
        try {
            const repoPath = filepath.split("/").slice(0, 2).join("/");

            const remoteUrl = this.vcsUrl + "/api/" + repoPath;
            await this.login();
            await this.createRepository(repoPath, remoteUrl);

            const relativePath = filepath.split("/").slice(2).filter(p => p !== "").join("/");

            await this.switchBranch(repoPath, relativePath);
            
            const socket = await this.handlePullSocket(repoPath);
            await this.pull(repoPath, relativePath);
            socket?.close();

            await this.copy(`$vault-home/${repoPath}/${relativePath}`, destination);
            await this.prepareAsset(repoPath, `$vault-home/${repoPath}/${relativePath}`, relativePath);

            await this.wash(repoPath);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    public handlePullSocket(repoPath: string): Promise<WebSocket | null> {
        if (!this.socketBaseUrl) return Promise.resolve(null);

        return new Promise((resolve, reject) => {
            const url = `${this.socketBaseUrl}/pull?repo=${encodeURIComponent(repoPath)}`;
            const socket = new WebSocket(url);
    
            const taskManager = TaskManager.getInstance();
            const boxTask = new BoxTask(`Pulling ${repoPath} from ${this.vcsUrl}`);
    
            let isConnected = false;
    
            socket.onopen = () => {
                console.log("Pull socket opened");
                boxTask.open();
                taskManager.addTask(boxTask);
            }
            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case "connected": {
                            if (!isConnected) {
                                isConnected = true;
                                resolve(socket);
                            }
                            break;
                        }
                        case "task": {
                            switch (data.taskType) {
                                case "progressing": {
                                    const total = data.params?.total || 0;
                                    boxTask.addSubtask(new ProgressingTask(data.action, total));
                                    break;
                                }
                                case "confirmation": {
                                    boxTask.addSubtask(new ConfirmableTask(data.action));
                                    break;
                                }
                                default: {
                                    console.error("Unknown task type:", data.taskType);
                                    break;
                                }
                            }
                            break;
                        }
                        case "forward": {
                            const task = boxTask.findSubtask(data.action);
                            if (task instanceof ConfirmableTask) {
                                task.confirm();
                            }
                            else if (task instanceof ProgressingTask) {
                                task.progress = data.current;
                            }
                            else {
                                console.error("Unknown task:", task);
                            }
                            break;
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            };
            socket.onerror = (event) => console.error("Pull socket error:", event);
            socket.onclose = (event) => {
                console.log("Pull socket closed:", event);
                boxTask.close();
                if (!isConnected) {
                    reject(new Error("Pull socket closed"));
                }
            }
    
            return socket;
        })
    }

    private async createRepository(repoPath: string, remoteUrl: string) {
        const resp = await this.api.post(`/initialize/repository/${repoPath}`, null, {
            params: { remote: remoteUrl }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private login() {
        if (!this.authService.isAuthenticated()) throw new Error("Not logged in");
        const user = this.authService.getUser();

        return this.api.post("/login", null, {
            params: { username: user?.username, token: user?.token}
        });
    }
    
    private async switchBranch(repoPath: string, branch: string) {
        const owner = repoPath.split("/")[0];
        const resp = await this.api.put(`/${repoPath}/switch`, null, {
            params: { branch: owner + ":" + branch, worldEffect: false }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async pull(repoPath: string, filepath: string) {
        const owner = repoPath.split("/")[0];
        const resp = await this.api.post(`/${repoPath}/pull`, null, {
            params: { branch: owner + ":" + filepath }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async copy(src: string, dest: string) {
        const resp = await this.api.put("/fs/copyFile", null, {
            params: { from: src, to: dest }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async prepareAsset(repoPath: string, filepath: string, destination: string) {
        const resp = await this.api.post(`/${repoPath}/prepareAsset`, null, {
            params: { filepath, moving: true, destination }
        });
        if (resp.status !== 200) throw new Error(resp.data);
    }

    private async wash(repoPath: string) {
        const resp = await this.api.delete(`/${repoPath}/wash`);
        if (resp.status !== 200) throw new Error(resp.data);
    }

}