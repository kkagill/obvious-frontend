/*
  Warnings:

  - You are about to drop the column `s3Location` on the `Clip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "s3Location",
ALTER COLUMN "fileExtension" SET DEFAULT '.mp4';
