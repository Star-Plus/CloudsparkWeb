import Stateful from "./Stateful.svelte";

export const enum TransferState {
    LOADING,
    SUCCESS,
    ERROR
}

export default class DTO<TPayload> extends Stateful<TransferState> {
    protected _error: Error | null = null;
    protected _payload: TPayload | null = null;

    constructor() {
        super(TransferState.LOADING);
    }

    setError(error: Error) {
        this._error = error;
        this.state = TransferState.ERROR;
    }

    setPayload(payload: TPayload) {
        this._payload = payload;
        this.state = TransferState.SUCCESS;
    }

    get payload() : TPayload | null {
        return this._payload;
    }

    get error() : Error | null {
        return this._error;
    }
}