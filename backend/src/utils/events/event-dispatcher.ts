import type { WebSocket } from "ws";
import type { Express } from "express";
import type { Event } from "@common/event";
import type { Application } from "express-ws";
import { requireAuth } from "@/middleware/auth";

const EVENTBUS_ENDPOINT = "/eventbus";

export default class EventDispatcher {
  private static instance: EventDispatcher;
  private wsMap: Map<string, WebSocket[]> = new Map();

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
        // Get array of currently connected websockets for user.
        const arr = this.wsMap.get(sub);
        if (!arr) return;

        // Remove this websocket from array.
        const idx = arr.indexOf(ws);
        arr.splice(idx);

        // If no websockets left for user, remove user from map.
        if (arr.length === 0) this.wsMap.delete(sub);
      });

      // If user already in map, add this websocket to user's websocket array.
      if (this.wsMap.has(sub)) this.wsMap.get(sub)?.push(ws);
      // Otherwise, add user to map and attach this websocket.
      else this.wsMap.set(sub, [ws]);
    });
  }

  public notifyUser(event: Event<any>, sub: string) {
    if (!this.wsMap.has(sub)) return;
    // For every websocket owned by user, send event.
    for (const ws of this.wsMap.get(sub)!.values()) ws.send(event.serialize());
  }

  public notifyAll(event: Event<any>) {
    // For every user in map, for every websocket owned by user, send event.
    for (const userSockets of this.wsMap.values())
      for (const ws of userSockets.values()) ws.send(event.serialize());
  }
}
