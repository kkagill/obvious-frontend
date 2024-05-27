import { NextResponse, NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import config from "@/config";
import prisma from "@/libs/prisma";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  console.log({code})
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { session },
    } = await supabase.auth.getSession();

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
    });
    
    if (!user) {
      await prisma.user.create({
        data: {
          id: session.user.id,
          email: session?.user?.email,
        },
      });
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
