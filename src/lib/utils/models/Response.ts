import Stateful from "./Stateful.svelte";

export const enum ResponseState {
    LOADING,
    SUCCESS,
    ERROR
}

export default class Response<TPayload> extends Stateful<ResponseState> {
    protected _error: Error | null = null;
    protected _payload: TPayload | null = null;

    constructor() {
        super(ResponseState.LOADING);
    }

    setError(error: Error) {
        this._error = error;
        this.state = ResponseState.ERROR;
    }

    setPayload(payload: TPayload) {
        this._payload = payload;
        this.state = ResponseState.SUCCESS;
    }

    get payload() : TPayload | null {
        return this._payload;
    }

    get error() : Error | null {
        return this._error;
    }
}