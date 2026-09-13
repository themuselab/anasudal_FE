"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { InstitutionCard } from "@/lib/api";
import { InstitutionCardView } from "@/components/institution/InstitutionCard";

/** 카드 한 장의 대략 높이(실측 전 추정치)와 카드 사이 간격 */
const ESTIMATED = 168;
const GAP = 16;
/** 끝에서 이만큼 남으면 다음 쪽을 미리 불러온다 */
const PREFETCH = 5;

/**
 * 기관 목록 — 창 스크롤 가상화 + 무한 스크롤.
 *  · 화면에 보이는 카드만 DOM 에 둔다 (2,866곳을 다 펼치지 않는다)
 *  · 카드 높이는 태그 줄바꿈에 따라 달라지므로 measureElement 로 실제 높이를 잰다
 *  · 목록 끝이 가까워지면 onLoadMore 로 다음 쪽 요청
 */
export function InstitutionList({
  items,
  hasMore,
  loading,
  onLoadMore,
}: {
  items: InstitutionCard[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  // 목록이 페이지 안에서 시작하는 y — 창 스크롤 가상화의 기준점.
  // 콜백 ref 로 잡는다 (렌더 중 ref 읽기 금지 규칙 회피)
  const [offset, setOffset] = useState(0);
  const elRef = useRef<HTMLDivElement | null>(null);
  const requested = useRef(-1); // 같은 위치에서 중복 요청 방지

  const setListRef = useCallback((el: HTMLDivElement | null) => {
    elRef.current = el;
    if (el) setOffset(el.offsetTop);
  }, []);

  // 창 크기가 바뀌면 툴바 줄바꿈으로 시작 위치가 달라진다
  useEffect(() => {
    const remeasure = () => {
      if (elRef.current) setOffset(elRef.current.offsetTop);
    };
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => ESTIMATED,
    gap: GAP,
    overscan: 6,
    scrollMargin: offset,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems.at(-1)?.index ?? -1;

  // 끝이 보이면 다음 쪽 (다음 틱에 요청 — effect 안 동기 setState 회피)
  useEffect(() => {
    if (!hasMore || loading || lastIndex < 0) return;
    if (lastIndex < items.length - PREFETCH) return;
    if (requested.current === items.length) return;
    requested.current = items.length;
    queueMicrotask(onLoadMore);
  }, [lastIndex, items.length, hasMore, loading, onLoadMore]);

  return (
    <div ref={setListRef} className="relative mt-3" style={{ height: virtualizer.getTotalSize() }}>
      {virtualItems.map((v) => {
        const item = items[v.index];
        if (!item) return null;
        return (
          <div
            key={item.biz_no}
            data-index={v.index}
            ref={virtualizer.measureElement}
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${v.start - offset}px)` }}
          >
            <InstitutionCardView item={item} />
          </div>
        );
      })}
    </div>
  );
}
