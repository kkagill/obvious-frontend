import { NextResponse, NextRequest } from "next/server";
import prisma from '@/libs/prisma';
import { VideoStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON payload
    const payload = await req.json();

    // Extract relevant data from the payload
    const { videoId, fileName, duration, sizeInMB, s3FolderName, s3Key } = payload;

    console.log({ payload });

    const clip = await prisma.clip.create({
      data: {
        videoId: videoId,
        fileName: fileName,
        duration: duration,
        sizeInMB: sizeInMB,
        s3FolderName: s3FolderName,
        s3Key: s3Key,
      },
    });

    console.log({ clip });

    // temporary... it verify all clips are updated
    const user = await prisma.video.update({
      where: { id: videoId },
      data: {
        status: VideoStatus.CLIPS_UPLOADED
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error("Error processing request:", e?.message);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  } finally {
    // Disconnect Prisma Client when done to avoid connection leaks
    await prisma.$disconnect();
  }
}
