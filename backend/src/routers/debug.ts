import { db } from "@/utils/database/db";
import { plaidClient } from "@/utils/plaid/client";
import { getLoggedInUserId } from "@/utils/user/auth";
import { NextFunction, Request, Router, Response } from "express";
import { SandboxItemFireWebhookRequestWebhookCodeEnum } from "plaid";

const debugRouter = Router();

/**
 * This code will eventually be used to generate a test webhook, which can
 * be useful in sandbox mode where webhooks aren't quite generated like
 * they are in production.
 */
debugRouter.post(
  "/generate_webhook",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getLoggedInUserId(req);
      const itemsAndTokens = await db.getItemsAndAccessTokensForUser(userId);
      const randomItem =
        itemsAndTokens[Math.floor(Math.random() * itemsAndTokens.length)];
      const accessToken = randomItem.access_token;
      const result = await plaidClient.sandboxItemFireWebhook({
        webhook_code:
          SandboxItemFireWebhookRequestWebhookCodeEnum.SyncUpdatesAvailable,
        access_token: accessToken,
      });
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }
);
