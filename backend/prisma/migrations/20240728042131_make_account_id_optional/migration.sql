-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isUserInput" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "account_id" DROP NOT NULL;
