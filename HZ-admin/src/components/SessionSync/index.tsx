"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/src/stores/useSessionStore";
import { usePermissionStore } from "@/src/stores/usePermissions";
import { clearSessionTokenCache } from "@/src/utils/apiClient";

export default function SessionSync() {
  const { data, status } = useSession();
  const setSession = useSessionStore((s) => s.setSession);
  const initFromSession = usePermissionStore((s) => s.initFromSession);
  const lastBearerRef = useRef<string | null>(null);

  useEffect(() => {
    const token =
      (data as any)?.accessToken ??
      (data as any)?.token ??
      (data as any)?.user?.token ??
      null;
    const bearer = token ? String(token) : null;
    if (bearer !== lastBearerRef.current) {
      lastBearerRef.current = bearer;
      clearSessionTokenCache();
    }
    const user = (data as any)?.user ?? null;
    const branchMembership = (data as any)?.branchMembership ?? (data as any)?.user?.branchMemberships ?? [];
    const lastLogin = (data as any)?.lastLogin;

    setSession({
      status: status as "loading" | "authenticated" | "unauthenticated",
      token,
      user,
      branchMembership: Array.isArray(branchMembership) ? branchMembership : [],
      lastLogin,
    });

    if (user && status === "authenticated") {
      const memberships = Array.isArray(branchMembership) ? branchMembership : [];
      initFromSession(memberships, (user as any).role, (user as any).email ?? null);
    }
  }, [data, status, setSession, initFromSession]);

  return null;
}
