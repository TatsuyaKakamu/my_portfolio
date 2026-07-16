// Training セクションの月次擬似データ生成。
// Strava 連携停止後、実測値の代わりに (年, 月) をシードにした決定的な値を表示する。
// 同じ月は誰がいつ見ても同じ値になり、月が替わると自動でローリングする（再デプロイ不要）。
// 値のレンジは連携停止前の実測（2025-12〜2026-05: 20.7〜29.9h、平均26h）に合わせている。

export interface PseudoMonthlyEntry {
  month: string;
  label: string;
  hours: number;
}

export interface PseudoTrainingView {
  period: { from: string; to: string; lastMonth: string; year: number };
  lastMonthTotalHours: number;
  previousMonthTotalHours: number;
  lastMonthDeltaHours: number;
  averageMonthlyHours: number;
  yearTotalHours: number;
  monthlyHours: PseudoMonthlyEntry[];
}

export const DISPLAY_MONTHS = 6;

const SALT = 62443;

// mulberry32: 32bit シードから [0,1) を返す決定的 PRNG
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

function hoursFor(year: number, monthIndex0: number): number {
  const rand = mulberry32(year * 12 + monthIndex0 + SALT);
  const seasonal = 3 * Math.sin(((monthIndex0 + 1) / 12) * 2 * Math.PI);
  const noise = (rand() * 2 - 1) * 2;
  return round1(Math.min(30, Math.max(20, 25 + seasonal + noise)));
}

// JST の暦フィールドを取り出す（既存 index.astro の jstNow と同じオフセット方式）
function jstParts(now: Date) {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { year: jst.getUTCFullYear(), monthIndex0: jst.getUTCMonth() };
}

export function buildTrainingView(now: Date): PseudoTrainingView {
  const { year, monthIndex0 } = jstParts(now);

  // 表示窓は直近の完了月（今月の前月）を終端とする DISPLAY_MONTHS ヶ月
  const months: PseudoMonthlyEntry[] = [];
  for (let i = DISPLAY_MONTHS; i >= 1; i--) {
    const d = new Date(Date.UTC(year, monthIndex0 - i, 1));
    const y = d.getUTCFullYear();
    const m0 = d.getUTCMonth();
    months.push({
      month: `${y}-${String(m0 + 1).padStart(2, "0")}`,
      label: `${m0 + 1}月`,
      hours: hoursFor(y, m0)
    });
  }

  const last = months[months.length - 1];
  const prev = months[months.length - 2];

  // 今年の合計は直近完了月が属する年の 1 月からの累計
  const lastDate = new Date(Date.UTC(year, monthIndex0 - 1, 1));
  const currentYear = lastDate.getUTCFullYear();
  let yearTotal = 0;
  for (let m0 = 0; m0 <= lastDate.getUTCMonth(); m0++) {
    yearTotal += hoursFor(currentYear, m0);
  }

  const average = round1(months.reduce((sum, entry) => sum + entry.hours, 0) / months.length);

  return {
    period: { from: months[0].month, to: last.month, lastMonth: last.month, year: currentYear },
    lastMonthTotalHours: last.hours,
    previousMonthTotalHours: prev.hours,
    lastMonthDeltaHours: round1(last.hours - prev.hours),
    averageMonthlyHours: average,
    yearTotalHours: round1(yearTotal),
    monthlyHours: months
  };
}
