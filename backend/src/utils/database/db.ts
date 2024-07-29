import { Prisma, PrismaClient } from "@prisma/client";
import type { SimpleTransaction } from "../types/transactions";
import {
	differenceInDays,
	parseISO,
	isValid,
	subDays,
	isBefore,
	getDate,
	getMonth,
} from "date-fns";

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

	/* Subscription Interaction */
	async classifySubscriptions(userId: string, itemId: string) {
		// Step 1: Retrieve all transactions for the given userId and itemId
		const transactions = await this.prisma.transaction.findMany({
			where: {
				user_id: userId,
				account: {
					item_id: itemId,
				},
				is_removed: false,
			},
			orderBy: {
				date: "asc",
			},
		});

		// Step 2: Group transactions by name and amount (to avoid false positives like Uber rides)
		const groupedTransactions: Record<string, any[]> = {};
		// biome-ignore lint/complexity/noForEach: <explanation>
		transactions.forEach((transaction) => {
			const key = `${transaction.name}-${transaction.amount}`;
			if (!groupedTransactions[key]) {
				groupedTransactions[key] = [];
			}
			groupedTransactions[key].push(transaction);
		});

		// Step 3: Filter groups by the most recent transaction date (within the last 2 months)
		const currentDate = new Date();
		const twoMonthsAgo = subDays(currentDate, 60);

		// Step 4: Check if the transactions in each group follow a monthly or annual interval
		for (const key in groupedTransactions) {
			const transactions = groupedTransactions[key];
			if (transactions.length < 2) continue; // Need at least 2 transactions to determine a pattern

			const mostRecentTransactionDate = parseISO(
				transactions[transactions.length - 1].date,
			);
			if (isBefore(mostRecentTransactionDate, twoMonthsAgo)) continue; // Skip if the most recent transaction is older than 2 months

			let isMonthly = true;
			let isAnnual = true;

			for (let i = 1; i < transactions.length; i++) {
				const previousDate = parseISO(transactions[i - 1].date);
				const currentDate = parseISO(transactions[i].date);

				if (!isValid(previousDate) || !isValid(currentDate)) {
					continue;
				}

				const daysDifference = differenceInDays(currentDate, previousDate);

				// Check if the difference in days is roughly a month (give or take a few days)
				if (daysDifference < 28 || daysDifference > 31) {
					isMonthly = false;
				}

				// Check if the difference in days is roughly a year (give or take a few days)
				if (daysDifference < 365 - 3 || daysDifference > 365 + 3) {
					isAnnual = false;
				}

				if (!isMonthly && !isAnnual) break;
			}

			if (isMonthly || isAnnual) {
				// Calculate the notification day (day before the first transaction date)
				const firstTransactionDate = parseISO(transactions[0].date);
				const notificationDay = getDate(firstTransactionDate) - 1;

				// If annual, store the month of the first transaction
				const notificationMonth = isAnnual
					? getMonth(firstTransactionDate) + 1
					: null;

				// Step 5: Store the subscription in the database
				await this.prisma.subscription.create({
					data: {
						userId: userId,
						itemId: itemId,
						name: transactions[0].name,
						amount: transactions[0].amount,
						frequency: isMonthly ? "MONTHLY" : "ANNUALLY",
						dayOfMonth: notificationDay,
						month: notificationMonth,
						isUserApproved: false,
					},
				});
			}
		}
	}
}

export const db = new Database();
