const nowEl = document.querySelector('[data-generated-at]');
if (nowEl) {
  nowEl.textContent = new Date().toISOString().slice(0, 10);
}

async function renderJson({ selector, path, render }) {
  const root = document.querySelector(selector);
  if (!root) return;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    root.innerHTML = render(data);
  } catch (error) {
    root.innerHTML = '<p class="meta">データを読み込めませんでした。直近キャッシュを確認してください。</p>';
  }
}

renderJson({
  selector: '[data-projects]',
  path: '/data/normalized/projects.json',
  render: (data) => (data.projects || []).map((p) => `
    <article class="card">
      <h3>${p.name}</h3>
      <p>${p.description || ''}</p>
      <p class="meta">最終更新: ${new Date(p.github.updatedAt).toLocaleDateString('ja-JP')}</p>
      <div class="badges">${(p.techStack || []).map((t) => `<span class="badge">${t}</span>`).join('')}</div>
      <p><a href="${p.repositoryUrl}" target="_blank" rel="noopener">GitHub</a>${p.demoUrl ? ` / <a href="${p.demoUrl}" target="_blank" rel="noopener">Demo</a>` : ''}</p>
    </article>
  `).join('') || '<p class="meta">表示できるプロジェクトがありません。</p>'
});

renderJson({
  selector: '[data-training]',
  path: '/data/normalized/training.json',
  render: (data) => {
    const s = data.training?.summary;
    if (!s) return '<p class="meta">トレーニング情報がありません。</p>';
    return `
      <article class="card">
        <h3>${s.period} のサマリ</h3>
        <ul>
          <li>アクティビティ数: ${s.activities}</li>
          <li>総距離: ${s.distanceKm} km</li>
          <li>移動時間: ${s.movingTimeHours} h</li>
          <li>獲得標高: ${s.elevationGainM} m</li>
        </ul>
        <p class="meta">最終同期: ${new Date(data.training.lastSyncedAt).toLocaleString('ja-JP')}</p>
      </article>
    `;
  }
});
