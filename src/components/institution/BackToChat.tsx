"use client";
import { useRouter } from "next/navigation";
import { readSessionId } from "@/lib/session";

/** 기관 상세 → 보던 대화방으로. 세션이 없으면 홈으로. */
export function BackToChat() {
  const router = useRouter();
  const go = () => {
    const sid = readSessionId();
    router.push(sid ? `/chat?s=${sid}` : "/");
  };
  return (
    <button type="button" onClick={go} className="t-caption text-muted underline underline-offset-4 hover:text-primary">
      ← 대화로 돌아가기
    </button>
  );
}
