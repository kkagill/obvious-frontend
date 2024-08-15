-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('CREATED', 'CLIPS_UPLOADED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'CREATED';
