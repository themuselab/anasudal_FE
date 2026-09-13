"use client";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui";

/** 기관 상세 상단 (시안) — "< 기관 상세". 뒤로가기는 오던 화면(대화·둘러보기)으로 */
export function DetailHeader() {
  const router = useRouter();
  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/browse");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4 md:h-16 md:px-10">
      <button type="button" onClick={back} aria-label="뒤로" className="grid size-8 place-items-center text-strong">
        <ChevronLeft />
      </button>
      <Text variant="title-s" as="h1">기관 상세</Text>
    </header>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
