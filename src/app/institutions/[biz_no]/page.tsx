import { notFound } from "next/navigation";
import { AppFooter } from "@/components/layout/AppHeader";
import { DetailHeader } from "@/components/institution/DetailHeader";
import { KakaoMap } from "@/components/institution/KakaoMap";
import { Card, Divider, Tag, Text } from "@/components/ui";
import { api, ApiError, type InstitutionDetail } from "@/lib/api";
import { areaShort, pricePerSession } from "@/lib/format";

/**
 * 기관 상세 (시안 pc/mb-둘러보기_상세)
 *  "< 기관 상세" → 지도 → 이름/치료영역 → 정보 표(주소·전화·운영시간·비용·홈페이지)
 */
export default async function InstitutionPage({ params }: { params: Promise<{ biz_no: string }> }) {
  const { biz_no } = await params;
  let d: InstitutionDetail;
  try {
    d = await api.institutions.detail(decodeURIComponent(biz_no));
  } catch (e) {
    if (e instanceof ApiError && e.code === "INSTITUTION_NOT_FOUND") notFound();
    throw e;
  }

  const homepage = d.has_own_site ? d.link_url : null;
  const placeUrl = d.has_own_site ? null : d.link_url;

  return (
    <div className="flex min-h-dvh flex-col">
      <DetailHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 md:px-10">
        <KakaoMap name={d.name} address={d.address} lat={d.lat} lon={d.lon} placeUrl={placeUrl} />

        <Text variant="title-s" as="h2" className="mt-5">{d.name}</Text>
        <div className="mt-2 flex flex-wrap gap-2">
          {d.area_codes.map((code, i) => (
            <Tag key={code}>{areaShort(code, d.area_names[i])}</Tag>
          ))}
        </div>

        <Card padding="none" className="mt-4 overflow-hidden">
          <Row icon={<PinIcon />} label="주소">
            {d.address ?? <Muted>안내 없음</Muted>}
          </Row>
          <Divider />

          <Row icon={<PhoneIcon />} label="전화번호">
            {d.tel ? <a href={`tel:${d.tel}`} className="text-primary">{d.tel}</a> : <Muted>안내 없음</Muted>}
          </Row>
          <Divider />

          <Row icon={<ClockIcon />} label="운영시간">
            {d.operating_hours ?? <Muted>안내 없음</Muted>}
          </Row>
          <Divider />

          <Row icon={<InfoIcon />} label="비용(특화분야별)">
            {d.prices.length ? (
              <>
                <ul className="flex flex-col gap-1.5">
                  {d.prices.map((p) => (
                    <li key={`${p.area_code}-${p.delivery_mode}`} className="flex items-baseline justify-between gap-4">
                      <span>
                        {areaShort(p.area_code, p.area_name)}
                        {p.delivery_mode === "방문" && <span className="t-caption text-muted"> 방문</span>}
                      </span>
                      <span className="tabular-nums">{pricePerSession(p.price_krw)}</span>
                    </li>
                  ))}
                </ul>
                <Text variant="label" as="p" className="mt-2 font-medium">{d.price_note}</Text>
              </>
            ) : (
              <Muted>공시 단가 없음</Muted>
            )}
          </Row>

          <Divider />
          <Row icon={<LinkIcon />} label="홈페이지">
            {homepage ? (
              <a href={homepage} target="_blank" rel="noreferrer" className="break-all text-primary underline underline-offset-4">
                {homepage.replace(/^https?:\/\//, "")}
              </a>
            ) : placeUrl ? (
              // 자체 홈페이지가 없는 곳은 카카오 플레이스로 (지도 키가 있으면 지도에는 안 뜨므로 여기서 항상 보여준다)
              <a href={placeUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
                카카오맵에서 보기
              </a>
            ) : (
              <Muted>안내 없음</Muted>
            )}
          </Row>
        </Card>
      </main>

      <AppFooter />
    </div>
  );
}

/** 라벨(아이콘 + 이름) / 값 한 줄. 모바일은 위아래, PC 는 좌우 */
function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-4 md:grid md:grid-cols-[180px_1fr] md:gap-4 md:px-5">
      <div className="t-caption flex items-center gap-1.5 text-muted">
        {icon}
        {label}
      </div>
      <div className="t-body-m mt-1.5 text-strong md:mt-0">{children}</div>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-placeholder">{children}</span>;
}

const ICON = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;

function PinIcon() {
  return (
    <svg {...ICON}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg {...ICON} strokeLinejoin="round">
      <path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg {...ICON} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg {...ICON} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg {...ICON} strokeLinecap="round">
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}
