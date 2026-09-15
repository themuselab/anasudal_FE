"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Segmented, Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/** 이만큼 내리면 상단 바가 줄어든다 */
const SHRINK_AT = 24;

/**
 * 상단 바 (시안 pc/mb-채팅 메인)
 *  · 로고(좌) + 세그먼트 "수달AI | 둘러보기"(가운데)
 *  · 절대 배치 대신 양옆 flex-1 로 가운데 정렬 — 로고가 길어져도 세그먼트와 겹치지 않는다
 *  · 화면 위에 붙어 있다가, 아래로 내리면 높이·로고가 작아지고 경계선이 생긴다
 *    (스크롤해도 수달AI/둘러보기가 계속 보여야 해서)
 */
export function AppHeader() {
  const path = usePathname();
  const router = useRouter();
  const tab = path.startsWith("/browse") || path.startsWith("/institutions") ? "browse" : "chat";
  const shrunk = useShrinkOnScroll();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex shrink-0 items-center gap-3 bg-base px-4 transition-all duration-200 md:px-10",
        shrunk ? "h-14 border-b border-line-subtle md:h-16" : "h-20 md:h-24",
      )}
    >
      <div className="flex flex-1 justify-start">
        {/* 로고는 브랜드 마크 — 본문 스케일과 따로 간다. 모바일 18(시안의 작은 마크) → PC 36(Title-L 데스크톱 값)
            두 조각 다 글자 크기(em)를 따라간다 — 스크롤로 헤더가 줄 때 같이 줄어야 한 덩어리로 보인다.
            모바일에선 글자를 빼고 마크만 둔다. 좁은 폭에서 세그먼트와 자리를 다투기 때문. */}
        <Link
          href="/"
          aria-label="안아수달 홈"
          className={cn(
            "flex items-center gap-1.5 transition-all duration-200 md:gap-2",
            shrunk ? "text-body-m md:text-title-m-lg" : "text-title-s md:text-title-l-lg",
          )}
        >
          <Image
            src="/logo-otter.png"
            alt=""
            width={716}
            height={684}
            priority
            className="w-auto"
            style={{ height: "1.35em" }}
          />
          <Image
            src="/logo-wordmark.png"
            alt=""
            width={316}
            height={80}
            priority
            className="hidden w-auto md:block"
            style={{ height: "0.8em" }}
          />
        </Link>
      </div>

      <Segmented
        aria-label="메인 메뉴"
        compact={shrunk}
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

/** 스크롤 위치를 본다. setState 는 이벤트 핸들러 안에서만 일어난다 */
function useShrinkOnScroll(): boolean {
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > SHRINK_AT);
    window.addEventListener("scroll", onScroll, { passive: true });
    queueMicrotask(onScroll); // 뒤로가기로 스크롤 위치가 복원된 경우
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return shrunk;
}

export function AppFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("shrink-0 py-6 text-center md:py-8", className)}>
      <Text variant="label" as="span" className="font-medium text-placeholder">
        © 2026 Muselab Inc.
      </Text>
    </footer>
  );
}
