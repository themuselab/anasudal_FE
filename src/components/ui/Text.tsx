import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { TypeVariant } from "@/design/tokens";

/** 정적 문자열이어야 Tailwind 가 유틸리티를 생성한다 (`t-${variant}` 금지) */
const TYPO: Record<TypeVariant, string> = {
  display: "t-display", "title-l": "t-title-l", "title-m": "t-title-m", "title-s": "t-title-s",
  "body-l": "t-body-l", "body-m": "t-body-m", caption: "t-caption", label: "t-label", "numeric-xl": "t-numeric-xl",
};

const DEFAULT_TAG: Record<TypeVariant, ElementType> = {
  display: "h1", "title-l": "h1", "title-m": "h2", "title-s": "h3",
  "body-l": "p", "body-m": "p", caption: "p", label: "span", "numeric-xl": "span",
};

type Props = HTMLAttributes<HTMLElement> & {
  variant: TypeVariant;
  as?: ElementType;
  /** 색 토큰 오버라이드 (기본은 변형별 규칙: 제목=strong, 본문=body, 캡션=muted) */
  tone?: "strong" | "body" | "muted" | "placeholder" | "primary" | "success" | "warning" | "danger" | "inherit";
};

/** 변형별 기본 색 — 시트 규칙: 제목·숫자 = strong, 본문 = body, 캡션·라벨 = muted */
const DEFAULT_TONE: Record<TypeVariant, NonNullable<Props["tone"]>> = {
  display: "strong", "title-l": "strong", "title-m": "strong", "title-s": "strong",
  "body-l": "body", "body-m": "body", caption: "muted", label: "muted", "numeric-xl": "strong",
};

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  strong: "text-strong", body: "text-body", muted: "text-muted", placeholder: "text-placeholder",
  primary: "text-primary", success: "text-success", warning: "text-warning", danger: "text-danger", inherit: "",
};

/** 타이포 스케일 컴포넌트. `<Text variant="title-m">섹션</Text>` */
export function Text({ variant, as, tone, className, ...rest }: Props) {
  const Tag = as ?? DEFAULT_TAG[variant];
  return <Tag className={cn(TYPO[variant], TONE[tone ?? DEFAULT_TONE[variant]], className)} {...rest} />;
}
