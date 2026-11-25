begin;
create table if not exists tradition_lesson.family_answers (
  code text not null,
  token uuid not null,
  phrase text not null check (char_length(phrase) between 2 and 64),
  primary key (code, token),
  foreign key (code, token)
    references tradition_lesson.members(code, token) on delete cascade
);
alter table tradition_lesson.family_answers add column if not exists
  extra_phrases text[] not null default '{}' check (cardinality(extra_phrases) <= 2);
alter table tradition_lesson.family_answers enable row level security;
revoke all on tradition_lesson.family_answers from public, anon, authenticated;

create or replace function public.tradition_family(
  operation text, room_code text, participant uuid, answer text default null
) returns jsonb
language plpgsql security definer set search_path=pg_catalog,tradition_lesson as $$
declare lesson rooms; clean text; input jsonb; phrases text[] := '{}';
begin
  select * into lesson from rooms where code=room_code for share;
  if not found or participant is null then raise exception 'Код урока не найден'; end if;
  if operation='cloud' and lesson.owner_key=participant then
    return coalesce((
      select jsonb_agg(jsonb_build_object('phrase', phrase, 'count', amount)
        order by amount desc, phrase)
      from (
        select item.phrase, count(*) as amount
        from family_answers as saved
        cross join lateral unnest(array[saved.phrase] || saved.extra_phrases) as item(phrase)
        where saved.code=room_code
        group by item.phrase
      ) as totals
    ), '[]'::jsonb);
  end if;
  if not exists (select 1 from members where code=room_code and token=participant) then
    raise exception 'Сначала войдите в команду';
  end if;
  if operation in ('save', 'save_many') then
    if lesson.started then raise exception 'Ответы уже собраны'; end if;
    input := case when operation='save' then jsonb_build_array(answer) else answer::jsonb end;
    if input is null or jsonb_typeof(input) <> 'array' then
      raise exception 'Можно вписать от одной до трёх традиций';
    end if;
    if jsonb_array_length(input) not between 1 and 3 then
      raise exception 'Можно вписать от одной до трёх традиций';
    end if;
    for clean in select value from jsonb_array_elements_text(input) loop
      clean := trim(both ' .,!?;:' from lower(regexp_replace(clean, '[[:space:]]+', ' ', 'g')));
      if clean is null or char_length(clean) not between 2 and 64 or clean !~ '[[:alpha:]]' then
        raise exception 'Напишите каждую традицию короткой фразой';
      end if;
      if not clean=any(phrases) then phrases := array_append(phrases, clean); end if;
    end loop;
    insert into family_answers(code, token, phrase, extra_phrases)
      values(room_code, participant, phrases[1], coalesce(phrases[2:3],'{}'))
      on conflict (code, token) do update
      set phrase=excluded.phrase, extra_phrases=excluded.extra_phrases;
  elsif operation<>'mine' then
    raise exception 'Действие недоступно';
  end if;
  return coalesce((select to_jsonb(phrase) from family_answers
    where code=room_code and token=participant),'null'::jsonb);
end;
$$;
revoke all on function public.tradition_family(text,text,uuid,text) from public;
grant execute on function public.tradition_family(text,text,uuid,text) to anon, authenticated;
commit;
notify pgrst, 'reload schema';
