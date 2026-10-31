# meal-tracking

食事を記録・振り返るための Web アプリ。

- フロントエンド：React 19 + TypeScript + Vite + Chakra UI v3
- バックエンド：Supabase（Auth / Postgres / Storage）

## 必要なもの

- Node.js
- Supabase CLI（`brew install supabase/tap/supabase`）
- Supabase のプロジェクト

## ローカル開発の初回セットアップ

```bash
npm install
```

プロジェクト直下に `.env` を作成し、Supabase の接続情報を設定する（値はダッシュボードの Project Settings → API で確認）。

```
VITE_SUPABASE_URL=https://<プロジェクトID>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Supabase CLI をプロジェクトに接続し、マイグレーションを適用する。

```bash
supabase login
supabase link --project-ref <プロジェクトID>
supabase db push
```

## DB をリフレッシュしてリスタートする

> [!WARNING]
> すべてのデータ（食事記録・画像・ユーザー）が削除されます。本番運用中の環境では実行しないでください。

1. **開発サーバーを止める**（起動中なら `Ctrl + C`）

2. **画像とユーザーを削除する**（Supabase ダッシュボード）

   `db reset` はデータベースのスキーマを作り直すが、Supabase が管理する Storage のファイルと Auth のユーザーは消えない場合があるため、手動で削除する。
   1. Storage → `meal-images` バケット内のファイルをすべて削除
   2. Authentication → Users のユーザーをすべて削除

3. **データベースを作り直す**

   ```bash
   supabase db reset --linked
   ```

   確認を求められたら `y` を入力する。`public` スキーマが削除され、`supabase/migrations/` のマイグレーションが順に適用される。

4. **適用結果を確認する**

   ```bash
   supabase migration list
   ```

   Local と Remote の両方に同じマイグレーションが並んでいれば成功。

5. **開発サーバーを起動する**

   ```bash
   npm run dev
   ```

   ブラウザに削除前のログイン状態が残っている場合はログアウトし、サインアップからやり直す。

## マイグレーション(テーブルの追加)

DB の変更は `supabase/migrations/` の SQL ファイルで管理する。SQL Editor で直接変更せず、必ずマイグレーションを追加すること。

```bash
supabase migration new <名前>   # supabase/migrations/ に空のファイルを作成 → SQL を書く
supabase db push                # 未適用のマイグレーションだけを適用
supabase migration list         # 適用状況を確認
```

`supabase/archive/` はマイグレーション導入前に SQL Editor で手動実行していた SQL の保管用。参照のみで、実行はしない。

## 食事記録の共有リンク

記録した食事を、管理栄養士などに読み取り専用で見てもらう機能。

1. ユーザーはプロフィール画面の「食事記録の共有」でリンクを発行する
2. 発行したリンク（`/share/<token>`）を LINE やメールで相手に送る
3. 相手は**ログインせずに**リンクを開き、食事記録を閲覧する

### 発行時に決めること

| 項目 | 意味 | 列 |
|---|---|---|
| いつの食事から／いつの食事まで | どの日に食べた食事の記録を見せるか。「継続して共有」なら、これから記録する食事も見せる | `start_date` / `end_date`（null = 継続） |
| 見せる内容 | 食事名・時間帯・日付は必ず見せる。メモ・写真は選んだときだけ（初期値は見せない） | `include_memo` / `include_images` |
| 共有相手の名前 | 発行済みリンクを見分けるための名前（共有ページにも「共有先」として出る） | `label` |
| リンクを開ける期間 | 7／30／90日間。過ぎるとリンクは開けなくなる | `expires_at` |

「いつの食事まで」と「リンクを開ける期間」は別の設定で、両方とも効く。たとえば「10/31 の食事まで」「30日間」で 10/29 に発行すると、11/28 までリンクを開けて、見えるのは 10/31 までの記録。

発行済みのリンクは、プロフィール画面からいつでも無効化できる。無効化したリンクや期限が過ぎたリンクを開くと「このリンクは有効期限が切れています」と表示される。

### 仕組み

- リンクは `meal_shares` テーブルに保存する（`20261029073848_create_meal_shares.sql`）。本人だけが参照・発行・無効化でき、削除はせず `revoked_at` で無効化する
- 共有ページは `get_shared_meals(token)` RPC（`20261029074730_create_get_shared_meals.sql`）だけを使って、共有範囲の食事を読む。`meals` テーブルの RLS は変えていない
- 共有ページは検索エンジンに載らないよう `noindex` を指定している

### 注意点

- リンク（URL）を知っている人は誰でも閲覧できる。送り先を間違えたときは、すぐに無効化する
- 食事の写真は public バケット（`meal-images`）に置いているため、写真の URL を知っていればリンクを無効化した後でも写真そのものは開ける（private 化は Issue #8 で対応予定）

## デプロイ（Vercel）

フロントエンドは Vercel の CI/CD で自動的にビルド・デプロイされる（`npm install` もビルド時に実行されるため手動作業は不要）。

### 環境変数

`.env` は Git 管理外のため Vercel には送られない。Vercel の Project Settings → Environment Variables に以下を登録する。

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`VITE_` で始まる変数はビルド時にコードへ埋め込まれるため、値を変更したら再デプロイが必要。

### ルーティング（vercel.json）

このアプリは SPA で、`/dashboard` や `/share/<token>` などの画面は React Router が表示する。Vercel 上にそのパスのファイルは無いため、`vercel.json` で全パスを `index.html` にリライトしている（実在するファイルは Vercel が先に返すので、JS・CSS・画像の配信には影響しない）。

`vercel.json` を消すと、ページを再読み込みしたときや、共有リンクを直接開いたときに Vercel の 404 になる。

### マイグレーション(テーブルの追加)

Vercel がデプロイするのはフロントエンドのみで、DB のマイグレーションは適用されない。テーブルを変更した場合は、デプロイとは別にローカルから適用する。

```bash
supabase db push
```

新しい列やテーブルを使うコードを先にデプロイすると本番でエラーになるため、`supabase db push` → デプロイの順で行う。

### Supabase Auth の URL 設定(初回ログイン時のメール認証)

現在は Authentication → Sign In / Providers → Email の **Confirm email** がオフのため、サインアップすると確認メールなしで即ログインされ、この設定は不要。

Confirm email をオンにする場合は、以下の設定が必要になる。

サインアップ確認メールのリンク先は、Supabase の Authentication → URL Configuration の **Site URL** で決まる。本番の URL（例：`https://<アプリ名>.vercel.app`）を設定しておく。

アプリ側で `emailRedirectTo` を指定していないため、ローカル開発中にサインアップした場合も確認メールのリンクは Site URL（本番）に飛ぶ。

## コマンド

```bash
npm run dev         # 開発サーバーを起動（localhost:3000）
npm run build       # 型チェック + 本番ビルド
npm run lint        # ESLint
npm run preview     # 本番ビルドのプレビュー
npm run test        # テストを実行
npm run test:watch  # テストをウォッチモードで実行
```
