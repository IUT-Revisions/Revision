-- GabouLearn — évaluations importées de l'agenda ADE (examens, soutenances) + lien ADE privé.
-- À exécuter une fois dans Supabase (SQL Editor). Idempotent.
create table if not exists public.course_exams (
  id         bigint generated always as identity primary key,
  slug       text not null,
  kind       text not null,             -- 'examen', 'soutenance', 'controle'
  title      text not null,
  groupe     text,                      -- ex. « 2ème année », « GA1-1 », « Groupe B an2 »
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  uid        text,
  source     text not null default 'ade',
  created_at timestamptz not null default now()
);
create index if not exists course_exams_slug_idx on public.course_exams (slug, starts_at);

alter table public.course_exams enable row level security;
drop policy if exists "évaluations : lecture publique" on public.course_exams;
create policy "évaluations : lecture publique" on public.course_exams for select to anon, authenticated using (true);
revoke insert, update, delete on public.course_exams from anon, authenticated;
grant select on public.course_exams to anon, authenticated;

-- Lien iCal ADE (rangé dans gl_config, illisible depuis le site)
create or replace function public.admin_set_ade_url(p_url text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if p_url is null or p_url !~ '^https://agenda-web-consult\.univ-amu\.fr/jsp/custom/modules/plannings/anonymous_cal\.jsp\?' then
    raise exception 'Lien ADE invalide : utilise le lien « Générer URL » de l''export iCalendar d''ADE';
  end if;
  insert into public.gl_config (key, value) values ('ade_url', p_url)
  on conflict (key) do update set value = excluded.value;
  insert into public.events (user_id, email, kind)
  select auth.uid(), p.email, 'admin : lien ADE enregistré' from public.profiles p where p.id = auth.uid();
end $$;

create or replace function public.admin_get_ade_url()
returns text language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  return (select value from public.gl_config where key = 'ade_url');
end $$;

revoke all on function public.admin_set_ade_url(text) from public, anon;
revoke all on function public.admin_get_ade_url() from public, anon;
grant execute on function public.admin_set_ade_url(text) to authenticated;
grant execute on function public.admin_get_ade_url() to authenticated;
grant execute on function public.is_admin() to authenticated;
