-- 食事写真用の Storage バケットと RLS ポリシー
-- Supabase ダッシュボードの SQL Editor で一度実行してください。
--
-- 画像は "{userId}/{uuid}.jpg" のパスで保存する。
-- バケットは public のため画像URLを知っていれば誰でも閲覧できるが、
-- アップロード・更新・削除は本人（自分の user_id フォルダ）のみに制限する。

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do nothing;

create policy "Public read access to meal images"
on storage.objects for select
to public
using (bucket_id = 'meal-images');

create policy "Users can upload their own meal images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own meal images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own meal images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
