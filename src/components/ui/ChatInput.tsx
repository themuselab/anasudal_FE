"use client";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * 채팅 입력 필드 (Figma "input field")
 *  · H 64 · radius 999 · padding 28(좌) 20(우) 16(상하) · fill surface/card · 테두리 없음(입력 중에도)
 *  · 입력 행: W Fill · H Hug · gap 20 · padding 0 · 채움/테두리 없음
 *  · default: placeholder = text/placeholder, 보내기 아이콘 = green-200(연함)
 *  · typed: 글자 = text/body, 아이콘 = action/primary (press = action/press)
 */
export function ChatInput({
  placeholder = "아이에 대해 편하게 말씀해주세요.",
  onSend, disabled, loading, maxLength = 1000, className, autoFocus,
}: {
  placeholder?: string;
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !disabled && !loading;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    const text = value.trim();
    setValue("");
    await onSend(text);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) submit();   // 한글 조합 중 Enter 무시
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex h-16 w-full items-center gap-5 rounded-pill bg-card pl-7 pr-5 shadow-card",   // 테두리 없음 (입력 중에도)
        "transition-shadow focus-within:shadow-card-focus",
        disabled && "bg-disabled",
        className,
      )}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        onKeyDown={onKey}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        enterKeyHint="send"
        aria-label="질문 입력"
        className="t-body-m h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-placeholder focus-visible:outline-none disabled:text-placeholder"
      />
      <button
        type="submit"
        aria-label="보내기"
        disabled={!canSend}
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-pill transition-colors",
          canSend ? "text-primary hover:bg-green-50 active:text-press" : "text-green-200",
        )}
      >
        {loading ? <Dots /> : <SendIcon />}
      </button>
    </form>
  );
}

function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z" />
    </svg>
  );
}

function Dots() {
  return (
    <span className="flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-pill bg-current" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </span>
  );
}
