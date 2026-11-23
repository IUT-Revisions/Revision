-- GabouLearn — schéma Supabase : comptes réservés à l'IUT (AMU), rôles, journal, état des cours.
-- À exécuter UNE FOIS dans Supabase : SQL Editor → New query → coller → Run.
-- Toutes les règles d'accès sont appliquées par la base (Row Level Security) : le site ne peut pas les contourner.

-- ===================================================================== tables
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  email         text not null,
  role          text not null default 'etudiant' check (role in ('etudiant', 'admin')),
  blocked       boolean not null default false,
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  last_login_at timestamptz
);

create table if not exists public.events (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  user_id uuid references auth.users on delete set null,
  email   text,
  kind    text not null,
  detail  jsonb not null default '{}'::jsonb
);
create index if not exists events_at_idx on public.events (at desc);

-- un seul compte admin possible
create unique index if not exists profiles_un_seul_admin on public.profiles ((role)) where role = 'admin';

-- configuration privée (illisible depuis le site : RLS activée, aucune politique)
create table if not exists public.gl_config (key text primary key, value text not null);

create table if not exists public.courses (
  slug       text primary key,
  titre      text not null,
  open       boolean not null default true,
  message    text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

insert into public.courses (slug, titre) values
  ('but2-calcul-moyenne', 'Calcul de moyenne BUT2'),
  ('r3-01-developpement-web', 'R3.01 Développement web'),
  ('r3-02-r3-03-dev-efficace-analyse', 'R3.02 · R3.03 Développement efficace & Analyse'),
  ('r3-04-qualite-dev', 'R3.04 Qualité de développement'),
  ('r3-05-programmation-systeme', 'R3.05 Programmation système'),
  ('r3-06-reseaux', 'R3.06 Réseaux'),
  ('r3-07-sql', 'R3.07 SQL dans un langage de programmation'),
  ('r3-08-probabilites', 'R3.08 Probabilités'),
  ('r3-09-cryptographie', 'R3.09 Cryptographie et sécurité'),
  ('r3-11-droit-du-numerique', 'R3.11 Droit du numérique')
on conflict (slug) do nothing;

-- ===================================================================== utilitaires
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not blocked);
$$;

-- ===================================================================== inscription réservée à l'IUT
-- Toute adresse qui n'est pas @etu.univ-amu.fr est refusée par la base, même si on contourne le site.
create or replace function public.check_amu_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is null or lower(new.email) !~ '^[a-z0-9._%+-]+@etu\.univ-amu\.fr$' then
    raise exception 'Inscription réservée aux adresses étudiantes @etu.univ-amu.fr';
  end if;
  return new;
end $$;

drop trigger if exists gl_amu_only on auth.users;
create trigger gl_amu_only before insert on auth.users
  for each row execute function public.check_amu_email();

drop trigger if exists gl_amu_only_upd on auth.users;
create trigger gl_amu_only_upd before update of email on auth.users
  for each row when (new.email is distinct from old.email) execute function public.check_amu_email();

-- ===================================================================== journal automatique
create or replace function public.on_user_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- le compte dont l'adresse est celle de l'admin (gl_config) devient l'unique admin
  insert into public.profiles (id, email, role)
  values (new.id, lower(new.email),
          case when lower(new.email) = (select lower(value) from public.gl_config where key = 'admin_email') then 'admin' else 'etudiant' end);
  insert into public.events (user_id, email, kind, detail)
  values (new.id, lower(new.email), 'inscription',
          jsonb_build_object('domaine', split_part(lower(new.email), '@', 2), 'iut', true));
  return new;
end $$;

drop trigger if exists gl_user_created on auth.users;
create trigger gl_user_created after insert on auth.users
  for each row execute function public.on_user_created();

create or replace function public.on_user_updated() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.profiles set confirmed_at = new.email_confirmed_at where id = new.id;
    insert into public.events (user_id, email, kind) values (new.id, lower(new.email), 'confirmation e-mail');
  end if;
  if new.last_sign_in_at is distinct from old.last_sign_in_at and new.last_sign_in_at is not null then
    update public.profiles set last_login_at = new.last_sign_in_at where id = new.id;
    insert into public.events (user_id, email, kind) values (new.id, lower(new.email), 'connexion');
  end if;
  return new;
end $$;

drop trigger if exists gl_user_updated on auth.users;
create trigger gl_user_updated after update on auth.users
  for each row execute function public.on_user_updated();

-- ===================================================================== actions (fonctions appelées par le site)
-- Fermer / rouvrir un cours (admin seulement)
create or replace function public.admin_set_course(p_slug text, p_open boolean, p_message text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  update public.courses
     set open = p_open, message = nullif(left(coalesce(p_message, ''), 300), ''), updated_at = now(), updated_by = auth.uid()
   where slug = p_slug;
  insert into public.events (user_id, email, kind, detail)
  select auth.uid(), p.email, case when p_open then 'admin : cours rouvert' else 'admin : cours fermé' end,
         jsonb_build_object('cours', p_slug, 'message', p_message)
    from public.profiles p where p.id = auth.uid();
end $$;

-- Bloquer / débloquer un compte (admin seulement ; un admin ne peut pas se bloquer lui-même)
create or replace function public.admin_set_blocked(p_user uuid, p_blocked boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if p_user = auth.uid() then raise exception 'Impossible de se bloquer soi-même'; end if;
  update public.profiles set blocked = p_blocked where id = p_user;
  insert into public.events (user_id, email, kind, detail)
  select auth.uid(), a.email, case when p_blocked then 'admin : compte bloqué' else 'admin : compte débloqué' end,
         jsonb_build_object('compte', (select email from public.profiles where id = p_user))
    from public.profiles a where a.id = auth.uid();
end $$;

-- Supprimer son propre compte (droit à l'effacement) : le journal garde une trace sans l'adresse.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Non connecté'; end if;
  update public.events set email = null where user_id = uid;
  insert into public.events (kind, detail) values ('suppression de compte', jsonb_build_object('domaine', 'etu.univ-amu.fr'));
  delete from auth.users where id = uid;
end $$;

-- Purge du journal après 12 mois (durée annoncée dans la politique de confidentialité).
create or replace function public.purge_old_events()
returns integer language sql security definer set search_path = public as $$
  with d as (delete from public.events where at < now() - interval '12 months' returning 1) select count(*)::int from d;
$$;
-- Facultatif (extension pg_cron activée dans Database → Extensions) :
-- select cron.schedule('gaboulearn-purge', '0 3 * * *', 'select public.purge_old_events()');

revoke all on function public.admin_set_course(text, boolean, text) from public, anon;
revoke all on function public.admin_set_blocked(uuid, boolean) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.purge_old_events() from public, anon, authenticated;
grant execute on function public.admin_set_course(text, boolean, text) to authenticated;
grant execute on function public.admin_set_blocked(uuid, boolean) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

-- ===================================================================== règles d'accès (RLS)
alter table public.profiles enable row level security;
alter table public.events   enable row level security;
alter table public.courses  enable row level security;
alter table public.gl_config enable row level security;
revoke all on public.gl_config from anon, authenticated;

drop policy if exists "profil : soi-même ou admin" on public.profiles;
create policy "profil : soi-même ou admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
-- aucune politique insert / update / delete : seules les fonctions ci-dessus modifient les profils

drop policy if exists "journal : admin" on public.events;
create policy "journal : admin" on public.events for select to authenticated using (public.is_admin());

drop policy if exists "cours : lecture publique" on public.courses;
create policy "cours : lecture publique" on public.courses for select to anon, authenticated using (true);

revoke insert, update, delete on public.profiles, public.events, public.courses from anon, authenticated;
grant select on public.courses to anon, authenticated;
grant select on public.profiles, public.events to authenticated;

-- ===================================================================== compte admin
-- L'adresse de l'admin n'est PAS dans ce fichier (dépôt public) : exécuter ensuite supabase/admin.local.sql
-- (fichier local, exclu de git), puis inviter cette adresse depuis Authentication → Users → Invite user.

-- ===================================================================== annotations de cours (ajouté le 23/11/2026)
alter table public.courses add column if not exists tags text[] not null default '{}';
alter table public.courses add column if not exists note text;
alter table public.courses add column if not exists exam_date date;

alter table public.courses drop constraint if exists courses_tags_valides;
alter table public.courses add constraint courses_tags_valides check (
  tags <@ array['incomplet', 'en-redaction', 'a-jour', 'verifie', 'controle-bientot', 'controle-passe']::text[]
);

create or replace function public.admin_annotate_course(p_slug text, p_tags text[], p_note text default null, p_exam date default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  update public.courses
     set tags = coalesce(p_tags, '{}'), note = nullif(left(coalesce(p_note, ''), 160), ''), exam_date = p_exam,
         updated_at = now(), updated_by = auth.uid()
   where slug = p_slug;
  insert into public.events (user_id, email, kind, detail)
  select auth.uid(), p.email, 'admin : cours annoté',
         jsonb_build_object('cours', p_slug, 'etiquettes', p_tags, 'note', p_note, 'controle', p_exam)
    from public.profiles p where p.id = auth.uid();
end $$;

revoke all on function public.admin_annotate_course(text, text[], text, date) from public, anon;
grant execute on function public.admin_annotate_course(text, text[], text, date) to authenticated;
