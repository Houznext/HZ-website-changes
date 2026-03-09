import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore, type SessionUser } from "@/store/useSessionStore";

/**
 * Syncs NextAuth session into Zustand useSessionStore so apiClient can use
 * getTokenFromStore() instead of getSession(), avoiding repeated /api/auth/session calls.
 * Only updates the store when status or token/user identity actually change (prevents refresh loops).
 */
export default function SessionSync() {
  const { data: session, status } = useSession();
  const setSession = useSessionStore((s) => s.setSession);
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      if (lastSyncedRef.current !== "loading") {
        lastSyncedRef.current = "loading";
        setSession({ status: "loading" });
      }
      return;
    }
    if (status === "unauthenticated" || !session) {
      if (lastSyncedRef.current !== "unauthenticated") {
        lastSyncedRef.current = "unauthenticated";
        setSession({
          status: "unauthenticated",
          token: null,
          user: null,
        });
      }
      return;
    }
    const user = session.user as any;
    const token = (session as any).token ?? (session as any).accessToken ?? null;
    const tokenStr = token ?? "";
    const userId = user?.id ?? "";
    const syncKey = `${status}:${userId}:${tokenStr.slice(0, 20)}`;
    if (lastSyncedRef.current === syncKey) return;
    lastSyncedRef.current = syncKey;

    const sessionUser: SessionUser | null = user
      ? {
          id: user.id ?? "",
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profile: user.profile,
          token: token ?? "",
          kind: user.kind,
          role: user.role,
          activeBranchId: user.activeBranchId,
          branchMemberships: user.branchMemberships ?? [],
        }
      : null;
    setSession({
      status: "authenticated",
      token: token ?? null,
      user: sessionUser,
      lastLogin: useSessionStore.getState().lastLogin ?? (sessionUser ? Date.now() : undefined),
    });
  }, [status, session, setSession]);

  return null;
}
