import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from '@/libs/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // User who are not logged in can't make a purchase
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
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

    return NextResponse.json({ user }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
