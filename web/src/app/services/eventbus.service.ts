import { Injectable, OnDestroy } from '@angular/core';
import environment from '@environment';
import { Observable, Subject } from 'rxjs';
import { Event, EventType } from '@common/event';

@Injectable({
  providedIn: 'root',
})
export class EventBusService implements OnDestroy {
  private ws: WebSocket;
  private eventMap: Map<EventType, Subject<any>> = new Map();

  constructor() {
    this.ws = new WebSocket(`${environment.api_url}/eventbus`);
    this.establishWsConnection();
  }

  private establishWsConnection() {
    this.ws.onopen = () => {
      console.log('Connected to the WebSocket server');
      this.ws.send('Hello from the client!');
    };

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data) as Event<any>;
      if (!this.eventMap.has(event.id)) return;

      const data =
        typeof event.payload === 'string'
          ? JSON.parse(event.payload)
          : event.payload;
      this.eventMap.get(event.id)?.next(data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from the WebSocket server');
    };
  }

  public observe<T>(id: EventType): Observable<T> {
    if (!this.eventMap.has(id)) this.eventMap.set(id, new Subject<T>());
    return this.eventMap.get(id)!;
  }

  ngOnDestroy(): void {
    this.eventMap.forEach((obs) => obs.complete());
  }
}
