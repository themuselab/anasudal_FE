import { ApiError } from "./client";
import type { AskResponse, ErrorCode } from "./types";

export interface StreamHandlers {
  onMeta?: (m: { evidence_count: number }) => void;
  onDelta: (text: string) => void;          // 본문 조각 (모델 원문, 볼드 없음)
  onDone: (res: AskResponse) => void;       // 최종본 — text 는 볼드·마무리 문장 반영. 이걸로 교체
  onError: (e: ApiError) => void;
}

const BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000").replace(/\/$/, "") + "/v1";

/**
 * POST /chat/ask/stream — SSE. EventSource 는 POST 를 못 하므로 fetch + ReadableStream 으로 직접 파싱.
 * 이벤트: meta → delta* → done | error
 */
export async function askStream(session_id: string, message: string, h: StreamHandlers, signal?: AbortSignal): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/chat/ask/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ session_id, message }),
      signal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    h.onError(new ApiError(0, "NETWORK_ERROR", "서버에 연결할 수 없어요. 네트워크를 확인해주세요", String(e)));
    return;
  }
  if (!res.ok || !res.body) {                       // 스트림 시작 전 오류(429 등)는 일반 봉투
    let body: { error?: { code?: ErrorCode; message?: string; details?: unknown } } | null = null;
    try { body = await res.json(); } catch { /* ignore */ }
    h.onError(new ApiError(res.status, body?.error?.code ?? "INTERNAL_ERROR", body?.error?.message ?? `HTTP ${res.status}`, body?.error?.details));
    return;
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  const dispatch = (block: string) => {
    let event = "message";
    const data: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
    }
    if (!data.length) return;
    let payload: unknown;
    try { payload = JSON.parse(data.join("\n")); } catch { return; }
    switch (event) {
      case "meta": h.onMeta?.(payload as { evidence_count: number }); break;
      case "delta": h.onDelta((payload as { text: string }).text); break;
      case "done": h.onDone(payload as AskResponse); break;
      case "error": {
        const p = payload as { code: ErrorCode; message: string; details?: unknown };
        h.onError(new ApiError(0, p.code, p.message, p.details));
        break;
      }
    }
  };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i: number;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        dispatch(buf.slice(0, i));
        buf = buf.slice(i + 2);
      }
    }
    if (buf.trim()) dispatch(buf);
  } catch (e) {
    if ((e as Error).name !== "AbortError") h.onError(new ApiError(0, "NETWORK_ERROR", "연결이 끊겼어요. 다시 시도해주세요", String(e)));
  }
}
