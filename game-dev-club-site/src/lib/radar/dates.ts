const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Date(또는 epoch ms) → KST 기준 YYYY-MM-DD */
export function kstDate(value: Date | number | string): string {
  const ms = typeof value === "number" ? value : new Date(value).getTime();
  return new Date(ms + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function todayKst(): string {
  return kstDate(Date.now());
}

export function addDays(isoDate: string, days: number): string {
  return new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** 'D-18', 'D-day', 'D+3' → 날짜 */
export function ddayToDate(text: string, today = todayKst()): string | null {
  const m = text.match(/D\s*([-+])\s*(\d+)/i);
  if (m) return addDays(today, m[1] === "+" ? -Number(m[2]) : Number(m[2]));
  if (/D-?day/i.test(text)) return today;
  return null;
}

/** 연도 없는 월/일을 오늘 기준 가장 그럴듯한 연도로 붙인다 (반년 이상 지났으면 내년) */
export function monthDayToDate(month: number, day: number, today = todayKst()): string {
  const year = Number(today.slice(0, 4));
  const pad = (n: number) => String(n).padStart(2, "0");
  const at = (y: number) => `${y}-${pad(month)}-${pad(day)}`;
  const gap = (a: string, b: string) => (new Date(a).getTime() - new Date(b).getTime()) / DAY_MS;
  if (gap(today, at(year)) > 183) return at(year + 1);
  if (gap(at(year), today) > 183) return at(year - 1);
  return at(year);
}

/** 마감일(없으면 종료일)이 오늘보다 앞이면 끝난 항목. 둘 다 없으면 상시 */
export function isOver(deadline: string | null, end: string | null, today = todayKst()): boolean {
  const last = deadline ?? end;
  return last !== null && last < today;
}

/** 두 날짜(YYYY-MM-DD) 사이 일수 */
export function daysBetween(from: string, to: string): number {
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / DAY_MS);
}
