export enum EventType {
  NEW_TRANSACTION = "event/new_transaction",
  REMOVE_TRANSACTION = "event/remove_transaction",
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

export class TransactionEvent extends Event<{
  uid: string;
  timestamp: number;
}> {
  id = EventType.NEW_TRANSACTION;
}

export class RemoveTransaction extends Event<{
  uid: string;
  timestamp: number;
}> {
  id = EventType.REMOVE_TRANSACTION;
}
