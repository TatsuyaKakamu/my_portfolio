#!/usr/bin/env node
// Monthly delta update: fetch only previous month's activities, update
// existing src/data/training-data.json incrementally.
// Run by GitHub Actions on the 1st of each month (JST 09:00).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  requireEnv,
  refreshAccessToken,
  fetchActivities,
  toJstNow,
  isoWeekKeyFromLocal,
  isoWeekKey,
  iterateIsoWeeks,
  formatDurationLabel,
  formatJstIso,
  round1,
  startOfMonthEpochSec,
  mondayOfIsoWeek,
  formatYmd
} from "./lib/strava.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, "..", "src", "data", "training-data.json");

requireEnv(["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REFRESH_TOKEN"]);

let prev;
try {
  prev = JSON.parse(await readFile(DATA_PATH, "utf8"));
} catch (err) {
  console.error(
    `[update] failed to read ${DATA_PATH}: ${err.message}\n` +
      "Run `node scripts/strava-bootstrap.mjs` first to generate the initial file."
  );
  process.exit(1);
}

const jstNow = toJstNow();
const thisYear = jstNow.getUTCFullYear();
const thisMonthIdx = jstNow.getUTCMonth(); // 0-based
const prevMonthDate = new Date(Date.UTC(thisYear, thisMonthIdx - 1, 1));
const prevMonthYear = prevMonthDate.getUTCFullYear();
const prevMonthIdx = prevMonthDate.getUTCMonth();
const prevMonthKey = `${prevMonthYear}-${String(prevMonthIdx + 1).padStart(2, "0")}`;
const thisMonthKey = `${thisYear}-${String(thisMonthIdx + 1).padStart(2, "0")}`;

const after = startOfMonthEpochSec(prevMonthYear, prevMonthIdx) - 1;
const before = startOfMonthEpochSec(thisYear, thisMonthIdx);

const token = await refreshAccessToken();
console.log(`[update] fetching activities for ${prevMonthKey} (after=${after}, before=${before})`);
const activities = await fetchActivities(token, { after, before });
console.log(`[update] fetched ${activities.length} activities`);

const lastMonthSeconds = activities.reduce((s, a) => s + a.moving_time, 0);
const lastMonthHours = round1(lastMonthSeconds / 3600);

// monthlyHours: shift oldest out, append this month with 0, set prevMonth bucket.
const oldMonthly = Array.isArray(prev.monthlyHours) ? prev.monthlyHours : [];
const monthlyHours = oldMonthly.slice(-5).map((b) => ({ ...b }));
// Ensure we have exactly 5 entries to keep before appending; if file was malformed,
// fall back to padding with zeros.
while (monthlyHours.length < 5) {
  monthlyHours.unshift({ month: "0000-00", label: "?", hours: 0 });
}
monthlyHours.push({
  month: thisMonthKey,
  label: `${thisMonthIdx + 1}月`,
  hours: 0
});
const prevBucket = monthlyHours[monthlyHours.length - 2];
prevBucket.month = prevMonthKey;
prevBucket.label = `${prevMonthIdx + 1}月`;
prevBucket.hours = lastMonthHours;

const previousMonthTotalHours = round1(prev.lastMonthTotalHours ?? 0);
const lastMonthDeltaHours = round1(lastMonthHours - previousMonthTotalHours);
const averageMonthlyHours = round1(
  monthlyHours.reduce((s, b) => s + b.hours, 0) / monthlyHours.length
);

// yearTotalHours:
//  - if cron runs in the same calendar year as previous JSON: add lastMonth.
//  - otherwise (Jan 1 cron, prevMonth = Dec of previous year): reset to 0.
let yearTotalHours;
if (prev.period?.year === thisYear) {
  yearTotalHours = round1((prev.yearTotalHours ?? 0) + lastMonthHours);
} else {
  yearTotalHours = 0;
}

// Streak update.
// Enumerate ISO weeks that overlap previous month, plus the prev-month-end week
// that may extend into this month. Check each has >=1 activity.
const prevMonthFirstDay = new Date(Date.UTC(prevMonthYear, prevMonthIdx, 1));
const prevMonthLastDay = new Date(Date.UTC(prevMonthYear, prevMonthIdx + 1, 0));
const startWeek = isoWeekKey(prevMonthFirstDay);
const endWeek = isoWeekKey(prevMonthLastDay);
const weeksToCheck = iterateIsoWeeks(startWeek, endWeek);

const activeWeeks = new Set();
for (const a of activities) {
  const k = isoWeekKeyFromLocal(a.start_date_local);
  if (k) activeWeeks.add(k);
}
const allWeeksActive = weeksToCheck.every((w) => activeWeeks.has(w));

let streak;
if (allWeeksActive && prev.streak?.startDate) {
  const startYmd = prev.streak.startDate;
  const startDate = new Date(`${startYmd}T00:00:00Z`);
  const endMonday = mondayOfIsoWeek(jstNow);
  const weeks = Math.round((endMonday.getTime() - startDate.getTime()) / (7 * 86400000)) + 1;
  streak = {
    weeks,
    startDate: startYmd,
    label: formatDurationLabel(startYmd, jstNow)
  };
} else {
  console.warn(
    "[update] streak broken (or missing prior streak): activity gap detected in last month. " +
      "Re-run scripts/strava-bootstrap.mjs to recompute the full streak."
  );
  // Fallback: compute a partial streak from the fetched window only.
  let count = 0;
  let earliestKey = null;
  for (let i = weeksToCheck.length - 1; i >= 0; i -= 1) {
    const wk = weeksToCheck[i];
    if (activeWeeks.has(wk)) {
      count += 1;
      earliestKey = wk;
    } else {
      break;
    }
  }
  if (count === 0 || !earliestKey) {
    streak = { weeks: 0, startDate: formatYmd(mondayOfIsoWeek(jstNow)), label: "0年0ヶ月0週間" };
  } else {
    // earliestKey -> Monday date.
    const [y, w] = earliestKey.split("-W").map(Number);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Mon = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
    const startMon = new Date(week1Mon.getTime() + (w - 1) * 7 * 86400000);
    const startYmd = formatYmd(startMon);
    streak = {
      weeks: count,
      startDate: startYmd,
      label: formatDurationLabel(startYmd, jstNow)
    };
  }
}

const data = {
  lastFetchedAt: formatJstIso(jstNow),
  period: {
    from: monthlyHours[0].month,
    to: monthlyHours[monthlyHours.length - 1].month,
    lastMonth: prevMonthKey,
    year: thisYear
  },
  lastMonthTotalHours: lastMonthHours,
  previousMonthTotalHours,
  lastMonthDeltaHours,
  averageMonthlyHours,
  yearTotalHours,
  monthlyHours,
  streak
};

await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`[update] wrote ${DATA_PATH}`);
