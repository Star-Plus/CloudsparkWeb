import type ITask from "./ITask";

export default class ProgressingTask implements ITask {
    public action: string;
    public progress: number;
    public total: number;

    constructor(action: string, progress: number, total: number) {
        this.action = action;
        this.progress = progress;
        this.total = total;
    }

    public isDone(): boolean {
        return this.progress >= this.total;
    }

    public increment(amount: number): void {
        this.progress += amount;
    }

    public reset(): void {
        this.progress = 0;
    }
}