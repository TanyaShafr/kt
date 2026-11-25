const missionTracks = [
 {
  source:['Былина «Илья Муромец и Соловей-разбойник», вариант со словами о хлебе-соли','https://world-of-legends.su/slavyanskaya/bilini/id687'],
  context:'По дороге из Мурома в Киев Илья помогает жителям Чернигова защитить город. Горожане встречают богатыря и предлагают ему остаться. Воевода — военный предводитель.',
  after:'Илья отказывается остаться воеводой и спрашивает дорогу в Киев.',
  verse:true,
  prose:[['Увидали мужики его, черниговцы:'],['Отворяют ему ворота во Чернигов-град'],['[…]'],['И слыви у нас воеводою.'],['[…]'],['Хлебом солью кормить тебя досыта,']],
  evidence:[[1,0],[3,0],[5,0]],
  scenes:[['ilya-approach','Илья подъезжает к городу'],['ilya-bread','Жители обещают угостить Илью хлебом и солью',2],['ilya-gates','Горожане открывают Илье ворота',0],['ilya-forest','Илья уже едет через лес'],['ilya-invite','Жители зовут Илью воеводой',1]],
  guestBridge:'Горожане обещали угостить Илью хлебом и солью. Найдите три предмета, которые подходят к этой сцене.',
  objects:[['journal-loaf','Каравай'],['cup','Чашка'],['journal-salt','Солонка'],['ribbon','Лента'],['journal-towel','Полотенце'],['plate','Тарелка для хлеба']],
  clues:[0,2,4], nearClue:'Почему тарелка для хлеба лишняя? Какое условие её исключает?',
  rules:['Одну улику можно съесть.','Во второй хранят соль и берут её щепоткой.','Третья — широкая ткань, на которую кладут хлеб.'],
  condition:'Хлеб уже готов?', cases:['Хлеб ещё печётся','Хлеб готов'],
  commands:['Подожди, пока хлеб испечётся','Сразу бери готовый хлеб','Положи хлеб на полотенце и поднеси гостю','Начни скачки'],
  program:[1,0,2],
  order:[['ilya-citizens','Горожане замечают Илью'],['ilya-gates','Горожане открывают ворота'],['ilya-invite','Жители зовут Илью воеводой'],['ilya-bread','Жители обещают угостить Илью хлебом и солью']],
  broken:[0,2,1,3]
 },
 {
  source:['Олег Данкир, «Татарские сказки»','https://proza.ru/2024/12/26/1660'],
  context:'Падишах готовится к свадьбе. Дутан-батыр участвует в состязаниях. Майдан — площадка, где собираются люди.',
  prose:[['Будут скачки, состязания в борьбе.'],['Собирается майдан. ','Пускают коней на трёхдневный перегон.'],['Он первым показывается из-за холма и первым прибывает на майдан.']],
  evidence:[[1,0],[1,1],[2,0]],
  scenes:[['seqta4','Победителя награждают',null],['seqta1','Люди собираются на майдане',0],['seqta3','Дутан появляется из-за холма вторым'],['seqta2','Всадники выходят на скачки',1],['storyta3','Дутан появляется из-за холма первым',2]],
  objects:[['ta2','Пояс борца'],['ch2','Нарты'],['ta1','Скакун'],['ta3','Бегуны'],['journal-towel','Полотенце'],['ribbon','Лента для награждения']],
  clues:[0,2,3], nearClue:'Почему лента для награждения не заменит борцовский пояс? Какое условие её исключает?',
  rules:['Для скачек нужен тот, на ком едут верхом.','Для борьбы нужен предмет, который борец надевает на пояс и за который его держит соперник.','Третья улика показывает участников, которые бегут без коня.'],
  condition:'Участник выбрал скачки?', cases:['Выбрал борьбу','Выбрал скачки'],
  commands:['Надень борцовский пояс','Приготовь скакуна','Выйди на площадку','Возьми солонку'],
  program:[1,0,2],
  order:[['storyta1','Объявляют скачки и борьбу'],['seqta1','Люди собираются на майдане'],['seqta2','Коней пускают на скачки'],['storyta3','Дутан прибывает первым']],
  broken:[0,1,3,2]
 },
 {
  source:['«Сказки народов Севера», с. 145–146','https://mir-knigi.com/files/1/9/7/9/5/5/pdf-197955.pdf'],
  context:'Эрмэчын хочет участвовать в гонках. У его семьи нет оленей. Нарта — сани для езды по снегу.',
  prose:[['Вскоре хозяин стойбища объявил, чтобы все готовили оленей — будут гонки.'],['Сосед дал ему старую, поломанную нарту. ','Починил её Эрмэчын'],['И Эрмэчын свою нарту тащит.']],
  evidence:[[0,0],[1,1],[2,0]],
  scenes:[['storych3','Эрмэчын сам везёт нарту',2],['ta1','Эрмэчын покупает коня'],['seqch4','Нарту везёт семейный олень'],['storych1','Хозяин стойбища объявляет гонки',0],['storych2','Эрмэчын чинит нарту',1]],
  objects:[['ta1','Конь'],['ch1','Северный олень'],['ch2','Нарты'],['ribbon','Декоративная лента'],['ch3','Упряжь'],['ta2','Пояс борца']],
  clues:[1,2,4], nearClue:'Почему декоративная лента не заменит упряжь? Какое условие её исключает?',
  rules:['Одна улика — животное с ветвистыми рогами.','Вторая — то, на чём едут по снегу.','Третья крепится к животному и нартам, чтобы животное могло везти их за собой.'],
  condition:'Нарта сломана?', cases:['Нарта исправна','Нарта сломана'],
  commands:['Выходи на старт','Почини нарту','Оставь нарту как есть','Убери нарту со старта'],
  program:[1,2,0],
  order:[['storych1','Объявляют гонки'],['seqch2','Сосед даёт старую нарту'],['storych2','Эрмэчын чинит нарту'],['storych3','Эрмэчын тащит нарту сам']],
  broken:[0,2,1,3]
 }
];

const missionInstructions=[
 'Разгадайте три названия. В третьем ребусе две команды перепутаны. Исправьте порядок номеров у слова «КЛЮЧ».',
 'К отрывку подходят три из пяти картинок. Коснитесь подчёркнутой фразы, затем выберите картинку к ней. Соберите три пары.',
 'Выберите три улики по всем условиям. Найдите одну похожую лишнюю картинку и обсудите, какое условие её исключает.',
 'Соберите одну программу для двух случаев. Выполните обе проверки и посмотрите, что получилось.',
 'В программе перепутаны две команды. Коснитесь двух карточек, чтобы поменять их местами. Восстановите порядок по отрывку. Обсудите в команде, почему одно событие должно случиться раньше другого.',
 'Сначала найдите карточку, которая совпадает с уликами вашей команды. Она откроет шифр с названием традиции.'
];
const traditionProfiles=[
 {find:'В былине Илью зовут остаться и обещают угостить хлебом и солью.',things:'Каравай, соль, полотенце',act:'Хозяева подносят гостю хлеб и соль.',why:'Показать гостю, что ему рады.'},
 {find:'В сказке люди собираются на майдане и смотрят скачки.',things:'Скакун, борцовский пояс',act:'Участники скачут верхом, бегут и борются.',why:'Собраться на праздник после весенних полевых работ.'},
 {find:'В сказке Эрмэчын готовит нарту и сам тянет её на гонке.',things:'Олень, нарты, упряжь',act:'Участники соревнуются на оленьих упряжках.',why:'Почтить труд оленеводов и показать их мастерство.'}
];
function clueNotebook(d,step){
 if(step<2||step>5)return '';
 const profile=traditionProfiles[tales.indexOf(d)];
 return '<details class="clue-notebook" '+(step===5?'open':'')+'><summary>Дневник улик</summary><dl>'+
  '<div><dt>След в сказании</dt><dd>'+profile.find+'</dd></div>'+
  (step>=3?'<div><dt>Что используют</dt><dd>'+profile.things+'</dd></div>':'')+
  (step>=4?'<div><dt>Что делают</dt><dd>'+profile.act+'</dd></div>':'')+
  '</dl></details>';
}
function profileText({things,act,why},reveal){
 return '<dl><div><dt>Что используют</dt><dd>'+things+'</dd></div>'+
  '<div><dt>Что делают</dt><dd>'+act+'</dd></div>'+
  (reveal?'<div><dt>Зачем</dt><dd>'+why+'</dd></div>':'')+'</dl>';
}
function compareProfiles(reveal=false){
 return '<div class="tradition-profiles">'+traditionProfiles.map((profile,i)=>'<article><h3>'+
  (reveal?tales[i].name:'Карточка '+(i+1))+'</h3>'+profileText(profile,reveal)+'</article>').join('')+'</div>';
}
const newMissionDraft=()=>({cards:[],fields:{},checks:{},order:null,pending:null,routeOpen:false,quote:null,pairs:{}});
let missionDraft=newMissionDraft();
const trackOf=d=>missionTracks[tales.indexOf(d)];
const museumRoutes=[
 {art:'route-window',title:'Резные наличники',caption:'Деревянная рама вокруг окна и ставни с вырезанными птицами.',clue:'На раме окна и на ставнях вырезаны узоры.',feature:'Резьба по дереву вокруг окна',url:'https://rusmuseumvrm.ru/data/collections/folk_art/onid-2579_onid-2584/index.php'},
 {art:'route-boots',title:'Ичиги',caption:'Узорные сапожки из сшитых кусочков цветной кожи.',clue:'Узор на сапогах собран из сшитых разноцветных кусочков.',feature:'Узор из кусочков цветной кожи',url:'https://tatarica.org/ru/razdely/narody/tatary/narodnoe-iskusstvo/mozaika-kozhanaya'},
 {art:'route-yaranga',title:'Яранга и нарты',caption:'Переносное жилище на каркасе и сани с оленьей упряжью.',clue:'Рядом с переносным домом стоят сани и олень.',feature:'Переносной дом и оленья упряжка',url:'https://www.chukotka-museum.ru/collection/yaranga'}
];
function routeTask(d){
 const clue=museumRoutes[tales.indexOf(d)];
 return '<div class="route-handout">'+picture(clue.art,'Подсказка вашего стола')+'<div><p>'+clue.clue+'</p>'+
  missionSelect('people','Какой народ исследует ваш стол?',indexed(peoples))+
  missionSelect('feature','Какая деталь помогла догадаться?', [2,0,1].map(i=>[i,museumRoutes[i].feature]))+'</div></div>';
}
const selectionKey=([row,column])=>row+'-'+column;
function quoteText(track,key){
 const [row,part]=key.split('-').map(Number);
 return track.prose[row][part].trim().replace(/[,.]$/,'');
}
function trackExcerpt(track,selectable=false){
 return '<blockquote class="original-excerpt'+(track.verse?' verse-excerpt':'')+'">'+track.prose.map((parts,row)=>'<p>'+parts.map((part,column)=>{
  if(!selectable||!track.evidence.some(([r,c])=>r===row&&c===column))return part;
  const key=selectionKey([row,column]);
  const chosen=missionDraft.quote===key;
  return (part.startsWith(' ')?' ':'')+btn(part.trim(),'quote-'+key,'inline-quote'+(chosen?' picked':''),chosen)+(part.endsWith(' ')?' ':'');
 }).join('')+(row<track.prose.length-1&&!track.verse?' […]':'')+'</p>').join('')+'</blockquote>'+(track.after?'<p class="story-context">'+track.after+'</p>':'')+
  '<p class="story-source">Источник: <a href="'+track.source[1]+'" target="_blank" rel="noopener noreferrer">'+track.source[0]+'</a></p>';
}
function evidenceChoices(track){
 return '<div class="choices lesson-choices evidence-choices">'+track.scenes.map(([art,label],i)=>{
  const selected=Object.hasOwn(missionDraft.pairs,i);
  const action=selected?'unpair-':'pair-';
  const caption=selected?'Убрать пару для картинки '+(i+1):'Картинка '+(i+1)+': '+label;
  return '<article>'+btn(picture(art,caption),action+i,selected?'picked':'',selected)+
   (selected?'<p class="pair-quote">«'+quoteText(track,missionDraft.pairs[i])+'»</p>':'')+'</article>';
 }).join('')+'</div>';
}

function missionSelect(name,label,values){
 const actual=missionDraft.fields[name]??'';
 return '<label for="task-'+name+'">'+label+'</label><select id="task-'+name+'" data-task-field="'+name+'"><option value="">Выберите вариант</option>'+
  values.map(([value,text])=>'<option value="'+value+'" '+(String(value)===actual?'selected':'')+'>'+text+'</option>').join('')+'</select>';
}
function missionInput(name,label){
 const value=(missionDraft.fields[name]??'').replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]));
 return '<label for="task-'+name+'">'+label+'</label><input id="task-'+name+'" data-task-field="'+name+'" autocomplete="off" value="'+value+'">';
}
const indexed=values=>values.map((v,i)=>[i,v]);
const selectedCards=cards=>[...cards].sort((a,b)=>a-b).join(',');
const sceneIds=track=>track.scenes.flatMap((entry,i)=>Number.isInteger(entry[2])?[i]:[]);
function imageChoices(entries, action, active=[]){
 return '<div class="choices lesson-choices">'+entries.map(([art,label],i)=>btn(picture(art,label),action+i,active.includes(i)?'picked':'',active.includes(i))).join('')+'</div>';
}
function codeRows(d){
 const main=[...d.word].map(c=>alphabet.indexOf(c)+1);
 const valid=[...main,main[0]], other=[...main,main[0]===33?32:main[0]+1];
 return d.prefix==='ta'?[other,valid]:[valid,other];
}
const alphabetTable=()=>'<div class="alphabet mission-alphabet">'+[...alphabet].map((c,i)=>'<span><b>'+c+'</b> '+(i+1)+'</span>').join('')+'</div>';
const recordLabel=i=>i===0?'Запись А':'Запись Б';
function programResult(track,draft,index){
 const ids=['then','else','after'].map(id=>draft.fields[id]);
 if(ids.some(id=>id==null||id===''))return null;
 const branch=index===1?0:1;
 return {
  trace:[track.commands[ids[branch]],track.commands[ids[2]]].join(' → '),
  ok:Number(ids[branch])===track.program[branch]&&Number(ids[2])===track.program[2]
 };
}
function commandOrder(track,order,interactive){
 return '<ol class="command-order">'+order.map((id,i)=>{
  const content=picture(...track.order[id]);
  return '<li>'+(interactive?btn(content,'swap-'+i,missionDraft.pending===i?'picked':'',missionDraft.pending===i):content)+'</li>';
 }).join('')+'</ol>';
}
function missionTask(d,step){
 const track=trackOf(d);
 if(step===0)return [0,1,2].map(i=>rebus(i)+(i===2?missionSelect('repair','Как исправить номера у слова «КЛЮЧ»?',[[0,'Оставить 4, 1'],[1,'Поставить 1, 4'],[2,'Выбрать 2, 3']]):'')+missionInput('rebus'+i,'Название народа '+(i+1))).join('');
 if(step===1)return '<section class="task-reading"><h3>'+d.story+'</h3><p class="story-context">'+track.context+'</p>'+
  trackExcerpt(track,true)+'</section><p class="evidence-status" role="status">'+(missionDraft.quote===null?'Собрано пар: '+Object.keys(missionDraft.pairs).length+' из 3':'Выделено: «'+quoteText(track,missionDraft.quote)+'». Теперь выберите картинку.')+'</p>'+evidenceChoices(track);
 if(step===2)return (track.guestBridge?'<p>'+track.guestBridge+'</p>':'')+'<ul class="mission-rules">'+track.rules.map(s=>'<li>'+s+'</li>').join('')+'</ul>'+
  imageChoices(track.objects,'task-card-',missionDraft.cards);
 if(step===3)return '<div class="panel program-board"><strong>Условие. '+track.condition+'</strong>'+
  missionSelect('then','Если да',indexed(track.commands))+missionSelect('else','Иначе',indexed(track.commands))+
  missionSelect('after','После любой ветки',indexed(track.commands))+'</div><div class="program-tests">'+
  track.cases.map((label,i)=>'<section>'+btn('Проверить: '+label,'test-'+i)+
   (missionDraft.checks[i]?'<p role="status">'+missionDraft.checks[i].trace+'. <strong>'+(missionDraft.checks[i].ok?'Подходит':'Не подходит')+'</strong></p>':'')+'</section>').join('')+
  '</div><details class="bonus"><summary>Если справились быстро</summary><p>Какой проверочный случай покажет ошибку, если последнюю команду выполнить только после ветки «Если да»?</p></details>';
 if(step===4)return '<details class="bonus"><summary>Открыть отрывок сказания</summary>'+trackExcerpt(track)+'</details>'+
  commandOrder(track,missionDraft.order??track.broken,true)+btn('Сбросить перестановку','mission-reset');
 if(missionDraft.fields.profile!==String(tales.indexOf(d)))return compareProfiles()+
  missionSelect('profile','Какая карточка совпадает с вашими уликами?',[[0,'Карточка 1'],[1,'Карточка 2'],[2,'Карточка 3']]);
 return '<p><strong>Шифр открыт.</strong> В правильной записи последнее число повторяет первое. Отбросьте последнее число и прочитайте слово по таблице.</p>'+
  '<div class="cipher-records">'+codeRows(d).map((row,i)=>'<section><b>'+recordLabel(i)+'</b><div class="cipher">'+row.map(n=>'<span class="cipher-card">'+n+'</span>').join('')+'</div></section>').join('')+
  '</div>'+alphabetTable()+missionSelect('record','Какая запись прошла проверку?',[[0,recordLabel(0)],[1,recordLabel(1)]])+missionInput('word','Слово-ключ');
}
function missionError(d,step,draft){
 const track=trackOf(d),f=draft.fields;
 if(step===0)return f.repair==='1'&&[0,1,2].every(i=>norm(f['rebus'+i]??'')===peoples[i].toUpperCase())?'':'Проверьте названия и порядок букв в слове «КЛЮЧ».';
 if(step===1){
  if(Object.keys(draft.pairs).length!==3)return 'Сначала соберите три пары. Для каждой выделите слова и выберите картинку.';
  return sceneIds(track).every(i=>draft.pairs[i]===selectionKey(track.evidence[track.scenes[i][2]]))?'':'Проверьте, описывают ли выделенные слова именно то, что происходит на каждой картинке.';
 }
 if(step===2)return selectedCards(draft.cards)===selectedCards(track.clues)?'':'Проверьте выбранные предметы по всем трём условиям.';
 if(step===3)return draft.checks[0]?.ok&&draft.checks[1]?.ok?'':'Обе проверки должны пройти. Исправьте программу и выполните их ещё раз.';
 if(step===4)return (draft.order??track.broken).join('')==='0123'?'':'Сверьте порядок действий с отрывком.';
 if(f.profile!==String(tales.indexOf(d)))return 'Сверьте предметы и действия в дневнике улик с карточками.';
 const rows=codeRows(d);
 return f.record!=null&&f.record!==''&&rows[f.record][0]===rows[f.record].at(-1)&&norm(f.word??'')===d.word?'':'Проверьте первое и последнее числа. Затем расшифруйте слово.';
}
