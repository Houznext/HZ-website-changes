import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    adminId?: string;
    role?: string;
  }

  interface User {
    role?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    adminId?: string;
    role?: string;
    accessToken?: string;
  }
}
