import express, { Express, Request, Response } from "express";
import { transactionsRouter } from "./routers/transactions";
import bodyParser from "body-parser";
import "dotenv/config";
import { errorHandler } from "./middleware/errors";
import "express-async-errors";
import cors from "cors";
import { db } from "@/utils/database/db";
import { requireAuth, requireAuthScope } from "./middleware/auth";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/transactions", transactionsRouter);

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

// Error handling
app.use(errorHandler);

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
