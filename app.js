const app=document.querySelector('#app');
const savedKey='tradition-session-'+(practiceTeams===3?'practice-three-'+practiceRole+(practiceRole==='student'?'-'+practiceRoom+'-'+practiceTeam:''):oneTeam?'practice-'+practiceRole:rehearsal?'rehearsal':online?'live':'demo-final');
let session=JSON.parse(sessionStorage.getItem(savedKey)||'null'), state, role=rehearsal||practiceRole==='teacher'?'teacher':'student',team=practiceTeam,tab='missions',showTeam=0,placeItem=null,drag=null,busy=false,polling=false,serial=0,lastReward=0,timeout;
function msg(s){const box=document.querySelector('#toast');box.textContent=s;clearTimeout(timeout);timeout=setTimeout(()=>box.textContent='',4600)}
function btn(text,action,css='',pressed=null){return '<button type="button" class="'+css+'" data-act="'+action+'"'+(pressed===null?'':' aria-pressed="'+pressed+'"')+'>'+text+'</button>'}
function art(d,i){return '<img draggable="false" src="art/'+d.prefix+i+'.webp" alt="'+d.pictures[i-1]+'">'}
function mapArt(d,item,variant,alt=''){
 return '<img draggable="false" src="art/sticker-'+d.prefix+'-'+item+'-'+variant+'.png" alt="'+alt+'">';
}
// The room stores two coordinates per slot. Half-unit x values mark the second picture.
function mapPictureVariant(x){return x-Math.floor(x)===0.5?1:0}
function mapPoint(e,field,variant){
 const point=coords(e,field);
 if(variant===1)point.x=Math.min(point.x,90)+0.5;
 return point;
}
function teamState(){return state.teams.find(t=>t.n===session.team)}
function tale(n){return tales[(n-1)%3]}
function remember(s){session=s;if(s)sessionStorage.setItem(savedKey,JSON.stringify(s));else sessionStorage.removeItem(savedKey)}
let openingVideo=false, pendingVideo=null;
function practiceStudentLinks(){
 const base='?practice=student&amp;code='+state.code;
 if(oneTeam)return '<a class="practice-open" href="'+base+'" target="_blank" rel="noopener">Открыть экран ученика</a>';
 return '<div class="practice-team-links">'+state.teams.map(({n})=>
  '<a class="practice-open" href="'+base+'&amp;teams=3&amp;team='+n+'" target="_blank" rel="noopener">Открыть команду '+n+'</a>'
 ).join('')+'</div>';
}
function practiceStudentEntry(){
 const code=/^\d{6}$/.test(practiceRoom)?practiceRoom:'';
 return '<section class="mission panel"><p class="rehearsal-label">Репетиция · экран ученика</p><h1>Команда '+practiceTeam+'</h1>'+
  '<p>Оставьте эту вкладку рядом с экраном учителя.</p><label for="room">Код урока</label>'+
  '<input id="room" inputmode="numeric" maxlength="6" autocomplete="off" value="'+code+'">'+
  btn('Войти в команду','join','primary full')+'</section>';
}
function landing(){
 if(practiceTeams){app.innerHTML=practiceStudentEntry();return}
 app.innerHTML='<section class="entry journal-entry"><h1 class="spread-heading">Путевой дневник</h1><div class="entry-copy"><div class="narrator entry-portrait"><img src="art/journal-narrator.webp" alt="Бабушка-сказочница"></div><p>Разгадайте ребусы, соберите иллюстрации и создайте карту традиции своего стола.</p></div><section class="panel entry-form"><div class="tabs">'+btn('Команда','student','active')+btn('Учитель','teacher')+'</div><label>Номер вашего стола</label><div class="teams">'+Array.from({length:6},(_,i)=>btn('Стол '+(i+1),'team-'+(i+1),team===i+1?'picked':'')).join('')+'</div><label for="room">Код урока</label><input id="room" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="6 цифр с экрана">'+btn('Войти в команду','join','primary full')+'</section></section>';
}
function openingView(){
 const content=openingVideo
  ? '<video class="opening-video" aria-label="Вступление бабушки-сказочницы" controls autoplay playsinline preload="metadata" poster="art/journal-narrator.webp" src="media/lesson-intro.mp4"></video>'
  : '<h1>Код традиций</h1>';
 return '<section class="opening-screen '+(openingVideo?'opening-film':'opening-title')+'">'+content+
  (practiceTeams?'<p class="rehearsal-label">Репетиция · '+(oneTeam?'одна команда':'три команды')+'</p>':'')+
  '<div class="opening-actions">'+btn('Ко входу','exit')+
  (openingVideo?btn('Показать код','create',rehearsal?'':'primary'):btn('Включить видео','intro-video',rehearsal?'':'primary'))+
  (rehearsal?btn('Смотреть задания','rehearsal-start','primary'):'')+'</div></section>';
}
function instructionVideo(){
 return '<section class="opening-screen opening-film"><video class="opening-video" aria-label="Видео бабушки-сказочницы" controls playsinline preload="metadata" poster="art/journal-narrator.webp" src="'+pendingVideo.src+'"></video>'+
  '<div class="opening-actions">'+btn('Назад','video-back')+btn(pendingVideo.label,'video-next','primary')+'</div></section>';
}
function showInstructionVideo(id,action,label='Открыть задание'){
 const src=stageClip(id);
 if(!src)return false;
 pendingVideo={src,action,label};render();
 app.querySelector('.opening-video').play().catch(()=>{});
 return true;
}
function lobbyTeams(){
 const connected=state.teams.filter(t=>t.count>0).length;
 const summary=oneTeam?(connected?'Команда подключилась':'Ждём подключения команды'):'Подключились '+connected+' из '+state.teams.length+' команд';
 return '<p class="lobby-summary">'+summary+'</p><ul class="lobby-teams'+(oneTeam?' one-team-lobby':practiceTeams===3?' three-team-lobby':'')+'">'+
  state.teams.map(t=>'<li class="'+(t.count?'connected':'')+'"><strong>Команда '+t.n+'</strong><span>'+(t.count?'Подключилась':'Ожидаем')+'</span></li>').join('')+
  '</ul>';
}
function lobbyView(){
 const next=state.started?'slide-'+(state.mission===6?'map':'q'+state.mission):'slide-family';
 return '<section class="opening-screen opening-lobby"><h1>Код урока</h1><div class="code lobby-code">'+state.code+'</div>'+
  '<section id="lobby-status" aria-live="polite">'+lobbyTeams()+'</section>'+
  '<div class="opening-actions">'+btn('Выйти','exit')+
  (practiceTeams?practiceStudentLinks():'')+
  btn(state.started?'К открытому этапу':'К семейному вопросу',next,'primary')+'</div>'+
  (practiceTeams?'<p class="practice-help">'+(oneTeam?'Откройте экран ученика в новой вкладке.':'Откройте три команды в отдельных вкладках одного браузера.')+' В каждой вкладке ученика нажмите «Войти в команду».</p>':'')+'</section>';
}
function teacherView(){
 if(!showTeam&&slide==='welcome')return lobbyView();
 if(showTeam){const t=state.teams.find(a=>a.n===showTeam);return '<div class="row">'+btn('К выступлениям','back')+'<span>Карта для выступления</span></div><div class="presentation-map"><section><h2 class="spread-heading">Команда '+t.n+'</h2>'+board(t,true)+'</section>'+'</div>'}
 return '<div class="row"><h2 class="spread-heading">Экран класса</h2>'+btn('Выйти','exit','close')+'</div><section class="panel"><div class="row"><div><small>Код урока</small><div class="code">'+state.code+'</div></div><div class="close">'+(!state.started?btn('Облако слов','slide-family','primary'):'Урок идёт')+'</div></div></section>'+projector()+'<div class="cards" id="teacher-teams">'+state.teams.map(t=>'<article>'+(t.step>0?'<small>'+peoples[(t.n-1)%3]+'</small>':'')+'<h3>Команда '+t.n+'</h3><div>Вошли: '+t.count+'</div><div class="meter"><i style="display:block;width:'+100*t.step/6+'%"></i></div><p>'+(t.ready?'Готовы к выступлению':!t.count?'Ожидаем команду':!state.started?'Ждут начала':names[t.step]||'Собирают карту')+'</p>'+btn('Показать карту','show-'+t.n)+'</article>').join('')+'</div>';
}
function board(t,readonly){
 const d=tale(t.n),unlocked=Math.max(0,t.step-1),edit=!readonly&&!t.ready&&t.step===6&&state.mission===6;
 let figures='',tray='';
 const pairs=mapPictures[d.prefix];
 for(let item=1;item<=unlocked;item++){
  const pos=t.positions[item];
  const chosen=pos?mapPictureVariant(pos[0]):-1;
  if(pos)figures+='<button type="button" class="sticker" '+(edit?'data-sticker="'+item+'" data-variant="'+chosen+'"':'disabled')+
   ' style="left:'+Math.floor(pos[0])+'%;top:'+pos[1]+'%">'+mapArt(d,item,chosen,pairs[item-1][chosen])+'</button>';
  if(!readonly&&!t.ready)tray+='<section class="map-pair" aria-label="Пара '+item+'">'+pairs[item-1].map((label,variant)=>{
   const selected=placeItem?.item===item&&placeItem.variant===variant;
   const content=mapArt(d,item,variant)+'<span>'+label+'</span>';
   return edit?btn(content,'pick-'+item+'-'+variant,selected?'picked':variant===chosen?'on-map':'',selected):'<div class="map-choice">'+content+'</div>';
  }).join('')+'</section>';
 }
 const hint=placeItem?'Коснитесь места на карте.':'Выберите по одной картинке из каждой пары. Чтобы заменить картинку, выберите вторую и укажите её место на карте.';
 return '<div class="field" id="field">'+figures+'<div class="center">'+(t.step===6?d.name:'Название скрыто')+'</div></div>'+
  (edit?'<p>'+hint+'</p>':'')+(tray?'<div class="tray map-pairs">'+tray+'</div>':'')+
  (!readonly?(t.ready?'<p>Карта готова к выступлению.</p>':edit&&Object.keys(t.positions).length===pairs.length?btn('Готово к выступлению','ready','primary'):unlocked===0?'<p>За каждую следующую миссию откроется пара картинок.</p>':''):'');
}
function question(t){
 const d=tale(t.n),s=t.step;
 if(s===0&&missionDraft.routeOpen)return '<span class="tag">Миссия 1 из 6</span><h2 class="spread-heading">Чей след?</h2>'+
  '<p>Сравните подсказку вашего стола с карточками музея на общем экране.</p>'+routeTask(d)+
  '<div class="actions">'+btn('Проверить маршрут','solve','primary')+'</div>';
 if(s===6)return '<h2>Шифр разгадан!</h2><p>Вы открыли традицию «'+d.name+'». Выберите по одной иллюстрации из каждой пары и разместите их вокруг названия.</p>'+btn('Собрать карту','map','primary');
 return '<span class="tag">Миссия '+(s+1)+' из 6</span><h2 class="spread-heading">'+speeches['q'+s][0]+'</h2>'+
  '<p>'+missionInstructions[s]+'</p>'+clueNotebook(d,s)+missionTask(d,s)+'<div class="actions">'+btn('Проверить ответ','solve','primary')+'</div>';
}
function render(){
 const opening=Boolean(pendingVideo)||(!session&&role==='teacher')||(session?.role==='teacher'&&state&&!showTeam&&slide==='welcome');
 document.body.classList.toggle('lesson-opening',Boolean(opening));
 if(pendingVideo){app.innerHTML=instructionVideo();return}
 if(!session){if(opening)app.innerHTML=openingView();else landing();return}if(!state){app.innerHTML='<p>Подключаемся к уроку…</p>'+btn('Ко входу','exit');return}
 if(session.role==='teacher'){app.innerHTML=teacherView();return}
 const t=teamState();if(!t)return;
 let r='<div class="row"><strong>Команда '+t.n+'</strong><small>Код '+state.code+'</small>'+btn('Выйти','exit','close')+'</div>';
 if(!state.started){
 const body=state.familyOpen===false?'<article class="waiting-task"><h2>Ждём задание</h2><p>Смотрите на общий экран. Задание появится здесь, когда учитель его откроет.</p></article>':familyForm();
 app.innerHTML='<section class="mission family-mission">'+r+body+'</section>';return;
 }
 r+='<div class="tabs">'+btn('Миссии','missions',tab==='missions'?'active':'')+btn('Наша карта · '+2*Math.max(0,t.step-1)+'/10','map',tab==='map'?'active':'')+'</div>';
 if(lastReward&&tab==='missions'){
  const d=tale(t.n);
  r+='<div class="panel reward"><div><strong>Получили две картинки</strong><div class="reward-pair">'+
   mapPictures[d.prefix][lastReward-1].map((label,variant)=>mapArt(d,lastReward,variant,label)).join('')+
   '</div></div>'+btn('Закрыть','dismiss','close')+'</div>';
 }
 const task=t.step<=state.mission?question(t):'<article class="waiting-task"><h2>Ждём следующую миссию</h2><p>Ваш ответ принят. Следующее задание откроет учитель после разбора.</p></article>';
 app.innerHTML='<section class="mission">'+r+(tab==='map'?'<h2 class="spread-heading">Наша карта</h2>'+board(t,false):task)+'</section>';
}
function accept(data,refreshView=false){
 const previous=state;const old=session?.role==='student'&&state?teamState()?.step:null;
 if(JSON.stringify(data)===JSON.stringify(state)){if(refreshView)render();return;}
 state=data;
 if(pendingVideo)return;
 const lobby=app.querySelector('#lobby-status');
 if(lobby){
  const teams=lobbyTeams();
  if(lobby.innerHTML!==teams)lobby.innerHTML=teams;
  return;
 }
 if(session?.role==='teacher'&&!showTeam&&app.querySelector('.projector')){
 const updated=document.createElement('template');updated.innerHTML=teacherView();
 app.querySelector('#teacher-teams').replaceWith(updated.content.querySelector('#teacher-teams'));
 updateSlideProgress();return;
 }
 const next=session?.role==='student'?teamState()?.step:null;
 if(previous?.started===data.started&&previous?.familyOpen===data.familyOpen&&previous?.mission===data.mission&&old===next&&next!==null&&(!data.started||tab==='missions'))return;
 if(old!==null&&next!==old){
  missionDraft=newMissionDraft();
  lastReward=next>1&&!teamState().skipped?.includes(next-1)?next-1:0;
 }
 render()
}
async function refresh(){
 if(!session||busy||polling||drag)return;const stamp=serial;polling=true;
 try{const data=await call('state',session.code,session.team);if(stamp===serial&&!drag)accept(data)}catch(e){if(!state)msg(e.message)}finally{polling=false}
}
function norm(v){return v.toUpperCase().replace(/[^А-ЯЁ]/g,'')}
function enterTeacherRoom(room,skipIntro=false){
 pendingVideo=null;
 remember({code:room.code,role:'teacher',team:0});
 slide=skipIntro?'family':'welcome';
 if(!practiceTeams){app.classList.add('in-projection');document.body.classList.add('projection-open');}
 accept(room);
}
async function act(a){
 if(busy)return;
 if(a==='fullscreen'){
  const projecting=app.classList.toggle('in-projection');
  document.body.classList.toggle('projection-open',projecting);
  render();
  return;
 }
 if(a==='intro-video'){openingVideo=true;render();app.querySelector('.opening-video').play().catch(()=>{});return}
 if(a==='video-back'){pendingVideo=null;render();return}
 if(a!=='discussion-voice')window.speechSynthesis?.cancel();
 const afterVideo=a==='video-next';
 if(afterVideo){
  if(!pendingVideo)return;
  a=pendingVideo.action;
 }
 if(a==='discussion-voice'){
  if(showInstructionVideo(slide,'slide-'+slide,slide==='discussion'?'К вопросу':'К разбору'))return;
  if(!('speechSynthesis' in window)||!window.SpeechSynthesisUtterance){msg('На этом устройстве прочитайте реплику со слайда.');return}
  if(window.speechSynthesis.speaking){window.speechSynthesis.cancel();return}
  const utterance=new window.SpeechSynthesisUtterance(reflectionText(slide));
  utterance.lang='ru-RU';utterance.rate=.9;
  const russianVoice=window.speechSynthesis.getVoices().find(voice=>voice.lang.toLowerCase().startsWith('ru'));
  if(russianVoice)utterance.voice=russianVoice;
  utterance.onerror=event=>{if(!['canceled','interrupted'].includes(event.error))msg('На этом устройстве прочитайте реплику со слайда.')};
  window.speechSynthesis.speak(utterance);return;
 }
 if(a==='play-stage-video'){showInstructionVideo(slide,'slide-'+slide,'К слайду');return}
 if(a==='slide-family'&&!rehearsal&&state?.familyOpen===false){
  if(!afterVideo&&showInstructionVideo('family','open-family','Открыть семейный вопрос'))return;
  a='open-family';
 }
 if(a.startsWith('slide-')){
  const target=a.slice(6);
  if(!canShowSlide(target))return;
  const videoBeforeSlide=['family','route','map','exercise','discussion','end'].includes(target)||/^q[0-5]$/.test(target);
  const videoNextLabel={family:'Открыть семейный вопрос',discussion:'К вопросу',end:'Показать итоги',map:'Открыть карты',exercise:'Закончить разминку'}[target];
  if(!afterVideo&&target!==slide&&videoBeforeSlide&&showInstructionVideo(target,a,videoNextLabel))return;
  pendingVideo=null;slide=target;render();if(slide==='family')refreshCloud();return;
 }
 if(!rehearsal&&!afterVideo&&(a==='start'||a.startsWith('launch-'))){
  const target=a==='start'?'q0':a==='launch-6'?'map':'q'+a.slice(7);
  if(showInstructionVideo(target,a,target==='map'?'Открыть карты':undefined))return;
 }
 if(a==='exit'){if((rehearsal||practiceRole==='teacher')&&!session){location.assign('./');return}app.classList.remove('in-projection');document.body.classList.remove('projection-open');slide='welcome';openingVideo=false;pendingVideo=null;role=rehearsal||practiceRole==='teacher'?'teacher':'student';if(document.fullscreenElement===document.documentElement)document.exitFullscreen?.().catch(()=>{});cloud=[];cloudOffline=false;cloudStamp='';serial++;remember(null);state=null;missionDraft=newMissionDraft();placeItem=null;lastReward=0;tab='missions';showTeam=0;render();return}
 if(['teacher','student'].includes(a)){role=a;render();return}
 if(a.startsWith('team-')){team=+a.slice(5);app.querySelectorAll('[data-act^="team-"]').forEach(b=>b.classList.toggle('picked',b.dataset.act===a));return}
 if(['map','missions'].includes(a)){tab=a;render();return}
 if(a==='back'||a.startsWith('show-')){showTeam=a==='back'?0:+a.slice(5);if(a==='back')slide='present';render();return}
 if(a==='dismiss'){lastReward=0;render();return}
 if(a==='mission-reset'){missionDraft=newMissionDraft();render();return}
 if(a.startsWith('quote-')){
  const quote=a.slice(6);
  missionDraft.quote=missionDraft.quote===quote?null:quote;
  render();app.querySelector('[data-act="'+a+'"]')?.focus({preventScroll:true});return;
 }
 if(a.startsWith('unpair-')){
  delete missionDraft.pairs[Number(a.slice(7))];
  render();return;
 }
 if(a.startsWith('pair-')){
  const scene=Number(a.slice(5)),quote=missionDraft.quote;
  if(quote===null){msg('Сначала выделите слова в отрывке.');return}
  const previous=Object.keys(missionDraft.pairs).find(i=>missionDraft.pairs[i]===quote);
  if(previous===undefined&&Object.keys(missionDraft.pairs).length>=3){msg('Уберите одну из трёх пар, чтобы добавить другую.');return}
  if(previous!==undefined)delete missionDraft.pairs[previous];
  missionDraft.pairs[scene]=quote;missionDraft.quote=null;
  render();app.querySelector('[data-act="unpair-'+scene+'"]')?.focus({preventScroll:true});return;
 }
 if(a.startsWith('task-card-')){
  const card=Number(a.slice(10)),selected=missionDraft.cards;
  if(selected.includes(card))missionDraft.cards=selected.filter(i=>i!==card);
  else if(selected.length<3)missionDraft.cards.push(card);
  else{msg('Можно выбрать только три картинки. Снимите одну отметку.');return}
  render();app.querySelector('[data-act="'+a+'"]')?.focus({preventScroll:true});return;
 }
 if(a.startsWith('test-')){
  const index=Number(a.slice(5)),result=programResult(trackOf(tale(teamState().n)),missionDraft,index);
  if(!result){msg('Выберите команду для каждой строки программы.');return}
  missionDraft.checks[index]=result;render();return;
 }
 if(a.startsWith('swap-')){
  const index=Number(a.slice(5)),previous=missionDraft.pending;
  if(previous===null)missionDraft.pending=index;
  else{
   const order=missionDraft.order??[...trackOf(tale(teamState().n)).broken];
   [order[previous],order[index]]=[order[index],order[previous]];
   missionDraft.order=order;missionDraft.pending=null;
  }
  render();app.querySelector('[data-act="'+a+'"]')?.focus({preventScroll:true});return;
 }
 if(a.startsWith('pick-')){const [,item,variant]=a.split('-').map(Number);placeItem={item,variant};render();return}
 busy=true;serial++;
 try{
 if(a==='create'||(rehearsal&&a==='rehearsal-start')){
 if(!rehearsal&&!practiceTeams&&!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});
 const d=await call('create','',0,{familyWaiting:!rehearsal});const roomState=await call('state',d.code);
 if(!Number.isInteger(roomState.mission))throw Error('Для запуска установите SQL для подключения или откройте репетицию');
 const quickRehearsal=a==='rehearsal-start';
 enterTeacherRoom(roomState,quickRehearsal);
 if(quickRehearsal)showInstructionVideo('family','slide-family','Открыть семейный вопрос');
 return;
 }
 if(a==='open-family'){
  state=await call('open_family',session.code);pendingVideo=null;slide='family';render();refreshCloud();return;
 }
 if(a==='join'){const code=document.querySelector('#room').value.trim();if(!/^\d{6}$/.test(code))throw Error('Введите шесть цифр с экрана учителя');const d=await call('join',code,team);if(!Number.isInteger(d.mission))throw Error('Учителю нужно обновить базу урока');remember({code,role:'student',team:d.teams.find(t=>t.n===team)?.n||d.teams[0].n});accept(d);return}
 if(a==='solve'){
 const t=teamState(),s=t.step;
 if(s!==state.mission)throw Error('Дождитесь запуска миссии учителем');
 if(s===0&&missionDraft.routeOpen){
  const index=(t.n-1)%3;
  if(missionDraft.fields.people!==String(index)||missionDraft.fields.feature!==String(index))throw Error('Сравните предмет и его деталь с музейными карточками на доске.');
 }else{
  const error=missionError(tale(t.n),s,missionDraft);
  if(error)throw Error(error);
  if(s===0){missionDraft.routeOpen=true;render();return}
 }
 // Keep the existing phase-completion contract for live and demo rooms.
 accept(await call('solve',session.code,t.n,{step:s,answer:keys[(t.n-1)%3][s]}));return;
 }
 if(a==='start'||a.startsWith('launch-')){
 const mission=a==='start'?0:+a.slice(7);
 if(!Number.isInteger(state.mission))throw Error('Установите обновление SQL для синхронизации миссий');
 const next=await call(a==='start'?'start':'advance',session.code,0,{mission});
 slide=mission===6?'map':'q'+mission;
 pendingVideo=null;state=next;render();
 }
 if(a==='ready')accept(await call(a,session.code,session.team))
 }catch(e){msg(e.message)}finally{busy=false}
}
function coords(e,field){const r=field.getBoundingClientRect();return {x:Math.max(9,Math.min(91,Math.round(100*(e.clientX-r.left)/r.width))),y:Math.max(13,Math.min(87,Math.round(100*(e.clientY-r.top)/r.height)))}}
app.addEventListener('input',event=>{
 const field=event.target.dataset.taskField;
 if(!field)return;
 missionDraft.fields[field]=event.target.value;
 if(field==='profile'){render();return}
 if(['then','else','after'].includes(field)&&Object.keys(missionDraft.checks).length){
  missionDraft.checks={};
  app.querySelectorAll('.program-tests [role="status"]').forEach(output=>output.remove());
 }
});
app.addEventListener('click',async e=>{
 const b=e.target.closest('[data-act]');if(b){await act(b.dataset.act);return}
 const f=e.target.closest('#field');if(!f||!placeItem||busy||e.target.closest('.sticker'))return;
 busy=true;serial++;try{const result=await call('place',session.code,session.team,{item:placeItem.item,...mapPoint(e,f,placeItem.variant)});placeItem=null;accept(result,true)}catch(err){msg(err.message)}finally{busy=false}
});
app.addEventListener('pointerdown',e=>{
 const b=e.target.closest('[data-sticker]');if(!b||busy||drag)return;
 placeItem=null;serial++;b.setPointerCapture(e.pointerId);const item=+b.dataset.sticker;
 drag={b,item,variant:Number(b.dataset.variant),id:e.pointerId,lock:call('lock',session.code,session.team,{item}).then(()=>true).catch(err=>{msg(err.message);return false})}
});
app.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const p=coords(e,drag.b.parentNode);drag.b.style.left=p.x+'%';drag.b.style.top=p.y+'%'});
async function endDrag(e){if(!drag||e.pointerId!==drag.id)return;const d=drag;busy=true;drag=null;
 try{if(await d.lock){state=await call(e.type==='pointercancel'?'unlock':'place',session.code,session.team,{item:d.item,...mapPoint(e,d.b.parentNode,d.variant)})}}catch(err){msg(err.message)}finally{busy=false;render()}}
app.addEventListener('pointerup',endDrag);app.addEventListener('pointercancel',endDrag);
window.addEventListener("DOMContentLoaded",()=>{render();refresh();setInterval(refresh,1800)});

window.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&app.classList.contains('in-projection'))act('fullscreen');
});
