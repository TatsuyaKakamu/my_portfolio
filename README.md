# Tatsuya Kakamu Portfolio

Tatsuya Kakamu の個人活動をまとめるポートフォリオサイトです。

アプリ開発、産業用サイバーセキュリティの学習、写真、トレーニングを一つの静的サイトに集約し、技術者としての信頼性と継続的なアウトプットを伝えることを目的にしています。

公開URL: https://tatsuyakakamu.github.io/my_portfolio/

## 主な機能

- Astro による静的ポートフォリオサイト (GitHub Pages へ GitHub Actions で自動デプロイ)
- Home / Apps & Websites / Security / Photography / Training / About の1ページ構成
- アプリ開発・Web 制作実績のカード表示
- TÜV SÜD の IEC 62443 Foundation 資格情報表示
- 代表写真のギャラリー表示
- 総継続習慣を表示するトレーニングセクション
- アプリ向けプライバシーポリシーページ
- レスポンシブ対応
- CSS Variables による活動領域ごとのテーマカラー管理
- Intersection Observer を使った控えめなスクロール表示アニメーション

## 技術スタック

- Astro 5
- TypeScript
- CSS
- Lucide Astro Icons

## セットアップ

```bash
npm install
```

## 開発コマンド

開発サーバーを起動します。

```bash
npm run dev
```

本番用の静的ファイルを生成します。

```bash
npm run build
```

ビルド結果をローカルで確認します。

```bash
npm run preview
```

`dev` と `preview` は `127.0.0.1` にホストする設定です。

## ディレクトリ構成

```text
.
├── public/
│   └── images/              # サイトで使う画像
├── requirement/
│   └── portfolio_requirements.md
├── scripts/
│   ├── lib/
│   │   └── strava.mjs       # Strava 取得・集計の共通ヘルパー
│   ├── strava-bootstrap.mjs # 初回手動実行用 (全履歴から training-data.json を生成)
│   └── strava-update-monthly.mjs  # 月次差分更新 (cron 用、先月分のみ取得)
├── src/
│   ├── components/          # Astro コンポーネント
│   ├── data/
│   │   ├── portfolio.ts     # プロフィール・実績・資格・写真・トレーニングデータ
│   │   └── training-data.json  # Strava 集計値 (スクリプトが書き換える)
│   ├── lib/
│   │   └── asset.ts         # `BASE_URL` を考慮した画像パスヘルパー
│   ├── pages/
│   │   ├── index.astro      # トップページ
│   │   └── privacy.astro    # アプリ向けプライバシーポリシー
│   └── styles/
│       └── global.css       # 全体スタイル
├── .github/workflows/
│   ├── deploy.yml           # main への push で GitHub Pages にデプロイ
│   └── update-strava.yml    # Strava 集計値の手動更新用ワークフロー
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## コンテンツ更新方法

サイト上に表示するプロフィール、活動領域、外部リンク、アプリ情報、資格情報、写真、トレーニング概要は主に `src/data/portfolio.ts` で管理しています。

画像を追加・差し替えたい場合は `public/images/` 配下に配置し、`src/data/portfolio.ts` のパスを更新してください。

主要な編集対象:

- `src/data/portfolio.ts`: 表示データ全般
- `public/images/`: プロフィール画像、アプリ画像、写真、ブランド画像
- `src/styles/global.css`: 色、余白、レイアウト、アニメーション
- `src/pages/index.astro`: ページ構造

## 外部サービス連携

現在リンク済みの外部サービス:

- GitHub プロフィール (`https://github.com/TatsuyaKakamu`)
- Instagram (`https://www.instagram.com/t_kakamu_/`)
- TÜV SÜD 資格検証ページ
- Strava

### Strava 連携

Strava/Garmin 連携は現在停止中です。サイト上の Training セクションでは、`training-data.json` の集計カードやグラフは非表示にし、総継続習慣のみを表示しています。

再開に備えて、Strava API から `src/data/training-data.json` を生成・更新するスクリプトと手動実行用ワークフローは残しています。

必要な GitHub Secrets:

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REFRESH_TOKEN` (scope: `activity:read_all`)

実行系統:

- **初回 (手動 1 回)**: ローカルで bootstrap を実行し、過去全アクティビティから `training-data.json` を生成・コミットする。
  ```bash
  STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... STRAVA_REFRESH_TOKEN=... \
    node scripts/strava-bootstrap.mjs
  git add src/data/training-data.json
  git commit -m "feat(strava): bootstrap training data"
  git push
  ```
- **差分更新 (手動)**: `.github/workflows/update-strava.yml` は `workflow_dispatch` のみ有効です。Actions タブから手動実行すると `scripts/strava-update-monthly.mjs` を実行し、先月分のアクティビティだけを取得して JSON を増分更新・自動コミットします。
- **失敗時**: スクリプトは非ゼロで終了し、JSON は変更されないため、サイトには最後に取得した値が表示され続ける。

API キーやトークンはクライアント側に露出させないでください (Secrets と Actions のジョブ環境内でのみ使用)。

## プライバシー方針

このサイトでは、公開済みまたは公開を許容した情報のみを扱います。

掲載しない情報:

- 会社名
- 現職の詳細
- 勤務地
- 連絡先情報
- 非公開リポジトリ
- 詳細な健康情報
- Strava のルート、開始地点、終了地点、心拍などの詳細データ

トレーニング情報は、個人の生活圏や健康状態が過度に推測されないよう、集計値のみを表示する方針です。

## 公開時の注意

このサイトは GitHub Pages の `https://tatsuyakakamu.github.io/my_portfolio/` に公開されます。

`astro.config.mjs` は GitHub Pages のプロジェクトページ向けに `site` と `base` を設定しています。

```js
export default defineConfig({
  site: "https://tatsuyakakamu.github.io",
  base: "/my_portfolio"
});
```

別ドメインに移行する場合は `site` をその URL に変更し、サブパス公開でなくなる場合は `base` を削除してください。デプロイは `.github/workflows/deploy.yml` により `main` ブランチへの push 時に自動実行されます。
