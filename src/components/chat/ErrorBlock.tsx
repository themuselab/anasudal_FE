"use client";
import { Button, Text } from "@/components/ui";

/**
 * 답변 실패 (시안 pc-답변 에러)
 *
 * 말풍선도 빨간 경고 상자도 쓰지 않는다. 답변이 놓일 자리에 답변과 같은 모양으로 둔다 —
 * 실패도 대화의 일부라서, 화면이 붉게 변하면 부모는 자기가 뭘 잘못한 줄 안다.
 *
 * 첫 줄은 무엇이 막혔는지, 둘째 줄은 질문이 사라지지 않았다는 안심.
 * 👍👎 는 두지 않는다 — 평가할 답변이 없어 붙일 곳(answer_id)이 없다.
 */
export function ErrorBlock({
  text,
  onRetry,
  onReset,
}: {
  text: string;
  onRetry?: () => void;
  onReset: () => void;
}) {
  return (
    <div className="max-w-[92%] md:max-w-[80%]">
      <Text variant="body-l" tone="body" as="p">{trimRetryHint(text)}</Text>
      <Text variant="body-l" tone="body" as="p">질문은 그대로 남아 있으니 다시 시도해보시겠어요?</Text>

      <div className="mt-4 flex items-center gap-2">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-danger/40 text-danger hover:bg-danger-bg active:bg-danger-bg"
          >
            <RetryIcon />
            다시 시도
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted hover:text-strong">
          처음으로
        </Button>
      </div>
    </div>
  );
}

/** "…다시 시도해주세요." 로 끝나는 사유는 꼬리를 뗀다 — 바로 아래 버튼이 같은 말을 한다 */
function trimRetryHint(text: string) {
  return text.replace(/\s*다시 시도해\s*주세요[.!]?\s*$/, "").trim() || "답변을 가져오지 못했어요.";
}

function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
