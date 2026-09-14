/** 백엔드 응답 스키마 (backend/app/domains/<도메인>/schemas.py 와 1:1). 봉투의 data 부분. */

export type ErrorCode =
  | "VALIDATION_ERROR" | "FEEDBACK_REASON_REQUIRED" | "INVALID_REASON_CODE" | "MESSAGE_EMPTY" | "MESSAGE_TOO_LONG"
  | "SESSION_NOT_FOUND" | "ANSWER_NOT_FOUND" | "REGION_NOT_FOUND" | "INSTITUTION_NOT_FOUND" | "CHUNK_NOT_FOUND" | "NOT_FOUND"
  | "ANSWER_NOT_GROUNDED" | "ANSWER_SESSION_MISMATCH"
  | "RATE_LIMITED" | "LLM_FAILED" | "LLM_RATE_LIMITED" | "INTERNAL_ERROR"
  | "NETWORK_ERROR";                       // 프론트 전용: fetch 자체 실패

export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCode; message: string; details?: unknown } };

// ── region
export interface Sido { sido: string; institution_count: number }
export interface Region { region_id: number; sido: string; sigungu: string; institution_count: number }

// ── institution
export type AreaCode = "SPEECH" | "AUDIT" | "ART" | "MUSIC" | "PLAY" | "BEHAV" | "PSYCH" | "SENSORY" | "MOTOR" | "PSYMOTOR" | "ETC";

export interface InstitutionCard {
  biz_no: string; name: string; sido: string; sigungu: string;
  area_codes: AreaCode[]; area_names: string[];
  price_min: number | null; price_max: number | null; price_year: number | null;
  visit_available: boolean; link_url: string | null; has_own_site: boolean;
}
export interface InstitutionPrice {
  area_code: AreaCode; area_name: string; delivery_mode: "기관내" | "방문";
  price_krw: number; price_year: number; disclosed_at: string;
}
export interface InstitutionDetail extends InstitutionCard {
  address: string | null; tel: string | null; lat: number | null; lon: number | null;
  operating_hours: string | null; prices: InstitutionPrice[]; price_note: string;
}
export interface InstitutionPage { total: number; items: InstitutionCard[]; page: number; size: number }

// ── chat
export interface Session {
  session_id: string; region_id: number | null; sido: string | null; sigungu: string | null;
  child_age_months: number | null; expires_at: string;
}
export interface Prompt { prompt_id: number; text: string; emoji: string }
export interface AreaPriority { area_code: AreaCode; area_name: string; priority: 1 | 2 | 3 }

export type Intent = "answer" | "diagnosis" | "out_of_scope" | "recommend" | "pick_region" | "need_context";

export interface AskResponse {
  answer_id: string | null;
  intent: Intent;
  text: string;                 // 마크다운 **굵게** 포함
  highlights: string[];
  areas: AreaPriority[];
  evidence_count: number;
  fallback_tier: 0 | 1 | 2 | 3;
  can_recommend: boolean;
  ask_region: boolean;
  recommend_for: string | null;
  next_prompts: string[];
}
export interface Evidence {
  chunk_id: string; chunk_type: string; content: string; publisher: string;
  source_title: string; source_year: number | null; source_url: string | null;
  similarity: number; match_percent: number;
}
export interface EvidenceList { answer_id: string; items: Evidence[] }

export interface RecommendedInstitution extends InstitutionCard { rank: number; reason: string }
export interface RecommendResponse {
  answer_id: string; intro: string; items: RecommendedInstitution[];
  scope_sido: string | null; browse_hint: string;
}

// ── feedback
export type Rating = "up" | "down";
export type ReasonCode = "MISMATCH" | "UNCLEAR" | "BAD_RECO";
export interface FeedbackReason { reason_code: ReasonCode; label: string }
export interface FeedbackOut { feedback_id: string; answer_id: string; rating: Rating; reason_code: ReasonCode | null }

// ── knowledge (디버그)
export interface SearchResponse { query: string; items: Evidence[] }
