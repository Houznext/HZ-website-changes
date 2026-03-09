"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getSocket, disconnectSocket } from "../../utils/socket";


export default function SocketInitializer() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user;
      const token = (session as any)?.token;

      if (user?.id) {
        getSocket({ userId: user.id, token: token || undefined });
      }
    } else if (status === "unauthenticated") {
      disconnectSocket();
    }
  }, [session, status]);

  return null;
}
