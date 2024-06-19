import express, { Express, Request, Response } from "express";
import "dotenv/config";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("HTTP server on http://localhost:%s", PORT);
});
