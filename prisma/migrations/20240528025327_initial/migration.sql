-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('PENDING', 'UPLOADED_TO_S3', 'UPLOADED_TO_IPFS', 'UPLOADED_TO_EVM');

-- CreateEnum
CREATE TYPE "FileUploadStatus" AS ENUM ('PENDING', 'UPLOADED_TO_S3', 'UPLOADED_TO_IPFS');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "availableCredits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditPurchaseHistory" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPurchaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "rentalAddress" TEXT NOT NULL,
    "securityDeposit" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "otherPartyEmail" TEXT NOT NULL,
    "creditsCharged" INTEGER NOT NULL,
    "numImages" INTEGER NOT NULL,
    "numVideos" INTEGER,
    "totalSeconds" INTEGER,
    "totalImagesSizeMB" DECIMAL(7,2) NOT NULL,
    "totalVideosSizeMB" DECIMAL(7,2),
    "s3FolderName" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" BIGSERIAL NOT NULL,
    "recordId" BIGINT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "fileSize" DECIMAL(7,2) NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Location" TEXT NOT NULL,
    "ipfsHash" TEXT,
    "type" "FileType" NOT NULL DEFAULT 'IMAGE',
    "uploadStatus" "FileUploadStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" BIGSERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_providerAccountId_key" ON "Account"("providerId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_token_key" ON "VerificationRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_identifier_token_key" ON "VerificationRequest"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditPurchaseHistory" ADD CONSTRAINT "CreditPurchaseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "Record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
