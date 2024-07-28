import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import EventDispatcher from "@/utils/events/event-dispatcher";
import { RemoveTransaction, TransactionEvent } from "@common/event";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

export const transactionsRouter = Router();

transactionsRouter.get("/", requireAuth, async (req, res, next) => {
	try {
		const userId = req.auth?.payload.sub as string;
		const { maxCount = "50" } = req.query;
		const maxCountNumber = Number.parseInt(maxCount as string, 10);
		const transactions = await db.getTransactionsByUser(userId, maxCountNumber);
		res.json(transactions);
	} catch (error) {
		console.log("Running into an error!");
		next(error);
	}
});

transactionsRouter.post(
	"/add",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;
			const { category, date, amount, name, isIncoming } = req.body;

			if (
				!category ||
				!date ||
				amount === undefined ||
				!name ||
				isIncoming === undefined
			) {
				return res.status(400).json({ error: "All fields are required" });
			}

			const adjustedAmount = isIncoming ? amount * -1 : amount;

			const dateOnly = new Date(date).toISOString().split("T")[0];

			const transaction = await db.addUserTransaction(
				userId,
				category,
				dateOnly,
				adjustedAmount,
				name,
			);
			const dispatcher = EventDispatcher.getInstance();
			dispatcher.notifyUser(
				new TransactionEvent({ uid: userId, timestamp: Date.now() }),
				userId,
			);
			res.json(transaction);
		} catch (error) {
			console.log("Running into an error!");
			next(error);
		}
	},
);

transactionsRouter.delete(
	"/delete/:id",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const transactionId = req.params.id;
			const userId = req.auth?.payload.sub as string;

			await db.removeTransaction(transactionId, userId);
			const dispatcher = EventDispatcher.getInstance();
			dispatcher.notifyUser(
				new RemoveTransaction({ uid: userId, timestamp: Date.now() }),
				userId,
			);
			res.status(204).send(); // No Content response
		} catch (error) {
			console.log("Running into an error!");
			next(error);
		}
	},
);

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
				endDate as string,
			);
			res.json(transactions);
		} catch (error) {
			console.log("Running into an error!");
			next(error);
		}
	},
);

transactionsRouter.get("/recent", requireAuth, async (req, res, next) => {
	try {
		console.log("hello");
		const userId = req.auth?.payload.sub as string;
		const transactions = await db.getRecentTransactions(userId, 5);
		res.json(transactions);
	} catch (error) {
		console.log(error);
		console.log("Running into an error!");
		next(error);
	}
});

transactionsRouter.get(
	"/year/:year",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;
			const year = Number.parseInt(req.params.year, 10);

			if (Number.isNaN(year) || year < 1000 || year > 9999) {
				return res.status(400).json({ error: "Invalid year format" });
			}

			const transactions = await db.getTransactionsByYear(userId, year);
			res.json(transactions);
		} catch (error) {
			console.log("Running into an error!");
			next(error);
		}
	},
);

transactionsRouter.get(
	"/first-transaction",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;

			const transaction = await db.getFirstTransaction(userId);
			res.json(transaction);
		} catch (error) {
			console.log("Running into an error!");
			next(error);
		}
	},
);

transactionsRouter.post(
	"/ask",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { query } = req.body;
			const transactions = await db.runRawQuery(query as string);
			res.json(transactions);
		} catch (error) {
			console.log(`Running into an error!`);
			next(error);
		}
	},
);

transactionsRouter.get(
	"/last-transaction",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;

			const transaction = await db.getLastTransaction(userId);
			res.json(transaction);
		} catch (error) {
			console.log("Running into an error!");
			next(error);
		}
	},
);

export default transactionsRouter;
