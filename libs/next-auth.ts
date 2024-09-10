import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { clientBackendPublic } from "./axios";
import type { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
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
            return response.data;
          }

          return null;
        } catch (ex: any) {
          throw new Error(JSON.stringify({ error: ex?.response.data }))
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/",
    error: '/',
  },
  events: {
    async signOut({ token }) {
      const refreshToken = token?.jwt?.refresh?.token;
      try {
        await clientBackendPublic.post(
          '/auth/logout',
          {
            refreshToken: refreshToken,
          }
        );
      } catch (ex: any) {
        throw new Error(JSON.stringify({ error: ex?.response.data }))
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any; profile: any; }) {
      // OAuth login
      if (account?.type == 'oauth') {
        // We accept only Google provider
        if (account.provider !== 'google') {
          return false;
        }

        try {
          const config = {
            headers: {
              'x-oauth-api-key': process.env.OAUTH_API_KEY,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
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
            // Map JWT to user for the session and token
            // Need to do this for google provider so it can go down to async jwt below
            // Otherwise google login won't have custom token from our backend
            user.id = response.data.id;
            user.jwt = response.data.jwt;
            return true;
          }

          return false;
        } catch (error) {
          console.error('Error during OAuth login:', error);
          return false;
        }
      }

      // Credential login
      return account?.type === 'credentials';
    },
    // We don't refresh tokens here because app router can't set cookies directly on the server side
    // Solution is to implement the refresh token rotation logic in middleware.ts
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.jwt = token.jwt; // Attach JWT tokens to the session.. hacky way, but it works..
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { clientBackendPublic } from "./axios";
// import type { AuthOptions } from "next-auth";

// let isRefreshing = false;

// async function refreshToken(token: any) {
//   if (isRefreshing) {
//     // Wait for the current refresh to finish
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     return token;
//   }

//   isRefreshing = true;

//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh-tokens`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         refreshToken: token.jwt.refresh.token,
//       }),
//     });

//     if (!res.ok) {
//       throw new Error('Failed to refresh token');
//     }

//     const data = await res.json();
//     token.jwt.access = data.jwt.access;
//     token.jwt.refresh = data.jwt.refresh;

//     console.log('Updated JWT with new tokens:', token.jwt);
//   } catch (error) {
//     console.error("Error refreshing token", error);
//     throw new Error('Token refresh failed');
//   } finally {
//     isRefreshing = false;
//   }

//   return token;
// }

// export const authOptions: AuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//       async profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.given_name ? profile.given_name : profile.name,
//           email: profile.email,
//           image: profile.picture,
//           createdAt: new Date(),
//         };
//       },
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           const response = await clientBackendPublic.post(
//             '/auth/login',
//             {
//               email: credentials?.email,
//               password: credentials?.password
//             }
//           );

//           if (response.data) {
//             return response.data;
//           }

//           return null;
//         } catch (ex: any) {
//           throw new Error(JSON.stringify({ error: ex?.response.data }))
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/",
//     error: '/',
//   },
//   events: {
//     async signOut({ token }) {
//       const refreshToken = token?.jwt?.refresh?.token;

//       try {
//         await clientBackendPublic.post(
//           '/auth/logout',
//           {
//             refreshToken: refreshToken,
//           }
//         );
//       } catch (ex: any) {
//         throw new Error(JSON.stringify({ error: ex?.response.data }))
//       }
//     },
//   },
//   callbacks: {
//     async signIn({ user, account, profile }: { user: any; account: any; profile: any; }) {
//       // OAuth login
//       if (account?.type == 'oauth') {
//         // We accept only Google provider
//         if (account.provider !== 'google') {
//           return false;
//         }

//         try {
//           const config = {
//             headers: {
//               'x-oauth-api-key': process.env.OAUTH_API_KEY,
//               'Accept': 'application/json',
//               'Content-Type': 'application/json',
//             },
//           };

//           const payload = {
//             email: profile?.email,
//             type: account?.type,
//             provider: account?.provider,
//             providerAccountId: account?.providerAccountId,
//             idToken: account?.id_token,
//             expiresAt: account?.expires_at!,
//             tokenType: account?.token_type!,
//             scope: account?.scope!,
//           };

//           const response = await clientBackendPublic.post(
//             '/auth/login-oauth',
//             payload,
//             config
//           );

//           if (response.data) {
//             // Map JWT to user for the session and token
//             // Need to do this for google provider so it can go down to async jwt below
//             // Otherwise google login won't have custom token from our backend
//             user.id = response.data.id;
//             user.jwt = response.data.jwt;
//             return true;
//           }

//           return false;
//         } catch (error) {
//           console.error('Error during OAuth login:', error);
//           return false;
//         }
//       }

//       // Credential login
//       return account?.type === 'credentials';
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.jwt = user.jwt; // Initial login sets the JWT
//       }

//       const accessTokenExpires = new Date(token.jwt?.access?.expires);

//       // Check if token has expired
//       if (new Date() >= accessTokenExpires) {
//         try {
//           // Call the refreshToken function
//           token = await refreshToken(token);
//         } catch (error) {
//           console.error("Error refreshing token", error);
//           // Return old token if refresh failed
//           return { ...token, error: 'RefreshTokenExpired' };
//         }
//       }

//       return token;
//     },
//     session: async ({ session, token }) => {
//       session.user.id = token.sub;
//       session.user.jwt = token.jwt; // Attach JWT tokens to the session.. hacky way, but it works..
//       console.log("SESSION!!!", session.user.jwt)
//       return session;
//     },
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);