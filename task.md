# ポートフォリオサイト完成までのタスク

このファイルは、現在未完成のポートフォリオサイトを公開・自動更新まで持っていくための作業一覧です。

完成範囲は、静的なMVP公開だけでなく、GitHub Actions による外部サービス自動更新まで含めます。Instagram は公式API連携ではなく、本人が選定した写真と投稿URLを手動管理する方針です。

## 現状メモ

- [x] Astro で1ページ構成のサイトは実装済み
- [x] Home / Apps / Security / Photography / Training / About の各セクションは存在する
- [x] TÜV SÜD の資格検証ページはリンク済み
- [ ] プロフィール画像、アプリ画像、写真はダミーまたは生成画像
- [ ] Apps のプロジェクト名、説明、スター数、フォーク数、更新日は仮データ
- [ ] GitHub / Instagram / Strava の外部リンクは未設定
- [ ] GitHub リポジトリへの個別リンクは未設定
- [ ] Instagram 投稿URLは未設定
- [ ] Strava の集計値は仮データ
- [ ] 外部サービスの自動取得は未実装
- [ ] GitHub Actions の定期更新ワークフローは未実装
- [ ] `astro.config.mjs` の `site` は `https://example.com` のまま
- [ ] 本番ドメイン、ホスティング先、公開手順は未確定

## 人間側でしかできないこと

- [ ] 公開する本番ドメインを決める
- [ ] ホスティング先を決める
  - 候補: GitHub Pages、Cloudflare Pages、Vercel
- [ ] GitHub の公開プロフィールURLを共有する
- [ ] サイトに掲載するGitHubリポジトリを選定する
- [ ] 各プロジェクトについて、公開してよい説明文・目的・工夫した点を確認する
- [ ] 各プロジェクトのスクリーンショットを用意する
- [ ] Instagram の公開アカウントURLを共有する
- [ ] 掲載する代表写真を選定する
- [ ] 掲載写真の投稿URLとキャプションを用意する
- [ ] Strava の公開プロフィールURLを共有する
- [ ] Strava API 用のアプリを作成し、Client ID / Client Secret を取得する
- [ ] Strava OAuth 認可を実行し、Refresh Token を取得する
- [ ] GitHub Actions Secrets に必要な値を登録する
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - `STRAVA_REFRESH_TOKEN`
  - 必要なら `GH_TOKEN`
- [ ] プロフィール写真として使う加工済み顔写真を用意する
- [ ] 実名、肩書き、自己紹介文、キャッチコピーの公開可否を確認する
- [ ] 会社名、勤務地、現職詳細、連絡先を載せない方針を最終確認する
- [ ] Strava の位置情報、ルート、開始地点、終了地点、心拍などを公開しない方針を最終確認する
- [ ] サイト全体の文面が実態以上に見えないか確認する
- [ ] TÜV SÜD 資格情報の掲載内容が正しいか確認する

## Codexに頼めば終わること

- [ ] `src/data/portfolio.ts` の仮データを実データに差し替える
- [ ] GitHub / Instagram / Strava の外部リンクを有効化する
- [ ] Apps の各カードにGitHubリンクと、必要ならデモリンクを追加する
- [ ] Instagram セクションの写真を実画像に差し替える
- [ ] Instagram 投稿URLがある写真はクリック可能にする
- [ ] Strava セクションの仮集計値を実集計値に差し替える
- [ ] `astro.config.mjs` の `site` を本番ドメインに変更する
- [ ] プロフィール画像、写真、アプリ画像を適切なサイズに圧縮・リサイズする
- [ ] 画像ファイル名と配置を整理する
  - 例: `public/images/profile/`
  - 例: `public/images/apps/`
  - 例: `public/images/photos/`
- [ ] 画像の `alt` テキストを実画像に合わせて更新する
- [ ] CTA の `disabled` 表示を、リンク設定後に通常リンクへ変更する
- [ ] `src/pages/index.astro` のリンク表示を、URL有無に応じて自然に切り替える
- [ ] レスポンシブ表示の崩れを修正する
- [ ] ナビゲーションの現在位置表示を必要に応じて改善する
- [ ] 本番公開用のメタタグを追加する
  - title
  - description
  - OGP
  - Twitter Card
  - canonical URL
- [ ] favicon や apple-touch-icon を追加する
- [ ] README を実際の公開手順・データ更新手順に合わせて更新する
- [ ] ビルドと表示確認を実行する

## 人間確認が必要だがCodexで実装できること

- [ ] GitHub API から公開リポジトリ情報を取得するスクリプトを作る
  - 想定ファイル: `scripts/fetch-github.mjs`
  - 取得対象は allowlist で制御する
  - 取得対象: name、description、topics、language、stars、forks、updated_at、repositoryUrl
  - README全文は取得せず、概要文は手動補足を優先する
- [ ] Strava API から集計値だけを取得するスクリプトを作る
  - 想定ファイル: `scripts/fetch-strava.mjs`
  - 取得対象: 月間アクティビティ数、月間距離、年間アクティビティ数、年間距離、週次距離
  - 公開しない対象: ルート、緯度経度、開始地点、終了地点、心拍、詳細な健康情報
- [ ] TÜV SÜD 資格ページの掲載状態を確認するスクリプトを作る
  - 想定ファイル: `scripts/check-tuv.mjs`
  - 氏名または資格IDの掲載有無を確認する
  - 規約やrobots.txt上問題がある場合は手動確認タスクに切り替える
- [ ] 生成済みデータをAstroが読む構成に変更する
  - 想定ディレクトリ: `src/data/generated/`
  - 公開サイトにはアクセストークンやSecretを含めない
  - API取得失敗時は直近成功データを使う
- [ ] GitHub Actions の定期更新ワークフローを作る
  - 想定ファイル: `.github/workflows/update-data.yml`
  - 1日1回の定期実行を基本にする
  - 手動実行 `workflow_dispatch` も有効にする
  - データ取得後に `npm run build` を実行する
- [ ] 自動更新で差分が出た場合の扱いを決める
  - 候補: 自動コミット
  - 候補: Pull Request 作成
  - 候補: ビルド時のみ生成してコミットしない
- [ ] 外部API取得エラー時の通知方法を決める
  - 候補: GitHub Actions の失敗通知だけにする
  - 候補: Issueを自動作成する
  - 候補: メールやSlack通知を追加する

## 自動更新フェーズのタスク

### Phase 1: データ構造整理

- [ ] 手動データと自動取得データの責務を分ける
- [ ] GitHub掲載対象の allowlist を作る
- [ ] Instagram写真は手動管理データとして残す
- [ ] Strava集計データの公開フィールドを固定する
- [ ] `lastFetchedAt` / `lastCheckedAt` を全データに保持する

### Phase 2: GitHub 自動取得

- [ ] GitHub API の取得方式を決める
  - 推奨: REST API
- [ ] 掲載対象リポジトリだけを取得する
- [ ] description、topics、language、stars、forks、updated_at を反映する
- [ ] API失敗時は前回成功データを残す
- [ ] 取得結果を `src/data/generated/` に保存する

### Phase 3: Strava 自動取得

- [ ] Strava OAuth のRefresh Token更新処理を実装する
- [ ] アクティビティ一覧から公開用集計値だけを作る
- [ ] 位置情報と健康詳細を保存しないようにする
- [ ] 月次・年次・週次の集計値を生成する
- [ ] API失敗時は前回成功データを残す

### Phase 4: TÜV SÜD 掲載確認

- [ ] 資格検証ページにアクセスしてよいか確認する
- [ ] 取得者名または資格IDの掲載状態を確認する
- [ ] 掲載確認日時を保存する
- [ ] 自動確認が不適切な場合は手動確認に切り替える

### Phase 5: GitHub Actions

- [ ] データ取得ジョブを追加する
- [ ] ビルドジョブを追加する
- [ ] Secrets未設定時にわかりやすく失敗するようにする
- [ ] 手動実行できるようにする
- [ ] 定期実行の頻度を設定する
  - GitHub: 1日1回
  - Strava: 1日1回
  - TÜV SÜD: 週1回程度
- [ ] 自動更新結果を公開サイトに反映する方法を確定する

## 公開前チェックリスト

- [ ] `npm run build` が成功する
- [ ] 必要なら `npx astro check` が成功する
- [ ] 画面幅 375px / 768px / 1280px で表示が崩れない
- [ ] 横スクロールが発生しない
- [ ] 画像がすべて実画像に差し替わっている
- [ ] 画像が重すぎない
- [ ] すべての画像に適切な `alt` がある
- [ ] GitHub / TÜV SÜD / Instagram / Strava のリンクが正しく開く
- [ ] リンク切れがない
- [ ] `https://example.com` が残っていない
- [ ] 会社名、勤務地、現職詳細、連絡先が入っていない
- [ ] 非公開リポジトリや内部情報が入っていない
- [ ] Strava のルート、開始地点、終了地点、心拍が入っていない
- [ ] 資格表現が誇張されていない
- [ ] スマートフォンでCTAやカードの文字がはみ出していない
- [ ] `prefers-reduced-motion` でアニメーションが抑制される
- [ ] Lighthouse で大きな問題がない
- [ ] OGP画像とSNS共有表示を確認する
- [ ] README に公開URL、更新方法、Secrets設定方法が書かれている

## 優先順位

1. 人間側で公開情報と素材を確定する
2. Codexで仮データと仮画像を実データに差し替える
3. 本番ドメインとホスティング設定を反映する
4. 公開前チェックを通す
5. GitHub / Strava / TÜV SÜD の自動更新を実装する
6. GitHub Actions で定期実行する
7. 運用しながら文面、写真、掲載プロジェクトを更新する

## Codexへ依頼するときの例

```text
task.md の「GitHub / Instagram / Strava の外部リンクを有効化する」を実装してください。
```

```text
task.md の「GitHub API から公開リポジトリ情報を取得するスクリプトを作る」を実装してください。
```

```text
task.md の公開前チェックリストを実行して、問題があれば修正してください。
```
