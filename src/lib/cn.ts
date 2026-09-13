/** 클래스 합치기 — falsy 제거. (tailwind-merge 없이도 충분한 규모) */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
