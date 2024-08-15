/*
  Warnings:

  - Added the required column `fileExtension` to the `Clip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileExtension` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clip" ADD COLUMN     "fileExtension" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "fileExtension" TEXT NOT NULL;
