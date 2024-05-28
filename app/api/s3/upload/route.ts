import { NextResponse, NextRequest } from "next/server";
import { FileUploadStatus, RecordStatus } from "@prisma/client";
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import prisma from '@/libs/prisma';

// Define an interface for the uploaded file metadata
interface UploadedFile {
  fileName: string;
  fileExtension: string;
  fileSize: string;
  s3Key: string;
  s3Location: string;
  type: 'IMAGE' | 'VIDEO';
}

// Configure the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteUploadedFiles = async (keys: string[]) => {
  const deletePromises = keys.map(key => {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };
    return s3Client.send(new DeleteObjectCommand(deleteParams));
  });

  try {
    await Promise.all(deletePromises);
    console.log('Successfully deleted uploaded files from S3.');
  } catch (error) {
    console.error('Error deleting files from S3:', error);
  }
};

export async function POST(req: NextRequest) {
  let uploadedFileKeys: string[] = [];

  try {
    const data = await req.json();

    const {
      role,
      address,
      securityDepositAmount,
      securityDepositCurrency,
      otherEmail,
      totalCredits,
      totalVideoSeconds,
      s3FolderName,
      uploadedFiles,
      totalImageSizeMB,
      totalVideoSizeMB
    }: {
      role: string;
      address: string;
      securityDepositAmount: string;
      securityDepositCurrency: string;
      otherEmail: string;
      totalCredits: string;
      totalVideoSeconds: string;
      s3FolderName: string;
      uploadedFiles: UploadedFile[];
      totalImageSizeMB: string;
      totalVideoSizeMB: string;
    } = data;

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the string values to integers
    const securityDepositAmountInt = parseInt(securityDepositAmount, 10);
    const totalCreditsInt = parseInt(totalCredits, 10);
    const totalVideoSecondsInt = parseInt(totalVideoSeconds, 10);
    const totalImageSizeMBInt = parseFloat(totalImageSizeMB);
    const totalVideoSizeMBInt = parseFloat(totalVideoSizeMB);
    console.log({ totalImageSizeMBInt })
    console.log({ totalVideoSizeMBInt })
    if (!role || !address || isNaN(securityDepositAmountInt) || !securityDepositCurrency || !s3FolderName ||
      !otherEmail || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(otherEmail) || isNaN(totalCreditsInt) ||
      isNaN(totalImageSizeMBInt) || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    uploadedFileKeys = uploadedFiles.map(file => file.s3Key);

    await prisma.$transaction(async (prisma) => {
      // Create a new record first
      const record = await prisma.record.create({
        data: {
          userId: session.user.id,
          role: role,
          rentalAddress: address,
          securityDeposit: securityDepositAmountInt,
          currency: securityDepositCurrency,
          otherPartyEmail: otherEmail,
          creditsCharged: totalCreditsInt,
          totalSeconds: totalVideoSecondsInt,
          totalImagesSizeMB: totalImageSizeMBInt,
          totalVideosSizeMB: totalVideoSizeMBInt,
          s3FolderName: s3FolderName,
          numImages: uploadedFiles.filter((file: UploadedFile) => file.type === 'IMAGE').length,
          numVideos: uploadedFiles.filter((file: UploadedFile) => file.type === 'VIDEO').length,
        },
      });

      // Decrease the user's available credits
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          availableCredits: {
            decrement: totalCreditsInt,
          },
        },
      });

      if (user.availableCredits < 0) {
        throw new Error('Sorry, you have insufficient credits.');
      }

      // Update the record status to indicate all files are uploaded
      await prisma.record.update({
        where: {
          id: record.id,
          userId: session.user.id
        },
        data: {
          status: RecordStatus.UPLOADED_TO_S3,
        },
      });

      //throw new Error('Test');

      // Save each uploaded file information in the database
      for (const file of uploadedFiles) {
        await prisma.file.create({
          data: {
            recordId: record.id,
            fileName: file.fileName,
            fileExtension: file.fileExtension,
            fileSize: parseFloat(file.fileSize),
            s3Key: file.s3Key,
            s3Location: file.s3Location,
            type: file.type,
            uploadStatus: FileUploadStatus.UPLOADED_TO_S3,
          },
        });
      }
      return uploadedFiles;
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    await deleteUploadedFiles(uploadedFileKeys);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
