#!/usr/bin/env node
// Monthly update: fetch all activities, update src/data/training-data.json.
// monthlyHours is updated incrementally (previous month bucket only).
// Streak is recomputed from full history to support 12-week blank tolerance.
// Run by GitHub Actions on the 1st of each month (JST 09:00).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  requireEnv,
  refreshAccessToken,
  fetchActivities,
  toJstNow,
  jstYearMonthFromLocal,
  jstYearFromLocal,
  computeStreakFromActivities,
  formatDurationLabel,
  formatJstIso,
  round1
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

const token = await refreshAccessToken();
console.log(`[update] fetching all activities for ${prevMonthKey} update...`);
const activities = await fetchActivities(token, { after: 0 });
console.log(`[update] fetched ${activities.length} activities`);

const lastMonthActivities = activities.filter(
  (a) => jstYearMonthFromLocal(a.start_date_local) === prevMonthKey
);
const lastMonthSeconds = lastMonthActivities.reduce((s, a) => s + a.moving_time, 0);
const lastMonthHours = round1(lastMonthSeconds / 3600);

// monthlyHours: keep the last 5 confirmed months from previous data (dropping
// any stale current-month or duplicate prev-month entry written by older logic
// or a same-day re-run), then append the just-completed month with its hours.
const oldMonthly = Array.isArray(prev.monthlyHours) ? prev.monthlyHours : [];
const filtered = oldMonthly.filter((b) => b.month < prevMonthKey);
const monthlyHours = filtered.slice(-5).map((b) => ({ ...b }));
while (monthlyHours.length < 5) {
  monthlyHours.unshift({ month: "0000-00", label: "?", hours: 0 });
}
monthlyHours.push({
  month: prevMonthKey,
  label: `${prevMonthIdx + 1}月`,
  hours: lastMonthHours
});

const previousMonthTotalHours = round1(prev.lastMonthTotalHours ?? 0);
const lastMonthDeltaHours = round1(lastMonthHours - previousMonthTotalHours);
const averageMonthlyHours = round1(
  monthlyHours.reduce((s, b) => s + b.hours, 0) / monthlyHours.length
);

// Recompute from full history so retroactive edits and mid-month bootstraps
// don't double-count or drift.
let yearSeconds = 0;
for (const a of activities) {
  if (jstYearFromLocal(a.start_date_local) === thisYear) {
    yearSeconds += a.moving_time;
  }
}
const yearTotalHours = round1(yearSeconds / 3600);

// Streak: recompute from all activities (full history needed for 12-week
// blank tolerance — a single month's fetch is insufficient).
const streakResult = computeStreakFromActivities(activities, jstNow);
const streak = {
  weeks: streakResult.weeks,
  startDate: streakResult.startDate,
  label: streakResult.weeks > 0
    ? formatDurationLabel(streakResult.startDate, jstNow)
    : "0年0ヶ月0週間"
};

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
