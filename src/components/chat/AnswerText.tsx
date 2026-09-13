import { Fragment } from "react";

/** 서버 답변의 **굵게** 와 줄바꿈만 처리 (HTML 주입 없음). 굵은 구간은 prose-answer 가 text/strong 으로 렌더 */
export function AnswerText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
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
        </p>
      ))}
    </>
  );
}
