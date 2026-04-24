import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';

export async function readJson(path, fallback = null) {
  try {
    const text = await readFile(path, 'utf8');
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function writeJson(path, data) {
  const dir = path.split('/').slice(0, -1).join('/');
  if (dir) await mkdir(dir, { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function withCacheFallback({ run, cachePath, fallbackPath }) {
  try {
    const result = await run();
    await writeJson(cachePath, result);
    return { ok: true, data: result, source: 'live' };
  } catch (error) {
    const fallback = await readJson(cachePath) ?? await readJson(fallbackPath);
    if (!fallback) throw error;
    return { ok: false, data: fallback, source: 'cache', error: error.message };
  }
}
