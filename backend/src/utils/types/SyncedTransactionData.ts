import { RemovedTransaction, Transaction } from "plaid";

export interface SyncedTransactionData {
  added: Transaction[];
  removed: RemovedTransaction[];
  modified: Transaction[];
  nextCursor: string;
}
