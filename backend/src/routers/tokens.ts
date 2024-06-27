import { Request, Router, Response, NextFunction } from "express";
import { plaidClient } from "@/utils/plaid/client";
import { CountryCode, Products } from "plaid";
import { getLoggedInUserId } from "@/utils/user/auth";
import { db } from "@/utils/database/db";
import { COUNTRY_CODES } from "@/utils/plaid/config";

export const tokensRouter = Router();

const WEBHOOK_URL =
  process.env.WEBHOOK_URL || "https://www.example.com/server/receive_webhook";
const CLIENT_NAME = process.env.CLIENT_NAME || "Eccountant";

/**
 * Generates a link token for the client
 */
tokensRouter.post(
  "/generate_link_token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getLoggedInUserId(req);
      const userObject = { client_user_id: userId };
      const tokenResponse = await plaidClient.linkTokenCreate({
        user: userObject,
        products: [Products.Transactions],
        client_name: CLIENT_NAME,
        language: "en",
        country_codes: COUNTRY_CODES,
        webhook: WEBHOOK_URL,
      });
      res.json(tokenResponse.data);
    } catch (error) {
      console.log(`Running into an error!`);
      next(error);
    }
  }
);

/**
 * Exchange link token for access token and sync database
 */
tokensRouter.post("/exchange_public_token", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const publicToken = req.body.publicToken;

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const tokenData = tokenResponse.data;
    await db.addItem(tokenData.item_id, userId, tokenData.access_token);
    await populateBankName(tokenData.item_id, tokenData.access_token);
    await populateAccountNames(tokenData.access_token);

    // Call sync for the first time to activate the sync webhooks
    await syncTransactions(tokenData.item_id);

    res.json({ status: "success" });
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});
