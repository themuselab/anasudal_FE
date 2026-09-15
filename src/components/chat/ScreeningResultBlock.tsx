"use client";

import { useState } from "react";
import { api, type ScreeningResult } from "@/lib/api";
import { Button, Card, Notice, Text } from "@/components/ui";
import { areaShort, sortAreas } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * 관찰 기록 — 점수도 등급도 없다. 고른 답을 그대로 되돌려주고 약했던 것만 표시한다.
 * 공유 링크가 곧 열쇠라 "지우기"를 같은 화면에 둔다. 나중에 찾아 들어오게 하면 아무도 안 지운다.
 */
export function ScreeningResultBlock({
  res,
  onRecommend,
}: {
  res: ScreeningResult;
  onRecommend?: (areaCodes: string[]) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [removed, setRemoved] = useState(false);
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/r/${res.result_token}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 클립보드가 막힌 브라우저 — 링크는 아래에 그대로 보인다 */
    }
  };

  const remove = async () => {
    try {
      await api.screening.remove(res.result_token);
      setRemoved(true);
    } catch {
      /* 이미 지워졌거나 만료됨 — 어느 쪽이든 결과는 같다 */
      setRemoved(true);
    }
  };

  if (removed) {
    return <Notice tone="neutral">기록을 지웠어요. 링크도 더는 열리지 않아요.</Notice>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Card padding="lg" className="rounded-xl">
        <Text variant="label" as="p">{res.child_age_months}개월 · 오늘 살펴본 것</Text>
        <Text variant="title-s" as="h3" className="mt-1">{res.headline}</Text>

        <ul className="mt-4 flex flex-col gap-3">
          {res.observations.map((o) => (
            <li key={o.task_code} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-2 size-1.5 shrink-0 rounded-pill",
                  o.needs_attention ? "bg-warning" : "bg-green-300",
                )}
                aria-hidden
              />
              <div>
                <Text variant="caption" tone="strong" as="p" className="font-bold">{o.title}</Text>
                <Text variant="caption" as="p">{o.label}</Text>
              </div>
            </li>
          ))}
        </ul>

        {res.skipped_count > 0 && (
          <Text variant="caption" className="mt-3">
            준비물이 없어 {res.skipped_count}가지는 건너뛰었어요
          </Text>
        )}

        <div className="mt-4">
          <Notice tone={res.suggest_visit ? "warning" : "neutral"}>{res.note}</Notice>
        </div>
      </Card>

      <Card padding="lg" className="rounded-xl">
        <Text variant="title-s" as="h3">기록을 저장해두세요</Text>
        <Text variant="caption" tone="body" className="mt-1">
          기관에 문의하실 때 이 링크를 보여주시면 돼요.
        </Text>

        <div className="mt-3 flex flex-col gap-2">
          <Button onClick={copy} variant="outline">{copied ? "링크를 복사했어요" : "링크 복사"}</Button>
          <Text variant="label" as="p" tone="placeholder" className="break-all">{link}</Text>
        </div>

        {res.area_codes.length > 0 && onRecommend && (
          <div className="mt-5 border-t border-line-subtle pt-4">
            <Text variant="label" as="p">반응이 약했던 영역</Text>
            <Text variant="caption" tone="body" className="mt-1">
              {sortAreas(res.area_codes).map((c) => areaShort(c)).join(" · ")}를 함께 보는 기관을 찾아볼 수 있어요.
            </Text>
            <div className="mt-3">
              <Button variant="soft" onClick={() => onRecommend(res.area_codes)}>가까운 기관 보기</Button>
            </div>
          </div>
        )}

        <Text variant="caption" className="mt-5">
          180일 뒤 자동으로 지워져요 ·{" "}
          <button type="button" onClick={remove} className="underline hover:text-danger">
            지금 지우기
          </button>
        </Text>
      </Card>
    </div>
  );
}
