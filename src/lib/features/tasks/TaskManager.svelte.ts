import type ITask from "./ITask";

export default class TaskManager {

    private locked = false;
    tasks = $state<ITask[]>([]);

    private static instance: TaskManager
    private constructor() {
        TaskManager.instance = this;
        setInterval(() => !this.locked && this.runTasks(), 1000);
    }

    static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    addTask(task: ITask) {
        this.tasks = [...this.tasks, task];
    }

    async runTasks() {
        this.locked = true;
        const remaining = this.tasks.filter(t => !t.isDone());
        if (remaining.length !== this.tasks.length) {
            this.tasks = remaining;
        }
        this.locked = false;
    }
}