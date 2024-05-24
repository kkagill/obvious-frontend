/*
  Warnings:

  - You are about to drop the column `videoLength` on the `File` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "RecordStatus" ADD VALUE 'FAILED_VIDEO_UPLOAD';

-- AlterTable
ALTER TABLE "File" DROP COLUMN "videoLength";
