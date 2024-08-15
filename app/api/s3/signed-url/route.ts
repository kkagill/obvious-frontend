import { NextResponse, NextRequest } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/libs/next-auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { videos } = data;

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (videos.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const uuid = uuidv4();
    const presignedUrls = [];

    for (const v of videos) {
      const fileKey = `${session.user.id}/${v.name}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: v.type,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      presignedUrls.push({ url, key: fileKey });
    }

    return NextResponse.json({ data: presignedUrls, s3FolderName: uuid }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
