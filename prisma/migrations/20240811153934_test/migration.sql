/*
  Warnings:

  - You are about to drop the column `fileSizeInMB` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `totalSeconds` on the `Clip` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `videosSizeInMB` on the `Video` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Clip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3FolderName` to the `Clip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeInMB` to the `Clip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileName` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedDuration` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Location` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeInMB` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clip" DROP COLUMN "fileSizeInMB",
DROP COLUMN "status",
DROP COLUMN "totalSeconds",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "s3FolderName" TEXT NOT NULL,
ADD COLUMN     "sizeInMB" DECIMAL(7,2) NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "duration",
DROP COLUMN "status",
DROP COLUMN "videosSizeInMB",
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "requestedDuration" INTEGER NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "s3Location" TEXT NOT NULL,
ADD COLUMN     "sizeInMB" DECIMAL(7,2) NOT NULL;

-- DropEnum
DROP TYPE "ClipStatus";

-- DropEnum
DROP TYPE "VideoStatus";
