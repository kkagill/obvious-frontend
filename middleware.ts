import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { encode, getToken } from "next-auth/jwt";

export const config = {
  matcher: "/:path*",
};

const sessionCookie = process.env.NEXTAUTH_URL?.startsWith("https://")
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

function signOut(request: NextRequest) {
  const response = NextResponse.next();

  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes("next-auth.session-token")) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}

function shouldUpdateToken(expires: Date) {
  return new Date() >= expires;
}

export const middleware: NextMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Skip the middleware if the user is already on the login page
  if (pathname === '/') {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  // if (!token) {
  //   return signOut(request);
  // }

  let response = NextResponse.next();

  // @ts-ignore
  const updateToken = shouldUpdateToken(new Date(token?.jwt?.access?.expires));
  
  if (updateToken) {
    try {
      // @ts-ignore
      const newTokens = await refreshTokens(token?.jwt?.refresh?.token);
      const newSessionToken = await encode({
        secret: process.env.NEXTAUTH_SECRET as string,
        token: {
          ...newTokens,
        },
        maxAge: 30 * 24 * 60 * 60,
      });
      response = updateCookie(newSessionToken, request, response);
    } catch (error) {
      response = updateCookie(null, request, response); // Clear cookies if refreshing tokens fails
    }
  }

  return response;
};

async function refreshTokens(refreshToken: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data;
}

function updateCookie(
  sessionToken: string | null,
  request: NextRequest,
  response: NextResponse
) {
  if (sessionToken) {
    request.cookies.set(sessionCookie, sessionToken);

    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    response.cookies.set(sessionCookie, sessionToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    request.cookies.delete(sessionCookie);
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.cookies.delete(sessionCookie);
  }

  return response;
}
