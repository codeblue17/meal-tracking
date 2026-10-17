-- 退会（アカウント削除）用の RPC 関数
-- Supabase ダッシュボードの SQL Editor で一度実行してください。
--
-- クライアント（anon キー）からは auth.users を直接削除できないため、
-- SECURITY DEFINER の関数を経由して「ログイン中のユーザー自身」だけを削除します。

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 食事記録を削除（FK に ON DELETE CASCADE があれば冗長だが安全のため明示）
  delete from public.meals where user_id = auth.uid();
  -- 認証ユーザー本体を削除
  delete from auth.users where id = auth.uid();
end;
$$;

-- ログイン済みユーザーのみ実行可能にする
revoke execute on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
