import type ITask from "./ITask";

export default class TaskManager {

    private locked = false;
    tasks = $state<ITask[]>([]);

    private static instance: TaskManager
    private constructor() {
        if (!window) throw new Error('TaskManager can only be initialized in the browser');
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
        for (const task of this.tasks) {
            if (task.isDone()) {
                this.tasks = this.tasks.filter(t => t !== task);
            }
        }
        this.locked = false;
    }
}