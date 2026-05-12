import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

/** NextAuth authorize runs on the Node server; localhost → 127.0.0.1 avoids IPv6 ::1 ECONNREFUSED on Windows. */
function serverBackendBaseUrl(): string {
  const raw = (
    process.env.INFRA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_INFRA_API_URL ||
    'http://127.0.0.1:4001'
  )
    .trim()
    .replace(/\/$/, '');
  return raw.replace(/^http:\/\/localhost(?=:|\/|$)/i, 'http://127.0.0.1');
}

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
        const email = credentials.email.trim();
        const password = credentials.password;
        try {
          const res = await axios.post(
            `${serverBackendBaseUrl()}/auth/admin/login`,
            { email, password },
            { timeout: 15000, headers: { 'Content-Type': 'application/json' } },
          );
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
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            const ax = err as { message?: string; code?: string; response?: { status?: number; data?: unknown } };
            console.error('[infra-admin NextAuth authorize]', ax.message, ax.code, ax.response?.status, ax.response?.data);
          }
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
