-- 食事記録テーブル
-- Supabase ダッシュボードの SQL Editor で一度実行してください。
--
-- meal_time には "breakfast" / "lunch" / "dinner" / "snack" を保存する
-- （表示名・配色・並び順は src/constants/mealTime.ts で管理）。
-- image_path は Storage バケット（storage_meal_images.sql 参照）内の
-- "userId/uuid.jpg" 形式のパス。

create table public.meals (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  name text not null,
  meal_time text not null,
  eaten_at date not null,
  memo text null,
  created_at timestamp with time zone null default now(),
  image_path text null,
  constraint meals_pkey primary key (id),
  constraint meals_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

-- 行レベルセキュリティ：本人の食事記録のみ参照・登録・更新・削除できる
-- （with check を省略しているため、insert / update の新しい行にも using の条件が適用される）
alter table public.meals enable row level security;

create policy "users can manage own meals"
on public.meals for all
to public
using (auth.uid() = user_id);
