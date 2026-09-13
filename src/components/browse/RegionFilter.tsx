"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Region, type Sido } from "@/lib/api";
import { Text } from "@/components/ui";
import { shortSido } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * 지역 설정 (시안 pc-둘러보기_지역 설정)
 *  버튼 → 아래로 패널: 왼쪽 시·도 목록 / 오른쪽 시·군·구 목록(기관 수)
 *  고르면 닫히고 리스트에 적용된다.
 */
export function RegionFilter({ value, onChange }: { value: Region | null; onChange: (r: Region | null) => void }) {
  const [open, setOpen] = useState(false);
  const [sidos, setSidos] = useState<Sido[]>([]);
  const [sido, setSido] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.regions.sido().then(setSidos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const pickSido = (s: string) => {
    setSido(s);
    setRegions([]);
    api.regions.sigungu(s).then(setRegions).catch(() => {});
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !sido) pickSido(value?.sido ?? sidos[0]?.sido ?? "서울특별시");
  };

  const label = value ? `${shortSido(value.sido)} ${value.sigungu}` : "지역 설정";

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="t-caption inline-flex h-11 items-center gap-1.5 rounded-pill border border-line bg-card px-4 text-strong transition-colors hover:border-green-300"
      >
        <PinIcon />
        {label}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line-subtle bg-card shadow-card">
          <div className="flex items-center justify-between px-4 py-3">
            <Text variant="title-s" as="h2">지역 선택</Text>
            <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="text-muted hover:text-strong">
              <CloseIcon />
            </button>
          </div>

          <div className="flex h-64 border-t border-line-subtle">
            <ul className="w-24 shrink-0 overflow-y-auto bg-base py-1">
              {sidos.map((s) => (
                <li key={s.sido}>
                  <button
                    type="button"
                    onClick={() => pickSido(s.sido)}
                    className={cn(
                      "t-caption w-full px-3 py-2 text-left transition-colors",
                      s.sido === sido ? "bg-card font-bold text-strong" : "text-muted hover:text-strong",
                    )}
                  >
                    {shortSido(s.sido)}
                  </button>
                </li>
              ))}
            </ul>

            <ul className="flex-1 overflow-y-auto py-1">
              {regions.map((r) => {
                const picked = value?.region_id === r.region_id;
                return (
                  <li key={r.region_id}>
                    <button
                      type="button"
                      onClick={() => { onChange(r); setOpen(false); }}
                      className={cn(
                        "t-caption flex w-full items-center justify-between gap-2 px-4 py-2 text-left transition-colors",
                        picked ? "bg-soft text-primary" : "text-strong hover:bg-green-50",
                      )}
                    >
                      <span>{r.sigungu}</span>
                      <span className="text-muted">{r.institution_count}곳</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={cn("transition-transform", open && "rotate-180")}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
