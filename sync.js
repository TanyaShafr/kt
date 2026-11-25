const lessonParams=new URLSearchParams(location.search);
const rehearsal=lessonParams.has('rehearsal');
const practiceRole=lessonParams.get('practice');
const practiceTeams=['teacher','student'].includes(practiceRole)?(lessonParams.get('teams')==='3'?3:1):0;
const oneTeam=practiceTeams===1;
const practiceTeam=practiceTeams===3&&/^[123]$/.test(lessonParams.get('team')??'')?Number(lessonParams.get('team')):1;
const practiceRoom=lessonParams.get('code')??'';
const localRoomPrefix=practiceTeams===3?'tradition-practice-three-':oneTeam?'tradition-practice-one-':'tradition-demo-v2-';
const online=!practiceTeams&&!rehearsal&&!lessonParams.has('demo')&&Boolean(window.lessonConfig.url&&window.lessonConfig.key);
const actorKey=practiceTeams===3?'lessonPracticeActor-'+practiceRole+'-'+practiceTeam:'lessonActor';
const actor=sessionStorage[actorKey]||(sessionStorage[actorKey]=crypto.randomUUID());
function emptyTeam(_,i){return {n:i+1,step:0,ready:false,positions:{},locks:{},count:0}}
async function call(op,code='',team=0,p={}){
 if(online){
 const cfg=window.lessonConfig;
 const res=await fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/tradition_action',{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},body:JSON.stringify({op,room_code:code,actor,team_no:team,payload:p}),signal:AbortSignal.timeout(9000)});
 const data=await res.json();if(!res.ok)throw Error(data.code==='PGRST202'?'Установите SQL урока в Supabase или откройте репетицию.':data.message||'Связь прервана');return data;
 }
 const run=()=>{
 const prefix=localRoomPrefix;
 if(op==='create'){let c;do{c=String(Math.floor(100000+Math.random()*900000))}while(localStorage.getItem(prefix+c));localStorage.setItem(prefix+c,JSON.stringify({code:c,owner:actor,started:false,familyOpen:!p.familyWaiting,mission:-1,members:{},teams:Array.from({length:practiceTeams||6},emptyTeam)}));return {code:c}}
 const raw=localStorage.getItem(prefix+code);if(!raw)throw Error('Код не найден. В режиме репетиции откройте урок в этом браузере.');
 const s=JSON.parse(raw),t=s.teams[team-1];if(op==='join'&&t)s.members[actor]=team;
 const own=s.owner===actor;if(!own&&!s.members[actor])throw Error('Выберите команду');
 if(['open_family','start','advance'].includes(op)){
  if(!own)throw Error('Миссию запускает учитель');
  if(op==='open_family')s.familyOpen=true;
  if(op==='start'&&!s.started){s.started=true;s.mission=0;s.familyOpen=true}
  if(op==='advance'&&p.mission!==s.mission){
   if(!s.started||p.mission!==s.mission+1||p.mission>6)throw Error('Откройте следующую миссию по порядку');
   if(practiceRole==='teacher'){
    for(const team of s.teams){
     if(team.step>=p.mission)continue;
     team.skipped??=[];
     for(let step=team.step;step<p.mission;step++)team.skipped.push(step);
     team.step=p.mission;
    }
   }else if(s.teams.some(a=>a.step<p.mission)){
    throw Error('Дождитесь ответов всех команд');
   }
   s.mission=p.mission;
  }
 }
 if(['solve','place','lock','unlock','ready'].includes(op)){
 if(!s.started||!t||s.members[actor]!==team)throw Error('Миссия недоступна');
 if(op==='solve'&&p.step!==s.mission)throw Error('Дождитесь запуска миссии учителем');
 if(op!=='solve'&&s.mission!==6)throw Error('Дождитесь запуска сборки карты');
 if(op==='solve'&&t.step===p.step){if(keys[(team-1)%3][t.step]!==p.answer)throw Error('Проверьте ответ');t.step++}
 if(op==='ready'){if(t.step!==6||Object.keys(t.positions).length!==5)throw Error('Разместите пять картинок');t.ready=true}
 if(['place','lock','unlock'].includes(op)){
 if(t.ready||t.step!==6)throw Error('Карта недоступна');const l=t.locks[p.item];if(l&&l.until>Date.now()&&l.who!==actor)throw Error('Картинку двигает другой участник');
 if(op==='lock')t.locks[p.item]={who:actor,until:Date.now()+12000};else{if(op==='place')t.positions[p.item]=[p.x,p.y];delete t.locks[p.item]}}
 }
 for(const a of s.teams)a.count=Object.values(s.members).filter(n=>n===a.n).length;
 if(op!=='state')localStorage.setItem(prefix+code,JSON.stringify(s));return {code:s.code,started:s.started,mission:s.mission,familyOpen:s.familyOpen??true,teams:own?s.teams:[t||s.teams[s.members[actor]-1]]};
 };return navigator.locks?navigator.locks.request(localRoomPrefix+code,run):run()
}
