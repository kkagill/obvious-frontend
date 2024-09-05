import NextAuth from "next-auth";
import type { AuthOptions, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import config from "@/config";
import { clientBackendPublic } from "./axios";
import { getToken } from "next-auth/jwt";
import { NextApiResponse } from "next";

export const authOptions: AuthOptions = {
  // Set any random key in .env.local
  //secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await clientBackendPublic.post(
            '/auth/login',
            {
              email: credentials?.email,
              password: credentials?.password
            }
          );

          if (response.data) {
            //setCookie(response, res);
            console.log({ response })
            return response.data;
          } else {
            return null;
          }
        } catch (ex: any) {
          throw new Error(JSON.stringify({ error: ex?.response.data }))
        }
      },
    }),
  ],
  events: {
    async signOut() {
      // const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
      // const refreshToken = token?.jwt?.refresh?.token;
      try {
        await clientBackendPublic.post(
          '/auth/logout',
          // {
          //   refreshToken: refreshToken,
          // }
        );
        //removeCookies(res);
      } catch (ex: any) {
        throw new Error(JSON.stringify({ error: ex?.response.data }))
      }
    },
  },
  pages: {
    signIn: "/",
    error: '/',
  },
  callbacks: {
    async signIn({ user, account, profile, res }: { user: any; account: any; profile: any; res: NextApiResponse }) {
      // console.log({user})
      // console.log({account})
      // console.log({profile})
      // Handle social login
      if (account?.providerAccountId && account?.type !== 'credentials') {
        // Allow only Google OAuth login
        if (account.provider !== 'google') {
          return false;
        }

        try {
          const config = {
            headers: {
              'x-oauth-api-key': process.env.OAUTH_API_KEY,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          };

          const payload = {
            email: profile?.email,
            type: account?.type,
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
            idToken: account?.id_token,
            expiresAt: account?.expires_at!,
            tokenType: account?.token_type!,
            scope: account?.scope!,
          };

          const response = await clientBackendPublic.post(
            '/auth/login-oauth',
            payload,
            config
          );

          if (response.data) {
            // Set cookies or perform other necessary actions
            //setCookie(response, res);

            // Assign returned values to the user object
            const { isOAuth, username, role, emailConfirmed, jwt } = response.data;
            Object.assign(user, { isOAuth, username, role, emailConfirmed, jwt });

            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.error('Error during OAuth login:', error);
          return false;  // Explicitly return false on error
        }
      }

      // Handle credentials login
      return account?.type === 'credentials';
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        console.log({ token })
        return { ...token, ...session.user };
      }

      return { ...token, ...user };
    },
    session: async ({ session, token }) => {
      console.log({ session })
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `https://obvious-logo.s3.amazonaws.com/logo.png`,
  },
};


export default NextAuth(authOptions);