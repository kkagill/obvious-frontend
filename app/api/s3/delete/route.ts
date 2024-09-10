import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function POST(req: NextRequest) {
  const { keys } = await req.json();

  if (!keys || keys.length === 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const payload = { keys };

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.user.jwt.access.token;

    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/s3/delete-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to delete files' }, { status: apiResponse.status });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error({ error });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}