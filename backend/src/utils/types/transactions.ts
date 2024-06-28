import { RemovedTransaction, Transaction as PlaidTransaction } from "plaid";
import { Transaction } from "@prisma/client";

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
class SimpleTransaction {
  transaction: Transaction;
  pending_transaction_id: string | null;
  
  constructor(
    transaction: Transaction,
    pending_transaction_id: string | null
  ) {
    this.transaction = transaction;
    this.pending_transaction_id = pending_transaction_id;
  }

  /**
   * Static factory method for creating the SimpleTransaction object
   *
   * @param {import("plaid").Transaction} txnObj The transaction object returned from the Plaid API
   * @param {string} userId The userID
   * @returns SimpleTransaction
   */
  static fromPlaidTransaction(txnObj: PlaidTransaction, userId: string) {
    return new SimpleTransaction({
      id: txnObj.transaction_id,
      user_id: userId,
      account_id: txnObj.account_id,
      category: txnObj.personal_finance_category.primary,
      date: txnObj.date,
      authorized_date: txnObj.authorized_date,
      name: txnObj.merchant_name ?? txnObj.name,
      amount: txnObj.amount,
      currency_code: txnObj.iso_currency_code,
  }, txnObj.pending_transaction_id);
  }
}
id: string;
    user_id: string;
    account_id: string;
    category: string | null;
    date: string;
    authorized_date: string | null;
    name: string | null;
    amount: number;
    currency_code: string | null;
    is_removed: boolean;
    itemId: string | null;


'{ id: string; user_id: string; account_id: string; category: string; date: string; authorized_date: string | null; name: string; amount: number; currency_code: string | null; }' is not assignable to parameter of type 
'{ id: string; user_id: string; account_id: string; category: string | null; date: string; authorized_date: string | null; name: string | null; amount: number; currency_code: string | null; is_removed: boolean; itemId: string | null; }'.
'{ id: string; user_id: string; account_id: string; category: string; date: string; authorized_date: string | null; name: string; amount: number; currency_code: string | null; }' is missing the following properties from type '{ id: string; user_id: string; account_id: string; category: string | null; date: string; authorized_date: string | null; name: string | null; amount: number; currency_code: string | null; is_removed: boolean; itemId: string | null; }': is_removed, itemId