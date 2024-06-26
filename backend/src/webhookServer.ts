import express, { Express, Request, Response } from "express"
import bodyParser from "body-parser"

const webhookApp: Express = express();

const WEBHOOK_PORT = process.env.WEBHOOK_PORT;

webhookApp.use(bodyParser.urlencoded({ extended: false }));
webhookApp.use(bodyParser.json());

webhookApp.listen(WEBHOOK_PORT, () => {
  console.log("HTTP server on http://localhost:%s", WEBHOOK_PORT);
});