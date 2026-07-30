/* Le Lexique / El Léxico — engine v3
   Shared logic; language-specific parts live only in CFG and T blocks.
   v3 additions: direction-split SRS, dictation (TTS), leech deck, exam mode,
   weekly assignment, per-lesson export (code v2), print support.
*/
(function(){
"use strict";

/*CFG-START*/
const CFG={
  key:"es",                       // corpus field with target-language variants
  ls:"lexico-es-v1",              // storage key (kept from v2 for migration)
  prefix:"LEXES2.",               // export code prefix (payload v2)
  ttsLang:"es-ES",
  artRe:/^(el |la |los |las |un |una |unos |unas |lo )/,
  accents:["á","é","í","ó","ú","ñ","ü","¡","¿"],
  FORMS_URL:"",                   // paste the MS Forms base URL here
  FORMS_FIELD_NAME:"",            // r… token for the name question
  FORMS_FIELD_CODE:""             // r… token for the code question
};
/*CFG-END*/

/*T-START*/
const T={
  padLabel:"Tildes y signos españoles",
  homeTitle:"Tus listas de vocabulario",
  homeLede:"Las listas reproducen exactamente el cuaderno: elige una unidad y luego una lección. Consulta la lista o practica escribiendo tus respuestas — en los dos sentidos. Tu progreso se guarda en este dispositivo; exporta tu código en Progreso para enviárselo al profesor.",
  nameLabel:"Tu nombre (para el código exportado)",
  namePh:"Nombre + inicial, p. ej. Lucía G.",
  dueCard:n=>n+" palabra"+(n>1?"s":"")+" por repasar hoy",
  startReview:"Empezar el repaso →",
  unitsLabel:"Unidades",
  unitMeta:(l,w,s,m)=>`${l} lecciones · ${w} palabras · ${s} vistas · ${m} dominadas`,
  lessonLine:(n,t,c)=>`Lección ${n} — ${t} (${c} palabras)`,
  lessonMeta:(s,m)=>`${s} vistas · ${m} dominadas`,
  accSuffix:" % de precisión",
  list:"Lista", practise:"Practicar",
  backUnits:"← Volver a las unidades", practiseThis:"Practicar esta lista",
  print:"Imprimir",
  colTarget:"Español", colEn:"English", colStatus:"Estado",
  stMast:"dominada", stCur:"en curso", stNew:"sin ver",
  listLegend:"○ sin ver · ◐ en curso · ● dominada (intervalo ≥ 3 semanas). Las formas separadas por « ; » son intercambiables: cualquiera cuenta como correcta.",
  back:"← Volver",
  dirLabel:"Dirección de traducción",
  dirEnFr:"Inglés → Español", dirFrEn:"Español → Inglés", dirMix:"Mixto", dirDict:"Dictado 🔊",
  dictNoTts:"Tu navegador no ofrece voz — dictado no disponible",
  startLesson:"Empezar — toda la lección",
  reviewTitle:"Repaso del día",
  reviewLede:n=>`${n} tarjeta${n>1?"s":""} han llegado a su fecha de repaso (todas las unidades, producción primero). La repetición espaciada elige por ti.`,
  reviewEmpty:"Nada que repasar por ahora — practica una lección desde Inicio, y las palabras volverán aquí en el momento adecuado.",
  nWords:"Número de palabras", all:"Todo", start:"Empezar",
  quit:"← Salir",
  metaEnFrArt:"inglés → español (con el artículo)", metaEnFr:"inglés → español",
  metaFrEn:"español → inglés", metaDict:"dictado — escucha y escribe",
  replay:"🔊 Escuchar otra vez",
  alsoPrompt:"también: ",
  phTarget:"tu respuesta en español…", phEn:"your answer in English…",
  check:"Comprobar", next:"Siguiente →",
  exact:"Exacto.", accentTier:"Bien — pero cuidado con las tildes.",
  artTier:"La palabra es correcta — revisa el artículo.",
  artWrong:"El artículo no es correcto — el género cuenta como gramática.",
  typoTier:"Casi — revisa la ortografía.", wrong:"No.",
  enTypo:"Bien — pequeño error de ortografía.",
  altNote:v=>["Tu respuesta « ",v," » también figura en tus listas con este sentido — las dos valen."],
  sibNote:"También en tus listas con este sentido: ",
  sessDone:"Sesión terminada", qs:"preguntas", right:"acertadas", prec:"precisión",
  toReview:"Para repasar", cont:"Continuar", seeProgress:"Ver mi progreso",
  leechTitle:"Palabras rebeldes", leechCard:n=>`${n} palabra${n>1?"s":""} rebelde${n>1?"s":""} — falladas una y otra vez`,
  leechGo:"Domarlas →", leechLabel:"Rebeldes",
  examTab:"Examen", examTitle:"Modo examen",
  examLede:"Preguntas al azar de las unidades elegidas, dirección mixta, sin correcciones hasta el final — como en un examen de verdad. El resultado se guarda en tu código.",
  examUnits:"Unidades del examen", examStart:"Empezar el examen",
  examNeedUnits:"Elige al menos una unidad.",
  examDone:"Examen terminado", examScore:"nota", examWrong:"Respuestas incorrectas",
  examGiven:"tu respuesta", examNone:"(en blanco)", examAgain:"Otro examen",
  taskTitle:"Tarea de la semana", taskDone:"hecha ✓", taskPending:"pendiente",
  progressTitle:"Progreso",
  progressLede:"Tu progreso por unidad, tus lecciones más frágiles y tu código para enviar al profesor.",
  kSeen:"palabras vistas / ", kMast:"dominadas (≥ 3 sem.)", kDue:"repasos pendientes",
  kProd:"precisión producción", kRec:"precisión reconocimiento",
  byUnit:"Por unidad",
  thUnit:"Unidad", thSeen:"Vistas", thMast:"Dominadas", thAcc:"Precisión",
  weakLessons:"Lecciones por reforzar",
  weakEmpty:"Aún no hay datos suficientes — practica algunas lecciones.",
  weakLine:(u,n)=>`${u} · Lección ${n}`,
  examsHist:"Tus exámenes",
  sendTitle:"Enviar al profesor",
  sendFormsTxt:"Haz clic en « Enviar por MS Forms »: el formulario se abre con tu nombre y tu código ya rellenados — solo te queda pulsar Enviar. El código solo contiene tus estadísticas y el nombre escrito en Inicio.",
  sendCopyTxt:"Copia este código y envíaselo a tu profesor (correo, Teams…). Solo contiene tus estadísticas y el nombre escrito en Inicio.",
  sendForms:"Enviar por MS Forms", copyCode:"Copiar el código",
  backup:"Copia de seguridad (.json)", restore:"Restaurar copia", reset:"Reiniciar",
  resetConfirm:"¿Borrar todo el progreso en este dispositivo? Esta acción es definitiva.",
  restored:"Copia restaurada.", badFile:"Archivo no reconocido — elige una copia exportada desde este sitio.",
  noName:"(sin nombre)",
  backupFile:"lexico-guardado.json",
  sessionLabel:(u,n)=>`${u} · Lección ${n}`, reviewLabel:"Repaso", examLabel:"Examen"
};
/*T-END*/

/* ───────── state & migration ───────── */
const DAY=86400000;
let S=load();
function load(){
  let s=null;
  try{ const r=localStorage.getItem(CFG.ls); if(r) s=JSON.parse(r); }catch(e){}
  if(!s) s={name:"",srs:{},sessions:[],exams:[],created:Date.now(),v:3};
  s.srs=s.srs||{}; s.sessions=s.sessions||[]; s.exams=s.exams||[];
  if(!s.v||s.v<3){ // split legacy per-entry records into production/recognition
    const old=s.srs; s.srs={};
    Object.keys(old).forEach(id=>{
      if(id.indexOf("|")>=0){ s.srs[id]=old[id]; return; }
      s.srs[id+"|f"]=JSON.parse(JSON.stringify(old[id]));
      s.srs[id+"|r"]=JSON.parse(JSON.stringify(old[id]));
    });
    s.v=3;
  }
  return s;
}
function save(){ try{ localStorage.setItem(CFG.ls, JSON.stringify(S)); }catch(e){} }

/* ───────── indexes ───────── */
const K=CFG.key;
const byId={}; CORPUS.forEach(e=>byId[e.id]=e);
const UNITS={}, UNIT_ORDER=[];
CORPUS.forEach(e=>{
  if(!UNITS[e.unit]){ UNITS[e.unit]={name:e.unitName, ids:[], lessons:{}, lessonOrder:[]}; UNIT_ORDER.push(e.unit); }
  const u=UNITS[e.unit]; u.ids.push(e.id);
  if(!u.lessons[e.lesson]){ u.lessons[e.lesson]={title:e.lessonTitle, ids:[]}; u.lessonOrder.push(e.lesson); }
  u.lessons[e.lesson].ids.push(e.id);
});

/* ───────── SM-2, direction-split ─────────
   rec key = `${id}|f` production (EN → target)  ·  `${id}|r` recognition (target → EN) */
function rk(id,dir){ return id+"|"+(dir==="fren"?"r":"f"); }  // dict & enfr grade production
function srsGet(k){ return S.srs[k]||(S.srs[k]={ef:2.5,int:0,reps:0,due:0,seen:0,ok:0,lapses:0}); }
function srsGrade(id,dir,q){
  const r=srsGet(rk(id,dir));
  r.seen++; if(q>=3)r.ok++;
  if(q<3){ r.reps=0; r.int=0; r.lapses++; r.due=Date.now(); }
  else{ r.reps++;
    if(r.reps===1)r.int=1; else if(r.reps===2)r.int=6; else r.int=Math.round(r.int*r.ef);
    r.ef=Math.max(1.3, r.ef+(0.1-(5-q)*(0.08+(5-q)*0.02)));
    r.due=Date.now()+r.int*DAY;
  }
  save();
}
const recOf=(id,d)=>S.srs[id+"|"+d];
const isSeen=id=>{const f=recOf(id,"f"),r=recOf(id,"r");return (f&&f.seen>0)||(r&&r.seen>0)};
const isMastered=id=>{const f=recOf(id,"f");return f&&f.int>=21};          // production is the exam skill
function dueDirs(id){
  const out=[]; const f=recOf(id,"f"), r=recOf(id,"r");
  if(f&&f.seen>0&&f.due<=Date.now()) out.push("enfr");
  if(r&&r.seen>0&&r.due<=Date.now()) out.push("fren");
  return out;
}
const isDue=id=>dueDirs(id).length>0;
function leeches(){
  const out=[];
  Object.keys(S.srs).forEach(k=>{
    const r=S.srs[k];
    if(r.lapses>=3 && r.int<21){
      const [id,d]=k.split("|");
      if(byId[id]) out.push({id, dir:d==="r"?"fren":"enfr", lapses:r.lapses});
    }
  });
  return out.sort((a,b)=>b.lapses-a.lapses);
}

/* ───────── utils ───────── */
const $=s=>document.querySelector(s);
function el(tag,attrs,...kids){
  const n=document.createElement(tag);
  if(attrs)for(const k2 in attrs){
    if(k2==="class")n.className=attrs[k2];
    else if(k2==="html")n.innerHTML=attrs[k2];
    else if(k2.startsWith("on"))n.addEventListener(k2.slice(2),attrs[k2]);
    else n.setAttribute(k2,attrs[k2]);
  }
  kids.flat().forEach(c=>{ if(c==null)return; n.append(c.nodeType?c:document.createTextNode(c)); });
  return n;
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pct(a,b){return b?Math.round(100*a/b):0}
function stripAcc(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/g,"oe").replace(/æ/g,"ae")}
function normFr(s){return s.toLowerCase().replace(/’/g,"'").replace(/\s*\([^)]*\)/g,"").replace(/\.{3}$/,"").replace(/[¡!¿?]/g,"").replace(/\s+/g," ").trim()}
function stripArt(s){return s.replace(CFG.artRe,"")}
function normEn(s){return s.toLowerCase().replace(/’/g,"'").replace(/-/g," ").replace(/(\w)iz(e[sdr]?|ing|ation)\b/g,"$1is$2").replace(/\s*\([^)]*\)/g,"").replace(/\.{3}$/,"").replace(/[!?.]+$/,"").replace(/\s+/g," ").trim()}
function stripEnLead(s){return s.replace(/^(the |a |an |to )/,"")}
function levDist(a,b,max){
  if(a===b)return 0;
  if(Math.abs(a.length-b.length)>max)return max+1;
  let prev=Array(b.length+1).fill(0).map((_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur=[i]; let rowMin=i;
    for(let j=1;j<=b.length;j++){
      cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a[i-1]===b[j-1]?0:1));
      if(cur[j]<rowMin)rowMin=cur[j];
    }
    if(rowMin>max)return max+1;
    prev=cur;
  }
  return prev[b.length];
}
function nearMiss(a,b){ // grammar-safe: suffix zone (last 2 chars of each word) must match exactly
  const ta=a.split(" "), tb=b.split(" ");
  if(ta.length!==tb.length) return false;
  const phraseTol=Math.max(a.length,b.length)>=12?2:1;
  let edits=0;
  for(let i=0;i<ta.length;i++){
    const wa=ta[i], wb=tb[i];
    if(wa===wb) continue;
    if(Math.max(wa.length,wb.length)<5) return false;
    if(wa.slice(-2)!==wb.slice(-2)) return false;
    const d=levDist(wa.slice(0,-2), wb.slice(0,-2), 2);
    if(d>2) return false;
    edits+=d; if(edits>phraseTol) return false;
  }
  return edits>0 && edits<=phraseTol;
}

/* ───────── cross-acceptance indexes ───────── */
function xLexkey(s){
  s=s.toLowerCase().replace(/’/g,"'").replace(/\s*\([^)]*\)/g,"");
  s=s.replace(CFG.artRe,"");
  s=s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/g,"oe").replace(/-/g," ");
  return s.replace(/\s+/g," ").trim();
}
function xCanonEn(s){
  s=s.toLowerCase().replace(/’/g,"'").replace(/-/g," ").replace(/\s*\([^)]*\)/g,"");
  s=s.replace(/^(the |a |an |to )/,"").replace(/\.{3}$/,"");
  return s.replace(/\s+/g," ").trim();
}
const GLOSS_TO_ENTRIES={}, LEX_TO_GLOSSES={};
CORPUS.forEach(e=>{
  e.en.forEach(g=>{const c=xCanonEn(g);(GLOSS_TO_ENTRIES[c]=GLOSS_TO_ENTRIES[c]||[]).push(e)});
  e[K].forEach(f=>{const lk=xLexkey(f);const set=(LEX_TO_GLOSSES[lk]=LEX_TO_GLOSSES[lk]||new Set());e.en.forEach(g=>set.add(g))});
});
const ANSWER_FORMS=new Set();
CORPUS.forEach(e=>e[K].forEach(v=>ANSWER_FORMS.add(stripAcc(stripArt(normFr(v))))));

/* ───────── answer checking ───────── */
function frTiers(raw, variants, allowFuzzy){
  const vars=variants.map(normFr);
  if(vars.includes(raw)) return {q:5,msg:T.exact,cls:"good"};
  if(vars.map(stripAcc).includes(stripAcc(raw))) return {q:4,msg:T.accentTier,cls:"good"};
  const rawHasArt = raw!==stripArt(raw);
  if(vars.map(v=>stripArt(v)).includes(stripArt(raw))||vars.map(v=>stripAcc(stripArt(v))).includes(stripAcc(stripArt(raw)))){
    const target=variants.map(normFr).find(v=>stripAcc(stripArt(v))===stripAcc(stripArt(raw)));
    const varHasArt = target && target!==stripArt(target);
    if(rawHasArt && varHasArt){
      const ra=raw.match(CFG.artRe)[0], va=target.match(CFG.artRe)[0];
      if(ra!==va) return {q:1,msg:T.artWrong,cls:"bad"};
    }
    if(rawHasArt && !varHasArt) return {q:5,msg:T.exact,cls:"good"};
    return {q:3,msg:T.artTier,cls:"good"};
  }
  if(allowFuzzy && vars.some(v=>nearMiss(stripAcc(stripArt(v)),stripAcc(stripArt(raw)))))
    return {q:3,msg:T.typoTier,cls:"good"};
  return null;
}
function checkFr(ans, entry, promptedGloss){
  const raw=normFr(ans); if(!raw)return null;
  const rawForm=stripAcc(stripArt(raw));
  const own=frTiers(raw, entry[K], false);
  if(own) return own;
  const sibs=(GLOSS_TO_ENTRIES[xCanonEn(promptedGloss||entry.en[0])]||[]).filter(x=>x.id!==entry.id);
  for(const s of sibs){
    const hit=frTiers(raw, s[K], false);
    if(hit) return {...hit, alt:s};
  }
  const inPool=[entry].concat(sibs).some(x=>x[K].some(v=>stripAcc(stripArt(normFr(v)))===rawForm));
  const allowFuzzy=inPool || !ANSWER_FORMS.has(rawForm);
  if(allowFuzzy){
    const own2=frTiers(raw, entry[K], true);
    if(own2) return own2;
    for(const s of sibs){
      const hit=frTiers(raw, s[K], true);
      if(hit) return {...hit, alt:s};
    }
  }
  return {q:1,msg:T.wrong,cls:"bad"};
}
function checkEn(ans, entry){
  const raw=normEn(ans); if(!raw)return null;
  const pool=new Set(entry.en);
  entry[K].forEach(f=>{const s=LEX_TO_GLOSSES[xLexkey(f)]; if(s)s.forEach(g=>pool.add(g))});
  const vars=[...pool].map(normEn);
  if(vars.includes(raw)||vars.map(stripEnLead).includes(stripEnLead(raw)))
    return {q:5,msg:T.exact,cls:"good"};
  if(vars.some(v=>nearMiss(stripEnLead(v),stripEnLead(raw))))
    return {q:4,msg:T.enTypo,cls:"good"};
  return {q:1,msg:T.wrong,cls:"bad"};
}

/* ───────── TTS ───────── */
const ttsOK="speechSynthesis" in window;
function speak(txt){
  if(!ttsOK)return;
  const u=new SpeechSynthesisUtterance(String(txt).replace(/\s*\([^)]*\)/g,"").replace(/;.*/,""));
  u.lang=CFG.ttsLang; u.rate=0.88;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
function speakBtn(txt,small){
  if(!ttsOK)return null;
  return el("button",{class:"speak"+(small?" small":""),type:"button",title:"🔊","aria-label":"🔊",
    onclick:ev=>{ev.stopPropagation();speak(txt)}},"🔊");
}

/* ───────── accent pad ───────── */
let padTarget=null;
const pad=(function(){
  const p=el("div",{class:"accent-pad hidden",role:"toolbar","aria-label":T.padLabel});
  CFG.accents.forEach(ch=>{
    const b=el("button",{type:"button",tabindex:"-1"},ch);
    b.addEventListener("mousedown",ev=>ev.preventDefault());
    b.addEventListener("click",()=>{
      if(!padTarget)return;
      const st=padTarget.selectionStart??padTarget.value.length, en=padTarget.selectionEnd??padTarget.value.length;
      padTarget.setRangeText(ch,st,en,"end");
      padTarget.dispatchEvent(new Event("input",{bubbles:true}));
      padTarget.focus();
    });
    p.append(b);
  });
  document.body.append(p);
  return p;
})();
function showPad(i){ padTarget=i; pad.classList.remove("hidden"); document.body.classList.add("pad-on"); }
function hidePad(){ padTarget=null; pad.classList.add("hidden"); document.body.classList.remove("pad-on"); }

/* ───────── router ───────── */
const VIEWS=["accueil","revision","examen","suivi"];
function go(v){
  hidePad();
  VIEWS.forEach(x=>{
    $("#view-"+x).classList.toggle("hidden",x!==v);
    $("#tab-"+x).setAttribute("aria-selected",x===v?"true":"false");
  });
  if(v==="accueil")renderAccueil();
  if(v==="revision")renderRevisionConfig();
  if(v==="examen")renderExamConfig();
  if(v==="suivi")renderSuivi();
  window.scrollTo(0,0);
}
VIEWS.forEach(v=>$("#tab-"+v).addEventListener("click",()=>go(v)));

function kpi(n,l){return el("div",{class:"kpi"},el("div",{class:"n"},String(n)),el("div",{class:"l"},l))}
function pills(items,current,on){
  const w=el("div",{class:"pill-select"});
  items.forEach(([val,label,dis])=>{
    const b=el("button",{class:val===current?"on":"",...(dis?{disabled:"",title:T.dictNoTts}:{}),
      onclick:()=>{on(val);[...w.children].forEach(c=>c.classList.remove("on"));b.classList.add("on")}},label);
    w.append(b);
  });
  return w;
}

/* ───────── assignment ───────── */
function assignment(){
  const a=window.ASSIGNMENT;
  if(!a||!a.label||!Array.isArray(a.lessons)||!a.lessons.length) return null;
  const since=Date.parse(a.since||"2000-01-01");
  const done=a.lessons.map(lid=>S.sessions.some(s=>s.lid===lid&&s.t>=since));
  return {...a, since, done};
}

/* ═════════ ACCUEIL ═════════ */
let openUnit=null;
function renderAccueil(){
  const v=$("#view-accueil"); v.innerHTML="";
  const dueN=CORPUS.reduce((n,e)=>n+dueDirs(e.id).length,0);
  const lee=leeches();
  const a=assignment();
  v.append(
    el("h2",null,T.homeTitle),
    el("p",{class:"lede"},T.homeLede),
    el("div",{class:"card"},
      el("label",{for:"student-name",style:"font-weight:600;font-size:.9rem"},T.nameLabel),
      el("input",{id:"student-name",class:"typed",style:"margin-top:8px",value:S.name||"",placeholder:T.namePh,
        oninput:e=>{S.name=e.target.value.trim();save()}})));
  if(a){
    const card=el("div",{class:"card",style:"margin-top:14px;border-color:var(--bleu)"},
      el("h3",null,T.taskTitle+" — "+a.label));
    a.lessons.forEach((lid,i)=>{
      const [uid]=lid.split(".");
      const L=UNITS[uid]&&UNITS[uid].lessons[lid];
      if(!L)return;
      card.append(el("div",{style:"display:flex;gap:10px;align-items:center;padding:4px 0"},
        el("span",{style:"flex:1"},T.lessonLine(lid.split(".")[1],L.title,L.ids.length)),
        el("span",{class:"session-count",style:a.done[i]?"color:var(--vert)":"color:var(--rouge)"},a.done[i]?T.taskDone:T.taskPending),
        el("button",{class:"btn small primary",onclick:()=>startLesson(uid,lid)},T.practise)));
    });
    v.append(card);
  }
  if(dueN) v.append(el("div",{class:"card",style:"margin-top:14px;border-color:var(--rouge)"},
    el("h3",null,T.dueCard(dueN)),
    el("div",{class:"btn-row"},el("button",{class:"btn primary",onclick:()=>go("revision")},T.startReview))));
  if(lee.length) v.append(el("div",{class:"card",style:"margin-top:14px;border-color:#B07B12"},
    el("h3",null,T.leechTitle+" ("+lee.length+")"),
    el("p",{style:"margin:4px 0 0;color:var(--ink-soft);font-size:.9rem"},T.leechCard(lee.length)),
    el("div",{class:"btn-row"},el("button",{class:"btn",onclick:startLeech},T.leechGo))));
  v.append(el("div",{class:"section-label"},T.unitsLabel));
  UNIT_ORDER.forEach(uid=>{
    const u=UNITS[uid];
    const mast=u.ids.filter(isMastered).length, seen=u.ids.filter(isSeen).length;
    const head=el("button",{class:"unit-tile",style:"width:100%",onclick:()=>{openUnit=openUnit===uid?null:uid;renderAccueil()}},
      el("div",{style:"flex:1"},
        el("div",{class:"u-code"},uid+(openUnit===uid?" ▾":" ▸")),
        el("div",{class:"u-name"},u.name),
        el("div",{class:"u-meta"},T.unitMeta(u.lessonOrder.length,u.ids.length,seen,mast)),
        el("div",{class:"u-bar"},el("i",{style:"width:"+pct(mast,u.ids.length)+"%"}))));
    v.append(head);
    if(openUnit===uid){
      const wrap=el("div",{style:"margin:6px 0 14px 10px;display:grid;gap:6px"});
      u.lessonOrder.forEach(lid=>{
        const L=u.lessons[lid];
        const n=L.ids.length, m=L.ids.filter(isMastered).length, s=L.ids.filter(isSeen).length;
        let a2=0,c2=0; L.ids.forEach(id=>["f","r"].forEach(d=>{const r=recOf(id,d);if(r){a2+=r.seen;c2+=r.ok}}));
        wrap.append(el("div",{class:"card",style:"display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px"},
          el("div",{style:"flex:1;min-width:220px"},
            el("div",{style:"font-weight:600"},T.lessonLine(lid.split(".")[1],L.title,n)),
            el("div",{class:"u-meta"},T.lessonMeta(s,m)+(a2?` · ${pct(c2,a2)}${T.accSuffix}`:"")),
            el("div",{class:"u-bar",style:"max-width:220px"},el("i",{style:"width:"+pct(m,n)+"%"}))),
          el("div",{class:"btn-row",style:"margin:0"},
            el("button",{class:"btn small ghost",onclick:()=>renderListe(uid,lid)},T.list),
            el("button",{class:"btn small primary",onclick:()=>startLesson(uid,lid)},T.practise))));
      });
      v.append(wrap);
    }
  });
}

/* — liste (printable) — */
function renderListe(uid,lid){
  const v=$("#view-accueil"); v.innerHTML="";
  const u=UNITS[uid], L=u.lessons[lid];
  v.append(
    el("div",{class:"session-bar no-print"},
      el("button",{class:"btn small ghost",onclick:renderAccueil},T.backUnits),
      el("button",{class:"btn small ghost",style:"margin-left:auto",onclick:()=>window.print()},T.print),
      el("button",{class:"btn small primary",onclick:()=>startLesson(uid,lid)},T.practiseThis)),
    el("h2",null,`${uid} ${u.name} · `+T.lessonLine(lid.split(".")[1],L.title,L.ids.length)));
  const tbl=el("table",{class:"stats"},
    el("thead",null,el("tr",null,el("th",null,T.colTarget),el("th",null,T.colEn),el("th",{class:"no-print",style:"width:70px"},T.colStatus))));
  const tb=el("tbody");
  L.ids.forEach(id=>{
    const e=byId[id];
    const st=isMastered(id)?"●":isSeen(id)?"◐":"○";
    const stTitle=isMastered(id)?T.stMast:isSeen(id)?T.stCur:T.stNew;
    tb.append(el("tr",null,
      el("td",null,el("b",null,e[K].join(" ; "))," ",speakBtn(e[K][0],true)),
      el("td",null,e.en.join(" ; ")),
      el("td",{class:"num no-print",title:stTitle,style:"color:"+(isMastered(id)?"var(--vert)":isSeen(id)?"var(--bleu)":"var(--muted)")},st)));
  });
  tbl.append(tb);
  v.append(tbl, el("p",{class:"no-print",style:"font-size:.82rem;color:var(--muted);margin-top:10px"},T.listLegend));
}

/* ═════════ SESSIONS ═════════ */
let sess=null, lessonPrefs={dir:"mixte"}, revLen=20;
function startLesson(uid,lid){
  go("accueil");
  const v=$("#view-accueil"); v.innerHTML="";
  const u=UNITS[uid], L=u.lessons[lid];
  v.append(
    el("div",{class:"session-bar"},el("button",{class:"btn small ghost",onclick:renderAccueil},T.back)),
    el("h2",null,T.lessonLine(lid.split(".")[1],L.title,L.ids.length)),
    el("div",{class:"card"},
      el("h3",null,T.dirLabel),
      pills([["enfr",T.dirEnFr],["fren",T.dirFrEn],["mixte",T.dirMix],["dict",T.dirDict,!ttsOK]],lessonPrefs.dir,d=>lessonPrefs.dir=d),
      el("div",{class:"btn-row"},
        el("button",{class:"btn primary",onclick:()=>{
          const ids=shuffle(L.ids);
          const q=ids.map((id,i)=>({id,dir:lessonPrefs.dir==="mixte"?(i%2?"fren":"enfr"):lessonPrefs.dir}));
          sess={queue:q,i:0,ok:0,wrong:[],back:renderAccueil,label:T.sessionLabel(uid,lid.split(".")[1]),view:"#view-accueil",lid,silent:false};
          renderQ();
        }},T.startLesson))));
}
function startLeech(){
  const q=leeches().slice(0,20).map(l=>({id:l.id,dir:l.dir}));
  if(!q.length)return;
  sess={queue:shuffle(q),i:0,ok:0,wrong:[],back:renderAccueil,label:T.leechLabel,view:"#view-accueil",lid:"leech",silent:false};
  go("accueil"); renderQ();
}
function renderRevisionConfig(){
  const v=$("#view-revision"); v.innerHTML="";
  // production first, then recognition
  const dueF=[],dueR=[];
  CORPUS.forEach(e=>{const d=dueDirs(e.id); if(d.includes("enfr"))dueF.push({id:e.id,dir:"enfr"}); if(d.includes("fren"))dueR.push({id:e.id,dir:"fren"})});
  const due=shuffle(dueF).concat(shuffle(dueR));
  v.append(
    el("h2",null,T.reviewTitle),
    el("p",{class:"lede"},due.length?T.reviewLede(due.length):T.reviewEmpty),
    due.length? el("div",{class:"card"},
      el("h3",null,T.nWords),
      pills([["10","10"],["20","20"],["30","30"],["999",T.all]],"20",n=>revLen=+n),
      el("div",{class:"btn-row"},el("button",{class:"btn primary",onclick:()=>{
        sess={queue:due.slice(0,revLen),i:0,ok:0,wrong:[],back:renderRevisionConfig,label:T.reviewLabel,view:"#view-revision",lid:"rev",silent:false};
        renderQ();
      }},T.start))):null);
}

/* ═════════ EXAM ═════════ */
let examUnits=new Set(), examLen=30;
function renderExamConfig(){
  const v=$("#view-examen"); v.innerHTML="";
  v.append(el("h2",null,T.examTitle), el("p",{class:"lede"},T.examLede),
    el("div",{class:"card"}, el("h3",null,T.examUnits)));
  const grid=el("div",{class:"pill-select",style:"margin-top:4px"});
  UNIT_ORDER.forEach(uid=>{
    const b=el("button",{class:examUnits.has(uid)?"on":"",onclick:()=>{
      examUnits.has(uid)?examUnits.delete(uid):examUnits.add(uid);
      b.classList.toggle("on");
    }},uid);
    grid.append(b);
  });
  const card=v.lastChild;
  card.append(grid,
    el("h3",{style:"margin-top:18px"},T.nWords),
    pills([["20","20"],["30","30"],["50","50"]],String(examLen),n=>examLen=+n),
    el("div",{class:"btn-row"},el("button",{class:"btn primary",onclick:()=>{
      if(!examUnits.size){alert(T.examNeedUnits);return}
      const ids=shuffle([...examUnits].flatMap(u=>UNITS[u]?UNITS[u].ids:[])).slice(0,examLen);
      const q=ids.map((id,i)=>({id,dir:i%2?"fren":"enfr"}));
      sess={queue:q,i:0,ok:0,wrong:[],back:renderExamConfig,label:T.examLabel,view:"#view-examen",lid:"exam",silent:true,answers:[]};
      renderQ();
    }},T.examStart)));
}

/* ═════════ question renderer (shared) ═════════ */
function renderQ(){
  const v=$(sess.view);
  hidePad();
  if(sess.i>=sess.queue.length)return sess.silent?examEnd(v):sessionEnd(v);
  v.innerHTML="";
  const p=pct(sess.i,sess.queue.length);
  v.append(el("div",{class:"session-bar"},
    el("button",{class:"btn small ghost",onclick:sess.back},T.quit),
    el("div",{class:"progress"},el("i",{style:"width:"+p+"%"})),
    el("span",{class:"session-count"},`${sess.i+1} / ${sess.queue.length}`),
    sess.silent?null:el("span",{class:"score-pill"},`✓ ${sess.ok}`)));
  const {id,dir}=sess.queue[sess.i], e=byId[id];
  const enfr=dir==="enfr", dict=dir==="dict";
  const hasArt=e[K].some(vv=>CFG.artRe.test(vv.toLowerCase()));
  const meta=dict?T.metaDict:enfr?(hasArt?T.metaEnFrArt:T.metaEnFr):T.metaFrEn;
  let promptNode;
  if(dict){
    promptNode=el("div",null,
      el("button",{class:"btn primary",onclick:()=>speak(e[K][0])},T.replay));
    setTimeout(()=>speak(e[K][0]),300);
  } else if(enfr){
    promptNode=el("div",{class:"headword",style:"font-family:var(--font-body);font-weight:600;font-size:1.5rem"},e.en[0]);
  } else {
    promptNode=el("div",{class:"headword"},e[K][0]," ",speakBtn(e[K][0]));
  }
  const others=(dict?[]:(enfr?e.en:e[K]).slice(1));
  const card=el("div",{class:"entry"},
    el("div",{class:"entry-meta"},`${sess.label} · ${meta}`),
    promptNode,
    others.length&&!sess.silent? el("div",{class:"gramm"},T.alsoPrompt+others.join(" ; ")):null);
  const targetLang = enfr||dict;
  const inp=el("input",{class:"typed",type:"text",autocapitalize:"off",autocomplete:"off",spellcheck:"false",
    placeholder:targetLang?T.phTarget:T.phEn});
  const row=el("div",{class:"btn-row"});
  const check=el("button",{class:"btn primary"},sess.silent?T.next:T.check);
  let done=false;
  function doCheck(){
    if(done)return;
    const res=targetLang? checkFr(inp.value,e,e.en[0]) : checkEn(inp.value,e);
    if(!res&&!sess.silent)return;
    done=true;
    const q=res?res.q:1;
    srsGrade(e.id, dict?"enfr":dir, q);
    if(q>=3)sess.ok++; else sess.wrong.push(e.id);
    if(sess.silent){
      sess.answers.push({id:e.id,dir,given:inp.value.trim(),q});
      sess.i++; renderQ(); return;
    }
    inp.disabled=true; check.disabled=true;
    hidePad();
    let sibs="";
    if(targetLang && q<3){
      const oth=(GLOSS_TO_ENTRIES[xCanonEn(e.en[0])]||[]).filter(x=>x.id!==e.id).map(x=>x[K][0]);
      if(oth.length) sibs=[...new Set(oth)].slice(0,3).join(" · ");
    }
    card.append(
      el("div",{class:"feedback "+res.cls},res.msg,
        sibs? el("span",{class:"note"},T.sibNote,sibs):null,
        res.alt? el("span",{class:"note"},...T.altNote(res.alt[K][0])):null,
        el("span",{class:"note"},
          el("b",null,e[K].join(" ; "))," ",speakBtn(e[K][0],true)," — ",e.en.join(" ; "))),
      nextBtn());
  }
  check.addEventListener("click",doCheck);
  inp.addEventListener("keydown",ev=>{if(ev.key==="Enter")doCheck()});
  row.append(check);
  card.append(inp,row);
  v.append(card);
  if(targetLang) showPad(inp);
  setTimeout(()=>inp.focus(),50);
}
function nextBtn(){
  const b=el("button",{class:"btn primary",onclick:()=>{sess.i++;renderQ()}},T.next);
  setTimeout(()=>b.focus(),50);
  return el("div",{class:"btn-row"},b);
}
function sessionEnd(v){
  hidePad();
  v.innerHTML="";
  S.sessions.push({t:Date.now(),n:sess.queue.length,ok:sess.ok,label:sess.label,lid:sess.lid});save();
  v.append(
    el("h2",null,T.sessDone),
    el("div",{class:"kpi-row"},
      kpi(sess.queue.length,T.qs), kpi(sess.ok,T.right), kpi(pct(sess.ok,sess.queue.length)+" %",T.prec)),
    sess.wrong.length? el("div",{class:"card"},
      el("h3",null,T.toReview),
      el("div",{style:"margin-top:8px"},
        [...new Set(sess.wrong)].map(id=>el("div",{style:"padding:4px 0;border-bottom:1px solid var(--line)"},
          el("b",null,byId[id][K].join(" ; "))," ",speakBtn(byId[id][K][0],true)," — ",byId[id].en.join(" ; "))))):null,
    el("div",{class:"btn-row"},
      el("button",{class:"btn primary",onclick:sess.back},T.cont),
      el("button",{class:"btn",onclick:()=>go("suivi")},T.seeProgress)));
}
function examEnd(v){
  hidePad(); v.innerHTML="";
  const p=pct(sess.ok,sess.queue.length);
  S.exams.push({t:Date.now(),units:[...examUnits],n:sess.queue.length,ok:sess.ok,pct:p});
  S.sessions.push({t:Date.now(),n:sess.queue.length,ok:sess.ok,label:T.examLabel,lid:"exam"});save();
  v.append(
    el("h2",null,T.examDone),
    el("div",{class:"kpi-row"},
      kpi(sess.queue.length,T.qs), kpi(sess.ok,T.right), kpi(p+" %",T.examScore)));
  const wrongs=sess.answers.filter(a=>a.q<3);
  if(wrongs.length){
    const card=el("div",{class:"card"},el("h3",null,T.examWrong));
    wrongs.forEach(a=>{
      const e=byId[a.id];
      card.append(el("div",{style:"padding:6px 0;border-bottom:1px solid var(--line)"},
        el("div",null,el("b",null,e[K].join(" ; "))," ",speakBtn(e[K][0],true)," — ",e.en.join(" ; ")),
        el("div",{style:"font-size:.85rem;color:var(--rouge)"},T.examGiven+": "+(a.given||T.examNone))));
    });
    v.append(card);
  }
  v.append(el("div",{class:"btn-row"},
    el("button",{class:"btn primary",onclick:renderExamConfig},T.examAgain),
    el("button",{class:"btn",onclick:()=>go("suivi")},T.seeProgress)));
}

/* ═════════ SUIVI ═════════ */
function renderSuivi(){
  const v=$("#view-suivi"); v.innerHTML="";
  const seenIds=CORPUS.map(e=>e.id).filter(isSeen);
  const mast=seenIds.filter(isMastered).length;
  const dueN=CORPUS.reduce((n,e)=>n+dueDirs(e.id).length,0);
  let fa=0,fc=0,ra=0,rc=0;
  CORPUS.forEach(e=>{
    const f=recOf(e.id,"f"); if(f){fa+=f.seen;fc+=f.ok}
    const r=recOf(e.id,"r"); if(r){ra+=r.seen;rc+=r.ok}
  });
  v.append(
    el("h2",null,T.progressTitle),
    el("p",{class:"lede"},T.progressLede),
    el("div",{class:"kpi-row"},
      kpi(seenIds.length,T.kSeen+CORPUS.length),
      kpi(mast,T.kMast),
      kpi(dueN,T.kDue),
      kpi(fa?pct(fc,fa)+" %":"—",T.kProd),
      kpi(ra?pct(rc,ra)+" %":"—",T.kRec)),
    el("div",{class:"section-label"},T.byUnit));
  const tbl=el("table",{class:"stats"},
    el("thead",null,el("tr",null,el("th",null,T.thUnit),el("th",null,T.thSeen),el("th",null,T.thMast),el("th",null,T.thAcc),el("th",null,""))));
  const tb=el("tbody");
  UNIT_ORDER.forEach(uid=>{
    const u=UNITS[uid], s=u.ids.filter(isSeen), m=u.ids.filter(isMastered);
    let ua=0,uc=0; u.ids.forEach(id=>["f","r"].forEach(d=>{const r=recOf(id,d);if(r){ua+=r.seen;uc+=r.ok}}));
    const acc=pct(uc,ua);
    tb.append(el("tr",null,
      el("td",null,el("b",null,uid)," ",u.name),
      el("td",{class:"num"},`${s.length}/${u.ids.length}`),
      el("td",{class:"num"},String(m.length)),
      el("td",{class:"num"},ua?acc+" %":"—"),
      el("td",null,el("div",{class:"bar"},el("i",{class:acc<60?"low":acc<80?"warn":"",style:"width:"+(ua?acc:0)+"%"})))));
  });
  tbl.append(tb); v.append(tbl);

  /* weakest lessons */
  const rows=[];
  UNIT_ORDER.forEach(uid=>UNITS[uid].lessonOrder.forEach(lid=>{
    let la=0,lc=0; UNITS[uid].lessons[lid].ids.forEach(id=>["f","r"].forEach(d=>{const r=recOf(id,d);if(r){la+=r.seen;lc+=r.ok}}));
    if(la>=5)rows.push({uid,lid,title:UNITS[uid].lessons[lid].title,acc:pct(lc,la)});
  }));
  rows.sort((x,y)=>x.acc-y.acc);
  v.append(el("div",{class:"section-label"},T.weakLessons));
  if(!rows.length)v.append(el("p",{style:"color:var(--muted)"},T.weakEmpty));
  else{
    const w=el("div",{class:"card"});
    rows.slice(0,8).forEach(r=>w.append(el("div",{style:"display:flex;gap:10px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)"},
      el("div",{style:"flex:1"},el("b",null,T.weakLine(r.uid,r.lid.split(".")[1]))," — "+r.title),
      el("span",{class:"session-count"},r.acc+" %"),
      el("button",{class:"btn small primary",onclick:()=>startLesson(r.uid,r.lid)},T.practise))));
    v.append(w);
  }

  /* exam history */
  if(S.exams.length){
    v.append(el("div",{class:"section-label"},T.examsHist));
    const w=el("div",{class:"card"});
    S.exams.slice(-8).reverse().forEach(x=>w.append(el("div",{style:"display:flex;gap:12px;padding:4px 0;border-bottom:1px solid var(--line)"},
      el("span",{class:"session-count"},new Date(x.t).toLocaleDateString()),
      el("span",{style:"flex:1"},x.units.join(", ")),
      el("b",null,x.pct+" %"),
      el("span",{class:"session-count"},x.ok+"/"+x.n))));
    v.append(w);
  }

  /* export */
  const code=buildExportCode();
  const ta=el("textarea",{class:"code",readonly:""},code);
  v.append(el("div",{class:"section-label"},T.sendTitle),
    el("div",{class:"card"},
      el("p",{style:"margin:0 0 10px"},CFG.FORMS_URL?T.sendFormsTxt:T.sendCopyTxt),
      ta,
      el("div",{class:"btn-row"},
        CFG.FORMS_URL? el("button",{class:"btn primary",onclick:()=>{window.open(
          CFG.FORMS_URL+"&"+CFG.FORMS_FIELD_NAME+"="+encodeURIComponent(S.name||T.noName)
                       +"&"+CFG.FORMS_FIELD_CODE+"="+encodeURIComponent(code),"_blank")}},T.sendForms):null,
        el("button",{class:"btn"+(CFG.FORMS_URL?" ghost":" primary"),onclick:async()=>{try{await navigator.clipboard.writeText(code)}catch(e){ta.select();document.execCommand("copy")}}},T.copyCode),
        el("button",{class:"btn ghost",onclick:downloadBackup},T.backup),
        el("button",{class:"btn ghost",onclick:restoreBackup},T.restore),
        el("button",{class:"btn ghost",style:"color:var(--rouge);border-color:var(--rouge)",onclick:()=>{
          if(confirm(T.resetConfirm)){localStorage.removeItem(CFG.ls);S=load();renderSuivi()}
        }},T.reset))));
}
function buildExportCode(){
  const u={};
  UNIT_ORDER.forEach(uid=>{
    const ids=UNITS[uid].ids, s=ids.filter(isSeen);
    if(!s.length)return;
    let a=0,c=0; ids.forEach(id=>["f","r"].forEach(d=>{const r=recOf(id,d);if(r){a+=r.seen;c+=r.ok}}));
    u[uid]=[s.length,ids.length,ids.filter(isMastered).length,pct(c,a)];
  });
  let l=[];
  UNIT_ORDER.forEach(uid=>UNITS[uid].lessonOrder.forEach(lid=>{
    const ids=UNITS[uid].lessons[lid].ids;
    const s=ids.filter(isSeen); if(!s.length)return;
    let a=0,c=0; ids.forEach(id=>["f","r"].forEach(d=>{const r=recOf(id,d);if(r){a+=r.seen;c+=r.ok}}));
    l.push([lid,s.length,ids.length,pct(c,a)]);
  }));
  const x=S.exams.slice(-5).map(e2=>[Math.round(e2.t/DAY),e2.pct,e2.n]);
  const a2=assignment();
  const payload={v:2,n:S.name||T.noName,t:Date.now(),
    o:{seen:CORPUS.map(e=>e.id).filter(isSeen).length,total:CORPUS.length,
       mast:CORPUS.map(e=>e.id).filter(isMastered).length,sess:S.sessions.length,lee:leeches().length},
    u,l,x, a:a2?{lab:a2.label,done:a2.done}:null};
  let code=CFG.prefix+btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  if(code.length>3800){ // MS Forms long-answer safety: keep weakest 30 lessons
    payload.l=l.slice().sort((p,q2)=>p[3]-q2[3]).slice(0,30);
    payload.lt=true;
    code=CFG.prefix+btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
  return code;
}
function downloadBackup(){
  const blob=new Blob([JSON.stringify(S)],{type:"application/json"});
  const a=el("a",{href:URL.createObjectURL(blob),download:T.backupFile});a.click();
}
function restoreBackup(){
  const inp=el("input",{type:"file",accept:".json"});
  inp.addEventListener("change",()=>{
    const f=inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{try{const s=JSON.parse(r.result);if(!s.srs)throw 0;localStorage.setItem(CFG.ls,r.result);S=load();save();renderSuivi();alert(T.restored)}
      catch(e){alert(T.badFile)}};
    r.readAsText(f);
  });
  inp.click();
}

go("accueil");
})();
