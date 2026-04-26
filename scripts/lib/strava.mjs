// Shared helpers for Strava data fetch scripts.
// Pure Node 20 (no external deps). All time math operates in JST (UTC+9).

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";
const MAX_PAGES = 50;
const PER_PAGE = 200;

export function requireEnv(names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length > 0) {
    console.error(`[strava] missing env: ${missing.join(", ")}`);
    process.exit(1);
  }
}

export async function refreshAccessToken() {
  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: process.env.STRAVA_REFRESH_TOKEN
  });
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[strava] token refresh failed: ${res.status} ${text}`);
    process.exit(1);
  }
  const json = await res.json();
  if (!json.access_token) {
    console.error("[strava] token refresh response missing access_token");
    process.exit(1);
  }
  return json.access_token;
}

// Fetch activities with optional after/before epoch seconds. Returns
// minimal records: { moving_time (sec), start_date_local (ISO local string) }.
export async function fetchActivities(token, { after, before } = {}) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page) });
    if (typeof after === "number") params.set("after", String(after));
    if (typeof before === "number") params.set("before", String(before));
    const url = `${STRAVA_ACTIVITIES_URL}?${params.toString()}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[strava] activities fetch failed page=${page}: ${res.status} ${text}`);
      process.exit(1);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const a of batch) {
      if (typeof a.moving_time !== "number" || typeof a.start_date_local !== "string") continue;
      out.push({ moving_time: a.moving_time, start_date_local: a.start_date_local });
    }
    if (batch.length < PER_PAGE) break;
  }
  return out;
}

// Returns a Date representing "now" but with its UTC fields shifted to JST,
// so that Date#getUTC* methods read JST calendar fields directly.
export function toJstNow(date = new Date()) {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

// "YYYY-MM" from a local-time ISO string like "2026-04-15T07:00:00Z".
export function jstYearMonthFromLocal(localIso) {
  return localIso.slice(0, 7);
}

export function jstYearFromLocal(localIso) {
  return Number(localIso.slice(0, 4));
}

// Parse "YYYY-MM-DDTHH:MM:SS" / similar local time into a Date whose
// UTC fields match the JST-local fields. (start_date_local has no offset.)
function parseLocalAsJstDate(localIso) {
  // Treat the local string as JST wall clock, return a Date whose UTC fields
  // equal those wall-clock fields (so we can use getUTC* helpers below).
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(localIso);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
}

// Return ISO week key "YYYY-Www" (ISO 8601). Input: a Date whose UTC fields
// represent the desired wall clock (use toJstNow / parseLocalAsJstDate).
export function isoWeekKey(jstDate) {
  // Copy and zero time portion.
  const d = new Date(Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth(), jstDate.getUTCDate()));
  const day = d.getUTCDay() || 7; // Mon=1..Sun=7
  // Move to Thursday in current week.
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// Monday (00:00 JST) of the week containing the given JST-fielded Date.
export function mondayOfIsoWeek(jstDate) {
  const d = new Date(Date.UTC(jstDate.getUTCFullYear(), jstDate.getUTCMonth(), jstDate.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return d;
}

export function formatYmd(jstDate) {
  const y = jstDate.getUTCFullYear();
  const m = String(jstDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jstDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoWeekKeyFromLocal(localIso) {
  const d = parseLocalAsJstDate(localIso);
  if (!d) return null;
  return isoWeekKey(d);
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

// Build six monthly buckets ending at the JST execution month.
// Returns array of 6 entries: oldest first, last entry = execution month.
export function buildSixMonthBuckets(jstNow) {
  const out = [];
  const year = jstNow.getUTCFullYear();
  const month = jstNow.getUTCMonth(); // 0-based
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(year, month - i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    out.push({
      month: `${y}-${String(m).padStart(2, "0")}`,
      label: `${m}月`,
      hours: 0
    });
  }
  return out;
}

// Format streak duration (startDate -> jstNow) into "X年Yヶ月Z週間".
// Calendar-based year/month diff with floor on weeks-of-remainder days.
export function formatDurationLabel(startYmd, jstNow) {
  const [sy, sm, sd] = startYmd.split("-").map(Number);
  let years = jstNow.getUTCFullYear() - sy;
  let months = jstNow.getUTCMonth() + 1 - sm;
  let days = jstNow.getUTCDate() - sd;
  if (days < 0) {
    months -= 1;
    // Days in previous month (relative to jstNow)
    const prev = new Date(Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), 0));
    days += prev.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const weeks = Math.floor(days / 7);
  return `${years}年${months}ヶ月${weeks}週間`;
}

// JST "now" formatted as ISO with +09:00 offset.
export function formatJstIso(jstNow) {
  const y = jstNow.getUTCFullYear();
  const m = String(jstNow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jstNow.getUTCDate()).padStart(2, "0");
  const hh = String(jstNow.getUTCHours()).padStart(2, "0");
  const mm = String(jstNow.getUTCMinutes()).padStart(2, "0");
  const ss = String(jstNow.getUTCSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}+09:00`;
}

// Iterate ISO weeks from startWeekKey forward up to (and including) endWeekKey.
// Both endpoints are inclusive. Returns array of week keys.
export function iterateIsoWeeks(startKey, endKey) {
  const parseKey = (k) => {
    const [y, w] = k.split("-W").map(Number);
    // Approx: take Jan 4 (always in week 1), find its Monday, add (w-1)*7 days.
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Mon = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
    return new Date(week1Mon.getTime() + (w - 1) * 7 * 86400000);
  };
  const start = parseKey(startKey);
  const end = parseKey(endKey);
  const out = [];
  for (let cur = start; cur <= end; cur = new Date(cur.getTime() + 7 * 86400000)) {
    out.push(isoWeekKey(cur));
  }
  return out;
}

// Compute streak from ALL activities. Walk back from the most recent week
// that has activity (current week if it has any, else previous week) until
// hitting a week with zero activity. Returns { weeks, startDate }.
export function computeStreakFromActivities(activities, jstNow) {
  const weekSet = new Set();
  for (const a of activities) {
    const k = isoWeekKeyFromLocal(a.start_date_local);
    if (k) weekSet.add(k);
  }
  // Determine "anchor" = most recent week with activity, starting from current.
  const currentMonday = mondayOfIsoWeek(jstNow);
  let cursorMonday = new Date(currentMonday);
  // If current week has no activity, step back one week so streak can still
  // be reported as ending in last completed week.
  if (!weekSet.has(isoWeekKey(cursorMonday))) {
    cursorMonday = new Date(cursorMonday.getTime() - 7 * 86400000);
  }
  if (!weekSet.has(isoWeekKey(cursorMonday))) {
    return { weeks: 0, startDate: formatYmd(currentMonday) };
  }
  let count = 0;
  let earliestMonday = cursorMonday;
  let walker = new Date(cursorMonday);
  while (weekSet.has(isoWeekKey(walker))) {
    count += 1;
    earliestMonday = new Date(walker);
    walker = new Date(walker.getTime() - 7 * 86400000);
  }
  return { weeks: count, startDate: formatYmd(earliestMonday) };
}

export function startOfMonthEpochSec(year, monthIndex0) {
  // Convert "YYYY-MM-01 00:00:00 JST" to UTC epoch seconds.
  const utcMs = Date.UTC(year, monthIndex0, 1, 0, 0, 0) - JST_OFFSET_MS;
  return Math.floor(utcMs / 1000);
}
