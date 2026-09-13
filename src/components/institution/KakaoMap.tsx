"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* 카카오 지도 SDK — 쓰는 부분만 타입을 좁혀 둔다 */
type LatLng = object;
interface KakaoMaps {
  load(cb: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  Map: new (el: HTMLElement, opts: { center: LatLng; level: number; draggable?: boolean }) => object;
  Marker: new (opts: { map: object; position: LatLng }) => object;
  services: {
    Geocoder: new () => {
      addressSearch(addr: string, cb: (result: Array<{ x: string; y: string }>, status: string) => void): void;
    };
    Status: { OK: string };
  };
}
declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

const SDK_ID = "kakao-maps-sdk";

function loadSdk(key: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  const existing = document.getElementById(SDK_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("kakao sdk")));
    });
  }
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.id = SDK_ID;
    el.async = true;
    el.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("kakao sdk"));
    document.head.appendChild(el);
  });
}

/**
 * 기관 위치 지도 (시안 pc/mb-둘러보기_상세의 "지도" 영역)
 *  · 좌표가 있으면 그대로, 없으면 카카오 주소검색(Geocoder)으로 주소를 좌표로 바꿔 표시
 *  · JS 키(NEXT_PUBLIC_KAKAO_MAP_KEY)가 없거나 실패하면 회색 자리와 카카오맵 링크만
 */
export function KakaoMap({
  name, address, lat, lon, placeUrl, className,
}: {
  name: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
  placeUrl: string | null;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const usable = Boolean(key) && !failed;

  useEffect(() => {
    if (!key || !box.current) return;
    let alive = true;

    loadSdk(key)
      .then(() => {
        if (!alive || !window.kakao) return;
        const maps = window.kakao.maps;
        maps.load(() => {
          const el = box.current;
          if (!alive || !el) return;
          const draw = (pos: LatLng) => {
            const map = new maps.Map(el, { center: pos, level: 4 });
            new maps.Marker({ map, position: pos });
          };
          if (lat != null && lon != null) {
            draw(new maps.LatLng(lat, lon));
          } else if (address) {
            new maps.services.Geocoder().addressSearch(address, (result, status) => {
              if (!alive) return;
              if (status === maps.services.Status.OK && result[0]) {
                draw(new maps.LatLng(Number(result[0].y), Number(result[0].x)));
              } else {
                setFailed(true);
              }
            });
          } else {
            setFailed(true);
          }
        });
      })
      .catch(() => { if (alive) setFailed(true); });

    return () => { alive = false; };
  }, [key, address, lat, lon]);

  return (
    <div className={cn("relative h-52 w-full overflow-hidden rounded-lg bg-sunken md:h-64", className)}>
      {usable ? (
        <div ref={box} className="size-full" aria-label={`${name} 위치 지도`} />
      ) : (
        <div className="grid size-full place-items-center text-center">
          <div>
            <p className="t-caption text-muted">지도</p>
            {placeUrl && (
              <a
                href={placeUrl}
                target="_blank"
                rel="noreferrer"
                className="t-caption mt-1 inline-block text-primary underline underline-offset-4"
              >
                카카오맵에서 보기
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
