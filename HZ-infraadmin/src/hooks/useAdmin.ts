import { useSession } from 'next-auth/react';

/** Admin session helpers (NextAuth + local or backend JWT in session). */
export function useAdminSession() {
  const { data: session, status } = useSession();
  const u = session?.user;
  return {
    session,
    status,
    accessToken: session?.accessToken,
    adminId: u?.id,
    role: u?.role,
  };
}
