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
- トレーニング集計値を月次で自動更新するセクション (Garmin Connect から取得)
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
│   │   └── training.mjs     # 集計の共通ヘルパー (JST/ISO週ストリーク/月次バケット)
│   ├── garmin_fetch.py      # Garmin Connect からアクティビティを取得し中間 JSON を出力
│   ├── requirements.txt     # garmin_fetch.py の依存 (garminconnect)
│   ├── training-bootstrap.mjs # 初回手動実行用 (全履歴から training-data.json を生成)
│   └── training-update-monthly.mjs  # 月次差分更新 (cron 用)
├── src/
│   ├── components/          # Astro コンポーネント
│   ├── data/
│   │   ├── portfolio.ts     # プロフィール・実績・資格・写真・トレーニングデータ
│   │   └── training-data.json  # トレーニング集計値 (スクリプトが書き換える)
│   ├── lib/
│   │   └── asset.ts         # `BASE_URL` を考慮した画像パスヘルパー
│   ├── pages/
│   │   └── index.astro      # トップページ
│   └── styles/
│       └── global.css       # 全体スタイル
├── .github/workflows/
│   ├── deploy.yml           # main への push で GitHub Pages にデプロイ
│   └── update-training.yml  # 月次でトレーニング集計値を更新
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
- Strava 公開プロフィール (トレーニングセクションの「Strava を見る」リンク先)

GitHub と Instagram の自動連携は未実装で、URL は準備中扱いです。トレーニング集計値の自動更新は Garmin Connect から取得しています (下記)。

### トレーニング集計値の月次自動更新 (Garmin Connect)

`src/data/training-data.json` を Garmin Connect のアクティビティから月次で再生成し、`main` に直接コミット・push します。`GITHUB_TOKEN` による push は `on: push` を発火しない（再帰実行防止）ため、push 後に workflow 内から `deploy.yml` を `workflow_dispatch` で明示的に起動して GitHub Pages を更新します。

データ取得は非公式ライブラリ [`python-garminconnect`](https://github.com/cyberjunky/python-garminconnect) を使い、Garmin の非公開エンドポイントへログインします。Garmin 側の仕様変更で動かなくなることがある前提で、`scripts/requirements.txt` のバージョンを固定しています (壊れたら最新版に更新)。

> **重要**: Garmin アカウントの **2 段階認証 (MFA) は無効** にしておく必要があります。CI はワンタイムコードを入力できないため、有効だとログインに失敗します。

必要な GitHub Secrets:

- `GARMIN_EMAIL` — Garmin Connect のログインメールアドレス
- `GARMIN_PASSWORD` — Garmin Connect のパスワード

処理の流れ: `garmin_fetch.py` が全アクティビティを取得して中間 JSON (`scripts/.cache/activities.json`, Git 管理外) を出力 → Node の集計スクリプトがそれを読み、JST/ISO 週ストリーク/月次バケットを計算して `training-data.json` を書き出す。取得項目は公開してよい集計のもと (`moving_time` / `start_date_local`) だけに限定しています。

実行系統:

- **初回 (手動 1 回)**: ローカルで取得 → bootstrap を実行し、過去全アクティビティから `training-data.json` を生成・コミットする。
  ```bash
  pip install -r scripts/requirements.txt
  GARMIN_EMAIL=... GARMIN_PASSWORD=... python scripts/garmin_fetch.py
  node scripts/training-bootstrap.mjs
  git add src/data/training-data.json
  git commit -m "feat(training): bootstrap training data"
  git push
  ```
- **月次 (自動)**: `.github/workflows/update-training.yml` が毎月 1 日 09:00 JST (= 00:00 UTC) に Garmin から取得 → `scripts/training-update-monthly.mjs` を実行し、JSON を増分更新・自動コミットする。Actions タブから `workflow_dispatch` で手動実行も可能。
- **失敗時**: スクリプトは非ゼロで終了し、JSON は変更されないため、サイトには最後に取得した値が表示され続ける。

認証情報はクライアント側に露出させないでください (Secrets と Actions のジョブ環境内でのみ使用)。`GARMIN_PASSWORD` はアカウント全体の認証情報なので、取り扱いに注意してください。

## プライバシー方針

このサイトでは、公開済みまたは公開を許容した情報のみを扱います。

掲載しない情報:

- 会社名
- 現職の詳細
- 勤務地
- 連絡先情報
- 非公開リポジトリ
- 詳細な健康情報
- トレーニングのルート、開始地点、終了地点、心拍などの詳細データ

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

## 要件定義

詳細なコンセプト、MVPスコープ、将来拡張方針は `requirement/portfolio_requirements.md` にまとめています。
