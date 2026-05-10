import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'OTP',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        try {
          const decoded = jwt.verify(credentials.token, process.env.INFRA_JWT_SECRET!) as {
            customerId?: string;
            sub?: string;
            phone?: string;
            email?: string;
            name?: string;
            kind?: string;
          };
          if (decoded.kind && decoded.kind !== 'customer') return null;
          const customerId = decoded.customerId || decoded.sub;
          if (!customerId) return null;

          return {
            id: customerId,
            phone: decoded.phone,
            email: decoded.email,
            name: decoded.name,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.INFRA_NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.customerId = user.id;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { customerId?: string }).customerId = token.customerId as string | undefined;
        (session.user as { phone?: string }).phone = token.phone as string | undefined;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
