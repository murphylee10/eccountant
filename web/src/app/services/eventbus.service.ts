import { Injectable, OnDestroy } from '@angular/core';
import environment from '@environment';
import { Observable, Subject, Subscription } from 'rxjs';
import { Event, EventType } from '@common/event';
import { AuthService } from '@auth0/auth0-angular';

const EVENTBUS_ENDPOINT = '/eventbus';

export class EventSubscription<T> {
  subscription: Subscription | null = null;

  constructor(
    private id: EventType,
    private obs$: Observable<T>,
    private unobserve: (id: EventType) => void,
  ) {}

  public subscribe(callback: (value: T) => void) {
    this.subscription = this.obs$.subscribe(callback);
  }

  public unsubscribe() {
    if (this.subscription) this.subscription.unsubscribe();
    this.unobserve(this.id);
  }
}

@Injectable({
  providedIn: 'root',
})
export class EventBusService implements OnDestroy {
  private ws: WebSocket | null = null;
  private subscriptions: Map<
    EventType,
    { observers: number; observable: Subject<any> }
  > = new Map();

  constructor(private auth: AuthService) {
    this.auth.user$.subscribe((user) => {
      if (user) {
        console.log(user.sub);
        this.ws = new WebSocket(
          `${environment.api_url}${EVENTBUS_ENDPOINT}/${user.sub}`,
        );
        this.establishWsConnection();
      } else {
        this.ws = null;
      }
    });
  }

  private establishWsConnection() {
    if (!this.ws) return;
    this.ws.onopen = () => {
      console.log('Connected to the WebSocket server');
      // this.ws.send('Hello from the client!');
    };

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data) as Event<any>;
      if (!this.subscriptions.has(event.id)) return;

      const data =
        typeof event.payload === 'string'
          ? JSON.parse(event.payload)
          : event.payload;
      this.subscriptions.get(event.id)?.observable.next(data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from the WebSocket server');
    };
  }

  public observe<T>(id: EventType): EventSubscription<T> {
    let obs = this.subscriptions.get(id);
    if (obs === undefined) {
      obs = { observers: 1, observable: new Subject<T>() };
      this.subscriptions.set(id, obs);
    } else {
      obs.observers++;
    }
    return new EventSubscription<T>(id, obs?.observable, this.unobserve);
  }

  unobserve = (id: EventType) => {
    let obs = this.subscriptions.get(id);
    if (obs === undefined) return;
    obs.observers--;
    if (obs.observers <= 0) {
      this.subscriptions.delete(id);
    }
  };

  ngOnDestroy(): void {
    for (const obs of this.subscriptions.values()) obs.observable.complete();
  }
}
