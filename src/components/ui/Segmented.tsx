"use client";
import { cn } from "@/lib/cn";

/**
 * 세그먼트 버튼 메뉴 (Figma "segment button menu")
 *
 *  트랙   220×50 Hug · fill surface/sunken · padding 2 · gap 4 · radius 999 · 그림자 없음
 *  세그먼트 W 106(PC 고정, 모바일은 Hug — 시안 모바일 트랙 188px) · H Hug · padding 13/8 · gap 8 · radius 99
 *          라벨 = Title-S (semibold · -1.5%) → 모바일 18/26, PC 20/30
 *          H 는 Hug 라 높이는 8 + 행간 + 8 = 모바일 42 / PC 46 (시트값)
 *  상태   default = 채움 없음 + text/muted · focused(선택) = action/primary + 흰 글자
 */
export interface SegmentOption<V extends string> {
  value: V;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Segmented<V extends string>({
  options,
  value,
  onChange,
  full,
  compact,
  className,
  "aria-label": ariaLabel,
}: {
  options: SegmentOption<V>[];
  value: V;
  onChange: (v: V) => void;
  /** 트랙을 가로로 꽉 채우고 세그먼트를 균등 분할 */
  full?: boolean;
  /** 상단 바가 스크롤로 줄어들 때 — 한 단계 작게 */
  compact?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-1 rounded-pill bg-sunken p-0.5 transition-all duration-200",
                    full && "flex w-full", className)}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-pill transition-all duration-200",
              compact
                ? "text-caption px-3 py-1 font-semibold md:min-w-22"
                : "t-title-s px-3.25 py-2 md:min-w-26.5",
              full && "min-w-0 flex-1",
              selected ? "bg-primary text-white" : "bg-transparent text-muted hover:bg-green-50 active:bg-soft",
              "disabled:text-placeholder disabled:hover:bg-transparent",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
