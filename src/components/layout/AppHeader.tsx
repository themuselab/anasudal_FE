"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Segmented, Text } from "@/components/ui";

/**
 * 상단 바 (시안 pc/mb-채팅 메인)
 *  · 로고(좌) + 세그먼트 "수달AI | 둘러보기"(가운데)
 *  · 절대 배치 대신 양옆 flex-1 로 가운데 정렬 — 로고가 길어져도 세그먼트와 겹치지 않는다
 *  · 높이 80 (모바일) / 96 (PC), 좌우 여백 16 / 40
 */
export function AppHeader() {
  const path = usePathname();
  const router = useRouter();
  const tab = path.startsWith("/browse") || path.startsWith("/institutions") ? "browse" : "chat";

  return (
    <header className="flex h-20 shrink-0 items-center gap-3 px-4 md:h-24 md:px-10">
      <div className="flex flex-1 justify-start">
        {/* 로고는 브랜드 마크 — 본문 스케일과 따로 간다. 모바일 18(시안의 작은 마크) → PC 36(Title-L 데스크톱 값) */}
        <Link href="/" aria-label="안아수달 홈" className="text-title-s font-bold text-primary md:text-title-l-lg">
          안아수달
        </Link>
      </div>
      <Segmented
        aria-label="메인 메뉴"
        value={tab}
        onChange={(v) => router.push(v === "chat" ? "/" : "/browse")}
        options={[
          { value: "chat", label: "수달AI" },
          { value: "browse", label: "둘러보기" },
        ]}
      />
      <div className="flex-1" />
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="shrink-0 py-6 text-center md:py-8">
      <Text variant="label" as="span" className="font-medium text-placeholder">
        © 2026 Muselab Inc.
      </Text>
    </footer>
  );
}
