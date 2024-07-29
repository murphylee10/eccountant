import express, {
	type Express,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import bodyParser from "body-parser";
import { errorHandler } from "./middleware/errors";
import "express-async-errors";
import "dotenv/config";
import { txnQueue } from "./utils/redis/syncTransactionsQueue";

const webhookApp: Express = express();

const WEBHOOK_PORT = process.env.WEBHOOK_PORT;

webhookApp.use(bodyParser.urlencoded({ extended: false }));
webhookApp.use(bodyParser.json());

webhookApp.post(
	"/server/receive_webhook",
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			console.log("**INCOMING WEBHOOK**");
			console.dir(req.body, { colors: true, depth: null });
			const product = req.body.webhook_type as string;
			const code = req.body.webhook_code as string;

			// TODO (maybe): Verify webhook
			switch (product) {
				case "TRANSACTIONS":
					handleTxnWebhook(code, req.body.item_id);
					break;
				// case "ITEM":
				//   handleItemWebhook(code, req.body);
				//   break;
				default:
					console.log(`Can't handle webhook product ${product}`);
					break;
			}
			res.json({ status: "received" });
		} catch (error) {
			next(error);
		}
	},
);

async function handleTxnWebhook(code: string, itemId: string) {
	switch (code) {
		case "SYNC_UPDATES_AVAILABLE":
			await txnQueue.add("syncTransactions", { itemId });
			break;
		// If we're using sync, we don't really need to concern ourselves with the
		// other transactions-related webhooks
		default:
			console.log(`Can't handle webhook code ${code}`);
			break;
	}
}

webhookApp.use(errorHandler);

webhookApp.listen(WEBHOOK_PORT, () => {
	console.log("HTTP server on http://localhost:%s", WEBHOOK_PORT);
});
