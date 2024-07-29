/*
  Warnings:

  - Added the required column `isUserApproved` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `frequency` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('MONTHLY', 'ANNUALLY');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "isUserApproved" BOOLEAN NOT NULL,
DROP COLUMN "frequency",
ADD COLUMN     "frequency" "Frequency" NOT NULL;
