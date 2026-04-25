# GitHub Pages 公開タスク

このファイルは、Astro製ポートフォリオサイトを GitHub Pages に公開し、その後に未完成部分を順番に仕上げていくための作業一覧です。

最優先目標は、未完成のままでもよいので GitHub Pages に公開することです。画像、仮データ、外部リンク、SEO、自動更新などは公開後に段階的に整えます。

## 方針

- まず公開する
- 未完成部分は公開後に詰める
- GitHub Pages へのデプロイは GitHub Actions を使う
- `dist/` はActionsで生成し、Pagesにデプロイする
- セキュリティ / 資格情報は自動更新しない
- TÜV SÜD 資格情報は手動で確認・更新する
- GitHub / Instagram / Strava の自動更新は公開後の改善候補として扱う

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
- [ ] Apps のプロジェクト名、説明、スター数、フォーク数、更新日は仮データ
- [ ] GitHub / Instagram / Strava の外部リンクは未設定
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

### 1-1. コンテンツを実データ化する

- [ ] プロフィール画像を実画像に差し替える
- [ ] アプリ画像を実スクリーンショットに差し替える
- [ ] 写真ギャラリーを実写真に差し替える
- [ ] Apps のプロジェクト名、説明、技術スタック、更新日を実態に合わせる
- [ ] Apps のスター数、フォーク数、更新日を実データまたは非表示にする
- [ ] Strava の集計値を実データまたは非表示にする
- [ ] 画像の `alt` テキストを実画像に合わせて更新する

### 1-2. 外部リンクを有効化する

- [ ] GitHub の公開プロフィールURLを設定する
- [ ] 掲載するGitHubリポジトリを選定する
- [ ] Apps の各カードにGitHubリンクと、必要ならデモリンクを追加する
- [ ] Instagram の公開アカウントURLを設定する
- [ ] 掲載写真にInstagram投稿URLがある場合はクリック可能にする
- [ ] Strava の公開プロフィールURLを設定する
- [ ] CTA の `disabled` 表示を、リンク設定後に通常リンクへ変更する
- [ ] 未設定リンクはクリックできない、または準備中表示のままにする

### 1-3. 表示品質を整える

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

## Phase 3: 自動更新を検討する

自動更新は公開後の改善として扱います。セキュリティ / 資格情報は自動更新しません。

### 自動更新する可能性があるもの

- [ ] GitHub API から公開リポジトリ情報を取得するか決める
- [ ] Strava API から公開用の集計値だけを取得するか決める
- [ ] 自動更新用のGitHub Actionsを追加するか決める
- [ ] Secretsの管理方針を決める

### 自動更新しないもの

- [x] TÜV SÜD 資格情報
- [x] Security / Certification セクションの資格表示

### 自動更新する場合の制約

- [ ] GitHubは公開リポジトリのみ対象にする
- [ ] GitHubの掲載対象は allowlist で制御する
- [ ] Stravaは集計値だけを保存する
- [ ] Stravaのルート、緯度経度、開始地点、終了地点、心拍、詳細な健康情報は保存しない
- [ ] APIキーやアクセストークンをクライアント側に露出しない
- [ ] API取得失敗時は公開サイトが壊れないようにする

## 人間側で決めること

- [x] GitHub Pages の公開方式 → プロジェクトPages
- [x] GitHub Pages に使うGitHubユーザー名またはOrganization名 → `tatsuyakakamu`
- [x] リポジトリ名をこのまま `my_portfolio` にするか → このまま
- [x] `dist/` をGit管理から外すか → 外す (Actions でビルド)
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
- [ ] `src/data/portfolio.ts` の仮データを実データに差し替える
- [ ] GitHub / Instagram / Strava の外部リンクを有効化する
- [ ] Apps の各カードにGitHubリンクと、必要ならデモリンクを追加する
- [ ] 画像を適切なサイズに圧縮・リサイズする
- [ ] 画像ファイル名と配置を整理する
- [ ] 画像の `alt` テキストを実画像に合わせて更新する
- [ ] CTA の `disabled` 表示を、リンク設定後に通常リンクへ変更する
- [ ] 本番公開用のメタタグを追加する
- [ ] favicon や apple-touch-icon を追加する
- [ ] ビルドと表示確認を実行する

## 優先順位

1. 未完成でもGitHub Pagesに公開する
2. GitHub Pages の公開URLと公開方式を決める
3. `astro.config.mjs` を公開方式に合わせる
4. GitHub Actions のPagesデプロイを追加する
5. `.gitignore` とGit管理対象を整理する
6. `npm run build` と公開URLでの最低限の表示確認を通す
7. 公開後に仮データ・仮画像・未設定リンクを実データへ差し替える
8. 公開後に表示品質、SEO、SNS共有を整える
9. 必要なものだけ自動更新を検討する

## Codexへ依頼するときの例

```text
task.md の Phase 0 を実装してください。公開URLは https://<username>.github.io/my_portfolio/ です。
```

```text
task.md の「GitHub ActionsでPagesへデプロイする」を実装してください。
```

```text
task.md の「公開後に未完成部分を詰める」から、仮データの差し替えを進めてください。
```
