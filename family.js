const familyQuestion='Какие традиции есть в вашей семье?';
let cloud=[], cloudOffline=false, cloudBusy=false, cloudStamp='';
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cleanTradition(value){
 return value.toLocaleLowerCase('ru').replace(/\s+/g,' ').replace(/^[ .,!?;:]+|[ .,!?;:]+$/g,'');
}
async function familyRequest(operation, code, answer=null){
 if(online){
  const cfg=window.lessonConfig;
  const response=await fetch(cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/tradition_family',{
   method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json'},
   body:JSON.stringify({operation,room_code:code,participant:actor,answer:operation==='save_many'?JSON.stringify(answer):answer}),
   signal:AbortSignal.timeout(7000)
  });
  const result=await response.json();
  if(!response.ok)throw Error(result.code==='PGRST202'||result.message==='Действие недоступно'?'Подключите облако слов в Supabase.':result.message||'Связь прервана');
  return result;
 }
 const key=(practiceTeams===3?'traditions-practice-three-family-':oneTeam?'traditions-practice-family-':'traditions-family-')+code;
 const records=JSON.parse(localStorage.getItem(key)||'{}');
 if(operation==='save_many'){
  const room=await call('state',code,session.team);
  if(room.started)throw Error('Ответы уже собраны');
  if(!room.familyOpen)throw Error('Дождитесь задания от учителя');
  records[actor]=[...new Set(answer.map(cleanTradition))];
  localStorage.setItem(key,JSON.stringify(records));
 }
 if(operation!=='cloud')return records[actor]??null;
 const totals=new Map();
 for(const phrase of Object.values(records).flat())totals.set(phrase,(totals.get(phrase)||0)+1);
 return [...totals].map(([phrase,count])=>({phrase,count})).sort((a,b)=>b.count-a.count||a.phrase.localeCompare(b.phrase,'ru'));
}
function renderCloud(){
 if(cloudOffline)return '<p>Облако слов недоступно. Проверьте подключение к Supabase.</p>';
 if(!cloud.length)return '<p>Здесь появятся ответы с планшетов.</p>';
 const max=cloud[0].count, total=cloud.reduce((sum,word)=>sum+word.count,0);
 return '<div class="word-cloud">'+cloud.map(({phrase,count})=>
  '<span style="--weight:'+Math.round(110+130*(count/max)*(max>1))+'%" aria-label="'+escapeHtml(phrase)+' — '+count+'">'+escapeHtml(phrase)+'</span>'
 ).join('')+'</div><p class="cloud-count">Вписали традиций: '+total+'</p>';
}
async function refreshCloud(){
 if(session?.role!=='teacher'||slide!=='family'||!state||cloudBusy)return;
 const code=session.code;cloudBusy=true;
 try{
  const words=await familyRequest('cloud',code);
  if(session?.code!==code)return;
  cloud=words;cloudOffline=false;
 }catch{
  if(session?.code!==code)return;
  cloudOffline=true;
 }finally{
  cloudBusy=false;
  const panel=app.querySelector('#family-cloud');
  if(session?.code===code&&panel){
   const stamp=JSON.stringify([cloudOffline,cloud]);
   if(stamp!==cloudStamp){panel.innerHTML=renderCloud();cloudStamp=stamp;}
  }
 }
}
// Keep the three fields on the participant's device through a page reload.
const familyStorageKey=(code)=>'traditions-family-draft:'+code+':'+actor;
function readFamilyDraft(code){
 try{return JSON.parse(sessionStorage.getItem(familyStorageKey(code)))??{}}
 catch{return {}}
}
function writeFamilyDraft(code,values,submitted,changed=false){
 try{sessionStorage.setItem(familyStorageKey(code),JSON.stringify({values,submitted,changed}))}
 catch{}
}
const familySavedNote='Традиции на общем экране. Их можно изменить до начала ребусов.';
const familyChangedNote='Нажмите «Обновить традиции», чтобы отправить изменения.';
function familyForm(){
 const fields=['Первая традиция','Вторая традиция (по желанию)','Третья традиция (по желанию)'];
 const draft=readFamilyDraft(session.code);
 return '<article class="family-page"><h2 class="spread-heading">'+familyQuestion+'</h2><p>Вспомните, что вы любите делать вместе. Впишите до трёх традиций, по одной в каждое поле.</p><form id="family-form">'+fields.map((label,i)=>
  '<label for="family-answer-'+i+'">'+label+'</label><input id="family-answer-'+i+'" maxlength="64" autocomplete="off" value="'+escapeHtml(draft.values?.[i]??'')+'" '+(i===0?'required placeholder="Например, печём пирог по воскресеньям"':'')+'>'
 ).join('')+'<button class="primary full" type="submit">'+(draft.submitted?'Обновить традиции':'Отправить на общий экран')+'</button><p id="family-note" role="status">'+(draft.submitted?(draft.changed?familyChangedNote:familySavedNote):'')+'</p></form></article>';
}
const familyValues=form=>Array.from(form.querySelectorAll('input'),input=>input.value);
app.addEventListener('input',e=>{
 const form=e.target.closest('#family-form');
 if(!form||session?.role!=='student')return;
 const {submitted}=readFamilyDraft(session.code);
 writeFamilyDraft(session.code,familyValues(form),submitted,true);
 if(submitted)form.querySelector('#family-note').textContent=familyChangedNote;
});
app.addEventListener('submit',async e=>{
 if(e.target.id!=='family-form')return;
 e.preventDefault();
 const form=e.target, button=form.querySelector('button');
 const values=familyValues(form), code=session.code;
 const answers=values.map(value=>value.trim()).filter(Boolean);
 if(!answers.length||answers.some(value=>cleanTradition(value).length<2||!/[а-яёa-z]/i.test(value))){
  msg('Впишите семейную традицию короткой фразой');return;
 }
 button.disabled=true;
 try{
  await familyRequest('save_many',code,answers);
  const current=familyValues(form);
  const changesPending=current.some((value,i)=>value!==values[i]);
  writeFamilyDraft(code,current,true,changesPending);
  form.querySelector('#family-note').textContent=changesPending?familyChangedNote:familySavedNote;
  button.textContent='Обновить традиции';
 }catch(error){msg(error.message);}
 finally{button.disabled=false;}
});
window.addEventListener('DOMContentLoaded',()=>setInterval(refreshCloud,1600));
