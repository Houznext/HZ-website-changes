import 'next-auth';

declare module 'next-auth' {
  interface User {
    phone?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      customerId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    customerId?: string;
    phone?: string;
  }
}
