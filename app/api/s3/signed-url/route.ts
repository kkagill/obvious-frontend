import { NextResponse, NextRequest } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { images, videos } = data;

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in.' },
        { status: 401 }
      );
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const uuid = uuidv4();
    const presignedUrls = [];

    const combined = [...images, ...videos];

    for (const c of combined) {
      const fileKey = `${uuid}/${c.name}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: c.type,
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
