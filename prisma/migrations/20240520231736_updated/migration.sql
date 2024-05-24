/*
  Warnings:

  - You are about to alter the column `securityDeposit` on the `Record` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Record" ALTER COLUMN "securityDeposit" SET DATA TYPE INTEGER;
