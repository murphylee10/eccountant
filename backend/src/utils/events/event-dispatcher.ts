import { WebSocket } from "ws";
import { Express } from "express";
import { Event } from "@common/event";

const EVENTBUS_ENDPOINT = "/eventbus";

export default class EventDispatcher {
  private static instance: EventDispatcher;
  private ws: WebSocket;

  private constructor(app: Express) {
    this.setupWs(app);
  }

  // Method to get the single instance of the class
  public static getInstance(app?: Express): EventDispatcher {
    if (!EventDispatcher.instance) {
      if (!app) throw Error("EventDispatcher server not created");
      EventDispatcher.instance = new EventDispatcher(app);
    }
    return EventDispatcher.instance;
  }

  private setupWs(app: Express) {
    app.ws(`/api${EVENTBUS_ENDPOINT}`, (ws: WebSocket, req: any) => {
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
