import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.user.jwt.access.token;
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dash`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Request failed:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}