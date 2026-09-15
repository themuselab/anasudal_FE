import type {
  ApiEnvelope, AskResponse, ErrorCode, EvidenceList, FeedbackOut, FeedbackReason, InstitutionDetail,
  InstitutionPage, Prompt, Rating, ReasonCode, RecommendResponse, Region, ScreeningResult,
  ScreeningTaskSet, SearchResponse, Session, Sido,
} from "./types";

/** 봉투를 벗기고 실패는 ApiError 로 던진다. 화면은 code 로 분기, message 는 그대로 보여줘도 됨. */
export class ApiError extends Error {
  constructor(public status: number, public code: ErrorCode, message: string, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

const ROOT = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000").replace(/\/$/, "");
const BASE = ROOT + "/v1";
// 조기 관찰만 v2. 쓰임과 수명이 달라 v1 과 따로 간다
const BASE_V2 = ROOT + "/v2";

async function call<T>(path: string, init?: RequestInit, base: string = BASE): Promise<T> {
  let res: Response;
  try {
    res = await fetch(base + path, {
      ...init,
      // 본문이 있을 때만 Content-Type 을 붙인다.
      // GET 에까지 붙이면 단순 요청이 아니게 되어 브라우저가 OPTIONS 프리플라이트를
      // 먼저 보낸다 — 요청 수와 왕복 시간이 그대로 두 배가 된다. 무한 스크롤처럼
      // URL 이 매번 달라지는 화면에서는 프리플라이트 캐시도 듣지 않는다.
      headers: init?.body
        ? { "Content-Type": "application/json", ...(init?.headers ?? {}) }
        : init?.headers,
      cache: "no-store",
    });
  } catch (e) {
    throw new ApiError(0, "NETWORK_ERROR", "서버에 연결할 수 없어요. 네트워크를 확인해주세요", String(e));
  }
  let body: ApiEnvelope<T> | null = null;
  try { body = (await res.json()) as ApiEnvelope<T>; } catch { /* 비JSON */ }
  if (!body || typeof body !== "object" || !("success" in body)) {
    throw new ApiError(res.status, "INTERNAL_ERROR", `응답 형식 오류 (${res.status})`);
  }
  if (!body.success) throw new ApiError(res.status, body.error.code, body.error.message, body.error.details);
  return body.data;
}

const qstr = (params?: Record<string, string | number | undefined | null>) => {
  if (!params) return "";
  const qs = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
  return qs ? "?" + qs : "";
};
const getV2 = <T,>(path: string, params?: Record<string, string | number | undefined | null>) =>
  call<T>(path + qstr(params), undefined, BASE_V2);
const postV2 = <T,>(path: string, body: unknown) =>
  call<T>(path, { method: "POST", body: JSON.stringify(body) }, BASE_V2);
const delV2 = (path: string) => call<null>(path, { method: "DELETE" }, BASE_V2);

const get = <T,>(path: string, params?: Record<string, string | number | undefined | null>) => {
  const qs = params
    ? "?" + Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&")
    : "";
  return call<T>(path + (qs === "?" ? "" : qs));
};
const post = <T,>(path: string, body: unknown) => call<T>(path, { method: "POST", body: JSON.stringify(body) });
const patch = <T,>(path: string, body: unknown) => call<T>(path, { method: "PATCH", body: JSON.stringify(body) });

/** 화면 ↔ 엔드포인트 (backend/README.md 4절) */
export const api = {
  regions: {
    sido: () => get<Sido[]>("/regions/sido"),
    sigungu: (sido: string) => get<Region[]>("/regions", { sido }),
  },
  institutions: {
    browse: (p: { sido?: string; region_id?: number; q?: string; sort?: "recommended" | "price"; page?: number; size?: number }) =>
      get<InstitutionPage>("/institutions", p),
    detail: (bizNo: string) => get<InstitutionDetail>(`/institutions/${encodeURIComponent(bizNo)}`),
  },
  session: {
    create: (p: { region_id?: number; child_age_months?: number } = {}) => post<Session>("/sessions", p),
    get: (id: string) => get<Session>(`/sessions/${id}`),
    patch: (id: string, p: { region_id?: number; child_age_months?: number }) => patch<Session>(`/sessions/${id}`, p),
  },
  chat: {
    prompts: () => get<Prompt[]>("/chat/prompts"),
    ask: (session_id: string, message: string) => post<AskResponse>("/chat/ask", { session_id, message }),
    evidence: (answerId: string) => get<EvidenceList>(`/chat/answers/${answerId}/evidence`),
    recommend: (p: { session_id: string; answer_id: string; region_id?: number; sido?: string; max_price?: number }) =>
      post<RecommendResponse>("/chat/recommend", p),
  },
  screening: {
    tasks: (child_age_months: number) => getV2<ScreeningTaskSet>("/screening/tasks", { child_age_months }),
    save: (p: { child_age_months: number; answers: { task_code: string; option_no: number }[]; skipped: string[] }) =>
      postV2<ScreeningResult>("/screening/results", p),
    result: (token: string) => getV2<ScreeningResult>(`/screening/results/${token}`),
    remove: (token: string) => delV2(`/screening/results/${token}`),
  },
  feedback: {
    reasons: () => get<FeedbackReason[]>("/feedback/reasons"),
    send: (answer_id: string, rating: Rating, reason_code?: ReasonCode) =>
      post<FeedbackOut>("/feedback", { answer_id, rating, reason_code }),
  },
  knowledge: {
    search: (query: string, age_months?: number, top_k = 3) => post<SearchResponse>("/knowledge/search", { query, age_months, top_k }),
  },
};

/** 에러 코드 → 사용자 문구 (서버 message 가 있으면 그걸 우선) */
export function humanize(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.code) {
      case "SESSION_NOT_FOUND": return "대화가 만료됐어요. 새로 시작할게요.";
      case "RATE_LIMITED": return "질문이 너무 많아요. 잠시 후 다시 시도해주세요.";
      case "NETWORK_ERROR": return e.message;
      default: return e.message || "문제가 생겼어요. 다시 시도해주세요.";
    }
  }
  return "문제가 생겼어요. 다시 시도해주세요.";
}
