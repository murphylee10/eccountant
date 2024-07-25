import { Configuration, PlaidEnvironments, PlaidApi } from "plaid";

const plaidSandboxConfig = new Configuration({
	// biome-ignore lint/complexity/useLiteralKeys: Plaid prefers this
	basePath: PlaidEnvironments["sandbox"],
	baseOptions: {
		headers: {
			"PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
			"PLAID-SECRET": process.env.PLAID_SECRET_SANDBOX,
			"Plaid-Version": "2020-09-14",
		},
	},
});

const plaidProductionConfig = new Configuration({
	// biome-ignore lint/complexity/useLiteralKeys: Plaid prefers this
	basePath: PlaidEnvironments["production"],
	baseOptions: {
		headers: {
			"PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
			"PLAID-SECRET": process.env.PLAID_SECRET_PRODUCTION,
			"Plaid-Version": "2020-09-14",
		},
	},
});

export const plaidSandboxClient = new PlaidApi(plaidSandboxConfig);
export const plaidProductionClient = new PlaidApi(plaidProductionConfig);
