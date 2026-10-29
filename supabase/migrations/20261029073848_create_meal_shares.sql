-- 食事記録の共有リンクテーブル
--
-- ユーザーが栄養士などに渡す、ログイン不要・読み取り専用の共有リンクを管理する。
-- 共有ページはこのテーブルを直接読まず、token を受け取る security definer の RPC
-- （get_shared_meals）経由で共有範囲の食事だけを返す。
--
-- token は後から URL を再コピーできるよう平文で保存し、RLS で本人だけが読めるようにする。
-- end_date が null の場合は継続共有（start_date 以降の記録をすべて共有）。
-- リンクの削除はせず、revoked_at を設定して無効化する。

create table public.meal_shares (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  token text not null default encode(extensions.gen_random_bytes (32), 'hex'),
  label text not null,
  start_date date not null,
  end_date date null,
  expires_at timestamp with time zone not null,
  revoked_at timestamp with time zone null,
  include_memo boolean not null default false,
  include_images boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint meal_shares_pkey primary key (id),
  constraint meal_shares_token_key unique (token),
  constraint meal_shares_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint meal_shares_label_check check (char_length(btrim(label)) between 1 and 50),
  constraint meal_shares_date_range_check check (end_date is null or start_date <= end_date)
) tablespace pg_default;

create index meal_shares_user_id_idx on public.meal_shares (user_id);

-- 行レベルセキュリティ：本人の共有リンクのみ参照・発行・無効化できる
alter table public.meal_shares enable row level security;

create policy "users can view own meal shares"
on public.meal_shares for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create own meal shares"
on public.meal_shares for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can revoke own meal shares"
on public.meal_shares for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 列単位の権限：token・作成日時はクライアントから指定させず、更新は無効化（revoked_at）だけに限る。
-- anon からはテーブルに一切アクセスさせない（共有ページは RPC 経由で読む）。
revoke all on public.meal_shares from anon, authenticated;
grant select on public.meal_shares to authenticated;
grant insert (label, start_date, end_date, expires_at, include_memo, include_images)
  on public.meal_shares to authenticated;
grant update (revoked_at) on public.meal_shares to authenticated;
