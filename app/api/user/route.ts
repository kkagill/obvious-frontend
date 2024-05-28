import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import prisma from '@/libs/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
      select: {
        customerId: true,
        email: true,
        availableCredits: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
