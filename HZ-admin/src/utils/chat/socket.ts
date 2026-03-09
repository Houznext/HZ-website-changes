// src/lib/chat/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:4400";
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.replace(/\/api$/i, "");
}

export function getSocket(params: { userId?: string; token?: string }) {
  if (typeof window === "undefined") return null;
  const token =
    typeof params.token === "string"
      ? params.token.replace(/^Bearer\s+/i, "").trim()
      : undefined;

  const url = getSocketBaseUrl();

  if (!socket) {
    console.log(url);
    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token,
      },
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err?.message || err);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully to:", url, socket?.id);
    });
  } else if (params.token && (socket.auth as any)?.token !== params.token) {
    // Dynamically update the token if it has changed without creating a new connection
    socket.auth = { token: params.token };
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
