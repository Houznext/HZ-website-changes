"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/src/stores/useSessionStore";


export default function SessionSync() {
  const { data, status } = useSession();
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    const token =
      (data as any)?.token ?? (data as any)?.user?.token ?? null;
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
  }, [data, status, setSession]);

  return null;
}
