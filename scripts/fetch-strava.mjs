import { writeJson, readJson, withCacheFallback } from './lib.mjs';

const token = process.env.STRAVA_ACCESS_TOKEN;
const athleteId = process.env.STRAVA_ATHLETE_ID;

if (!token || !athleteId) {
  throw new Error('STRAVA_ACCESS_TOKEN と STRAVA_ATHLETE_ID を設定してください。');
}

async function fetchStravaSummary() {
  const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!statsRes.ok) throw new Error(`Strava API error: ${statsRes.status}`);
  const stats = await statsRes.json();

  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const monthlyDistanceKm = Number((stats.recent_run_totals?.distance || 0) / 1000).toFixed(1);

  return {
    training: {
      stravaUrl: `https://www.strava.com/athletes/${athleteId}`,
      summary: {
        period,
        activities: stats.recent_run_totals?.count || 0,
        distanceKm: Number(monthlyDistanceKm),
        movingTimeHours: Number(((stats.recent_run_totals?.moving_time || 0) / 3600).toFixed(1)),
        elevationGainM: stats.recent_run_totals?.elevation_gain || 0,
        note: '継続的なトレーニング習慣を記録しています。'
      },
      privacy: {
        includeRoutes: false,
        includeHeartRate: false,
        includeStartEndLocation: false
      },
      lastSyncedAt: new Date().toISOString()
    }
  };
}

const result = await withCacheFallback({
  run: fetchStravaSummary,
  cachePath: 'data/raw/strava.cache.json',
  fallbackPath: 'data/normalized/training.json'
});

await writeJson('data/normalized/training.json', result.data);
console.log(`[strava] source=${result.source} period=${result.data.training.summary.period}`);
