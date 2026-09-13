"use client";
import { useEffect, useState } from "react";
import { api, type Prompt } from "@/lib/api";
import { cn } from "@/lib/cn";

/** 서버가 안 뜰 때 보이는 기본값 — 서버 시드 앞 3개와 같다 */
const FALLBACK: Prompt[] = [
  { prompt_id: 1, text: "아이가 말이 느린 것 같아요", emoji: "🗣️" },
  { prompt_id: 2, text: "근처 언어치료 기관 찾아줘", emoji: "🔍" },
  { prompt_id: 3, text: "또래와 어울리는 걸 어려워해요", emoji: "🧸" },
];

/**
 * 첫 화면 추천 질문 (시안 pc/mb-채팅 메인)
 *  · 세로로 쌓인 알약 3개, 왼쪽 정렬 · fill surface/sunken · 테두리·그림자 없음
 *  · 이모지 + 문장 (라벨 = Caption) · 이모지는 서버가 내려준다
 *  · 목록은 호출마다 서버가 회전시켜 준다
 */
export function PromptList({ onPick, className }: { onPick: (text: string) => void; className?: string }) {
  const [items, setItems] = useState<Prompt[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    api.chat.prompts()
      .then((p) => { if (alive && p.length) setItems(p); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <ul className={cn("flex flex-col items-start gap-3", className)} aria-label="추천 질문">
      {items.map((p) => (
        <li key={p.prompt_id}>
          <button
            type="button"
            onClick={() => onPick(p.text)}
            className="t-caption inline-flex h-9 items-center gap-2 rounded-pill bg-sunken pl-3 pr-4 text-strong transition-colors hover:bg-green-100 active:bg-soft md:h-10"
          >
            <span aria-hidden className="text-body-m leading-none">{p.emoji}</span>
            {p.text}
          </button>
        </li>
      ))}
    </ul>
  );
}
