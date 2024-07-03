import { Prisma, PrismaClient } from "@prisma/client";
import { SimpleTransaction } from "../types/transactions";

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
      account_name: transaction.account.name,
      bank_name: transaction.account.item.bank_name,
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

  async getItemInfo(itemId: string) {
    const result = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: {
        user_id: true,
        access_token: true,
        transaction_cursor: true,
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
      },
    });
    return result;
  }

  async addItem(itemId: string, userId: string, accessToken: string) {
    const result = await this.prisma.item.create({
      data: {
        id: itemId,
        user_id: userId,
        access_token: accessToken,
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

  async deactivateItem(itemId: string) {
    const updateResult = await this.prisma.item.update({
      where: { id: itemId },
      data: {
        access_token: "REVOKED",
        is_active: false,
      },
    });
    return updateResult;

    // TODO: Potentially Delete transactions for accounts belonging to this item, Delete accounts that belong to this item, Delete the item itself from the database
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

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const db = new Database();
