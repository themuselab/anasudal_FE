/** 표시용 포맷 — 시안 문구 규칙 */

/**
 * 시·도 표시용 약칭. 접미사만 떼면 "경상남도" → "경상남" 처럼 틀리므로 표로 둔다.
 * DB 에는 항상 전체 이름("경상남도")이 들어 있고, 축약은 화면에서만 한다.
 */
const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울", 부산광역시: "부산", 대구광역시: "대구", 인천광역시: "인천",
  광주광역시: "광주", 대전광역시: "대전", 울산광역시: "울산", 세종특별자치시: "세종",
  경기도: "경기", 강원특별자치도: "강원",
  충청북도: "충북", 충청남도: "충남",
  전북특별자치도: "전북", 전라남도: "전남",
  경상북도: "경북", 경상남도: "경남",
  제주특별자치도: "제주",
};

export function shortSido(sido: string | null | undefined): string {
  if (!sido) return "";
  return SIDO_SHORT[sido] ?? sido;   // 표에 없으면 전체 이름 그대로 (잘라서 틀리느니)
}

/** 53000 → "5.3", 70000 → "7" */
function man(v: number): string {
  return (v / 10000).toFixed(1).replace(/\.0$/, "");
}

/** (40000, 60000) → "회기당 4~6만원" · (53000, 53000) → "회기당 5.3만원" · null → "" */
export function priceRange(min: number | null, max: number | null): string {
  if (min == null) return "";
  const lo = man(min), hi = man(max ?? min);
  return lo === hi ? `회기당 ${lo}만원` : `회기당 ${lo}~${hi}만원`;
}

/** 치료영역 표시명 — 시안은 "언어치료·감각통합"처럼 짧게 (법정명 "언어재활" → "언어치료") */
const AREA_SHORT: Record<string, string> = {
  SPEECH: "언어치료", AUDIT: "청능치료", ART: "미술치료", MUSIC: "음악치료", PLAY: "놀이치료",
  BEHAV: "행동치료", PSYCH: "심리치료", SENSORY: "감각통합", MOTOR: "운동치료", PSYMOTOR: "심리운동", ETC: "기타",
};
export function areaShort(code: string, fallback?: string): string {
  return AREA_SHORT[code] ?? fallback ?? code;
}

/**
 * 태그를 보여줄 순서. 서버는 코드 알파벳 순으로 주는데 그대로 자르면 ART·AUDIT·BEHAV 만
 * 남고 정작 제일 많이 찾는 언어치료가 사라진다. 부모가 먼저 찾는 순서로 다시 세운다.
 */
const AREA_ORDER = [
  "SPEECH", "SENSORY", "PLAY", "BEHAV", "PSYCH", "ART", "MUSIC", "MOTOR", "PSYMOTOR", "AUDIT", "ETC",
];

export function sortAreas<T extends string>(codes: readonly T[]): T[] {
  const rank = (c: string) => {
    const i = AREA_ORDER.indexOf(c);
    return i === -1 ? AREA_ORDER.length : i;
  };
  return [...codes].sort((a, b) => rank(a) - rank(b));
}

/** 53000 → "회기당 5.3만원" (영역별 단가 한 건) */
export function pricePerSession(krw: number): string {
  return `회기당 ${man(krw)}만원`;
}
