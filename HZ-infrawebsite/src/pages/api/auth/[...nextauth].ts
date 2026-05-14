import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import * as jwt from 'jsonwebtoken';

const backend = (
  process.env.INFRA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_INFRA_API_URL ||
  'http://127.0.0.1:4001'
)
  .trim()
  .replace(/\/+$/, '');

/** On localhost, cookies are host-scoped (not port-scoped), so HZ-infraadmin + HZ-infrawebsite must not share default NextAuth names or they overwrite each other's session → JWEDecryptionFailed. */
const secureCookies = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        token: { label: 'Token', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.token) {
          try {
            const decoded = jwt.verify(
              credentials.token,
              process.env.INFRA_JWT_SECRET!,
            ) as {
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
              accessToken: credentials.token as string,
            };
          } catch {
            return null;
          }
        }

        if (credentials?.email && credentials?.password) {
          const res = await fetch(`${backend}/auth/customer/login-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email.trim(),
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = (await res.json()) as {
            accessToken: string;
            customer: {
              customerId: string;
              phone?: string | null;
              email?: string | null;
              name?: string | null;
            };
          };
          const c = data.customer;
          return {
            id: c.customerId,
            phone: c.phone ?? undefined,
            email: c.email ?? undefined,
            name: c.name ?? undefined,
            accessToken: data.accessToken,
          };
        }

        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.INFRA_NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: secureCookies ? '__Secure-hz-infrawebsite.session-token' : 'hz-infrawebsite.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies },
    },
    callbackUrl: {
      name: secureCookies ? '__Secure-hz-infrawebsite.callback-url' : 'hz-infrawebsite.callback-url',
      options: { sameSite: 'lax', path: '/', secure: secureCookies },
    },
    csrfToken: {
      name: secureCookies ? '__Host-hz-infrawebsite.csrf-token' : 'hz-infrawebsite.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies },
    },
    pkceCodeVerifier: {
      name: secureCookies ? '__Secure-hz-infrawebsite.pkce.code_verifier' : 'hz-infrawebsite.pkce.code_verifier',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies, maxAge: 900 },
    },
    state: {
      name: secureCookies ? '__Secure-hz-infrawebsite.state' : 'hz-infrawebsite.state',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies, maxAge: 900 },
    },
    nonce: {
      name: secureCookies ? '__Secure-hz-infrawebsite.nonce' : 'hz-infrawebsite.nonce',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: secureCookies },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === 'google' && account.id_token) {
        const res = await fetch(`${backend}/auth/customer/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: account.id_token }),
        });
        let data: { accessToken?: string } = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        if (!res.ok || !data.accessToken) {
          throw new Error('Google sign-in failed');
        }
        const decoded = jwt.verify(
          data.accessToken,
          process.env.INFRA_JWT_SECRET!,
        ) as {
          customerId?: string;
          sub?: string;
          phone?: string;
          email?: string;
          name?: string;
        };
        token.customerId = decoded.customerId || decoded.sub;
        token.phone = decoded.phone;
        token.email = decoded.email;
        token.name = decoded.name;
        token.accessToken = data.accessToken;
        return token;
      }

      if (trigger === 'update' && session && (session as { phone?: string }).phone !== undefined) {
        token.phone = (session as { phone: string }).phone;
      }

      if (user) {
        const u = user as unknown as {
          id: string;
          phone?: string;
          email?: string;
          name?: string;
          accessToken?: string;
        };
        token.customerId = u.id;
        token.phone = u.phone;
        token.email = u.email;
        token.name = u.name;
        if (u.accessToken) token.accessToken = u.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.customerId && session.user) {
        session.user.id = token.customerId as string;
        (session.user as { customerId?: string }).customerId = token.customerId as string;
        (session.user as { phone?: string | null }).phone = (token.phone as string | null) ?? null;
        (session.user as { email?: string | null }).email = (token.email as string | null) ?? null;
        (session.user as { name?: string | null }).name = (token.name as string | null) ?? null;
        (session as { accessToken?: string }).accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
