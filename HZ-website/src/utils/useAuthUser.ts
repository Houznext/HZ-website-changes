import React from "react";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export const useAuthUser = () => {
  const { data: session, status } = useSession();

  const user = status === "authenticated" ? session?.user : null;

  return {
    user,
    userId: user?.id,
    isAuthenticated: status === "authenticated",
  };
};
