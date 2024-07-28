import { Prisma, PrismaClient } from "@prisma/client";
import type { SimpleTransaction } from "../types/transactions";

class Database {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	/* User interactions */

	async createUserIfNotExists(userId: string) {
		const existingUser = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (existingUser) {
			return existingUser;
		}

		// If user does not exist, create a new user
		const newUser = await this.prisma.user.create({
			data: { id: userId },
		});
		return newUser;
	}

	/* Transaction interactions */
	async addUserTransaction(
		userId: string,
		category: string,
		date: string,
		amount: number,
		name: string,
	) {
		const result = await this.prisma.transaction.create({
			data: {
				user_id: userId,
				category: category,
				date: date,
				amount: amount,
				name: name,
				isUserInput: true,
			},
		});
		return result;
	}

	async removeTransaction(transactionId: string, userId: string) {
		const result = await this.prisma.transaction.deleteMany({
			where: {
				id: transactionId,
				user_id: userId,
			},
		});

		if (result.count === 0) {
			throw new Error("Transaction not found or does not belong to user");
		}

		return result;
	}

	async getRecentTransactions(userId: string, limit: number) {
		const results = await this.prisma.transaction.findMany({
			where: {
				user_id: userId,
				is_removed: false,
			},
			orderBy: {
				date: "desc",
			},
			take: limit,
			include: {
				account: {
					select: {
						name: true,
						item: {
							select: {
								bank_name: true,
							},
						},
					},
				},
			},
		});

		return results.map((transaction) => ({
			...transaction,
		}));
	}

	async getFirstTransaction(userId: string) {
		const result = await this.prisma.transaction.findFirst({
			where: {
				user_id: userId,
				is_removed: false,
			},
			orderBy: {
				date: "asc",
			},
			include: {
				account: {
					select: {
						name: true,
						item: {
							select: {
								bank_name: true,
							},
						},
					},
				},
			},
		});

		return result;
	}
	async getLastTransaction(userId: string) {
		const result = await this.prisma.transaction.findFirst({
			where: {
				user_id: userId,
				is_removed: false,
			},
			orderBy: {
				date: "desc",
			},
			include: {
				account: {
					select: {
						name: true,
						item: {
							select: {
								bank_name: true,
							},
						},
					},
				},
			},
		});
		return result;
	}

	async getTransactionsByDateRange(
		userId: string,
		startDate: string,
		endDate: string,
	) {
		const results = await this.prisma.transaction.findMany({
			where: {
				user_id: userId,
				is_removed: false,
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: {
				date: "desc",
			},
			include: {
				account: {
					select: {
						name: true,
						item: {
							select: {
								bank_name: true,
							},
						},
					},
				},
			},
		});

		return results;
	}

	async getTransactionsByYear(userId: string, year: number) {
		const startDate = `${year}-01-01`;
		const endDate = `${year}-12-31`;

		const results = await this.prisma.transaction.findMany({
			where: {
				user_id: userId,
				is_removed: false,
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: {
				date: "desc",
			},
			include: {
				account: {
					select: {
						name: true,
						item: {
							select: {
								bank_name: true,
							},
						},
					},
				},
			},
		});

		return results;
	}

	async getTransactionsByUser(userId: string, limit: number) {
		const results = await this.prisma.transaction.findMany({
			where: {
				user_id: userId,
				is_removed: false,
			},
			orderBy: {
				date: "desc",
			},
			take: limit,
			include: {
				account: {
					select: {
						name: true,
						item: {
							select: {
								bank_name: true,
							},
						},
					},
				},
			},
		});

		return results.map((transaction) => ({
			...transaction,
			account_name: transaction.account ? transaction.account.name : null,
			bank_name: transaction.account
				? transaction.account.item.bank_name
				: null,
		}));
	}

	async addNewTransaction(transactionObj: SimpleTransaction) {
		const result = await this.prisma.transaction.create({
			data: {
				...transactionObj.transaction,
			},
		});

		if (transactionObj.pending_transaction_id) {
			// TODO - possibly handle attributes we added
		}
		return result;
	}

	async modifyExistingTransaction(transactionObj: SimpleTransaction) {
		const result = await this.prisma.transaction.update({
			where: { id: transactionObj.transaction.id },
			data: {
				...transactionObj.transaction,
			},
		});
		return result;
	}

	async markTransactionAsRemoved(transactionId: string) {
		const result = await this.prisma.transaction.update({
			where: { id: transactionId },
			data: {
				is_removed: true,
			},
		});
		return result;
	}

	/* Item interactions */

	async getBankNamesForUser(userId: string) {
		const result = await this.prisma.item.findMany({
			where: {
				user_id: userId,
				is_active: true,
			},
			select: {
				id: true,
				bank_name: true,
			},
		});
		return result;
	}

	async getAccountsWithBank(itemId: string, userId: string) {
		const result = await db.prisma.item.findUnique({
			where: {
				id: itemId,
				user_id: userId,
				is_active: true,
			},
		});
		return result;
	}

	async getItemInfo(itemId: string) {
		const result = await this.prisma.item.findUnique({
			where: { id: itemId },
			select: {
				user_id: true,
				access_token: true,
				transaction_cursor: true,
				isSandbox: true,
			},
		});
		return result;
	}

	async getItemInfoForUser(itemId: string, userId: string) {
		const result = await this.prisma.item.findUnique({
			where: { id: itemId, user_id: userId },
			select: {
				user_id: true,
				access_token: true,
				transaction_cursor: true,
				isSandbox: true,
			},
		});
		return result;
	}

	async addItem(
		itemId: string,
		userId: string,
		accessToken: string,
		isSandbox: boolean,
	) {
		const result = await this.prisma.item.create({
			data: {
				id: itemId,
				user_id: userId,
				access_token: accessToken,
				isSandbox: isSandbox,
			},
		});
		return result;
	}

	async setItemBankName(itemId: string, bankName: string) {
		const result = await this.prisma.item.update({
			where: { id: itemId },
			data: {
				bank_name: bankName,
			},
		});
		return result;
	}

	async getItemsAndAccessTokensForUser(userId: string) {
		const items = await this.prisma.item.findMany({
			where: {
				user_id: userId,
				is_active: true,
			},
			select: {
				id: true,
				access_token: true,
			},
		});
		return items;
	}

	// async deactivateItem(itemId: string) {
	//   const updateResult = await this.prisma.item.update({
	//     where: { id: itemId },
	//     data: {
	//       access_token: "REVOKED",
	//       is_active: false,
	//     },
	//   });
	//   return updateResult;

	//   // TODO: Potentially Delete transactions for accounts belonging to this item, Delete accounts that belong to this item, Delete the item itself from the database
	// }

	async deactivateItem(itemId: string) {
		// Start a transaction
		const [deleteTransactions, deleteAccounts, deleteItem] =
			await this.prisma.$transaction([
				// Step 1: Delete transactions associated with accounts of the item
				this.prisma.transaction.deleteMany({
					where: {
						account: {
							item_id: itemId,
						},
					},
				}),

				// Step 2: Delete accounts associated with the item
				this.prisma.account.deleteMany({
					where: {
						item_id: itemId,
					},
				}),

				// Step 3: Delete the item itself from the database
				this.prisma.item.delete({
					where: { id: itemId },
				}),
			]);

		return { deleteTransactions, deleteAccounts, deleteItem };
	}

	async saveCursorForItem(cursor: string | undefined, itemId: string) {
		const result = await this.prisma.item.update({
			where: { id: itemId },
			data: {
				transaction_cursor: cursor || null,
			},
		});
		return result;
	}

	/* Account interactions */
	async addAccount(accountId: string, itemId: string, acctName?: string) {
		try {
			const result = await this.prisma.account.create({
				data: {
					id: accountId,
					item_id: itemId,
					name: acctName,
				},
			});
			return result;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				// Handle unique constraint violation
				if (error.code === "P2002") {
					console.log(`Account with id ${accountId} already exists.`);
					return null;
				}
			}
			// Re-throw other unexpected errors
			throw error;
		}
	}

	/* LLM Interaction */
	async runRawQuery(query: string) {
		try {
			return await this.prisma.$queryRaw`${Prisma.raw(query)}`;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	async disconnect() {
		await this.prisma.$disconnect();
	}
}

export const db = new Database();
