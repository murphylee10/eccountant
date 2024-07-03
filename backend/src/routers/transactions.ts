import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import { Router } from "express";

export const transactionsRouter = Router();

transactionsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth?.payload.sub as string;
    const { maxCount = "50" } = req.query;
    const maxCountNumber = parseInt(maxCount as string, 10);
    const transactions = await db.getTransactionsByUser(userId, maxCountNumber);
    res.json(transactions);
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});
