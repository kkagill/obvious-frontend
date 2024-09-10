import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { videos } = data;

  if (!videos || videos.length === 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const payload = { videos };

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.user.jwt.access.token;

    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/s3/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch signed URLs' }, { status: apiResponse.status });
    }

    const responseData = await apiResponse.json();
    const { signedUrls, s3FolderName } = responseData;

    return NextResponse.json({ signedUrls, s3FolderName }, { status: 200 });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}