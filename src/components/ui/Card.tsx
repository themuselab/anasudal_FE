import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** card: 흰 카드 · sunken: 눌린 면(입력 영역·근거 박스) · soft: 틴트(AI 말풍선) */
  surface?: "card" | "sunken" | "soft";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
};

const SURFACE = {
  card: "bg-card border border-line-subtle shadow-card",
  sunken: "bg-sunken",
  soft: "bg-soft",
};
const PAD = { none: "", sm: "p-3", md: "p-4 md:p-5", lg: "p-5 md:p-6" };

export function Card({ surface = "card", padding = "md", interactive, className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg", SURFACE[surface], PAD[padding],
        interactive && "cursor-pointer transition-colors hover:border-green-300 active:bg-green-50",
        className,
      )}
      {...rest}
    />
  );
}

/** 헤어라인 — 리스트 내부 구분 (line/subtle), 섹션 구분은 line/default */
export function Divider({ strong, className }: { strong?: boolean; className?: string }) {
  return <hr className={cn("border-0 border-t", strong ? "border-line" : "border-line-subtle", className)} />;
}
