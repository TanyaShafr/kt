begin;
create schema if not exists tradition_lesson;
revoke all on schema tradition_lesson from public,anon,authenticated;
create table if not exists tradition_lesson.rooms(code text primary key, owner_key uuid not null,started boolean not null default false,created timestamptz not null default now());
create table if not exists tradition_lesson.teams(code text references tradition_lesson.rooms on delete cascade,n int check(n between 1 and 6),step int not null default 0,positions jsonb not null default '{}',locks jsonb not null default '{}',ready boolean not null default false,primary key(code,n));
create table if not exists tradition_lesson.members(code text references tradition_lesson.rooms on delete cascade,token uuid,n int not null check(n between 1 and 6),primary key(code,token));
alter table tradition_lesson.rooms enable row level security;
alter table tradition_lesson.teams enable row level security;
alter table tradition_lesson.members enable row level security;
alter table tradition_lesson.rooms add column if not exists mission int not null default -1
  check (mission between -1 and 6);
update tradition_lesson.rooms as lesson
set mission=(select coalesce(min(step),0) from tradition_lesson.teams where code=lesson.code)
where started and mission=-1;
create or replace function public.tradition_action(op text, room_code text, actor uuid, team_no int default 0, payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=pg_catalog,tradition_lesson as $$
declare r rooms; t teams; member_n int; owner_ok boolean; k text; item int; x numeric; y numeric; result jsonb; c text; expected text; group_n int;
begin
if actor is null then raise exception 'Недействительный вход'; end if;
if op='create' then
 loop
 c:=lpad(floor(random()*1000000)::int::text,6,'0');
 insert into rooms(code,owner_key) values(c,actor) on conflict do nothing;
 exit when found;
 end loop;
 insert into teams(code,n) select c,i from generate_series(1,6)i;
 return jsonb_build_object('code',c);
end if;
if op in ('start','advance') then
 select * into r from rooms where code=room_code for update;
elsif op in ('solve','place','lock','unlock','ready') then
 select * into r from rooms where code=room_code for share;
else
 select * into r from rooms where code=room_code;
end if;
if not found then raise exception 'Код урока не найден'; end if;
owner_ok:=r.owner_key=actor;
if op='join' then
 if team_no not between 1 and 6 then raise exception 'Выберите команду'; end if;
 insert into members values(room_code,actor,team_no) on conflict do nothing;
end if;
select n into member_n from members where code=room_code and token=actor;
if not owner_ok and member_n is null then raise exception 'Войдите в команду'; end if;
if op='start' and owner_ok then
 update rooms set started=true,mission=0 where code=room_code and not started;
elsif op='advance' and owner_ok then
 if not r.started then raise exception 'Сначала запустите урок'; end if;
 item:=(payload->>'mission')::int;
 if item=r.mission+1 and item<=6 then
  if exists (select 1 from teams where code=room_code and step<item) then
   raise exception 'Дождитесь ответов всех команд';
  end if;
  update rooms set mission=item where code=room_code;
 elsif item is distinct from r.mission then
  raise exception 'Откройте следующую миссию по порядку';
 end if;
elsif op in ('solve','place','lock','unlock','ready') then
 if member_n is distinct from team_no or not r.started then raise exception 'Миссия недоступна'; end if;
 select * into t from teams where code=room_code and n=team_no for update;
 if op='solve' then
 if (payload->>'step')::int is distinct from r.mission then
  raise exception 'Дождитесь запуска миссии учителем';
 end if;
 if t.step=r.mission and t.step<6 then
 group_n:=mod(team_no-1,3);
 expected:=(array[
 ARRAY['РУССКИЕТАТАРЫЧУКЧИ','0,2','0,1,3','0,2','0123','ХЛЕБСОЛЬ'],
 ARRAY['РУССКИЕТАТАРЫЧУКЧИ','1,3','0,1,3','1,2','0123','САБАНТУЙ'],
 ARRAY['РУССКИЕТАТАРЫЧУКЧИ','0,2','0,2,3','0,2','0123','ОЛЕНЕВОД']])[group_n+1][t.step+1];
 if expected is distinct from payload->>'answer' then raise exception 'Проверьте ответ'; end if;
 update teams set step=step+1 where code=room_code and n=team_no;
 end if;
 elsif r.mission<>6 then
 raise exception 'Дождитесь запуска сборки карты';
 elsif op='ready' then
 if t.step<>6 or (select count(*) from jsonb_object_keys(t.positions))<5 then raise exception 'Разместите пять картинок'; end if;
 update teams set ready=true where code=room_code and n=team_no;
 else
 item:=(payload->>'item')::int; k:=item::text;
 if t.ready or t.step<>6 or item is null or item not between 1 and 5 then raise exception 'Карта недоступна'; end if;
 if t.locks ? k and (t.locks->k->>'until')::timestamptz>clock_timestamp() and t.locks->k->>'who'<>actor::text then raise exception 'Картинку двигает другой участник'; end if;
 if op='lock' then update teams set locks=jsonb_set(locks,array[k],jsonb_build_object('who',actor,'until',clock_timestamp()+interval '12 seconds')) where code=room_code and n=team_no;
 elsif op='place' then x:=(payload->>'x')::numeric;y:=(payload->>'y')::numeric;
 if x is null or y is null or x not between 9 and 91 or y not between 13 and 87 then raise exception 'Проверьте позицию'; end if;
 update teams set positions=jsonb_set(positions,array[k],jsonb_build_array(x,y)), locks=locks-k where code=room_code and n=team_no;
 else update teams set locks=locks-k where code=room_code and n=team_no; end if;
 end if;
elsif op not in ('join','state') then raise exception 'Действие недоступно'; end if;
select jsonb_build_object('code',r2.code,'started',r2.started,'mission',r2.mission,'teams',(select jsonb_agg(jsonb_build_object('n',a.n,'step',a.step,'ready',a.ready,'positions',a.positions,'count',(select count(*) from members m where m.code=a.code and m.n=a.n)) order by a.n) from teams a where a.code=r2.code and (owner_ok or a.n=member_n))) into result from rooms r2 where r2.code=room_code;
return result;
end;$$;
revoke all on function public.tradition_action(text,text,uuid,int,jsonb) from public;
grant execute on function public.tradition_action(text,text,uuid,int,jsonb) to anon,authenticated;
notify pgrst, 'reload schema';
commit;
