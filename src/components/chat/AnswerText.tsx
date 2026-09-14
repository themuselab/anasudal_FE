import { Fragment, type ReactNode } from "react";

/**
 * 서버 답변의 **굵게** 와 줄바꿈만 처리 (HTML 주입 없음). 굵은 구간은 prose-answer 가 text/strong 으로 렌더.
 * `trailing` 은 마지막 문단 **안에** 붙는다 — 수달 아이콘이 줄을 따로 차지하지 않고 글 끝에 이어지도록.
 */
export function AnswerText({ text, trailing }: { text: string; trailing?: ReactNode }) {
  const paras = text.split(/\n{2,}/);

  return (
    <>
      {paras.map((para, i) => (
        <p key={i} className={i > 0 ? "mt-3" : undefined}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
            seg.startsWith("**") && seg.endsWith("**") ? (
              <strong key={j}>{seg.slice(2, -2)}</strong>
            ) : (
              <Fragment key={j}>
                {seg.split("\n").map((line, k) => (k ? <Fragment key={k}><br />{line}</Fragment> : line))}
              </Fragment>
            ),
          )}
          {i === paras.length - 1 && trailing}
        </p>
      ))}
    </>
  );
}
