# Tatsuya Kakamu Portfolio

Tatsuya Kakamu の個人活動をまとめるポートフォリオサイトです。

アプリ開発、産業用サイバーセキュリティの学習、写真、トレーニングを一つの静的サイトに集約し、技術者としての信頼性と継続的なアウトプットを伝えることを目的にしています。

## 主な機能

- Astro による静的ポートフォリオサイト
- Home / Apps / Security / Photography / Training / About の1ページ構成
- アプリ開発実績のカード表示
- TÜV SÜD の IEC 62443 Foundation 資格情報表示
- 代表写真のギャラリー表示
- トレーニング概要のメトリクス表示
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
├── src/
│   ├── components/          # Astro コンポーネント
│   ├── data/
│   │   └── portfolio.ts     # プロフィール・実績・資格・写真・トレーニングデータ
│   ├── pages/
│   │   └── index.astro      # トップページ
│   └── styles/
│       └── global.css       # 全体スタイル
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

現時点では外部サービスの自動取得は未実装です。GitHub、Instagram、Strava のURLは準備中として扱っています。

現在リンク済みの外部サービス:

- TÜV SÜD 資格検証ページ

将来的には以下のような連携を想定しています。

- GitHub API による公開リポジトリ情報の取得
- Strava API による位置情報を除いた集計データの取得
- Instagram の公式APIまたは公式埋め込みによる代表投稿の表示
- TÜV SÜD 資格ページの掲載状態確認

外部API連携を追加する場合は、APIキーやアクセストークンをクライアント側に露出しないようにしてください。

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

このサイトは GitHub Pages の `https://tatsuyakakamu.github.io/my_portfolio_website/` に公開されます。

`astro.config.mjs` は GitHub Pages のプロジェクトページ向けに `site` と `base` を設定しています。

```js
export default defineConfig({
  site: "https://tatsuyakakamu.github.io",
  base: "/my_portfolio_website"
});
```

別ドメインに移行する場合は `site` をその URL に変更し、サブパス公開でなくなる場合は `base` を削除してください。デプロイは `.github/workflows/deploy.yml` により `main` ブランチへの push 時に自動実行されます。

## 要件定義

詳細なコンセプト、MVPスコープ、将来拡張方針は `requirement/portfolio_requirements.md` にまとめています。
