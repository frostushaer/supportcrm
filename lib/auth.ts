import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';

interface CredentialsType {
  email: string;
  password: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const creds = credentials as CredentialsType;
        // TODO: Replace with actual database verification in Phase 2
        if (creds.email === 'admin@supportcrm.io' && creds.password === 'demo') {
          return {
            id: '1',
            name: 'Admin User',
            email: 'admin@supportcrm.io',
            role: 'Admin',
            regionId: 'region_1',
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.regionId = user.regionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.regionId = token.regionId as string;
      }
      return session;
    },
  },
});
