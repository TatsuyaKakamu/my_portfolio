# GitHub Pages 公開タスク

このファイルは、Astro製ポートフォリオサイトを GitHub Pages に公開し、その後に未完成部分を順番に仕上げていくための作業一覧です。

最優先目標は、未完成のままでもよいので GitHub Pages に公開することです。画像、仮データ、外部リンク、SEO は公開後に段階的に整えます。
外部サービスとの自動連携・自動更新は当面行いません。Strava の集計値だけは将来的に自動更新する余地を残します。

## 方針

- まず公開する
- 未完成部分は公開後に詰める
- GitHub Pages へのデプロイは GitHub Actions を使う
- `dist/` はActionsで生成し、Pagesにデプロイする
- セキュリティ / 資格情報は手動で確認・更新する
- TÜV SÜD 資格情報は手動で確認・更新する
- GitHub / Instagram の連携は当面行わず、表示は仮データまたは「準備中」のままにする
- Strava の集計値については、ルートや健康詳細を保存しない前提で、将来的に自動更新を検討する (Phase 3)
- GitHub / Instagram / TÜV SÜD の自動更新は本タスクのスコープ外とする (現時点では計画しない)
- アプリ開発に加え、Web サイト制作も同じセクションで紹介する
- セクション名は `App Development / アプリ開発` から `Apps & Websites / アプリ・Web制作` にリネームする
- Hero下部のバッジは `App Developer` から `App & Web Developer` にリネームする
- Apps & Websites セクションは当面 2 件のみ紹介する。2カード構成でバランスが崩れない見た目に整える

## 公開前提

- ホスティング先: GitHub Pages
- フレームワーク: Astro
- ビルド出力: `dist/`
- 公開方式: GitHub Actions で `npm run build` を実行し、`dist/` をPagesにデプロイする
- 想定URL:
  - ユーザー/Organization Pages: `https://<username>.github.io/`
  - プロジェクトPages: `https://<username>.github.io/my_portfolio/`

## 現状メモ

- [x] Astro で1ページ構成のサイトは実装済み
- [x] Home / Apps / Security / Photography / Training / About の各セクションは存在する
- [x] TÜV SÜD の資格検証ページはリンク済み
- [x] `npm run build` は成功する
- [x] `dist/` は生成済み
- [x] `astro.config.mjs` の `site` を GitHub Pages 用に更新済み (`https://tatsuyakakamu.github.io`)
- [x] GitHub Pages の公開URLを確定 (`https://tatsuyakakamu.github.io/my_portfolio/`)
- [x] プロジェクトPages用の `base` 設定 (`/my_portfolio`) を反映
- [x] GitHub Actions のPagesデプロイワークフロー (`.github/workflows/deploy.yml`) を実装
- [x] `.astro/` を `.gitignore` に追加済み
- [x] `dist/` を `.gitignore` に追加し、Git 管理から除外
- [ ] プロフィール画像、アプリ画像、写真はダミーまたは生成画像
- [x] Apps セクションを 2 カード前提のレイアウトに変更済み (`.project-grid` を `repeat(2, ...)` + `max-width: 960px` に変更)
- [x] セクション名 (`App Development` → `Apps & Websites`) とバッジ (`App Developer` → `App & Web Developer`) のリネームを反映済み
- [x] `projects` を `MLX Audio Transcriptor` + `Photographer Demo Site` の 2 件構成に整理済み
- [ ] `Photographer Demo Site` のスクリーンショット画像が未準備のため、画像領域は仮プレースホルダブロック (アイコン + 「プレビュー準備中」) で表示中
- [ ] Apps のプロジェクト名、説明、技術スタック、更新日は仮データ (Photographer Demo Site は概要を仮設定)
- [ ] GitHub / Instagram / Strava の外部リンクは未設定 (準備中表示のまま)
- [ ] Strava の集計値は仮データ

## Phase 0: 未完成でも公開する

このフェーズでは、内容の完成度よりも「GitHub Pagesで見られる状態にする」ことを優先します。

### 0-1. 公開方式を決める

- [ ] ユーザー/Organization Pagesとして公開するか決める
  - 例: `https://<username>.github.io/`
  - リポジトリ名は通常 `<username>.github.io`
- [x] プロジェクトPagesとして公開するか決める
  - 採用: `https://tatsuyakakamu.github.io/my_portfolio/`
- [x] 独自ドメインを使うか決める
  - 採用しない (github.io ドメインのまま公開)

### 0-2. AstroをGitHub Pages向けに設定する

- [x] `astro.config.mjs` の `site` を実際の公開URLに変更する
- [x] プロジェクトPagesの場合は `base` をリポジトリ名に合わせる
- [x] `npm run build` 後の `dist/index.html` に `https://example.com` が残っていないことを確認する
- [x] CSSと画像のパスが公開方式に合っていることを確認する (`src/lib/asset.ts` ヘルパーで `BASE_URL` を前置)

ユーザー/Organization Pages または独自ドメイン直下の場合:

```js
export default defineConfig({
  site: "https://<username>.github.io"
});
```

プロジェクトPagesの場合:

```js
export default defineConfig({
  site: "https://<username>.github.io",
  base: "/my_portfolio"
});
```

### 0-3. GitHub ActionsでPagesへデプロイする

- [x] `.github/workflows/deploy.yml` を追加する
- [x] push時に `npm ci` を実行する
- [x] `npm run build` を実行する
- [x] `dist/` をPages artifactとしてアップロードする
- [x] GitHub Pagesへデプロイする
- [ ] GitHub repository settings で Pages の Source を `GitHub Actions` にする (※ ユーザー側でGitHub UIから操作)

想定ワークフロー:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

このデプロイワークフローのみ自動化対象とする。コンテンツデータ (リポジトリ情報、写真、トレーニングなど) を外部APIから自動取得する仕組みは追加しない。

### 0-4. Git管理対象を公開向けに整理する

- [x] `.gitignore` に `.astro/` を追加する
- [x] GitHub Actionsでデプロイするため、`dist/` をGit管理から外すか決める
  - 採用: `dist/` はコミットせず、Actionsで毎回ビルドする
- [x] `dist/` をコミットしない方針なら `.gitignore` に `dist/` を追加する
- [x] すでにGit管理されている `dist/` を外す (`git rm -r --cached dist/` 実施済み)
- [x] `package-lock.json` は `npm ci` のためGit管理に残す

### 0-5. 最低限の公開チェック

- [x] `npm ci` が成功する
- [x] `npm run build` が成功する
- [ ] GitHub Actionsのデプロイが成功する (※ main マージ後に確認)
- [ ] 公開URLでトップページが開ける (※ デプロイ後に確認)
- [ ] CSSが読み込まれている (※ デプロイ後に確認)
- [ ] 主要画像が読み込まれている (※ デプロイ後に確認)
- [ ] 画面幅 375px / 768px / 1280px で致命的な崩れがない (※ デプロイ後に確認)
- [ ] 会社名、勤務地、現職詳細、連絡先が入っていない
- [ ] 非公開リポジトリや内部情報が入っていない
- [ ] Strava のルート、開始地点、終了地点、心拍が入っていない
- [ ] TÜV SÜD 資格情報の掲載内容が手動確認済み

## Phase 1: 公開後に未完成部分を詰める

公開後に、仮の表示や準備中のリンクを順番に実データへ置き換えます。

### 1-1. Apps & Websites セクションを 2 カード構成・新名称に整える

このセクションではアプリ開発に加えて Web サイト制作も紹介します。紹介対象は当面 2 件のみで、3 カード前提の現行レイアウトのままだと最後のカードが空くか不格好になるため、データ・レイアウト・表示文言の 3 点をまとめて整えます。

データ (`src/data/portfolio.ts`):

- [x] `activityAreas` の `apps` エントリをリネーム (`title`: `Apps & Websites` / `labelJa`: `アプリ・Web制作`)
- [x] `profile.badges` の `App Developer` を `App & Web Developer` に変更
- [x] `projects` を実際に紹介する 2 件のみに整理
  - 残す: `MLX Audio Transcriptor`
  - 追加: `Photographer Demo Site` (https://github.com/TatsuyaKakamu/photographer_demo_site / デモ: https://tatsuyakakamu.github.io/photographer_demo_site/)
  - 削除: `Secure Device Monitor` / `Photo Map`

ページ構造 (`src/pages/index.astro`):

- [x] navigation ラベルの短縮処理を `Apps & Websites` → `Apps & Web` に更新
- [x] Apps セクションの `SectionHeading` の `title` を `Apps & Websites` に、`description` を「効率的で美しいアプリと Web サイトを制作しています。」に変更
- [x] `screenshot` が空のプロジェクトは画像の代わりに仮プレースホルダブロック (Lucide `Image` アイコン + 「プレビュー準備中」) を表示するよう `project-shot` の描画を分岐

レイアウト (`src/styles/global.css`):

- [x] `.project-grid` を `grid-template-columns: repeat(2, minmax(0, 1fr))` + `max-width: 960px; margin: 0 auto` に変更
- [x] `.project-shot.is-placeholder` のスタイルを追加 (アスペクト比 3/2、薄いラベル + アイコン)
- [ ] 2 カードでも余白・画像比率・タグの並びが崩れないことを 375px / 768px / 1280px の実機 / DevTools で確認する (※ デプロイ後に追加チェック)
- [ ] 「すべてのプロジェクトを見る」CTA は紹介対象が増えるまで `disabled` のままにする (現状維持)

備考:

- `Theme` 型の `"app"` 文字列キー、CSS 変数 `--app`、`.section-app` クラス名は内部的な識別子なのでそのまま残す (リネームしても見た目に効かない上に変更箇所が増えるため)。表示ラベルだけを変える。

### 1-2. コンテンツを実データ化する

- [ ] プロフィール画像を実画像に差し替える
- [ ] MLX Audio Transcriptor のスクリーンショットを実画像に差し替える
- [ ] Web サイト制作枠の対象を確定し、サムネイル画像・URL・説明・技術スタックを設定する
- [ ] 写真ギャラリーを実写真に差し替える
- [ ] Apps & Websites の各カードのプロジェクト名、説明、技術スタック、更新日を実態に合わせる
- [ ] Apps のスター数、フォーク数、更新日は手動更新するか、表示自体を非表示にする (自動取得はしない)
- [ ] Strava の集計値は当面仮データのままにし、Phase 3 で自動更新を検討する (それまでは表示そのものを非表示にしてもよい)
- [ ] 画像の `alt` テキストを実画像に合わせて更新する

### 1-3. 外部リンクを有効化する

- [ ] GitHub の公開プロフィールURLを設定する
- [ ] Apps & Websites の各カードに GitHub リンク・公開URL (必要ならデモリンク) を設定する
- [ ] Instagram の公開アカウントURLを設定する
- [ ] 掲載写真にInstagram投稿URLがある場合はクリック可能にする
- [ ] Strava の公開プロフィールURLを設定する
- [ ] CTA の `disabled` 表示を、リンク設定後に通常リンクへ変更する
- [ ] 未設定リンクはクリックできない、または準備中表示のままにする

### 1-4. 表示品質を整える

- [ ] 画面幅 375px / 768px / 1280px で表示を確認する
- [ ] 横スクロールが発生しないようにする
- [ ] スマートフォンでCTAやカードの文字がはみ出さないようにする
- [ ] 画像を適切なサイズに圧縮・リサイズする
- [ ] 画像ファイル名と配置を整理する
- [ ] `prefers-reduced-motion` でアニメーションが抑制されることを確認する
- [ ] Lighthouse で大きな問題がないことを確認する

## Phase 2: 公開後にSEO / SNS共有を整える

- [ ] 本番公開用のメタタグを追加する
  - title
  - description
  - OGP
  - Twitter Card
  - canonical URL
- [ ] OGP画像を追加する
- [ ] favicon を追加する
- [ ] apple-touch-icon を追加する
- [ ] README に公開URL、ローカル開発、デプロイ方法を書く
- [ ] Google Search Consoleに登録する
- [ ] SNS共有時の表示を確認する

## Phase 3: Strava 集計値の自動更新を検討する

Strava の集計値だけは、本人の生活圏や健康状態を推測できる情報を保存しない前提で、自動更新を検討対象として残します。実施タイミングは GitHub Pages 公開と Phase 1 / Phase 2 が落ち着いたあとを想定します。

検討項目:

- [ ] Strava API から取得する項目を「公開してよい集計値だけ」に限定する仕様を定義する
- [ ] Strava 連携用の GitHub Actions ワークフローを設計する (定期実行 + 失敗時のフォールバック)
- [ ] Strava の API キー / アクセストークンを GitHub Secrets で管理する
- [ ] 生成された集計値を `src/data/portfolio.ts` に書き戻す経路を決める (静的データ更新 PR / コミット / 別の JSON ファイルなど)
- [ ] API 取得失敗時に公開サイトが壊れず、最後の取得値を表示し続ける挙動を担保する

保存しないと決めるもの (Strava 自動更新を実装する場合の制約):

- [ ] Strava の生ルート、緯度経度、開始地点、終了地点
- [ ] 心拍などの詳細な健康情報
- [ ] API キー / アクセストークンをクライアント側に露出しない
- [ ] 取得失敗時は既存の表示を維持し、エラー詳細はサイト上に出さない

## スコープ外 (当面やらないこと)

以下は意図的に本計画のスコープから外します。必要になったタイミングで別途検討します。

- GitHub API による公開リポジトリ情報の自動取得
- Instagram の公式APIまたは公式埋め込みによる自動表示
- TÜV SÜD 資格ページの自動チェック
- 上記 (GitHub / Instagram / TÜV SÜD) の自動更新を行うための GitHub Actions の追加
- 上記の自動更新に必要な Secrets 管理 (Strava 用 Secrets は Phase 3 のスコープ)

`src/data/portfolio.ts` の各データに含まれる `lastFetchedAt` / `lastCheckedAt` は、自動取得を前提とした命名だが、Strava 以外は当面「手動で最後に更新した日付」として扱う。Strava の `lastFetchedAt` は Phase 3 を実装した時点で実際の自動取得タイムスタンプに置き換える。

## 人間側で決めること

- [x] GitHub Pages の公開方式 → プロジェクトPages
- [x] GitHub Pages に使うGitHubユーザー名またはOrganization名 → `tatsuyakakamu`
- [x] リポジトリ名をこのまま `my_portfolio` にするか → このまま
- [x] `dist/` をGit管理から外すか → 外す (Actions でビルド)
- [x] 外部API連携の自動更新を行うか → GitHub / Instagram / TÜV SÜD は行わない。Strava の集計値のみ Phase 3 で自動更新を検討する
- [ ] Strava API 連携を実装する判断 (公開直後に着手するか、Phase 1 / 2 が落ち着いてからか)
- [ ] Strava 自動更新を実装する場合に取得・保存する集計項目の確定 (例: 月走行距離、月アクティビティ数、継続日数 など)
- [x] App Development を 2 件構成にする方針 → 採用
- [x] セクション名・バッジを Apps & Websites / App & Web Developer にリネームする方針 → 採用
- [x] 紹介する 2 件のうち 1 件を `MLX Audio Transcriptor`、もう 1 件を Web サイト制作枠とする → 採用
- [ ] Web サイト制作枠で紹介する具体的な対象を確定する (このポートフォリオ自身か / 別の Web サイトか)
- [ ] 未完成のまま公開してよい範囲
- [ ] 仮画像・仮データのまま公開してよいか
- [ ] GitHub / Instagram / Strava の外部リンクを公開時点で有効化するか
- [ ] 会社名、勤務地、現職詳細、連絡先を載せない方針の最終確認
- [ ] TÜV SÜD 資格情報の掲載内容が正しいかの最終確認
- [ ] リポジトリを Public に変更する (GitHub UI)
- [ ] Settings → Pages → Source を `GitHub Actions` に設定する (GitHub UI)

## Codexに頼めば終わること

- [ ] `astro.config.mjs` をGitHub Pages用に変更する
- [ ] `.github/workflows/deploy.yml` を追加する
- [ ] `.gitignore` に `.astro/` と必要なら `dist/` を追加する
- [ ] GitHub Pages公開方式に合わせてREADMEを更新する
- [ ] `src/data/portfolio.ts` の `activityAreas[apps]` を `Apps & Websites` / `アプリ・Web制作` にリネームする
- [ ] `src/data/portfolio.ts` の `profile.badges` を `App & Web Developer` にリネームする
- [ ] `src/data/portfolio.ts` の `projects` を 2 件構成 (`MLX Audio Transcriptor` + Web サイト制作枠) に整理する
- [ ] `src/pages/index.astro` の navigation ラベルと `SectionHeading` を `Apps & Web` / `Apps & Websites` に更新する
- [ ] `.project-grid` を 2 カード前提のレイアウトに調整する
- [ ] `src/data/portfolio.ts` の仮データを実データに差し替える
- [ ] GitHub / Instagram / Strava の外部リンクを有効化する
- [ ] Apps & Websites の各カードに GitHub リンク・公開URL (必要ならデモリンク) を追加する
- [ ] 画像を適切なサイズに圧縮・リサイズする
- [ ] 画像ファイル名と配置を整理する
- [ ] 画像の `alt` テキストを実画像に合わせて更新する
- [ ] CTA の `disabled` 表示を、リンク設定後に通常リンクへ変更する
- [ ] 本番公開用のメタタグを追加する
- [ ] favicon や apple-touch-icon を追加する
- [ ] Phase 3 の Strava 自動更新を実装する (API クライアント、取得項目、Actions ワークフロー、Secrets 設定、`portfolio.ts` への書き戻し)
- [ ] ビルドと表示確認を実行する

## 優先順位

1. 未完成でもGitHub Pagesに公開する
2. GitHub Pages の公開URLと公開方式を決める
3. `astro.config.mjs` を公開方式に合わせる
4. GitHub Actions のPagesデプロイを追加する
5. `.gitignore` とGit管理対象を整理する
6. `npm run build` と公開URLでの最低限の表示確認を通す
7. 公開後に Apps & Websites を 2 カード構成へ整える (データ + レイアウト + 表示文言・バッジのリネーム)
8. 公開後に仮データ・仮画像・未設定リンクを手動で実データへ差し替える
9. 公開後に表示品質、SEO、SNS共有を整える
10. Phase 3 として Strava の集計値の自動更新を検討・実装する

## Codexへ依頼するときの例

```text
task.md の Phase 0 を実装してください。公開URLは https://<username>.github.io/my_portfolio/ です。
```

```text
task.md の「GitHub ActionsでPagesへデプロイする」を実装してください。
```

```text
task.md の Phase 1-1 を実装してください。`activityAreas[apps]` を `Apps & Websites` / `アプリ・Web制作` にリネーム、`profile.badges` を `App & Web Developer` に変更、`projects` を `MLX Audio Transcriptor` + Web サイト制作枠の 2 件に絞り、navigation ラベルと SectionHeading を更新、`.project-grid` を 2 カード構成のバランスが取れるレイアウトに変更してください。`Theme` 型の `"app"` キーや CSS の `.section-app` / `--app` は内部識別子なのでそのまま残してください。
```

```text
task.md の「公開後に未完成部分を詰める」から、仮データの差し替えを進めてください。外部APIによる自動取得は行わず、手動でデータを更新してください。
```
