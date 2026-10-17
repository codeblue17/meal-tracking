-- 食事写真用の Storage バケットと RLS ポリシー
--
-- 画像は "{userId}/{uuid}.jpg" のパスで保存する。
-- バケットは public のため画像URLを知っていれば誰でも閲覧できるが、
-- アップロード・更新・削除は本人（自分の user_id フォルダ）のみに制限する。
--
-- storage スキーマは Supabase の管理下にあり、db reset 後もポリシーが残る場合があるため、
-- 作成前に drop policy if exists で消しておく。

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to meal images" on storage.objects;
create policy "Public read access to meal images"
on storage.objects for select
to public
using (bucket_id = 'meal-images');

drop policy if exists "Users can upload their own meal images" on storage.objects;
create policy "Users can upload their own meal images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own meal images" on storage.objects;
create policy "Users can update their own meal images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own meal images" on storage.objects;
create policy "Users can delete their own meal images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
