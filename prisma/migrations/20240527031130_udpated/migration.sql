/*
  Warnings:

  - Made the column `s3FolderName` on table `Record` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Record" ALTER COLUMN "s3FolderName" SET NOT NULL;
