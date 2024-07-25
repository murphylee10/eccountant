import { requireAuth } from "@/middleware/auth";
import { db } from "@/utils/database/db";
import { plaidSandboxClient } from "@/utils/plaid/client";
import {
	type NextFunction,
	type Request,
	Router,
	type Response,
} from "express";
import { SandboxItemFireWebhookRequestWebhookCodeEnum } from "plaid";

export const debugRouter = Router();

/**
 * This code will eventually be used to generate a test webhook, which can
 * be useful in sandbox mode where webhooks aren't quite generated like
 * they are in production.
 */
debugRouter.post(
	"/generate_webhook",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub;
			const itemsAndTokens = await db.getItemsAndAccessTokensForUser(
				userId as string,
			);
			const randomItem =
				itemsAndTokens[Math.floor(Math.random() * itemsAndTokens.length)];
			const accessToken = randomItem.access_token;
			const result = await plaidSandboxClient.sandboxItemFireWebhook({
				webhook_code:
					SandboxItemFireWebhookRequestWebhookCodeEnum.SyncUpdatesAvailable,
				access_token: accessToken,
			});
			res.json(result.data);
		} catch (error) {
			next(error);
		}
	},
);
