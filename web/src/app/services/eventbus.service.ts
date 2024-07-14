import { Injectable, OnDestroy } from '@angular/core';
import environment from '@environment';
import { Observable, Subject } from 'rxjs';
import { Event, EventType } from '@common/event';

const EVENTBUS_ENDPOINT = '/eventbus';

@Injectable({
  providedIn: 'root',
})
export class EventBusService implements OnDestroy {
  private ws: WebSocket;
  private subscriptions: Map<EventType, Subject<any>> = new Map();

  constructor() {
    this.ws = new WebSocket(`${environment.api_url}${EVENTBUS_ENDPOINT}`);
    this.establishWsConnection();
  }

  private establishWsConnection() {
    this.ws.onopen = () => {
      console.log('Connected to the WebSocket server');
      this.ws.send('Hello from the client!');
    };

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data) as Event<any>;
      if (!this.subscriptions.has(event.id)) return;

      const data =
        typeof event.payload === 'string'
          ? JSON.parse(event.payload)
          : event.payload;
      this.subscriptions.get(event.id)?.next(data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from the WebSocket server');
    };
  }

  public observe<T>(id: EventType): Observable<T> {
    let obs = this.subscriptions.get(id);
    if (obs === undefined) {
      obs = new Subject<T>();
      this.subscriptions.set(id, obs);
    }
    return obs;
  }

  ngOnDestroy(): void {
    for (const obs of this.subscriptions.values()) obs.complete();
  }
}
