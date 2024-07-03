// import { Server } from "https";
import { WebSocket, WebSocketServer } from "ws";
import { Express } from "express";
import { Event, EventType } from "@common/event";

export class EventBus {
  private static instance: EventBus;
  private ws: WebSocket;

  private constructor(app: Express) {
    this.setupWs(app);
  }

  // Method to get the single instance of the class
  public static getInstance(app?: Express): EventBus {
    if (!EventBus.instance) {
      if (!app) throw Error("EventBus server not created");
      EventBus.instance = new EventBus(app);
    }
    return EventBus.instance;
  }

  private setupWs(app: Express) {
    app.ws("/api/eventbus", (ws: WebSocket, req: any) => {
      this.ws = ws;
      console.log("established ws");

      ws.on("message", function (message) {
        console.log("Message received: " + message);
      });
      ws.on("close", function () {
        console.log("The connection was closed!");
      });
    });
  }

  public trigger(event: Event<any>) {
    this.ws.send(event.serialize());
  }
}
