const clips=new Map();
let slide='welcome', journalTrack=0;
function picture(file,label){
 return '<figure>'+( /^[a-z]/.test(file)?'<img src="art/'+file+'.webp" alt="">':'<span class="object-glyph" aria-hidden="true">'+file+'</span>')+'<figcaption>'+label+'</figcaption></figure>';
}
const rebusPieces=[
 [['rebus1','РУСЛО',',,'],['violin','СКРИПКА','1, 6, 4'],['spruce','ЕЛЬ','1']],
 [['taxi','ТАКСИ','1, 2'],['plate','ТАРЕЛКА',',,,,'],['rebus4','РЫБА','2']],
 [['rebus5','ЧУДО',',,'],['key','КЛЮЧ','4, 1'],['needle','ИГЛА','1']]
];
function rebus(i,repair=false){
 return '<div class="rebus">'+rebusPieces[i].map(([asset,label,rule])=>
  '<span class="piece"><img src="art/'+asset+'.webp" alt=""><b>'+label+'</b><strong class="letter-rule">'+(repair&&asset==='key'?'1, 4':rule)+'</strong></span>'
 ).join('<span aria-hidden="true">+</span>')+'</div>';
}
const builtInClips={
 family:'media/family-intro.mp4',
 q0:'media/rebus-intro.mp4',
 route:'media/route-intro.mp4',
 q1:'media/story-intro.mp4',
 q2:'media/clues-intro.mp4',
 q3:'media/program-intro.mp4',
 q4:'media/order-intro.mp4',
 q5:'media/cipher-intro.mp4',
 map:'media/map-intro.mp4',
 exercise:'media/exercise.mp4',
 discussion:'media/presentation-question.mp4',
 end:'media/farewell.mp4'
};
const factsInInstruction={a0:'q1',a1:'q2',a3:'q4',a4:'q5',a5:'map'};
const clipKey=id=>/^[qa][0-5]$/.test(id)?'logic-'+id:id;
const selectedClipKey=id=>missionFacts[id]?(id==='a5'?'mission-fact-':'craft-fact-')+id:
 builtInClips[id]&&id!=='family'?'lesson-video-'+id:clipKey(id);
const stageClip=id=>clips.get(selectedClipKey(id))??builtInClips[id];
const factPlaysWithInstruction=id=>{
 const target=factsInInstruction[id];
 return Boolean(target&&stageClip(target)===builtInClips[target]);
};
function clipSettings(id){
 if(factPlaysWithInstruction(id))return '';
 const fact=Object.keys(factsInInstruction).find(answer=>factsInInstruction[answer]===id&&factPlaysWithInstruction(answer));
 const script=fact?missionFacts[fact].text+' '+speeches[id][1]:reflectionText(id)||speeches[id][1];
 return '<details class="clip-settings"><summary>Видео и реплика</summary><p>'+script+'</p>'+
  '<label class="video-label">Выбрать видео<input class="clipfile" type="file" accept="video/*"></label></details>';
}
function lessonReflection(id){
 if(factPlaysWithInstruction(id))return '';
 const text=reflectionText(id);
 if(!text)return '';
 const source=missionFacts[id]?.source;
 const question=id==='discussion';
 return '<section class="lesson-reflection"><h3>'+(question?'Вопрос бабушки':'Бабушка рассказывает')+'</h3>'+
  '<p>'+(question?'<strong>'+text+'</strong>':text)+'</p>'+
  (source?'<a class="story-source" href="'+source+'" target="_blank" rel="noopener noreferrer">Источник</a> ':'')+
  btn(stageClip(id)?(question?'Повторить видео с вопросом':'Показать рассказ бабушки'):'Озвучить реплику','discussion-voice')+'</section>';
}
function slideBody(id){
 if(id==='family')return '<div id="family-cloud" aria-live="polite">'+renderCloud()+'</div><p>Что повторяется в разных семьях? Какую традицию вы услышали впервые?</p>';
 if(id==='route')return '<p>Сравните свою подсказку с музейными карточками. Какой народ исследует ваш стол? Какая деталь это доказывает?</p>'+
  '<div class="route-museum">'+museumRoutes.map((item,i)=>'<article><h3>'+peoples[i]+'</h3>'+picture(item.art,item.title)+'<p>'+item.caption+'</p><a href="'+item.url+'" target="_blank" rel="noopener noreferrer">Источник</a></article>').join('')+'</div>';
 if(id==='discussion')return '';
 if(id==='exercise')return '<p>Повторите движения с экрана.</p>';
 if(id==='present')return '<p>Начните с ответа на вопрос бабушки. Затем назовите традицию, покажите одну картинку и закончите фразу «По этой детали можно узнать традицию, потому что…».</p><div class="teams">'+state.teams.map(t=>btn('Карта команды '+t.n,'show-'+t.n)).join('')+'</div>';
 if(id==='map'||id==='end')return '<div class="slide-art">'+tales.map((d,i)=>'<figure>'+mapArt(d,1,0)+
  '<figcaption>'+['Встреча гостя','Состязания','Гонки на упряжках'][i]+'</figcaption></figure>').join('')+'</div><p>'+
  ({map:'Выберите по одной картинке из каждой пары и разместите их вокруг названия.',end:'Мы узнали три традиции по предметам и действиям.'})[id]+'</p>';
 const step=+id[1],answer=id[0]==='a';
 if(step===0)return '<p>'+(answer?'Объясните, почему порядок 1, 4 даёт КЧ, а порядок 4, 1 даёт ЧК.':'Запятые убирают буквы с конца. Номера показывают, какие буквы взять. В третьем ребусе исправьте две перепутанные команды.')+
  '</p><div class="rebus-grid">'+[0,1,2].map(i=>'<section>'+rebus(i,answer)+(answer?'<strong>'+['РУС + СКИ + Е','ТА + ТАР + Ы','ЧУ + КЧ + И'][i]+'<br>'+peoples[i]+(practiceTeams===3?' · стол № '+(i+1):oneTeam?(i===0?' · стол № 1':''):' · столы № '+(i+1)+' и № '+(i+4))+'</strong>':'')+'</section>').join('')+'</div>';
 const d=tales[journalTrack],track=trackOf(d),intro=answer?'':'<p>'+missionInstructions[step]+'</p>';
 if(step===1){
  if(answer)return '<h3>'+d.story+'</h3><div class="lesson-slide-cards">'+sceneIds(track).map(i=>{
   const [art,label,phrase]=track.scenes[i];
   return '<article>'+picture(art,label)+'<small>'+'«'+quoteText(track,selectionKey(track.evidence[phrase]))+'»'+'</small></article>';
  }).join('')+'</div><p>Выберите одну похожую картинку, которая не подошла. Как текст помог это понять?</p>';
  return intro+'<h3>'+d.story+'</h3><p class="story-context">'+track.context+'</p>'+trackExcerpt(track)+'<div class="lesson-slide-cards">'+track.scenes.map(([art,label])=>picture(art,label)).join('')+'</div>';
 }
 if(step===2)return intro+(!answer&&track.guestBridge?'<p>'+track.guestBridge+'</p>':'')+'<ul class="mission-rules">'+track.rules.map(s=>'<li>'+s+'</li>').join('')+'</ul><div class="lesson-slide-cards">'+
  (answer?track.clues.map(i=>track.objects[i]):track.objects).map(([art,label])=>picture(art,label)).join('')+'</div>'+(answer?'<p>'+track.nearClue+'</p>':'');
 if(step===3)return intro+'<h3>'+track.condition+'</h3>'+
  '<dl class="slide-program">'+['Если да','Иначе','После любой ветки'].map((label,i)=>'<div><dt>'+label+'</dt><dd>'+(answer?track.commands[track.program[i]]:'Выберите команду')+'</dd></div>').join('')+'</dl>'+
  '<p>Проверки. '+track.cases.join(' · ')+'</p>';
 if(step===4)return intro+commandOrder(track,answer?[0,1,2,3]:track.broken,false)+(answer?'<p>Назовите два переставленных события. Почему одно должно случиться раньше другого?</p>':'');
 if(answer){
  const chosen=d.prefix==='ta'?1:0;
  return '<p>'+recordLabel(chosen)+' проходит проверку.</p><div class="cipher">'+codeRows(d)[chosen].slice(0,-1).map((n,i)=>'<span class="cipher-card">'+n+' → '+d.word[i]+'</span>').join('')+'</div><h3>'+d.name+'</h3>'+compareProfiles(true);
 }
 return intro+compareProfiles()+'<p>Сверьте карточку с дневником улик. Числовой шифр откроется на планшете.</p>';
}

function projector(){
 const hasTracks=/^[qa][1-5]$/.test(slide);
 const tabs=hasTracks&&!oneTeam?'<label for="journal-track">Карточки столов</label><select id="journal-track">'+tales.map((_,i)=>'<option value="'+i+'" '+(i===journalTrack?'selected':'')+'>'+(practiceTeams===3?'Команда '+(i+1):(i+1)+' и '+(i+4))+'</option>').join('')+'</select>':'';
 const toolbar='<div class="slide-toolbar row">'+(practiceTeams?'<strong class="rehearsal-label">'+(oneTeam?'Одна команда':'Три команды')+'</strong>':rehearsal?'<strong class="rehearsal-label">Репетиция</strong>':'')+'<label for="slide">Слайд</label><select id="slide">'+Object.entries(speeches).map(([id,[name]])=>'<option value="'+id+'" '+(id===slide?'selected':'')+(!canShowSlide(id)?' disabled':'')+'>'+name+'</option>').join('')+'</select>'+tabs+(practiceTeams?practiceStudentLinks():'')+(stageClip(slide)?btn('Показать видео','play-stage-video'):'')+btn(app.classList?.contains('in-projection')?'Закрыть показ':'На весь экран','fullscreen')+clipSettings(slide)+'</div>';
 const title=speeches[slide][0];
 return '<section class="projector">'+toolbar+'<div id="slide-paper" class="slide-paper diary-slide '+(hasTracks?'logic-slide':'')+'"><div class="diary-brand" aria-label="Код традиций"></div><h2 class="diary-title">'+title+'</h2><div class="slide-content">'+slideBody(slide)+lessonReflection(slide)+'</div>'+'<div class="row slide-actions">'+slideActions()+'</div></div></section>';

}
function finished(step){return state.teams.filter(t=>t.step>step&&!t.skipped?.includes(step)).length}
function canReveal(step){
 return rehearsal||(practiceRole==='teacher'&&state.mission>=step)||finished(step)>=state.teams.length;
}
function nextMissionButton(step,label){
 if(step===2)return btn(label??'К физминутке','slide-exercise','primary');
 const next=step+1;
 return rehearsal||state.mission>=next
  ?btn(label??(next===6?'К картам':next===1?'Открыть сказания':'К следующей миссии'),'slide-'+(next===6?'map':'q'+next),'primary')
  :btn(label??(next===6?'Запустить сборку карт':next===1?'Открыть сказания':'Запустить миссию '+(next+1)),'launch-'+next,'primary');
}
function canShowSlide(id){
 if(rehearsal)return true;
 if(id==='route')return state.started;
 if(id==='exercise')return state.mission>=2&&canReveal(2);
 if(id.startsWith('a'))return canReveal(+id[1]);
 if(id.startsWith('q'))return state.mission>=Number(id[1]);
 if(['map','discussion','present','end'].includes(id))return state.mission===6;
 return true;
}
function slideActions(){
 if(slide==='family')return rehearsal||state.started?btn('К ребусам','slide-q0','primary'):btn('К ребусам','start','primary');
 const step=+slide[1];
 if(slide==='exercise')return btn('К заданию на программу',rehearsal||state.mission>=3?'slide-q3':'launch-3','primary');
 if(slide==='route')return btn('К ребусам','slide-q0')+completion(0);
 if(slide[0]==='q')return (step===0?btn('К заданию «Чей след?»','slide-route'):'')+completion(step);
 if(slide[0]==='a')return nextMissionButton(step);
 if(slide==='map'){
  const ready=state.teams.filter(t=>t.ready).length;
  const summary=oneTeam?(ready?'Карта команды готова':'Команда собирает карту'):'Готовы к выступлению: '+ready+' из '+state.teams.length;
  return (rehearsal?'':'<b id="completion">'+summary+'</b>')+btn('К вопросу бабушки','slide-discussion','primary');
 }
 if(slide==='discussion')return btn('Начать выступления','slide-present','primary');
 if(slide==='present')return btn('К итогам','slide-end','primary');
 return '';
}
function completion(step){
 if(rehearsal)return btn('Показать решение','slide-a'+step,'primary');
 const done=finished(step),total=state.teams.length;
 const waiting=state.teams.filter(t=>t.step<=step).map(t=>'№ '+t.n);
 const continuePractice=practiceRole==='teacher'&&state.mission===step&&waiting.length>0;
 const waitingText=waiting.length&&!continuePractice?'<small class="waiting-teams">Ждём: '+waiting.join(', ')+'</small>':'';
 const summary=oneTeam?(done?'Команда ответила':'Ждём ответ команды'):'Ответили '+done+' из '+total+' команд';
 return '<div class="journal-progress"><b id="completion">'+summary+'</b><span class="progress-steps'+(oneTeam?' one-team-progress':practiceTeams===3?' three-team-progress':'')+'" role="progressbar" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+done+'" aria-labelledby="completion">'+Array.from({length:total},(_,i)=>'<i class="'+(i<done?'replied':'')+'"></i>').join('')+'</span>'+waitingText+'</div><button type="button" class="primary" data-act="slide-a'+step+'" '+(!canReveal(step)?'disabled':'')+'>Показать решение</button>'+
  (continuePractice?nextMissionButton(step,'Дальше без ожидания'):'');
}
function updateSlideProgress(){
 const actions=app.querySelector('.slide-actions');
 if(actions)actions.innerHTML=slideActions();
 const picker=app.querySelector('#slide');
 if(picker)for(const option of picker.options)option.disabled=!canShowSlide(option.value);
}
function openClipDatabase(){
 return new Promise((resolve,reject)=>{
 const request=indexedDB.open('traditions-clips',1);
 request.onupgradeneeded=()=>request.result.createObjectStore('clips');
 request.onsuccess=()=>resolve(request.result);
 request.onerror=()=>reject(request.error);
 });
}
async function restoreClips(){
 try{
 const db=await openClipDatabase();
 const request=db.transaction('clips').objectStore('clips').openCursor();
 request.onsuccess=()=>{
 const cursor=request.result;
 if(cursor){if(!clips.has(cursor.key))clips.set(cursor.key,URL.createObjectURL(cursor.value));cursor.continue()}
 else{db.close();if(session?.role==='teacher'&&state&&!pendingVideo)render()}
 };
 }catch{}
}
app.addEventListener('change',async e=>{
 if(e.target.id==='journal-track'){journalTrack=Number(e.target.value);render();return}
 if(e.target.id==='slide'){await act('slide-'+e.target.value);return}
 if(!e.target.classList.contains('clipfile')||!e.target.files[0])return;
 const id=selectedClipKey(slide),file=e.target.files[0];
 if(clips.has(id))URL.revokeObjectURL(clips.get(id));
 clips.set(id,URL.createObjectURL(file));render();
 try{
 const db=await openClipDatabase(),tx=db.transaction('clips','readwrite');
 tx.oncomplete=()=>db.close();
 tx.onerror=()=>{db.close();msg('Видео доступно до перезагрузки страницы')};
 tx.objectStore('clips').put(file,id);
 }catch{msg('Видео доступно до перезагрузки страницы')}
});
window.addEventListener('DOMContentLoaded',restoreClips);
