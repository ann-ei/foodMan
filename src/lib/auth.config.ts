import type { NextAuthConfig } from "next-auth";

// Shared auth config — no heavy imports (Prisma, bcrypt) so it can run on Edge
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");

      if (isAuthPage) {
        return isLoggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Added in auth.ts with credentials
  session: {
    strategy: "jwt",
  },
  trustHost: true,
};
