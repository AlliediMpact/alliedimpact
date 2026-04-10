/**
 * Auth Configuration - Stub Implementation
 */
import { NextAuthOptions } from 'next-auth';
import type { User, Session } from 'next-auth';

// Extend the default User type to include id
declare module 'next-auth' {
  interface User {
    id: string;
  }
  interface Session {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = (user as any).id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        (session.user as any).id = token.uid;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
};
