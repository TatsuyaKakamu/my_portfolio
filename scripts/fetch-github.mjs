import { readJson, writeJson, withCacheFallback } from './lib.mjs';

const config = await readJson('config/projects.config.json', {});
const owner = process.env.GITHUB_OWNER || config.githubOwner;
const token = process.env.GITHUB_TOKEN;
if (!owner || owner === 'YOUR_GITHUB_ID') {
  throw new Error('GITHUB_OWNER または config/projects.config.json の githubOwner を設定してください。');
}

async function fetchRepos() {
  const res = await fetch(`https://api.github.com/users/${owner}/repos?type=owner&sort=updated&per_page=100`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const repos = await res.json();
  const allowlist = new Set(config.allowlist || []);
  const topicsAllow = new Set(config.includeTopics || []);

  const filtered = repos.filter((repo) => {
    const byAllow = allowlist.has(repo.name);
    const byTopic = (repo.topics || []).some((t) => topicsAllow.has(t));
    return byAllow || byTopic;
  });

  return {
    projects: filtered.map((repo) => {
      const override = config.manualOverrides?.[repo.name] || {};
      return {
        name: repo.name,
        description: repo.description || '',
        repositoryUrl: repo.html_url,
        demoUrl: override.demoUrl || '',
        screenshot: override.screenshot || `/images/apps/${repo.name}.png`,
        techStack: [repo.language].filter(Boolean),
        highlights: override.highlights || [],
        featured: Boolean(override.featured),
        source: 'github',
        github: {
          owner: repo.owner.login,
          repo: repo.name,
          stars: repo.stargazers_count,
          topics: repo.topics || [],
          primaryLanguage: repo.language || '',
          updatedAt: repo.updated_at
        }
      };
    })
  };
}

const result = await withCacheFallback({
  run: fetchRepos,
  cachePath: 'data/raw/github.cache.json',
  fallbackPath: 'data/normalized/projects.json'
});

await writeJson('data/normalized/projects.json', result.data);
console.log(`[github] source=${result.source} projects=${result.data.projects.length}`);
