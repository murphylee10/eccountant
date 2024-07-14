import { RemovedTransaction, Transaction as PlaidTransaction } from "plaid";
import { Transaction } from "@prisma/client";
import { CATEGORY_MAP } from "./categoryMap";

export interface SyncedTransactionData {
  added: PlaidTransaction[];
  removed: RemovedTransaction[];
  modified: PlaidTransaction[];
  nextCursor?: string;
}

/**
 * A simple object to pass to our database functions that represents the data
 *  our application cares about from the Plaid transaction endpoint
 */
export class SimpleTransaction {
  transaction: Transaction;
  pending_transaction_id: string | null;

  constructor(transaction: Transaction, pending_transaction_id: string | null) {
    this.transaction = transaction;
    this.pending_transaction_id = pending_transaction_id;
  }

  /**
   * Static factory method for creating the SimpleTransaction object
   */
  static fromPlaidTransaction(txnObj: PlaidTransaction, userId: string) {
    return new SimpleTransaction(
      {
        id: txnObj.transaction_id,
        user_id: userId,
        account_id: txnObj.account_id,
        category:
          CATEGORY_MAP[
            txnObj.personal_finance_category
              ? txnObj.personal_finance_category.primary
              : ""
          ] ||
          txnObj.personal_finance_category?.primary ||
          "Unknown",
        date: txnObj.date,
        authorized_date: txnObj.authorized_date,
        name: txnObj.merchant_name ?? txnObj.name,
        amount: txnObj.amount,
        currency_code: txnObj.iso_currency_code,
        is_removed: false,
      },
      txnObj.pending_transaction_id,
    );
  }
}
