import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "neutral" | "primary";

const TONE: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger:  "bg-danger-bg text-danger",
  neutral: "bg-sunken text-muted",
  primary: "bg-soft text-primary",
};

/** 상태 배지 — 방문 가능 · 공시 연도 · 근거 N건 등 */
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("t-label inline-flex h-6 items-center rounded-sm px-2", TONE[tone], className)}>
      {children}
    </span>
  );
}

/** 안내 박스 — 답변 하단 주의문(진단 아님), 경고, 오류 */
export function Notice({ tone = "neutral", title, children }: { tone?: Tone; title?: string; children: React.ReactNode }) {
  const box: Record<Tone, string> = {
    success: "bg-success-bg", warning: "bg-warning-bg", danger: "bg-danger-bg", neutral: "bg-sunken", primary: "bg-soft",
  };
  const text: Record<Tone, string> = {
    success: "text-success", warning: "text-warning", danger: "text-danger", neutral: "text-muted", primary: "text-primary",
  };
  return (
    <div className={cn("rounded-md px-4 py-3", box[tone])}>
      {title && <p className={cn("t-caption font-bold", text[tone])}>{title}</p>}
      <div className="t-caption text-body">{children}</div>
    </div>
  );
}
