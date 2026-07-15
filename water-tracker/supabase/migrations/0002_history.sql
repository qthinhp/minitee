-- Daily history for the History screen: one row per calendar day (in the
-- CALLER'S timezone), zero-filled so charts and streak math never have to
-- guess at missing days. goal is the target that was in effect ON that day,
-- so raising your goal today doesn't retroactively break old streaks.

create or replace function public.daily_history(p_days int default 30)
returns table (day date, total numeric, goal numeric)
language sql security definer set search_path = public as $$
  with me as (select p.id, p.timezone from public.profiles p where p.id = auth.uid()),
  metric as (select id from public.metric_types where slug = 'water'),
  days as (
    select ((now() at time zone (select timezone from me))::date - offs) as d
    from generate_series(0, greatest(least(p_days, 366), 1) - 1) as offs
  )
  select
    days.d,
    coalesce((
      select sum(e.value) from public.events e, me, metric
      where e.user_id = me.id
        and e.metric_type_id = metric.id
        and (e.occurred_at at time zone me.timezone)::date = days.d
    ), 0),
    (
      select g.target_value from public.goals g, metric
      where g.user_id = auth.uid()
        and g.metric_type_id = metric.id
        and g.effective_from <= days.d
      order by g.effective_from desc limit 1
    )
  from days
  order by days.d;
$$;
