import type IEventPayload from "./IEventPayload";

export default interface IListener<T extends IEventPayload> {
    onUpdate(payload: T): void;
}