"use client";
import type { FormEvent } from "react";

/**
 * 기관 검색 (시안 pc-둘러보기_검색창 입력)
 *  알약 입력창 · 왼쪽 돋보기 · 입력하면 오른쪽 X 로 지움
 *  기관 이름과 치료영역 둘 다 찾는다 ("언어치료", "감각통합" 도 검색어)
 *  값은 부모가 들고 있다 (디바운스도 부모에서) — 여기선 입력만 받는다
 */
export function SearchBox({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const submit = (e: FormEvent) => e.preventDefault(); // 엔터로 새로고침 방지, 검색은 입력 즉시

  return (
    <form
      onSubmit={submit}
      className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-pill border border-line bg-card px-4 transition-colors focus-within:border-primary"
    >
      <SearchIcon />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 50))}
        placeholder="기관 이름 검색하기"
        aria-label="기관 이름 또는 치료영역 검색"
        enterKeyHint="search"
        className="t-caption h-full min-w-0 flex-1 bg-transparent text-strong outline-none placeholder:text-placeholder focus-visible:outline-none"
      />
      {value && (
        <button type="button" aria-label="검색어 지우기" onClick={() => onChange("")} className="text-muted hover:text-strong">
          <CloseIcon />
        </button>
      )}
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
