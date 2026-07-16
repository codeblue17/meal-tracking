-- meals テーブルに画像パス列を追加
-- Supabase ダッシュボードの SQL Editor で一度実行してください。
--
-- 画像本体は Storage バケット（storage_meal_images.sql 参照）に保存し、
-- ここには "userId/uuid.jpg" 形式のパスのみを保持する。

alter table public.meals
  add column if not exists image_path text;
