/**
 * 디자인 토큰 — globals.css `@theme` 와 같은 값. 두 곳이 어긋나면 CSS 가 기준.
 * JS 에서 값 자체가 필요할 때(차트·캔버스·문서 페이지)만 쓴다. 화면은 클래스(bg-primary, t-title-s …)를 쓸 것.
 */

/** 브레이크포인트: PC / 모바일 둘뿐 (768px 미만 = 모바일, 이상 = PC·태블릿) */
export const BREAKPOINT_MD = 768;

export const palette = {
  900: "#102421", 800: "#183833", 700: "#204A44", 600: "#295E56", 500: "#3A7A6E",
  400: "#5E9689", 300: "#92BCB2", 200: "#BCD7D0", 100: "#DEEBE7", 50: "#F2F7F5",
} as const;

/** 의미 토큰 — [이름, hex, 역할] 순서 그대로 문서 페이지에 쓴다 */
export const semantic = [
  ["primary",          "#295E56", "안아수달의 액션, CTA 버튼"],
  ["text/strong",      "#1B2A27", "제목, 핵심 숫자, 본문 강조"],
  ["text/body",        "#40534F", "기본 본문, 설명 문단"],
  ["text/muted",       "#5A6B67", "라벨, 캡션, 안내문"],
  ["text/placeholder", "#9AA8A5", "입력 힌트, 비활성 텍스트 (본문 금지)"],
  ["line/default",     "#D8DDD6", "구분선, 입력 필드 보더"],
  ["line/subtle",      "#EFEFE9", "리스트 내부 헤어라인"],
  ["action/press",     "#204A44", "press 상태"],
  ["action/soft",      "#DEEBE7", "tinted 컬러"],
  ["action/disabled",  "#E9E8E0", "disabled 상태"],
  ["surface/card",     "#FFFFFF", "카드 면"],
  ["surface/base",     "#F3F2EC", "화면 바탕"],
  ["surface/sunken",   "#E9E8E0", "눌린 면 (입력 영역, 세그먼트 트랙)"],
  ["success",          "#24634A", ""],
  ["success-bg",       "#E4F2EA", ""],
  ["warning",          "#B26200", ""],
  ["warning-bg",       "#FBF1DC", ""],
  ["danger",           "#9E382E", ""],
  ["danger-bg",        "#FBE9E6", ""],
] as const;

/** 클래스에서 쓰는 이름 (semantic 이름과 1:1) */
export const color = {
  primary: "#295E56",
  text: { strong: "#1B2A27", body: "#40534F", muted: "#5A6B67", placeholder: "#9AA8A5" },
  line: { default: "#D8DDD6", subtle: "#EFEFE9" },
  action: { press: "#204A44", soft: "#DEEBE7", disabled: "#E9E8E0" },
  surface: { card: "#FFFFFF", base: "#F3F2EC", sunken: "#E9E8E0" },
  success: "#24634A", successBg: "#E4F2EA",
  warning: "#B26200", warningBg: "#FBF1DC",
  danger: "#9E382E", dangerBg: "#FBE9E6",
} as const;

/** 타이포 스케일 — [size, line] px. mobile = 768 미만, desktop = 768 이상 */
export const type = {
  display:      { weight: 700, spacing: "-2.5%", mobile: [34, 44], desktop: [52, 66], role: "온보딩 완료화면 대제목" },
  "title-l":    { weight: 700, spacing: "-2%",   mobile: [26, 36], desktop: [36, 48], role: "화면제목" },
  "title-m":    { weight: 600, spacing: "-2%",   mobile: [21, 30], desktop: [26, 38], role: "섹션헤딩" },
  "title-s":    { weight: 600, spacing: "-1.5%", mobile: [18, 26], desktop: [20, 30], role: "카드 제목, 리스트 항목명" },
  "body-l":     { weight: 400, spacing: "0",     mobile: [17, 29], desktop: [18, 32], role: "설명 문단, 상담 안내문" },
  "body-m":     { weight: 400, spacing: "0",     mobile: [16, 26], desktop: [16, 28], role: "기본 본문, 최소 본문 크기" },
  caption:      { weight: 500, spacing: "0",     mobile: [14, 22], desktop: [14, 24], role: "주석, 보조정보" },
  label:        { weight: 700, spacing: "+1%",   mobile: [12, 18], desktop: [12, 18], role: "스테퍼, 오버라인" },
  "numeric-xl": { weight: 700, spacing: "0",     mobile: [40, 44], desktop: [56, 60], role: "매칭률, 통계숫자" },
} as const;

export type TypeVariant = keyof typeof type;
