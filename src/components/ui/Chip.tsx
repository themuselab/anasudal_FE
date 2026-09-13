"use client";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * 칩 — 첫 화면 추천 질문 · 후속 답변("네, 추천해주세요") · 지역 선택.
 * 회의 결정: 필터 UI 없음, 칩만.
 */
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  tone?: "default" | "primary";
};

export function Chip({ selected, tone = "default", className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "t-caption inline-flex h-10 items-center rounded-pill border px-4 transition-colors",
        "disabled:bg-disabled disabled:text-placeholder disabled:border-transparent",
        selected
          ? "border-primary bg-primary text-white"
          : tone === "primary"
            ? "border-transparent bg-soft text-primary hover:bg-green-200 active:bg-green-200"
            : "border-line bg-card text-strong hover:border-green-300 hover:bg-green-50 active:bg-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** 태그 — 기관 카드의 치료영역 (읽기 전용). 시안: 연회색(sunken) 알약 */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("t-caption inline-flex h-8 items-center rounded-pill bg-sunken px-3 text-body", className)}>
      {children}
    </span>
  );
}
