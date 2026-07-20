import type ITask from "./ITask";

export default class ConfirmableTask implements ITask {
    action: string;

    constructor(action: string) {
        this.action = action;
    }

    isDone(): boolean {
        return this.confirmed;
    }
    confirmed: boolean = false;
    confirm() {
        this.confirmed = true;
    }

    reset() {
        this.confirmed = false;
    }
}