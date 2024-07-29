import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import type { Request, Response, NextFunction } from "express";

export const subscriptionsRouter = Router();

subscriptionsRouter.get(
	"/",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;
			const partitionedSubscriptions =
				await db.fetchPartitionedSubscriptions(userId);

			res.json(partitionedSubscriptions);
		} catch (error) {
			console.error("Running into an error!");
			next(error);
		}
	},
);

subscriptionsRouter.post(
	"/accept",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { subscriptionId } = req.body;
			await db.acceptSubscription(subscriptionId);
			res.status(200).json({ message: "Subscription accepted" });
		} catch (error) {
			console.error("Running into an error!");
			next(error);
		}
	},
);

subscriptionsRouter.delete(
	"/:id",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const subscriptionId = req.params.id;
			await db.removeSubscription(subscriptionId);
			res.status(200).json({ message: "Subscription removed" });
		} catch (error) {
			console.error("Running into an error!");
			next(error);
		}
	},
);

subscriptionsRouter.patch(
	"/change-day",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { subscriptionId, day } = req.body;
			await db.changeSubscriptionDay(subscriptionId, day);
			res.status(200).json({ message: "Subscription day changed" });
		} catch (error) {
			console.error("Running into an error!");
			next(error);
		}
	},
);

subscriptionsRouter.patch(
	"/change-month",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { subscriptionId, month } = req.body;
			await db.changeSubscriptionMonth(subscriptionId, month);
			res.status(200).json({ message: "Subscription month changed" });
		} catch (error) {
			console.error("Running into an error!");
			next(error);
		}
	},
);

export default subscriptionsRouter;
