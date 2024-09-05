import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string,
      username: string,
      role: string,
      isOAuth: boolean,
      emailConfirmed: boolean,
      jwt: {
        access: {
          token: string,
          expires: Date,
        },
        refresh: {
          token: string,
          expires: Date,
        }
      },
    }
  }
}