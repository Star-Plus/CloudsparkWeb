import type ITask from "./ITask";

export default class BoxTask implements ITask {
    action: string;
    closed = $state<boolean>(false);
    subtasks = $state<ITask[]>([]);
    error = $state<Error | null>(null);

    constructor(action: string, subtasks: ITask[] = []) {
        this.action = action;
        this.subtasks = subtasks;
    }

    addSubtask(task: ITask) {
        this.subtasks = [...this.subtasks, task];
    }

    findSubtask(action: string): ITask | undefined {
        return this.subtasks.find((c) => c.action === action);
    }

    close() { 
        this.closed = true;
        this.subtasks = [];
    }

    open() {
        this.closed = false;
    }

    isDone(): boolean {
        return this.closed && this.subtasks.every(subtask => subtask.isDone());
    }

    raiseError(error: Error) {
        this.error = error;
    }
}