#!/usr/bin/env node
// Sync a month / year summary from the Strava API.
//
// Environment:
//   STRAVA_CLIENT_ID
//   STRAVA_CLIENT_SECRET
//   STRAVA_REFRESH_TOKEN   Refresh token for the owner's account.
//   STRAVA_ATHLETE_URL     (optional) Public profile URL.
//
// Published values are restricted to aggregate counts / distance / time / elevation.
// Location, heart rate, and start/end points are never persisted to projects data.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "..", "src", "data", "training.json");

const clientId = process.env.STRAVA_CLIENT_ID;
const clientSecret = process.env.STRAVA_CLIENT_SECRET;
const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

if (!clientId || !clientSecret || !refreshToken) {
  console.warn(
    "[sync-strava] missing STRAVA credentials. Skipping without overwriting data.",
  );
  process.exit(0);
}

async function getAccessToken() {
  const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`strava oauth ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function fetchActivities(accessToken, after) {
  const results = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const url = new URL("https://www.strava.com/api/v3/athlete/activities");
    url.searchParams.set("after", String(Math.floor(after.getTime() / 1000)));
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`strava activities ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    results.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
    if (page > 10) break;
  }
  return results;
}

function summarize(activities) {
  // Intentionally drop map, location, heartrate fields.
  const distanceKm = activities.reduce((acc, a) => acc + (a.distance ?? 0), 0) / 1000;
  const movingTimeHours =
    activities.reduce((acc, a) => acc + (a.moving_time ?? 0), 0) / 3600;
  const elevationGainM = activities.reduce(
    (acc, a) => acc + (a.total_elevation_gain ?? 0),
    0,
  );
  return {
    activities: activities.length,
    distanceKm: Math.round(distanceKm * 10) / 10,
    movingTimeHours: Math.round(movingTimeHours * 10) / 10,
    elevationGainM: Math.round(elevationGainM),
  };
}

async function main() {
  try {
    const token = await getAccessToken();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const yearActivities = await fetchActivities(token, yearStart);
    const monthActivities = yearActivities.filter(
      (a) => new Date(a.start_date).getTime() >= monthStart.getTime(),
    );

    const existing = JSON.parse(await readFile(DATA_PATH, "utf8"));
    const monthPeriod = `${monthStart.getFullYear()}-${String(
      monthStart.getMonth() + 1,
    ).padStart(2, "0")}`;

    const output = {
      ...existing,
      summary: {
        ...existing.summary,
        period: monthPeriod,
        ...summarize(monthActivities),
      },
      yearToDate: {
        ...existing.yearToDate,
        period: String(now.getFullYear()),
        ...summarize(yearActivities),
      },
      lastSyncedAt: new Date().toISOString(),
    };

    await writeFile(DATA_PATH, JSON.stringify(output, null, 2) + "\n");
    console.log(
      `[sync-strava] wrote summary: month=${output.summary.activities} acts, year=${output.yearToDate.activities} acts`,
    );
  } catch (err) {
    console.error("[sync-strava] failed:", err.message);
    console.error("[sync-strava] keeping existing training.json.");
    process.exit(0);
  }
}

main();
