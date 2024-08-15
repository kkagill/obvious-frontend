/*
  Warnings:

  - You are about to drop the column `uploadStatus` on the `Clip` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "uploadStatus",
ADD COLUMN     "status" "ClipStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "duration" INTEGER NOT NULL;
