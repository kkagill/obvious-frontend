/*
  Warnings:

  - The values [FAILED_VIDEO_UPLOAD] on the enum `RecordStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecordStatus_new" AS ENUM ('PENDING', 'UPLOADED_TO_S3', 'UPLOADED_TO_IPFS', 'UPLOADED_TO_EVM');
ALTER TABLE "Record" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Record" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TYPE "RecordStatus" RENAME TO "RecordStatus_old";
ALTER TYPE "RecordStatus_new" RENAME TO "RecordStatus";
DROP TYPE "RecordStatus_old";
ALTER TABLE "Record" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
