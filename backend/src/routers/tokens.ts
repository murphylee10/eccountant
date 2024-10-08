import {
	type Request,
	Router,
	type Response,
	type NextFunction,
} from "express";
import {
	plaidSandboxClient,
	plaidProductionClient,
} from "@/utils/plaid/client";
import { Products } from "plaid";
import { db } from "@/utils/database/db";
import { COUNTRY_CODES } from "@/utils/plaid/config";
import { syncTransactions } from "@/utils/plaid/transactions";
import { requireAuth } from "@/middleware/auth";
import "dotenv/config";

export const tokensRouter = Router();

const WEBHOOK_URL = process.env.PLAID_WEBHOOK_URL;
const CLIENT_NAME = process.env.CLIENT_NAME || "Eccountant";

/**
 * Generates a link token for the client
 */
tokensRouter.post(
	"/generate_link_token",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;
			const isSandbox = req.body.isSandbox ?? true;
			const userObject = { client_user_id: userId };
			const tokenResponse = await (isSandbox
				? plaidSandboxClient
				: plaidProductionClient
			).linkTokenCreate({
				user: userObject,
				products: [Products.Transactions],
				client_name: CLIENT_NAME,
				language: "en",
				country_codes: COUNTRY_CODES,
				webhook: WEBHOOK_URL,
			});
			res.json(tokenResponse.data);
		} catch (error) {
			next(error);
		}
	},
);

/**
 * Exchange link token for access token and sync database
 */
tokensRouter.post(
	"/exchange_public_token",
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.auth?.payload.sub as string;
			const publicToken = req.body.publicToken;
			const isSandbox = req.body.isSandbox ?? true;

			const tokenResponse = await (isSandbox
				? plaidSandboxClient
				: plaidProductionClient
			).itemPublicTokenExchange({
				public_token: publicToken,
			});
			const tokenData = tokenResponse.data;
			const { item_id: itemId, access_token: accessToken } = tokenData;
			await db.addItem(itemId, userId, accessToken, isSandbox);
			await populateBankName(itemId, accessToken, isSandbox);
			await populateAccountNames(accessToken, isSandbox);

			// Call sync for the first time to activate the sync webhooks
			await syncTransactions(itemId);
			// Classify subscriptions
			// await db.classifySubscriptions(userId, itemId);

			res.json({ status: "success" });
		} catch (error) {
			next(error);
		}
	},
);

const populateBankName = async (
	itemId: string,
	accessToken: string,
	isSandbox: boolean,
) => {
	try {
		const plaidClient = isSandbox ? plaidSandboxClient : plaidProductionClient;
		const itemResponse = await plaidClient.itemGet({
			access_token: accessToken,
		});
		const institutionId = itemResponse.data.item.institution_id;
		if (institutionId == null) {
			return;
		}
		const institutionResponse = await plaidClient.institutionsGetById({
			institution_id: institutionId,
			country_codes: COUNTRY_CODES,
		});
		const institutionName = institutionResponse.data.institution.name;
		await db.setItemBankName(itemId, institutionName);
	} catch (error) {
		console.log(error);
	}
};

const populateAccountNames = async (
	accessToken: string,
	isSandbox: boolean,
) => {
	try {
		const plaidClient = isSandbox ? plaidSandboxClient : plaidProductionClient;
		const accountsResponse = await plaidClient.accountsGet({
			access_token: accessToken,
		});
		const accountsData = accountsResponse.data;
		const itemId = accountsData.item.item_id;
		await Promise.all(
			accountsData.accounts.map(async (account) => {
				await db.addAccount(account.account_id, itemId, account.name);
			}),
		);
	} catch (error) {
		console.log(error);
	}
};
