#!/usr/bin/env node
// Fetch public repositories from GitHub and write a normalized projects.json.
//
// Environment:
//   GITHUB_USERNAME  GitHub account whose public repos we list.
//   GITHUB_TOKEN     (optional) PAT or GITHUB_TOKEN for higher rate limits.
//   PORTFOLIO_TOPIC  (optional) Only include repos with this topic (default: "portfolio").
//   PORTFOLIO_ALLOWLIST  (optional) Comma-separated repo names to force-include.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, "..", "src", "data", "projects.json");

const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;
const topic = process.env.PORTFOLIO_TOPIC ?? "portfolio";
const allowlist = (process.env.PORTFOLIO_ALLOWLIST ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!username) {
  console.error("[sync-github] GITHUB_USERNAME is required. Skipping.");
  process.exit(0);
}

const headers = {
  "User-Agent": "portfolio-sync",
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (token) headers.Authorization = `Bearer ${token}`;

async function fetchRepos() {
  const url = `https://api.github.com/users/${encodeURIComponent(
    username,
  )}/repos?per_page=100&sort=updated&type=owner`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function normalize(repo) {
  return {
    name: repo.name,
    description: repo.description ?? "",
    repositoryUrl: repo.html_url,
    demoUrl: repo.homepage ?? "",
    screenshot: `/images/apps/${repo.name}.png`,
    techStack: repo.language ? [repo.language] : [],
    highlights: [],
    featured: repo.stargazers_count >= 1 || (repo.topics ?? []).includes("featured"),
    source: "github",
    github: {
      owner: repo.owner?.login ?? username,
      repo: repo.name,
      stars: repo.stargazers_count ?? 0,
      topics: repo.topics ?? [],
      primaryLanguage: repo.language ?? "",
      updatedAt: repo.updated_at ?? null,
    },
  };
}

async function main() {
  let repos;
  try {
    repos = await fetchRepos();
  } catch (err) {
    console.error("[sync-github] fetch failed:", err.message);
    console.error("[sync-github] keeping existing projects.json.");
    process.exit(0);
  }

  const filtered = repos
    .filter((r) => !r.private && !r.archived && !r.fork)
    .filter(
      (r) =>
        allowlist.includes(r.name) ||
        (r.topics ?? []).includes(topic),
    )
    .map(normalize);

  if (filtered.length === 0) {
    console.warn(
      `[sync-github] no repos matched topic "${topic}" or allowlist. Keeping existing data.`,
    );
    process.exit(0);
  }

  const existing = JSON.parse(await readFile(DATA_PATH, "utf8"));
  const output = {
    ...existing,
    lastSyncedAt: new Date().toISOString(),
    source: "github",
    projects: filtered,
  };

  await writeFile(DATA_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log(`[sync-github] wrote ${filtered.length} projects to projects.json`);
}

main().catch((err) => {
  console.error("[sync-github] unexpected error:", err);
  process.exit(0);
});
