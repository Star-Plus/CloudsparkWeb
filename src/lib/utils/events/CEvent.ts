import type IEventPayload from "./IEventPayload";
import type IListener from "./IListener";

export default class CEvent<T extends IEventPayload> {
    private listeners: Set<IListener<T>> = new Set();

    public subscribe(listener: IListener<T>): void {
        this.listeners.add(listener);
    }

    public unsubscribe(listener: IListener<T>): void {
        this.listeners.delete(listener);
    }
    
    public emit(payload: T): void {
        for (const listener of this.listeners) {
            listener.onUpdate(payload);
        }
    }
}