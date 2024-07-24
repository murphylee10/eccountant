import express, { type Express, Request, Response } from "express";
import { transactionsRouter } from "./routers/transactions";
import bodyParser from "body-parser";
import "dotenv/config";
import { errorHandler } from "./middleware/errors";
import "express-async-errors";
import cors from "cors";
import { db } from "@/utils/database/db";
import { requireAuth, requireAuthScope } from "./middleware/auth";
import { usersRouter } from "./routers/users";
import EventDispatcher from "./utils/events/event-dispatcher";
import { banksRouter } from "./routers/banks";
import { tokensRouter } from "./routers/tokens";
import { ExampleEvent } from "@common/event";
import { debugRouter } from "./routers/debug";
import expressWs, {
  Application as ExpressWsApplication,
  type WithWebsocketMethod,
} from "express-ws";
import MistralClient from "@mistralai/mistralai";

type ExtendedExpress = Express & WithWebsocketMethod;

const app = express() as ExtendedExpress;
const PORT = process.env.PORT || 3000;

// Setup realtime events with websockets
// @ts-ignore
expressWs(app);
const dispatcher = EventDispatcher.getInstance(app);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/transactions", transactionsRouter);

app.use("/api/users", usersRouter);

app.use("/api/tokens", tokensRouter);

app.use("/api/debug", debugRouter);

app.use("/api/banks", banksRouter);

// Example endpoint that requires authentication.
app.get("/api/example/auth", requireAuth, (req, res) => {
  return res.json({ success: true, msg: "User is authenticated" });
});

// Example endpoint that requires authorization.
app.get(
  "/api/example/authScope",
  requireAuth,
  requireAuthScope("read:example"),
  (req, res) => {
    return res.json({ success: true, msg: "User is authorized" });
  },
);

// Example endpoint that triggers realtime event update.
app.get("/api/example/event/:id", (req, res) => {
  try {
    const id = req.params.id;
    dispatcher.notifyUser(new ExampleEvent({ foo: "chosen", bar: 0 }), id);
    dispatcher.notifyAll(new ExampleEvent({ foo: "hi", bar: 1 }));
  } catch (e) {
    console.log(e);
    return res.json({ success: false });
  }
  return res.json({ success: true });
});

// Chat endpoint.
const mistralClient = new MistralClient(process.env.MISTRAL_API_KEY);
app.post("/api/chat", async (req, res) => {
  try {
    const { model, messages } = req.body;
    mistralClient.chat({ model, messages }).then((chatResponse) => {
      res.json(chatResponse.choices[0].message.content);
    });
  } catch (error) {
    console.error("Error in chat request:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

// Error handling
app.use(errorHandler);

// // Setup eventbus via websocket protocol.
// const eventbus = EventBus.getInstance(app);

app.listen(PORT, () => {
  console.log("HTTP server on http://localhost:%s", PORT);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await db.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await db.disconnect();
  process.exit(0);
});
