/*
  Warnings:

  - You are about to drop the column `accountId` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_accountId_fkey";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "accountId",
ADD COLUMN     "itemId" TEXT,
ALTER COLUMN "isUserApproved" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
