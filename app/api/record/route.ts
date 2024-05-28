import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { serializeBigInt } from "@/libs/serializeBigInt";
import prisma from '@/libs/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecords = await prisma.record.findMany({
      where: {
        userId: session?.user?.id,
      }
    });

    const serializedRecords = serializeBigInt(userRecords);

    return NextResponse.json(serializedRecords, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}