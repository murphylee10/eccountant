import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import { plaidClient } from "@/utils/plaid/client";
import { type Request, Router } from "express";

interface DeactivateRequest extends Request {
  body: {
    itemId: string;
  };
}

export const banksRouter = Router();

banksRouter.get("/list", requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth?.payload.sub as string;
    const result = await db.getBankNamesForUser(userId);
    // console.log(result);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

banksRouter.get("/accounts/:itemId", requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth?.payload.sub as string;
    const { itemId } = req.params;

    // Retrieve the access token for the specified item
    const item = await db.getAccountsWithBank(itemId, userId);

    if (!item || !item.access_token) {
      return res
        .status(404)
        .json({ error: "Bank not found or not accessible" });
    }

    // Retrieve accounts and balances from Plaid
    const response = await plaidClient.accountsGet({
      access_token: item.access_token,
    });
    const accounts = response.data.accounts;

    return res.json(accounts);
  } catch (error) {
    next(error);
  }
});

banksRouter.post(
  "/deactivate",
  requireAuth,
  async (req: DeactivateRequest, res, next) => {
    try {
      const itemId = req.body.itemId;
      const userId = req.auth?.payload.sub as string;
      const result = await db.getItemInfoForUser(itemId, userId);
      if (!result) return;
      const { access_token: accessToken } = result;
      await plaidClient.itemRemove({
        access_token: accessToken,
      });
      await db.deactivateItem(itemId);

      return res.json({ removed: itemId });
    } catch (error) {
      next(error);
    }
  },
);
