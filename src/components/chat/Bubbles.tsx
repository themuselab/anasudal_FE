import Image from "next/image";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/** 사용자 말풍선 (시안) — 오른쪽 정렬 · fill surface/sunken · Body-M · text/strong
 *  오른쪽 위 모서리만 각지게 (말꼬리 방향) */
export function UserBubble({ text }: { text: string }) {
  return (
    <div className="t-body-m max-w-[85%] self-end rounded-lg rounded-tr-none bg-sunken px-4 py-2.5 text-strong md:max-w-[70%]">
      {text}
    </div>
  );
}

/** 답변 문장 끝에 붙는 작은 수달 (시안: "기관을 추천해드릴까요? 🦦")
 *  높이를 1.2em 으로 둬서 본문 글자 크기를 그대로 따라간다 — 토큰이 아니라 본문에 종속된 값 */
export function OtterMark() {
  return (
    <Image
      src="/otter.png"
      alt=""
      width={45}
      height={30}
      className="ml-1.5 inline-block w-auto align-text-bottom"
      style={{ height: "1.2em" }}
    />
  );
}

/** 로딩 (시안 pc-채팅 입력 로딩 중) — 수달 아래 점 3개 + 상태 문구 */
export function Thinking({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Image src="/otter.png" alt="" width={96} height={64} className="h-auto w-18" />
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-pulse rounded-pill bg-strong"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
        <span className="t-caption text-muted">{status}</span>
      </div>
    </div>
  );
}

/** 입력창 위 안내 — 메인/대화 화면 공통. 가운데 정렬(블록이어야 먹는다) */
export function PrivacyNote({ className }: { className?: string }) {
  return (
    <Text variant="caption" className={cn("text-center", className)}>
      대화 내용은 저장되지 않아요
    </Text>
  );
}
