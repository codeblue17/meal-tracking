-- 共有リンクのトークンから、共有範囲の食事記録を返す RPC 関数
--
-- 栄養士などの閲覧者はログインせず（anon キーで）この関数を呼ぶ。
-- meals / meal_shares の RLS は変えず、SECURITY DEFINER のこの関数だけが共有範囲のデータを返す。
-- そのため Supabase advisors の「anon が SECURITY DEFINER 関数を実行できる」警告は意図どおり。
--
-- 戻り値（jsonb）
--   トークンが存在しない        → { "status": "not_found" }
--   期限切れ・無効化済み        → { "status": "expired" }
--   有効                        → { "status": "ok", owner_name, goal_type, goal_detail, label,
--                                   start_date, end_date, expires_at, include_memo, include_images,
--                                   meals: [{ id, name, meal_time, eaten_at, memo, image_path }] }
-- user_id やメールアドレスは返さない。共有設定でメモ・写真を含めない場合、memo / image_path は null。

create or replace function public.get_shared_meals(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_share public.meal_shares%rowtype;
  v_meta jsonb;
  v_meals jsonb;
begin
  select * into v_share
  from public.meal_shares
  where token = p_token;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_share.revoked_at is not null or v_share.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  select u.raw_user_meta_data into v_meta
  from auth.users u
  where u.id = v_share.user_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'name', m.name,
        'meal_time', m.meal_time,
        'eaten_at', m.eaten_at,
        'memo', case when v_share.include_memo then m.memo end,
        'image_path', case when v_share.include_images then m.image_path end
      )
      order by m.eaten_at desc, m.created_at desc
    ),
    '[]'::jsonb
  ) into v_meals
  from public.meals m
  where m.user_id = v_share.user_id
    and m.eaten_at >= v_share.start_date
    and (v_share.end_date is null or m.eaten_at <= v_share.end_date);

  return jsonb_build_object(
    'status', 'ok',
    'owner_name', v_meta ->> 'full_name',
    'goal_type', v_meta ->> 'goal_type',
    'goal_detail', v_meta ->> 'goal_detail',
    'label', v_share.label,
    'start_date', v_share.start_date,
    'end_date', v_share.end_date,
    'expires_at', v_share.expires_at,
    'include_memo', v_share.include_memo,
    'include_images', v_share.include_images,
    'meals', v_meals
  );
end;
$$;

-- ログインしていない閲覧者（anon）からも呼べるようにする
revoke execute on function public.get_shared_meals(text) from public;
grant execute on function public.get_shared_meals(text) to anon, authenticated;
