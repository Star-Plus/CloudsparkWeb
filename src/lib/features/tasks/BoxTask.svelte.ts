import type ITask from "./ITask";

export default class BoxTask implements ITask {
    action: string;
    closed = $state<boolean>(false);
    subtasks = $state<ITask[]>([]);

    constructor(action: string, subtasks: ITask[] = []) {
        this.action = action;
        this.subtasks = subtasks;
    }

    addSubtask(task: ITask) {
        this.subtasks = [...this.subtasks, task];
    }

    close() { 
        this.closed = true;
    }

    open() {
        this.closed = false;
    }

    isDone(): boolean {
        return this.closed && this.subtasks.every(subtask => subtask.isDone());
    }
}