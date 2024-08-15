/*
  Warnings:

  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Record` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'UPLOADED_TO_S3');

-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('PENDING', 'UPLOADED_TO_S3');

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_recordId_fkey";

-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_userId_fkey";

-- DropTable
DROP TABLE "Currency";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "Record";

-- DropEnum
DROP TYPE "FileType";

-- DropEnum
DROP TYPE "FileUploadStatus";

-- DropEnum
DROP TYPE "RecordStatus";

-- CreateTable
CREATE TABLE "Video" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "creditsCharged" INTEGER NOT NULL,
    "numOfClips" INTEGER NOT NULL,
    "totalSeconds" INTEGER NOT NULL,
    "videosSizeInMB" DECIMAL(7,2) NOT NULL,
    "s3FolderName" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" BIGSERIAL NOT NULL,
    "videoId" BIGINT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalSeconds" INTEGER NOT NULL,
    "fileSizeInMB" DECIMAL(7,2) NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Location" TEXT NOT NULL,
    "uploadStatus" "ClipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
