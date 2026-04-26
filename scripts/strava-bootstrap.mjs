#!/usr/bin/env node
// One-time bootstrap: fetch all Strava activities, compute training-data.json
// from scratch (six-month buckets, year total, streak).
// Usage:
//   STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... STRAVA_REFRESH_TOKEN=... \
//     node scripts/strava-bootstrap.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  requireEnv,
  refreshAccessToken,
  fetchActivities,
  toJstNow,
  buildSixMonthBuckets,
  jstYearMonthFromLocal,
  jstYearFromLocal,
  computeStreakFromActivities,
  formatDurationLabel,
  formatJstIso,
  round1
} from "./lib/strava.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = resolve(__dirname, "..", "src", "data", "training-data.json");

requireEnv(["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REFRESH_TOKEN"]);

const token = await refreshAccessToken();
console.log("[bootstrap] fetching all activities...");
const activities = await fetchActivities(token, { after: 0 });
console.log(`[bootstrap] fetched ${activities.length} activities`);

const jstNow = toJstNow();
const thisYear = jstNow.getUTCFullYear();
const monthlyHours = buildSixMonthBuckets(jstNow);
const bucketIndex = new Map(monthlyHours.map((b, i) => [b.month, i]));

let yearSeconds = 0;
for (const a of activities) {
  const ym = jstYearMonthFromLocal(a.start_date_local);
  const idx = bucketIndex.get(ym);
  if (idx !== undefined) {
    monthlyHours[idx].hours += a.moving_time / 3600;
  }
  if (jstYearFromLocal(a.start_date_local) === thisYear) {
    yearSeconds += a.moving_time;
  }
}
for (const b of monthlyHours) b.hours = round1(b.hours);

const lastMonthTotalHours = monthlyHours[monthlyHours.length - 2].hours;
const previousMonthTotalHours = monthlyHours[monthlyHours.length - 3].hours;
const lastMonthDeltaHours = round1(lastMonthTotalHours - previousMonthTotalHours);
const averageMonthlyHours = round1(
  monthlyHours.reduce((s, b) => s + b.hours, 0) / monthlyHours.length
);
const yearTotalHours = round1(yearSeconds / 3600);

const streak = computeStreakFromActivities(activities, jstNow);
const streakLabel = streak.weeks > 0
  ? formatDurationLabel(streak.startDate, jstNow)
  : "0年0ヶ月0週間";

const data = {
  lastFetchedAt: formatJstIso(jstNow),
  period: {
    from: monthlyHours[0].month,
    to: monthlyHours[monthlyHours.length - 1].month,
    lastMonth: monthlyHours[monthlyHours.length - 2].month,
    year: thisYear
  },
  lastMonthTotalHours,
  previousMonthTotalHours,
  lastMonthDeltaHours,
  averageMonthlyHours,
  yearTotalHours,
  monthlyHours,
  streak: {
    weeks: streak.weeks,
    startDate: streak.startDate,
    label: streakLabel
  }
};

await writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`[bootstrap] wrote ${OUTPUT_PATH}`);
