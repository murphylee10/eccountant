import { PrismaClient } from "@prisma/client";
import { SimpleTransaction } from "../types/transactions";

class Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /* Transaction interactions */

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

  /* Item interactions */

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

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const db = new Database();
