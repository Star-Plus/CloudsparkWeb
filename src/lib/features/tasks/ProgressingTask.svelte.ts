import type ITask from "./ITask";

export default class ProgressingTask implements ITask {
    public action: string;
    public progress = $state(0);
    public total: number;

    constructor(action: string, total: number) {
        this.action = action;
        this.total = total;
    }

    public isDone(): boolean {
        return this.progress >= this.total;
    }

    public increment(amount: number): void {
        this.progress += amount;
    }

    public update(progress: number): void {
        this.progress = progress;
    }

    public reset(): void {
        this.progress = 0;
    }
}