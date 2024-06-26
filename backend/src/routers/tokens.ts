import { Request, Router, Response, NextFunction } from "express";
import { plaidClient } from "@/utils/plaid/client";
import { CountryCode, Products } from "plaid";

export const tokensRouter = Router();

const WEBHOOK_URL =
  process.env.WEBHOOK_URL || "https://www.example.com/server/receive_webhook";
const CLIENT_NAME = process.env.CLIENT_NAME || "Eccountant";

tokensRouter.post("/generate_link_token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getLoggedInUserId(req);
    const userObject = { client_user_id: userId };
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: userObject,
      products: [Products.Transactions],
      client_name: CLIENT_NAME,
      language: "en",
      country_codes: [CountryCode.Ca],
      webhook: WEBHOOK_URL,
    });
    res.json(tokenResponse.data);
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});