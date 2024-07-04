import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import { Router } from "express";
import { Request, Response, NextFunction } from "express";

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

transactionsRouter.get(
  "/date-range",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth?.payload.sub as string;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate and endDate are required" });
      }

      const transactions = await db.getTransactionsByDateRange(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(transactions);
    } catch (error) {
      console.log(`Running into an error!`);
      next(error);
    }
  }
);

export default transactionsRouter;
