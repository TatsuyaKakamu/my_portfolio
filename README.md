# my_portfolio_website

個人ブランディング向けポートフォリオサイトの初版実装です。

## 構成

- `index.html`: Home
- `pages/apps.html`: Apps
- `pages/security.html`: Security / Certification
- `pages/photography.html`: Photography
- `pages/training.html`: Training
- `pages/about.html`: About
- `data/normalized/*.json`: サイト表示用の正規化済みデータ
- `scripts/*.mjs`: 外部サービス連携（GitHub / Strava / TÜV SÜD）
- `.github/workflows/update-data.yml`: 定期データ更新

## 開発

```bash
npm run serve
```

http://localhost:4173 を開くと確認できます。

## 自動更新

### GitHub

```bash
GITHUB_OWNER=your-id GITHUB_TOKEN=token npm run data:github
```

- `config/projects.config.json` の `allowlist` / `includeTopics` で掲載制御。

### Strava

```bash
STRAVA_ACCESS_TOKEN=token STRAVA_ATHLETE_ID=12345 npm run data:strava
```

- 集計値のみを `data/normalized/training.json` に反映。
- 位置情報・心拍は保存しない設計。

### TÜV SÜD

```bash
npm run data:cert
```

- 資格ページに氏名またはIDが存在するかを低頻度確認。

## プライバシー

- 会社名、勤務地、連絡先、健康の詳細情報は掲載しない。
- 公開情報のみを表示対象にする。
- 取得失敗時は `data/raw/*.cache.json` または既存の正規化済みデータへフォールバック。
