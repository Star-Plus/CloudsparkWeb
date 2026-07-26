export default class ErrorStore {

    private static instance: ErrorStore
    private constructor() {}

    static getInstance(): ErrorStore {
        if (!ErrorStore.instance) ErrorStore.instance = new ErrorStore();
        return ErrorStore.instance;
    }

    errors = $state<Error[]>([]);

    add(error: Error) {
        console.error(error);
        this.errors.push(error);
    }

    clear() {
        this.errors = [];
    }

    remove(idx: number) {
        this.errors.splice(idx, 1);
    }
}