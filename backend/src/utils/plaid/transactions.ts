import { db } from "@/utils/database/db";
import { plaidClient } from "./client";
import {
  RemovedTransaction,
  Transaction,
  TransactionsSyncResponse,
} from "plaid";
import { SyncedTransactionData } from "../types/SyncedTransactionData";

/**
 * A simple object to pass to our database functions that represents the data
 *  our application cares about from the Plaid transaction endpoint
 */
class SimpleTransaction {
  constructor(
    id: string,
    userId: string,
    accountId: string,
    category: string,
    date: string,
    authorizedDate: string,
    name: string,
    amount: number,
    currencyCode: string,
    pendingTransactionId: string
  ) {
    this.id = id;
    this.userId = userId;
    this.accountId = accountId;
    this.category = category;
    this.date = date;
    this.authorizedDate = authorizedDate;
    this.name = name;
    this.amount = amount;
    this.currencyCode = currencyCode;
    this.pendingTransactionId = pendingTransactionId;
  }

  /**
   * Static factory method for creating the SimpleTransaction object
   *
   * @param {import("plaid").Transaction} txnObj The transaction object returned from the Plaid API
   * @param {string} userId The userID
   * @returns SimpleTransaction
   */
  static fromPlaidTransaction(txnObj, userId) {
    return new SimpleTransaction(
      txnObj.transaction_id,
      userId,
      txnObj.account_id,
      txnObj.personal_finance_category.primary,
      txnObj.date,
      txnObj.authorized_date,
      txnObj.merchant_name ?? txnObj.name,
      txnObj.amount,
      txnObj.iso_currency_code,
      txnObj.pending_transaction_id
    );
  }
}

export const syncTransactions = async function (itemId: string) {
  // Step 1: Retrieve our access token and cursor from the database

  const itemInfo = await db.getItemInfo(itemId);
  if (!itemInfo) {
    throw new Error(`Item with id ${itemId} not found`); // TODO - handle this error
  }
  const {
    access_token: accessToken,
    transaction_cursor: transactionCursor,
    user_id: userId,
  } = itemInfo;

  const summary = { added: 0, removed: 0, modified: 0 };
  const allData = await fetchNewSyncData(accessToken, transactionCursor);

  // STEP 2: Save new transactions to the database
  await Promise.all(
    allData.added.map(async (txnObj) => {
      console.log(`I want to add ${txnObj.transaction_id}`);
      const result = await db.addNewTransaction(
        SimpleTransaction.fromPlaidTransaction(txnObj, userId)
      );
      if (result) {
        summary.added += result.changes;
      }
    })
  );

  // STEP 3: Update modified transactions in our database
  await Promise.all(
    allData.modified.map(async (txnObj) => {
      console.log(`I want to modify ${txnObj.transaction_id}`);
      const result = await db.modifyExistingTransaction(
        SimpleTransaction.fromPlaidTransaction(txnObj, userId)
      );
      if (result) {
        summary.modified += result.changes;
      }
    })
  );

  // STEP 4: Do something in our database with the removed transactions
  await Promise.all(
    allData.removed.map(async (txnObj) => {
      console.log(`I want to remove ${txnObj.transaction_id}`);
      // const result = await db.deleteExistingTransaction(
      //   txnObj.transaction_id
      // );
      const result = await db.markTransactionAsRemoved(txnObj.transaction_id);
      if (result) {
        summary.removed += result.changes;
      }
    })
  );

  console.log(`The last cursor value was ${allData.nextCursor}`);
  // Step 5: Save our cursor value to the database
  await db.saveCursorForItem(allData.nextCursor, itemId);

  console.log(summary);
  return summary;
};

export const fetchNewSyncData = async function (
  accessToken: string,
  initialCursor: string,
  retriesLeft = 3
): Promise<SyncedTransactionData> {
  const allData = {
    added: [] as Transaction[],
    removed: [] as RemovedTransaction[],
    modified: [] as Transaction[],
    nextCursor: initialCursor,
  };
  if (retriesLeft <= 0) {
    console.error("Too many retries!");
    // We're just going to return no data and keep our original cursor. We can try again later.
    return allData;
  }
  try {
    let keepGoing = false;
    do {
      const results = await plaidClient.transactionsSync({
        access_token: accessToken,
        options: {
          include_personal_finance_category: true,
        },
        cursor: allData.nextCursor,
      });
      const newData = results.data;
      allData.added = allData.added.concat(newData.added);
      allData.modified = allData.modified.concat(newData.modified);
      allData.removed = allData.removed.concat(newData.removed);
      allData.nextCursor = newData.next_cursor;
      keepGoing = newData.has_more;
      console.log(
        `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length} `
      );

      // if (Math.random() < 0.5) {
      //   throw new Error("SIMULATED PLAID SYNC ERROR");
      // }
    } while (keepGoing === true);
    return allData;
  } catch (error) {
    // If you want to see if this is a sync mutation error, you can look at
    // error?.response?.data?.error_code
    console.log(
      `Oh no! Error! ${JSON.stringify(
        error
      )} Let's try again from the beginning!`
    );
    setTimeout(() => {}, 1000);
    return fetchNewSyncData(accessToken, initialCursor, retriesLeft - 1);
  }
};
