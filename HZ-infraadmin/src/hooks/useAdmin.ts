import { useSession } from 'next-auth/react';

/** Admin session helpers (NextAuth + infra backend JWT in session). */
export function useAdminSession() {
  const { data: session, status } = useSession();
  return {
    session,
    status,
    accessToken: session?.accessToken,
    adminId: session?.adminId,
    role: session?.role,
  };
}
