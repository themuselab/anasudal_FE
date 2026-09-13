"use client";
import { api, ApiError, type Session } from "@/lib/api";

const KEY = "anasudal.session";

/** 브라우저에 세션 id만 보관 (로그인 없음). 만료(404)면 새로 발급. */
export async function getOrCreateSession(): Promise<Session> {
  let id: string | null = null;
  try { id = localStorage.getItem(KEY); } catch { /* private mode 등 */ }
  if (id) {
    try { return await api.session.get(id); }
    catch (e) { if (!(e instanceof ApiError && e.code === "SESSION_NOT_FOUND")) throw e; }
  }
  const s = await api.session.create();
  try { localStorage.setItem(KEY, s.session_id); } catch { /* ignore */ }
  return s;
}

/** 지금 보관 중인 세션 id (없으면 null). 기관 상세 → 대화방 복귀에 쓴다. */
export function readSessionId(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function clearSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/**
 * 대화 내용 임시 보관 — 탭을 닫으면 사라지는 sessionStorage 에만 둔다(서버 미저장 원칙 유지).
 * 기관 상세를 보고 돌아왔을 때 대화가 비어 있지 않게 하려는 용도.
 */
const MSGS = (sessionId: string) => `anasudal.msgs.${sessionId}`;

export function loadMessages<T>(sessionId: string): T[] {
  try {
    const raw = sessionStorage.getItem(MSGS(sessionId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function saveMessages<T>(sessionId: string, msgs: T[]): void {
  try {
    if (msgs.length) sessionStorage.setItem(MSGS(sessionId), JSON.stringify(msgs));
    else sessionStorage.removeItem(MSGS(sessionId));
  } catch { /* 용량 초과·차단 시 무시 */ }
}
