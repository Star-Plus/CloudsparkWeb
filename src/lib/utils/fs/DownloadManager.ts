import { writable } from "svelte/store";


export default class DownloadManager {
    
    private tasks = writable<LoadingTask[]>([]);
    public static instance: DownloadManager;

    private constructor() {}

    public static getInstance() {
        if (!DownloadManager.instance) {
            DownloadManager.instance = new DownloadManager();
        }
        return DownloadManager.instance;
    }

    public addTask(task: LoadingTask) {
        this.tasks.update(current => [...current, task]);
    }

    public getTasks() {
        return this.tasks;
    }

    public hasActiveTasks() {
        let hasActive = false;
        const unsubscribeTasks = this.tasks.subscribe(tasks => {
            for (const task of tasks) {
                let isDone = false;
                const unsubscribeDone = task.isDone.subscribe(v => isDone = v);
                unsubscribeDone();
                if (!isDone) {
                    hasActive = true;
                    break;
                }
            }
        });
        unsubscribeTasks();
        return hasActive;
    }
}

export class LoadingTask {

    private calcDelayMs = 100;

    url: string;
    shorten: string = "";
    savePath: string;

    public isDone = writable(false);
    public error = writable<string | null>(null);

    public isDownload: boolean = true;

    private lastNetworkComputeTime: number;
    private lastDiskComputeTime: number;
    private lastNetworkLoaded: number = 0;
    private lastDiskLoaded: number = 0;

    total = writable(0);

    constructor(url: string, savePath: string, isDownload: boolean, shorten: string = "") {
        this.url = url;
        this.savePath = savePath;
        this.isDownload = isDownload;
        this.shorten = shorten;
        this.lastNetworkComputeTime = Date.now();
        this.lastDiskComputeTime = Date.now();
    }

    progressNetwork = writable(0);
    progressDisk = writable(0);
    networkSpeedBps = writable(0);
    diskSpeedBps = writable(0);


    public updateNetworkProgress(progress: number) {
        this.progressNetwork.set(progress);

        const now = Date.now();

        if (this.lastNetworkComputeTime === 0) {
            this.lastNetworkComputeTime = now;
            this.lastNetworkLoaded = progress;
            return;
        }

        const elapsedMs = now - this.lastNetworkComputeTime;

        if (elapsedMs >= this.calcDelayMs) {
            const bytesLoadedSinceLastCompute = progress - this.lastNetworkLoaded;
            const speedBps = bytesLoadedSinceLastCompute / (elapsedMs / 1000);
            
            this.networkSpeedBps.set(speedBps);

            this.lastNetworkLoaded = progress;
            this.lastNetworkComputeTime = now;
        }
    }

    public updateDiskProgress(progress: number) {
        this.progressDisk.set(progress);

        const now = Date.now();

        if (this.lastDiskComputeTime === 0) {
            this.lastDiskComputeTime = now;
            this.lastDiskLoaded = progress;
            return;
        }

        const elapsedMs = now - this.lastDiskComputeTime;

        if (elapsedMs >= this.calcDelayMs) {
            const bytesWrittenSinceLastCompute = progress - this.lastDiskLoaded;
            const speedBps = bytesWrittenSinceLastCompute / (elapsedMs / 1000);
            
            this.diskSpeedBps.set(speedBps);

            this.lastDiskLoaded = progress;
            this.lastDiskComputeTime = now;
        }
    }

    public finish() {
        this.isDone.set(true);
    }

    public fail(error: Error | string) {
        this.error.set(typeof error === "string" ? error : error.message);
    }

}