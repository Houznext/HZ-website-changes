import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const backendUrl = process.env.INFRA_BACKEND_URL || 'http://localhost:4001';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await axios.post(`${backendUrl.replace(/\/$/, '')}/auth/admin/login`, {
            email: credentials.email,
            password: credentials.password,
          });
          const { admin, token } = res.data as {
            admin?: { adminId: string; email: string; name?: string | null; role: string };
            token?: string;
          };
          if (!admin || !token) return null;
          return {
            id: admin.adminId,
            email: admin.email,
            name: admin.name ?? undefined,
            role: admin.role,
            accessToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  secret: process.env.INFRA_ADMIN_NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.adminId = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.adminId = token.adminId as string | undefined;
      session.role = token.role as string | undefined;
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};

export default NextAuth(authOptions);
