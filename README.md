# my_portfolio_website

個人ブランディング向けのポートフォリオサイト。コンセプトは「信頼性のある技術者 + 継続的にアウトプットする個人」。

- フレームワーク: Astro (static)
- データ管理: `src/data/*.json` に正規化済み JSON として保持
- 自動更新: GitHub Actions から GitHub / Strava / TÜV SÜD を同期

## ローカル開発

```sh
npm install
npm run dev        # http://localhost:4321
npm run build
npm run preview
```

## セクション

| パス | 内容 | データ |
| --- | --- | --- |
| `/` | Home | `src/data/site.json` |
| `/apps` | App Development | `src/data/projects.json` |
| `/security` | IEC 62443 / TÜV SÜD | `src/data/certifications.json` |
| `/photography` | 写真投稿の控えめな紹介 | `src/data/photography.json` |
| `/training` | Strava 概要 (公開可能な集計値のみ) | `src/data/training.json` |
| `/about` | プロフィール | `src/data/site.json` |

## 自動更新

`.github/workflows/sync-and-deploy.yml` が、以下のスクリプトを順に実行して `src/data` を更新・コミットします。失敗時は既存 JSON を維持します。

| コマンド | 役割 | 必要な環境変数 |
| --- | --- | --- |
| `npm run sync:github` | 公開リポジトリを取得 (topics / allowlist で絞り込み) | `GITHUB_USERNAME`, `GITHUB_TOKEN`, `PORTFOLIO_TOPIC`, `PORTFOLIO_ALLOWLIST` |
| `npm run sync:strava` | 月次 / 年次集計値を取得 (位置情報・心拍は破棄) | `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` |
| `npm run sync:certifications` | TÜV SÜD 掲載状態を週次確認 | (不要) |

## 公開方針

- 実名 / 加工済みプロフィール写真 / 公開リポジトリ / 資格 / 公開 SNS のみ
- 会社名・勤務地・連絡先・位置情報・非公開リポジトリは掲載しない
- Strava の位置情報・詳細心拍は、同期スクリプトの時点で破棄する
