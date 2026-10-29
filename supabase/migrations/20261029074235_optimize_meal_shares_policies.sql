-- meal_shares の RLS ポリシーで auth.uid() が行ごとに評価されないよう、
-- (select auth.uid()) に書き換える（Supabase advisors の auth_rls_initplan 対応）。
-- 条件の内容は 20261029073848_create_meal_shares.sql から変えていない。

alter policy "users can view own meal shares"
on public.meal_shares
using ((select auth.uid()) = user_id);

alter policy "users can create own meal shares"
on public.meal_shares
with check ((select auth.uid()) = user_id);

alter policy "users can revoke own meal shares"
on public.meal_shares
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
