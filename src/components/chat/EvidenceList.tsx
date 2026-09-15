"use client";

import { useState } from "react";
import { api, type Evidence } from "@/lib/api";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * 답변 아래 근거 자료 (기획 Core 2 — 신뢰 장치).
 *
 * 처음엔 "국가건강정보포털 외 2곳 · 근거 보기" 한 줄만 보인다. 부모가 먼저 읽어야 할 건
 * 답변이지 출처 목록이 아니다. 펼치면 그때 API 를 부른다 — 대부분 안 펼치므로
 * 답변마다 미리 받아두면 낭비다.
 *
 * 원문을 그대로 보여준다. 요약하면 "정말 저 자료에 그렇게 쓰여 있나"를 확인할 수 없어
 * 신뢰 장치 구실을 못 한다.
 */
export function EvidenceList({ answerId, count }: { answerId: string; count: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Evidence[] | null>(null);
  const [failed, setFailed] = useState(false);

  if (count <= 0) return null;

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (items || failed) return;
    try {
      const res = await api.chat.evidence(answerId);
      setItems(res.items);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-sm text-muted transition-colors hover:text-primary"
      >
        <BookIcon />
        <Text variant="label" as="span" tone="inherit" className="font-medium">
          답변의 근거 {count}건
        </Text>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="mt-2.5 flex flex-col gap-2">
          {items === null && !failed && (
            <Text variant="caption" tone="placeholder">
              근거 자료를 불러오는 중이에요
            </Text>
          )}
          {failed && (
            <Text variant="caption" tone="placeholder">
              근거 자료를 불러오지 못했어요
            </Text>
          )}
          {items?.map((e) => (
            <EvidenceCard key={e.chunk_id} item={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ item }: { item: Evidence }) {
  const source = [item.publisher, item.source_title].filter(Boolean).join(" · ");
  return (
    <article className="rounded-md border border-line-subtle bg-card px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <Text variant="label" as="span" tone="primary" className="font-bold">
          {source}
          {item.source_year ? ` (${item.source_year})` : ""}
        </Text>
        <Text variant="label" as="span" tone="placeholder" className="shrink-0 font-medium tabular-nums">
          {item.match_percent}% 일치
        </Text>
      </div>

      <Text variant="caption" tone="body" className="mt-1.5 whitespace-pre-line">
        {item.content}
      </Text>

      {item.source_url && (
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="t-label mt-2 inline-flex items-center gap-1 font-medium text-muted transition-colors hover:text-primary"
        >
          원문 보기
          <ExternalIcon />
        </a>
      )}
    </article>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={cn("transition-transform duration-200", open && "rotate-180")}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}
