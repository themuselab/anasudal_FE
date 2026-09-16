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

/** 답변 문장 끝에 붙는 작은 수달 — 고개를 내밀고 묻는 모습 (시안 pc-답변)
 *  높이를 em 으로 둬서 본문 글자 크기를 그대로 따라간다 — 토큰이 아니라 본문에 종속된 값.
 *  그림의 투명 여백은 미리 잘라뒀다. 여백이 남아 있으면 같은 em 이어도 수달이 작아 보이고,
 *  그걸 키우려 em 을 올리면 이 줄만 줄 간격이 벌어진다. */
export function OtterMark() {
  return (
    <Image
      src="/otter-ask.png"
      alt=""
      width={61}
      height={88}
      className="ml-1.5 inline-block w-auto align-text-bottom"
      style={{ height: "1.2em" }}
    />
  );
}

/**
 * 로딩 (시안 pc-채팅 입력 로딩 중) — 헤엄치는 수달 옆에 지금 뭘 하는지 한 줄
 *
 * 점 3개를 빼고 수달이 그 자리를 채운다. 점은 "뭔가 돌아간다"만 말하지만 수달은
 * 기다리는 동안 볼 게 된다. 문구는 단계마다 바뀌는데, 부모가 알아들을 말로만 쓴다 —
 * "임베딩 중", "검색 중" 같은 말은 여기서 아무 뜻이 없다.
 *
 * unoptimized: next/image 를 거치면 움직이는 GIF 가 첫 프레임짜리 정지 이미지가 된다.
 * motion-reduce: 움직임을 줄여 달라고 설정한 사람에겐 정지 그림으로 바꾼다 — GIF 는
 *                CSS 로 멈출 수 없어서 판을 따로 둔다.
 */
export function Thinking({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <Image
        src="/otter-loading.gif"
        alt=""
        width={380}
        height={263}
        unoptimized
        className="h-auto w-16 shrink-0 motion-reduce:hidden"
      />
      <Image
        src="/otter.png"
        alt=""
        width={96}
        height={64}
        className="hidden h-auto w-16 shrink-0 motion-reduce:block"
      />
      {/* key 를 문구로 둬서 바뀔 때마다 부드럽게 들어온다 */}
      <span key={status} className="t-caption fade-in text-muted">
        {status}
      </span>
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
