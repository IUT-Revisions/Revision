-- GabouLearn — annotations de cours (étiquettes, date de contrôle, note), modifiables par l'admin, lisibles par tous.
-- À exécuter une fois dans Supabase (SQL Editor). Idempotent.
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
