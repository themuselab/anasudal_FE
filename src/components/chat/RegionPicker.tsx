"use client";
import { useEffect, useState } from "react";
import { api, type Region, type Sido } from "@/lib/api";
import { Chip, Text } from "@/components/ui";
import { shortSido } from "@/lib/format";

/**
 * 지역 선택 — 시안 없음(임시). 세션에 지역이 없을 때 추천 전에 한 번 묻는다.
 * 시·도 칩 → 시·군·구 칩. 고르면 region_id 를 돌려주고 세션에 저장된다.
 */
export function RegionPicker({ onPick }: { onPick: (region: Region) => void }) {
  const [sidos, setSidos] = useState<Sido[]>([]);
  const [sido, setSido] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    api.regions.sido().then(setSidos).catch(() => {});
  }, []);

  const pickSido = (s: string) => {
    setSido(s);
    setRegions([]);
    api.regions.sigungu(s).then(setRegions).catch(() => {});
  };

  return (
    <div className="max-w-[92%] md:max-w-[80%]">
      <Text variant="body-l">어느 지역에서 찾아드릴까요?</Text>
      <div className="mt-3 flex flex-wrap gap-2">
        {sidos.map((s) => (
          <Chip key={s.sido} selected={s.sido === sido} onClick={() => pickSido(s.sido)}>
            {shortSido(s.sido)}
          </Chip>
        ))}
      </div>
      {sido && regions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {regions.map((r) => (
            <Chip key={r.region_id} tone="primary" onClick={() => onPick(r)}>
              {r.sigungu}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
