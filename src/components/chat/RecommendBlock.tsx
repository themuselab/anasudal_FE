import Image from "next/image";
import Link from "next/link";
import type { RecommendResponse } from "@/lib/api";
import { Button, Text } from "@/components/ui";
import { InstitutionCardView } from "@/components/institution/InstitutionCard";

/**
 * 기관 추천 결과 (시안 pc-답변-기관 노출)
 *  안내 문장 → 기관 카드 3곳 → "다른 지역의 기관도 찾아보고 싶나요?" 배너(action/soft)
 */
export function RecommendBlock({ res }: { res: RecommendResponse }) {
  return (
    <div className="flex flex-col gap-4">
      <Text variant="body-l">{res.intro}</Text>

      {res.items.slice(0, 3).map((item) => (
        <InstitutionCardView key={item.biz_no} item={item} reason={item.reason} />
      ))}

      {res.items.length > 0 && <BrowseBanner />}
    </div>
  );
}

function BrowseBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-soft p-4 md:gap-4 md:p-5">
      <Image src="/otter.png" alt="" width={80} height={53} className="h-auto w-12 shrink-0 md:w-14" />
      <div className="min-w-0 flex-1">
        <Text variant="title-s">다른 지역의 기관도 찾아보고 싶나요?</Text>
        <Text variant="caption" className="mt-0.5">둘러보기에서 지역을 설정해 더 많은 기관을 확인해요</Text>
      </div>
      <Link href="/browse" className="shrink-0">
        <Button variant="outline" size="sm">
          기관 둘러보기 <ArrowIcon />
        </Button>
      </Link>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
