export enum EventType {
  EXAMPLE = "event/example",
  NEW_TRANSACTION = "event/new_transaction",
}

export abstract class Event<T> {
  abstract id: EventType;
  payload: T;

  constructor(payload: T) {
    try {
      JSON.stringify(payload);
    } catch {
      throw Error("Payload cannot be serialized");
    }
    this.payload = payload;
  }

  public serialize() {
    return JSON.stringify({
      id: this.id,
      payload: this.payload,
    });
  }
}

export class ExampleEvent extends Event<{ foo: string; bar: number }> {
  id = EventType.EXAMPLE;
}
