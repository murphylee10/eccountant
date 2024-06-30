import { db } from "@/utils/database/db";
import { getLoggedInUserId } from "@/utils/user/auth";
import { Router } from "express";

export const transactionsRouter = Router();

transactionsRouter.get("/", async (req, res, next) => {
  try {
    const userId = getLoggedInUserId(req);
    const { maxCount = "50" } = req.query;
    const maxCountNumber = parseInt(maxCount as string, 10);
    const transactions = await db.getTransactionsByUser(userId, maxCountNumber);
    res.json(transactions);
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
});
