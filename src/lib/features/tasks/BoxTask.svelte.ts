import type ITask from "./ITask";

export default class BoxTask implements ITask {
    action: string;
    subtasks = $state<ITask[]>([]);

    constructor(action: string, subtasks: ITask[] = []) {
        this.action = action;
        this.subtasks = subtasks;
    }

    addSubtask(task: ITask) {
        this.subtasks = [...this.subtasks, task];
    }

    isDone(): boolean {
        return this.subtasks.every(subtask => subtask.isDone());
    }
}