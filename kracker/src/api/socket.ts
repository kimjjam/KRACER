import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "https://kracer-server.onrender.com";

export type PlayersState = Record<string, { x: number; y: number }>;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});

export function connectSocket() {
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
