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

## デプロイ（Vercel）

フロントエンドは Vercel の CI/CD で自動的にビルド・デプロイされる（`npm install` もビルド時に実行されるため手動作業は不要）。

### 環境変数

`.env` は Git 管理外のため Vercel には送られない。Vercel の Project Settings → Environment Variables に以下を登録する。

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`VITE_` で始まる変数はビルド時にコードへ埋め込まれるため、値を変更したら再デプロイが必要。

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
