"use client";
import { useEffect, useState } from "react";
import { api, type AskResponse, type FeedbackReason, type Rating, type ReasonCode } from "@/lib/api";
import { Chip, Text } from "@/components/ui";
import { AnswerText } from "@/components/chat/AnswerText";
import { OtterMark } from "@/components/chat/Bubbles";
import { cn } from "@/lib/cn";

/**
 * 수달 답변 (시안 pc-답변 / 붐따 했을 때)
 *  · 말풍선 없이 바탕 위 왼쪽 정렬 본문(Body-L). **굵게** 는 text/strong
 *  · 마지막 줄 끝에 작은 수달
 *  · 아래: 👍 👎 + "이 답변이 어땠나요?" → 누르면 "의견 감사해요", 👎 면 사유 칩 3개
 *  · 후속 칩 "네, 추천해주세요" (칩 모양 — 전에 쓰던 진한 버튼 아님)
 */
export function AnswerBlock({
  res,
  streaming,
  onPrompt,
}: {
  res: AskResponse;
  streaming?: boolean;
  onPrompt: (text: string) => void;
}) {
  return (
    <div className="max-w-[92%] md:max-w-[80%]">
      <div className="prose-answer t-body-l text-body">
        <AnswerText
          text={res.text}
          trailing={
            streaming ? (
              <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-primary align-middle" aria-hidden />
            ) : (
              <OtterMark />
            )
          }
        />
      </div>

      {!streaming && res.answer_id && res.fallback_tier > 0 && <FeedbackRow answerId={res.answer_id} />}

      {/* 후속 칩은 전부 같은 모양 — "더 물어볼게요"는 입력창에 치는 것과 같은 동작이라 서버에서 뺐다 */}
      {!streaming && res.next_prompts.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {res.next_prompts.map((p) => (
            <Chip key={p} onClick={() => onPrompt(p)}>
              {p}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackRow({ answerId }: { answerId: string }) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [reasons, setReasons] = useState<FeedbackReason[]>([]);

  useEffect(() => {
    if (rating === "down" && reasons.length === 0) api.feedback.reasons().then(setReasons).catch(() => {});
  }, [rating, reasons.length]);

  const up = () => {
    setRating("up");
    setReason(null);
    api.feedback.send(answerId, "up").catch(() => {});
  };
  const down = () => setRating("down"); // 사유를 고르는 시점에 저장
  const pick = (code: ReasonCode) => {
    setReason(code);
    api.feedback.send(answerId, "down", code).catch(() => {}); // 다시 고르면 덮어씀
  };

  const thumb = (kind: Rating) =>
    cn(
      "grid size-7 place-items-center rounded-sm transition-colors hover:bg-green-50",
      rating === kind ? "text-primary" : "text-muted",
    );

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5">
        <button type="button" aria-label="도움이 됐어요" aria-pressed={rating === "up"} onClick={up} className={thumb("up")}>
          <ThumbIcon filled={rating === "up"} />
        </button>
        <button type="button" aria-label="아쉬워요" aria-pressed={rating === "down"} onClick={down} className={thumb("down")}>
          <ThumbIcon down filled={rating === "down"} />
        </button>
        <Text variant="label" as="span" className="ml-1 font-medium">
          {rating ? "의견 감사해요" : "이 답변이 어땠나요?"}
        </Text>
      </div>

      {rating === "down" && reasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {reasons.map((r) => (
            <Chip key={r.reason_code} selected={reason === r.reason_code} onClick={() => pick(r.reason_code)}>
              {r.label}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function ThumbIcon({ down, filled }: { down?: boolean; filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      className={down ? "rotate-180" : undefined}
      aria-hidden
    >
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4.5-7.5a2 2 0 0 1 3.6 1.4L14.5 8H19a2 2 0 0 1 2 2.3l-1.2 8A2 2 0 0 1 17.8 20H7" />
    </svg>
  );
}
