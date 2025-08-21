// src/lib/socket.ts
import { io } from "socket.io-client";

// 배포(Render)는 REACT_APP_SOCKET_URL을 사용, 로컬 개발은 localhost로
const PROD_URL = (process.env.REACT_APP_SOCKET_URL || "").replace(/\/$/, "");
const DEV_URL = "http://localhost:4000";

// 프로덕션에서 환경변수 없으면 콘솔 경고(안전장치)
if (process.env.NODE_ENV === "production" && !PROD_URL) {
  // eslint-disable-next-line no-console
  console.warn("REACT_APP_SOCKET_URL is not set. Falling back to DEV_URL (will fail on Render).");
}

const BASE_URL =
  process.env.NODE_ENV === "production" && PROD_URL ? PROD_URL : (PROD_URL || DEV_URL);

export const socket = io(BASE_URL, {
  transports: ["websocket"],   // 바로 wss로 연결
  withCredentials: false,
});

// 공용 타입(서버 ack 형태에 맞춤)
export type RoomStatus = "waiting" | "playing";
export interface PlayerSummary {
  id: string;
  nickname: string;
  team?: "A" | "B";
  color?: string;
  ready: boolean;
}
export interface SafeRoomState {
  roomId: string;
  hostId: string;
  max: number;
  status: RoomStatus;
  players: PlayerSummary[];
}
export interface AckOk<T = unknown> {
  ok: true;
  room?: SafeRoomState;
  data?: T;
}
export interface AckErr {
  ok: false;
  error?: string;
}
export type Ack<T = unknown> = AckOk<T> | AckErr;
