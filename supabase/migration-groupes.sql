-- GabouLearn — groupe de TD/TP de chaque compte + évaluations réservées aux comptes connectés.
-- À exécuter une fois dans Supabase (SQL Editor). Idempotent.
alter table public.profiles add column if not exists groupe text;
alter table public.profiles add column if not exists sous_groupe smallint;
alter table public.profiles drop constraint if exists profiles_groupe_valide;
alter table public.profiles add constraint profiles_groupe_valide check (groupe is null or groupe in ('GA1', 'GA2', 'GB', 'FA'));
alter table public.profiles drop constraint if exists profiles_sous_groupe_valide;
alter table public.profiles add constraint profiles_sous_groupe_valide check (sous_groupe is null or sous_groupe in (1, 2));

-- Choisir / changer son groupe
create or replace function public.set_my_group(p_groupe text, p_sous smallint default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if p_groupe not in ('GA1', 'GA2', 'GB', 'FA') then raise exception 'Groupe inconnu'; end if;
  if p_groupe <> 'FA' and (p_sous is null or p_sous not in (1, 2)) then raise exception 'Choisis ton sous-groupe (1 ou 2)'; end if;
  update public.profiles set groupe = p_groupe, sous_groupe = case when p_groupe = 'FA' then null else p_sous end where id = auth.uid();
  insert into public.events (user_id, email, kind, detail)
  select auth.uid(), p.email, 'groupe choisi', jsonb_build_object('groupe', p_groupe, 'sous_groupe', p_sous)
    from public.profiles p where p.id = auth.uid();
end $$;
revoke all on function public.set_my_group(text, smallint) from public, anon;
grant execute on function public.set_my_group(text, smallint) to authenticated;

-- À l'inscription, le groupe choisi dans le formulaire (métadonnées) est enregistré
create or replace function public.on_user_created() returns trigger
language plpgsql security definer set search_path = public as $$
declare g text := new.raw_user_meta_data->>'groupe';
        s smallint := nullif(new.raw_user_meta_data->>'sous_groupe', '')::smallint;
begin
  if g is not null and g not in ('GA1', 'GA2', 'GB', 'FA') then g := null; end if;
  if g = 'FA' or s not in (1, 2) then s := null; end if;
  insert into public.profiles (id, email, role, groupe, sous_groupe)
  values (new.id, lower(new.email),
          case when lower(new.email) = (select lower(value) from public.gl_config where key = 'admin_email') then 'admin' else 'etudiant' end,
          g, s);
  insert into public.events (user_id, email, kind, detail)
  values (new.id, lower(new.email), 'inscription',
          jsonb_build_object('domaine', split_part(lower(new.email), '@', 2), 'iut', true, 'groupe', g, 'sous_groupe', s));
  return new;
end $$;

-- Les dates d'évaluation ne sont visibles que par les comptes connectés
drop policy if exists "évaluations : lecture publique" on public.course_exams;
drop policy if exists "évaluations : comptes connectés" on public.course_exams;
create policy "évaluations : comptes connectés" on public.course_exams for select to authenticated using (true);
revoke select on public.course_exams from anon;
grant select on public.course_exams to authenticated;
