"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

const HOLD_MS = 1400; // 로고가 머무는 시간
const FADE_MS = 400; // 사라지는 시간
const SEEN_KEY = "anasudal.splash";

type Phase = "show" | "fading" | "gone";

/**
 * 첫 진입 스플래시 (시안 pc-스플래시 / mb-스플래시).
 *
 * 탭당 한 번만 뜬다 — 대화하다 돌아올 때마다 로고를 다시 보여주면 방해만 된다.
 * 서버에서도 그려야 첫 페인트를 덮을 수 있으므로 기본값은 "show" 이고,
 * 이미 본 세션이면 마운트 직후 지운다.
 */
export function Splash() {
  const [phase, setPhase] = useState<Phase>("show");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // 사생활 보호 모드 등 저장이 막힌 브라우저 — 그냥 매번 보여준다
    }
    if (seen) {
      queueMicrotask(() => setPhase("gone"));
      return;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* 위와 같음 */
    }
    const toFade = setTimeout(() => setPhase("fading"), HOLD_MS);
    const toGone = setTimeout(() => setPhase("gone"), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(toFade);
      clearTimeout(toGone);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      role="status"
      aria-label="안아수달을 여는 중"
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center bg-base px-6 transition-opacity duration-400 motion-reduce:transition-none",
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-11 md:gap-14">
        <Text variant="caption" className="text-center">
          아이를 이해하고
          <br />꼭 맞는 도움을 찾아드려요
        </Text>

        <div className="flex flex-col items-center gap-4 md:gap-5">
          <Image
            src="/logo-otter.png"
            alt=""
            width={716}
            height={684}
            priority
            className="h-24 w-auto md:h-36"
          />
          <Text variant="title-l" as="p" tone="primary">
            안아수달
          </Text>
        </div>
      </div>

      <Text variant="label" tone="placeholder" as="p" className="pb-8 md:pb-10">
        © 2026 Muselab Inc.
      </Text>
    </div>
  );
}
