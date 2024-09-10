import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

// Define an interface for the uploaded file metadata
interface UploadedFile {
  fileName: string;
  fileExtension: string;
  fileSize: string;
  s3Key: string;
  s3Location: string;
  type: 'VIDEO' | 'CLIP';
}

export async function POST(req: NextRequest) {
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

  const payload = {
    clipAmount: parseInt(clipAmount, 10),
    duration: parseInt(duration, 10),
    totalVideoSeconds: parseInt(totalVideoSeconds, 10),
    totalVideoSizeMB: parseFloat(totalVideoSizeMB),
    s3FolderName,
    uploadedFiles,
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.user.jwt.access.token;

    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/s3/upload-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: apiResponse.status });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}