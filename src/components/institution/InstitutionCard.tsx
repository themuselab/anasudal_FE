import Link from "next/link";
import type { InstitutionCard as CardData } from "@/lib/api";
import { Card, Tag, Text } from "@/components/ui";
import { areaShort, priceRange, shortSido, sortAreas } from "@/lib/format";

/** 카드에 펼쳐 보일 태그 수. 넘치면 "+N" 하나로 접는다 */
const TAG_LIMIT = 3;

/**
 * 기관 카드 (시안 pc-답변-기관 노출) — 추천 결과와 둘러보기 리스트가 같은 카드 (회의 결정)
 *  이름(Title-S) + 우상단 "상세보기" · 📍 지역 · 회기당 가격(Caption) · 치료영역 태그 · 전화 버튼
 *
 * 태그를 3개로 끊는 이유: 영역을 11개 다 하는 기관이 적지 않아서 전부 그리면 카드마다
 * 같은 태그 벽이 되고 이름·지역·가격이 묻힌다. 전체 목록은 상세에서 본다.
 *
 * 전화 버튼이 카드에 있는 이유: 추천을 받은 부모가 다음에 하는 일이 전화다.
 * 상세로 한 번 더 들어가게 만들 이유가 없다.
 */
export function InstitutionCardView({ item, reason }: { item: CardData; reason?: string }) {
  const href = `/institutions/${encodeURIComponent(item.biz_no)}`;
  const ordered = sortAreas(item.area_codes);
  const shown = ordered.slice(0, TAG_LIMIT);
  const rest = ordered.length - shown.length;

  return (
    <Card padding="lg" className="rounded-xl">
      <div className="flex items-start justify-between gap-3">
        {/* 이름이 가장 크고 눈에 먼저 들어오는데 누를 수 없으면 손이 헛돈다.
            "상세보기"는 그대로 둔다 — 이름만 링크면 누를 수 있다는 걸 모르는 사람이 있다. */}
        <Text variant="title-s" as="h3">
          <Link
            href={href}
            className="transition-colors hover:text-primary hover:underline underline-offset-4"
          >
            {item.name}
          </Link>
        </Text>
        <Link href={href} className="t-caption shrink-0 text-muted transition-colors hover:text-primary">
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {shown.map((code) => (
          <Tag key={code}>{areaShort(code)}</Tag>
        ))}
        {rest > 0 && (
          <Text variant="label" as="span" tone="placeholder" className="font-medium">
            +{rest}
          </Text>
        )}
      </div>

      {item.tel && (
        <a
          href={`tel:${item.tel}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-soft px-3.5 py-2 text-primary transition-colors hover:bg-green-200"
        >
          <PhoneIcon />
          <Text variant="caption" as="span" tone="inherit" className="font-semibold tabular-nums">
            {item.tel}
          </Text>
        </a>
      )}
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

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2L21 14.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z" />
    </svg>
  );
}
