"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatInput, Notice, Text } from "@/components/ui";
import { PromptList } from "@/components/chat/PromptList";
import { PrivacyNote } from "@/components/chat/Bubbles";
import { getOrCreateSession } from "@/lib/session";
import { humanize } from "@/lib/api";

/**
 * 채팅 메인 (시안 pc/mb-채팅 메인)
 *  수달 → 인사 제목(Title-M, "안아수달"만 primary) → 저장 안내(Caption) → 입력창(최대 768) → 추천 칩
 *  세로 가운데 정렬. 모바일도 같은 구성이고 타이포·여백만 작아진다.
 */
export function ChatHome() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (text: string) => {
    setBusy(true);
    setError(null);
    try {
      const s = await getOrCreateSession();
      sessionStorage.setItem("anasudal.first", text); // 대화 화면이 첫 질문을 이어받는다
      router.push(`/chat?s=${s.session_id}`);
    } catch (e) {
      setError(humanize(e));
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 pb-10 md:px-10">
      <Image src="/otter.png" alt="" width={96} height={64} priority className="h-auto w-20 md:w-24" />

      <Text variant="title-m" as="h1" className="mt-5 text-center">
        안녕하세요, <span className="text-primary">안아수달</span>이에요!
        <br />
        무엇을 도와드릴까요?
      </Text>

      <div className="mt-10 w-full max-w-3xl md:mt-14">
        <PrivacyNote />
        <ChatInput className="mt-3" onSend={start} loading={busy} autoFocus />
        {error && (
          <div className="mt-3">
            <Notice tone="danger">{error}</Notice>
          </div>
        )}
        <PromptList className="mt-5 md:mt-6" onPick={start} />
      </div>
    </section>
  );
}
