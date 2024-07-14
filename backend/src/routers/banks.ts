import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import { plaidClient } from "@/utils/plaid/client";
import { Request, Router } from "express";

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
