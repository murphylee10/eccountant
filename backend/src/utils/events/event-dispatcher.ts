import type { WebSocket } from "ws";
import type { Express } from "express";
import type { Event } from "@common/event";
import type { Application } from "express-ws";
import { requireAuth } from "@/middleware/auth";

const EVENTBUS_ENDPOINT = "/eventbus";

export default class EventDispatcher {
  private static instance: EventDispatcher;
  private wsMap: Map<string, WebSocket> = new Map();

  private constructor(app: Application) {
    this.setupWs(app);
  }

  // Method to get the single instance of the class
  public static getInstance(app?: Application): EventDispatcher {
    if (!EventDispatcher.instance) {
      if (!app) throw Error("EventDispatcher server not created");
      EventDispatcher.instance = new EventDispatcher(app);
    }
    return EventDispatcher.instance;
  }

  private setupWs(app: Application) {
    app.ws(`/api${EVENTBUS_ENDPOINT}/:sub`, (ws: WebSocket, req: any) => {
      const sub = req.params.sub;

      ws.on("message", (message) => {
        console.log(`Message received: ${message}`);
      });
      ws.on("close", () => {
        console.log("The connection was closed!");
      });

      this.wsMap.set(sub, ws);
    });
  }

  public notifyUser(event: Event<any>, sub: string) {
    if (!this.wsMap.has(sub)) return;
    this.wsMap.get(sub)?.send(event.serialize());
  }

  public notifyAll(event: Event<any>) {
    for (const ws of this.wsMap.values()) ws.send(event.serialize());
  }
}
