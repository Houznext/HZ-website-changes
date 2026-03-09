// src/lib/chat/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(params: { userId?: string; token?: string }) {
  if (typeof window === "undefined") return null;

  // Use the same base URL as REST calls (strip trailing /, /api, /backend)
  const raw =
    process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:4400";
  let url = raw.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "").replace(/\/backend$/i, "");
  const token =
    typeof params.token === "string"
      ? params.token.replace(/^Bearer\s+/i, "").trim()
      : undefined;
  
  if (!socket) {
    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token,
        userId: params.userId,
      },
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err?.message || err);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully to:", url);
    });
  } else if (
    token &&
    ((socket.auth as any)?.token !== token ||
      (socket.auth as any)?.userId !== params.userId)
  ) {
    // Dynamically update the token if it has changed without creating a new connection
    socket.auth = { token, userId: params.userId };
    socket.disconnect().connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
