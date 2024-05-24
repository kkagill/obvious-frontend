import { NextResponse } from "next/server";
import prisma from '@/libs/prisma';

export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      select: {
        currency: true,
      },
      orderBy: {
        currency: 'asc',
      },
    });
    return NextResponse.json(currencies, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}