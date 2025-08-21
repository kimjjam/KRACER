// client/src/lib/socket.ts
import { io } from "socket.io-client";

/**
 * 배포(Render)에서는 REACT_APP_SOCKET_URL을 사용하고
 * 개발 로컬에서는 http://localhost:4000 를 기본값으로 사용합니다.
 * 예) REACT_APP_SOCKET_URL=https://kracer-server.onrender.com
 */

// 1) 환경변수에서 생산용 URL 읽기 (뒷 슬래시 제거)
const RAW_PROD_URL = (process.env.REACT_APP_SOCKET_URL ?? "").trim();
const PROD_URL = RAW_PROD_URL.replace(/\/+$/, "");

// 2) 개발 기본값
const DEV_URL = "http://localhost:4000";

// 3) 실행 모드
const isProd = process.env.NODE_ENV === "production";

// 4) BASE_URL 결정
let BASE_URL =
  isProd
    ? (PROD_URL || (typeof window !== "undefined" ? window.location.origin : ""))
    : (PROD_URL || DEV_URL);

// 5) 혼합 콘텐츠 방지: 페이지가 https면 소켓도 https로 강제 승격
if (
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  BASE_URL.startsWith("http://")
) {
  BASE_URL = BASE_URL.replace(/^http:/, "https:");
}

// 6) 프로덕션에서 환경변수가 비어있으면 경고(실제 Render에서는 꼭 설정 권장)
if (isProd && !PROD_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "REACT_APP_SOCKET_URL is not set. Falling back to window.origin/DEV_URL. " +
      "Set REACT_APP_SOCKET_URL on Render to avoid connection issues."
  );
}

export const SOCKET_BASE_URL = BASE_URL;

// 7) 소켓 인스턴스
export const socket = io(SOCKET_BASE_URL, {
  transports: ["websocket"], // 바로 websocket (wss) 사용
  withCredentials: false,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
  timeout: 10000,
  // path: "/socket.io", // 서버에서 커스텀 경로를 썼다면 주석 해제
});

/* ───────── 공용 타입 (서버 ack 형태에 맞춤) ───────── */

export type RoomStatus = "waiting" | "playing";

export interface PlayerSummary {
  id: string;
  nickname: string;
  team?: "A" | "B";
  color?: string;
  ready: boolean;
  health?: number;
  wins?: number;
}

export interface SafeRoomState {
  roomId: string;
  hostId: string;
  max: number;
  status: RoomStatus;
  players: PlayerSummary[];
  // 서버에서 내려오는 부가 정보(쓸 일 있으면 사용)
  visibility?: "public" | "private";
  roomName?: string;
  gameMode?: string;
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
