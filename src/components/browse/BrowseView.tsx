"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, humanize, type InstitutionCard, type Region } from "@/lib/api";
import { Button, Card, Notice, Text } from "@/components/ui";
import { InstitutionList } from "@/components/browse/InstitutionList";
import { RegionFilter } from "@/components/browse/RegionFilter";
import { SearchBox } from "@/components/browse/SearchBox";

const SIZE = 20;

/** 주소에 담긴 지역을 되살린다. institution_count 는 패널 목록에만 쓰여 여기선 0 이면 된다. */
function regionFromUrl(sp: URLSearchParams | ReturnType<typeof useSearchParams>): Region | null {
  const id = Number(sp.get("region"));
  const sido = sp.get("sido");
  const sigungu = sp.get("sigungu");
  if (!id || !sido || !sigungu) return null;
  return { region_id: id, sido, sigungu, institution_count: 0 };
}

/**
 * 둘러보기 (시안 pc/mb-둘러보기 메인 · 지역 설정 · 검색창 입력 · 필터결과 없음)
 *  [지역 설정 ▾] [🔍 기관 이름 검색하기]
 *  총 N곳 · [초기화]
 *  기관 카드 — 무한 스크롤 + 창 스크롤 가상화 (InstitutionList)
 *
 * 고른 지역·검색어는 주소에 남긴다. 기관 상세를 보고 뒤로 왔을 때 화면이 다시 만들어지는데,
 * 상태를 메모리에만 두면 그때 필터가 풀린다 — 부모는 지역을 다시 고르게 된다.
 * 주소에 있으면 새로고침·뒤로가기·링크 공유까지 같이 산다.
 */
export function BrowseView() {
  const sp = useSearchParams();
  const router = useRouter();

  const [region, setRegion] = useState<Region | null>(() => regionFromUrl(sp));
  const [q, setQ] = useState(() => sp.get("q") ?? "");           // 입력창에 보이는 값
  const [query, setQuery] = useState(() => sp.get("q") ?? "");   // 타이핑이 멎으면 반영되는 검색어
  const [items, setItems] = useState<InstitutionCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageRef = useRef(1);
  const reqRef = useRef(0);                 // 늦게 도착한 응답이 최신 결과를 덮지 않도록

  const dirty = region !== null || q !== "";
  const hasMore = items.length < total;

  const fetchPage = useCallback(
    async (nextPage: number, replace: boolean) => {
      const seq = ++reqRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await api.institutions.browse({
          region_id: region?.region_id,
          q: query || undefined,
          sort: "recommended",
          page: nextPage,
          size: SIZE,
        });
        if (seq !== reqRef.current) return;   // 더 최신 요청이 있으면 버린다
        pageRef.current = res.page;
        setTotal(res.total);
        setItems((prev) => (replace ? res.items : [...prev, ...res.items]));
      } catch (e) {
        if (seq === reqRef.current) setError(humanize(e));
      } finally {
        if (seq === reqRef.current) setLoading(false);
      }
    },
    [region, query],
  );

  // 고른 조건을 주소에 적어둔다. 되돌아왔을 때 위에서 그대로 읽는다
  useEffect(() => {
    const p = new URLSearchParams();
    if (region) {
      p.set("region", String(region.region_id));
      p.set("sido", region.sido);
      p.set("sigungu", region.sigungu);
    }
    if (query) p.set("q", query);
    const qs = p.toString();
    router.replace(qs ? `/browse?${qs}` : "/browse", { scroll: false });
  }, [region, query, router]);

  // 타이핑이 멎으면 검색 (300ms)
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // 조건이 바뀌면 처음부터 다시
  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {                  // effect 안 동기 setState 회피
      if (!alive) return;
      pageRef.current = 1;
      void fetchPage(1, true);
      window.scrollTo({ top: 0 });
    });
    return () => { alive = false; };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    void fetchPage(pageRef.current + 1, false);
  }, [fetchPage]);

  const reset = () => {
    setRegion(null);
    setQ("");
    setQuery("");
  };

  const empty = !loading && !error && items.length === 0;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 md:px-0">
      <div className="flex items-center gap-2">
        <RegionFilter value={region} onChange={setRegion} />
        <SearchBox value={q} onChange={setQ} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Text variant="caption" as="p">총 {total.toLocaleString()}곳</Text>
        <button
          type="button"
          onClick={reset}
          disabled={!dirty}
          className="t-caption inline-flex h-8 items-center rounded-pill px-3 text-muted transition-colors hover:bg-green-50 hover:text-strong disabled:text-placeholder disabled:hover:bg-transparent"
        >
          초기화
        </button>
      </div>

      {error && <div className="mt-4"><Notice tone="danger">{error}</Notice></div>}

      <InstitutionList items={items} hasMore={hasMore} loading={loading} onLoadMore={loadMore} />

      {empty && (
        <Card padding="lg" className="mt-3 text-center">
          <Text variant="body-m">조건에 맞는 기관이 없어요.</Text>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={reset}>조건 초기화</Button>
          </div>
        </Card>
      )}

      {loading && <Text variant="caption" className="mt-4 text-center">불러오는 중…</Text>}
      {!loading && !hasMore && items.length > 0 && (
        <Text variant="caption" className="mt-6 text-center">{total.toLocaleString()}곳을 모두 봤어요</Text>
      )}
    </main>
  );
}
