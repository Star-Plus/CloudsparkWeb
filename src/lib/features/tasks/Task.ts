import type ITask from "./ITask";

export default class Task implements ITask {
    action: string;
    subtasks: ITask[];

    constructor(action: string, subtasks: ITask[] = []) {
        this.action = action;
        this.subtasks = subtasks;
    }

    isDone(): boolean {
        return this.subtasks.every(subtask => subtask.isDone());
    }
}