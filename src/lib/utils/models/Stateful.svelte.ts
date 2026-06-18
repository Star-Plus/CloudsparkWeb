export default class Stateful<T> {
    state = $state<T>(undefined as T);
    constructor(initialState: T) {
        this.state = initialState;
    }
}