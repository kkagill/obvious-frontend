import { NextResponse, NextRequest } from "next/server";
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
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
  type: 'VIDEO' | 'CLIP';
}

// Configure the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure the AWS SQS client
const sqsClient = new SQSClient({
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

const sendSQSMessage = async (messageBody: object) => {
  const params = {
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    MessageBody: JSON.stringify(messageBody),
  };

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log('SQS message sent:', data.MessageId);
  } catch (error) {
    console.error('Error sending SQS message:', error);
  }
};

export async function POST(req: NextRequest) {
  let uploadedFileKeys: string[] = [];

  try {
    const data = await req.json();

    const {
      clipAmount,
      duration,
      totalVideoSeconds,
      s3FolderName,
      uploadedFiles,
      totalVideoSizeMB
    }: {
      clipAmount: string;
      duration: string;
      totalVideoSeconds: string;
      s3FolderName: string;
      uploadedFiles: UploadedFile[];
      totalVideoSizeMB: string;
    } = data;

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the string values to integers
    const clipAmountInt = parseInt(clipAmount, 10);
    const durationInt = parseInt(duration, 10);
    const totalVideoSecondsInt = parseInt(totalVideoSeconds, 10);
    const totalVideoSizeMBInt = parseFloat(totalVideoSizeMB);

    if (isNaN(clipAmountInt) || !durationInt || !s3FolderName || isNaN(totalVideoSecondsInt) || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    uploadedFileKeys = uploadedFiles.map(file => file.s3Key);

    await prisma.$transaction(async (prisma) => {
      const video = await prisma.video.create({
        data: {
          userId: session.user.id,
          fileName: uploadedFiles[0].fileName,
          fileExtension: uploadedFiles[0].fileExtension,
          creditsCharged: 0,
          numOfClips: clipAmountInt,
          requestedDuration: durationInt,
          totalSeconds: totalVideoSecondsInt,
          sizeInMB: totalVideoSizeMBInt,
          s3FolderName: s3FolderName,
          s3Key: uploadedFiles[0].s3Key,
          s3Location: uploadedFiles[0].s3Location,
        },
      });

      await sendSQSMessage({
        videoId: video.id,
        userId: video.userId,
        s3Key: video.s3Key,
        type: 'video',
        numOfClips: clipAmountInt,
        duration: durationInt,
      });

      return uploadedFiles;
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    await deleteUploadedFiles(uploadedFileKeys);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
