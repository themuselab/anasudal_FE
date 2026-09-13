import Link from "next/link";
import type { InstitutionCard as CardData } from "@/lib/api";
import { Card, Tag, Text } from "@/components/ui";
import { areaShort, priceRange, shortSido } from "@/lib/format";

/**
 * 기관 카드 (시안 pc-답변-기관 노출) — 추천 결과와 둘러보기 리스트가 같은 카드 (회의 결정)
 *  이름(Title-S) + 우상단 "상세보기" · 📍 지역 · 회기당 가격(Caption) · 치료영역 태그
 */
export function InstitutionCardView({ item, reason }: { item: CardData; reason?: string }) {
  return (
    <Card padding="lg" className="rounded-xl">
      <div className="flex items-start justify-between gap-3">
        <Text variant="title-s" as="h3">{item.name}</Text>
        <Link
          href={`/institutions/${encodeURIComponent(item.biz_no)}`}
          className="t-caption shrink-0 text-muted transition-colors hover:text-primary"
        >
          상세보기
        </Link>
      </div>

      <Text variant="caption" className="mt-1 flex flex-wrap items-center gap-x-1.5">
        <PinIcon />
        <span>{shortSido(item.sido)} {item.sigungu}</span>
        {item.price_min != null && (
          <>
            <span aria-hidden>·</span>
            <span>{priceRange(item.price_min, item.price_max)}</span>
          </>
        )}
      </Text>

      {reason && <Text variant="caption" tone="body" className="mt-2">{reason}</Text>}

      <div className="mt-3 flex flex-wrap gap-2">
        {item.area_codes.map((code, i) => (
          <Tag key={code}>{areaShort(code, item.area_names[i])}</Tag>
        ))}
      </div>
    </Card>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
