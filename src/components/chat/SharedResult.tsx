"use client";

import { useEffect, useState } from "react";
import { api, humanize, type ScreeningResult } from "@/lib/api";
import { Notice, Text } from "@/components/ui";
import { ScreeningResultBlock } from "@/components/chat/ScreeningResultBlock";

/** 공유 링크로 들어온 화면. 대화 맥락 없이 기록만 보여준다. */
export function SharedResult({ token }: { token: string }) {
  const [res, setRes] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.screening
      .result(token)
      .then((r) => { if (alive) setRes(r); })
      .catch((e) => { if (alive) setError(humanize(e)); });
    return () => { alive = false; };
  }, [token]);

  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!res) return <Text variant="caption">기록을 불러오는 중이에요…</Text>;

  return (
    <div className="flex flex-col gap-4">
      <Text variant="title-m" as="h1">살펴본 기록</Text>
      <ScreeningResultBlock res={res} />
    </div>
  );
}
