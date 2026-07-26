export default class ErrorMode {

    private static instance: ErrorMode

    enabled = $state<boolean>(false);

    private constructor() {
        this.enabled = false;
    }

    static getInstance(): ErrorMode {
        if (!ErrorMode.instance) ErrorMode.instance = new ErrorMode();
        return ErrorMode.instance;
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}