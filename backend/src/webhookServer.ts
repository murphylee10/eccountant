import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { errorHandler } from "./middleware/errors";
import "express-async-errors";

const webhookApp: Express = express();

const WEBHOOK_PORT = process.env.WEBHOOK_PORT;

webhookApp.use(bodyParser.urlencoded({ extended: false }));
webhookApp.use(bodyParser.json());

webhookApp.post("/server/receive_webhook", async (req, res, next) => {
  try {
    console.log("**INCOMING WEBHOOK**");
    console.dir(req.body, { colors: true, depth: null });
    const product = req.body.webhook_type;
    const code = req.body.webhook_code;

    // TODO (maybe): Verify webhook
    switch (product) {
      case "ITEM":
        handleItemWebhook(code, req.body);
        break;
      case "TRANSACTIONS":
        handleTxnWebhook(code, req.body);
        break;
      default:
        console.log(`Can't handle webhook product ${product}`);
        break;
    }
    res.json({ status: "received" });
  } catch (error) {
    next(error);
  }
});

function handleTxnWebhook(code, requestBody) {
  switch (code) {
    case "SYNC_UPDATES_AVAILABLE":
      syncTransactions(requestBody.item_id);
      break;
    // If we're using sync, we don't really need to concern ourselves with the
    // other transactions-related webhooks
    default:
      console.log(`Can't handle webhook code ${code}`);
      break;
  }
}

function handleItemWebhook(code, requestBody) {
  switch (code) {
    case "ERROR":
      // The most common reason for receiving this webhook is because your
      // user's credentials changed and they should run Link in update mode to fix it.
      console.log(
        `I received this error: ${requestBody.error.error_message}| should probably ask this user to connect to their bank`
      );
      break;
    case "NEW_ACCOUNTS_AVAILABLE":
      console.log(
        `There are new accounts available at this Financial Institution! (Id: ${requestBody.item_id}) We may want to ask the user to share them with us`
      );
      break;
    case "PENDING_EXPIRATION":
      console.log(
        `We should tell our user to reconnect their bank with Plaid so there's no disruption to their service`
      );
      break;
    case "USER_PERMISSION_REVOKED":
      console.log(
        `The user revoked access to this item. We should remove it from our records`
      );
      break;
    case "WEBHOOK_UPDATE_ACKNOWLEDGED":
      console.log(`Hooray! You found the right spot!`);
      break;
    default:
      console.log(`Can't handle webhook code ${code}`);
      break;
  }
}

webhookApp.use(errorHandler);

webhookApp.listen(WEBHOOK_PORT, () => {
  console.log("HTTP server on http://localhost:%s", WEBHOOK_PORT);
});
