import { Request, Router, Response, NextFunction } from "express";

export const tokensRouter = Router();

const WEBHOOK_URL =
  process.env.WEBHOOK_URL || "https://www.example.com/server/receive_webhook";

tokensRouter.post("/generate_link_token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getLoggedInUserId(req);
    const userObject = { client_user_id: userId };
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: userObject,
      products: ["transactions"],
      client_name: "Where'd My Money Go?",
      language: "en",
      country_codes: ["CA", "US"],
      webhook: WEBHOOK_URL,
    });
    res.json(tokenResponse.data);
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});