/* Le Lexique v2 — engine
   Typed recall only, both directions. Entries carry interchangeable variants:
   fr:[…] French forms, en:[…] English meanings. Any variant = correct; the
   full set is revealed after every answer.
   Data: window.CORPUS. Storage: localStorage "lexico-es-v1".
*/
(function(){
"use strict";

/* ───────── config — teacher-editable ─────────
   MS Forms drop-box. Leave FORMS_URL empty ("") to hide the button. */
const FORMS_URL="";  // paste the Spanish MS Forms base URL here
const FORMS_FIELD_NAME="";  // r… token for the name question
const FORMS_FIELD_CODE="";  // r… token for the code question
function formsLink(name, code){
  return FORMS_URL+"&"+FORMS_FIELD_NAME+"="+encodeURIComponent(name||"(sin nombre)")
                 +"&"+FORMS_FIELD_CODE+"="+encodeURIComponent(code);
}

/* ───────── state ───────── */
const LS="lexico-es-v1", DAY=86400000;
let S=load();
function load(){
  try{ const r=localStorage.getItem(LS); if(r){ const s=JSON.parse(r); s.srs=s.srs||{}; s.sessions=s.sessions||[]; return s; } }catch(e){}
  return {name:"", srs:{}, sessions:[], created:Date.now()};
}
function save(){ try{ localStorage.setItem(LS, JSON.stringify(S)); }catch(e){} }

/* ───────── indexes ───────── */
const byId={}; CORPUS.forEach(e=>byId[e.id]=e);
const UNITS={}, UNIT_ORDER=[];
CORPUS.forEach(e=>{
  if(!UNITS[e.unit]){ UNITS[e.unit]={name:e.unitName, ids:[], lessons:{}, lessonOrder:[]}; UNIT_ORDER.push(e.unit); }
  const u=UNITS[e.unit]; u.ids.push(e.id);
  if(!u.lessons[e.lesson]){ u.lessons[e.lesson]={title:e.lessonTitle, ids:[]}; u.lessonOrder.push(e.lesson); }
  u.lessons[e.lesson].ids.push(e.id);
});

/* ───────── cross-acceptance indexes ─────────
   Weak-point fix: many lists teach several French words for one English gloss
   (l'Hexagone / la métropole), and several tenses share one gloss
   (a occupé / ont occupé = "occupied"). Any list-sanctioned answer counts. */
function xLexkey(s){
  s=s.toLowerCase().replace(/’/g,"'").replace(/\s*\([^)]*\)/g,"");
  s=s.replace(/^(el |la |los |las |un |una |unos |unas |lo )/,"");
  s=s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/g,"oe").replace(/-/g," ");
  return s.replace(/\s+/g," ").trim();
}
function xCanonEn(s){
  s=s.toLowerCase().replace(/’/g,"'").replace(/-/g," ").replace(/\s*\([^)]*\)/g,"");
  s=s.replace(/^(the |a |an |to )/,"").replace(/\.{3}$/,"");
  return s.replace(/\s+/g," ").trim();
}
const GLOSS_TO_ENTRIES={};   // canonical EN gloss -> entries carrying it (global)
const LEX_TO_GLOSSES={};     // French lexkey -> union of EN glosses across duplicate entries
CORPUS.forEach(e=>{
  e.en.forEach(g=>{
    const cg=xCanonEn(g);
    (GLOSS_TO_ENTRIES[cg]=GLOSS_TO_ENTRIES[cg]||[]).push(e);
  });
  e.es.forEach(f=>{
    const lk=xLexkey(f);
    const set=(LEX_TO_GLOSSES[lk]=LEX_TO_GLOSSES[lk]||new Set());
    e.en.forEach(g=>set.add(g));
  });
});

/* ───────── SM-2 ───────── */
function srsGet(id){ return S.srs[id]||(S.srs[id]={ef:2.5,int:0,reps:0,due:0,seen:0,ok:0,lapses:0}); }
function srsGrade(id,q){
  const r=srsGet(id);
  r.seen++; if(q>=3)r.ok++;
  if(q<3){ r.reps=0; r.int=0; r.lapses++; r.due=Date.now(); }
  else{ r.reps++;
    if(r.reps===1)r.int=1; else if(r.reps===2)r.int=6; else r.int=Math.round(r.int*r.ef);
    r.ef=Math.max(1.3, r.ef+(0.1-(5-q)*(0.08+(5-q)*0.02)));
    r.due=Date.now()+r.int*DAY;
  }
  save();
}
const isSeen=id=>{const r=S.srs[id];return r&&r.seen>0};
const isDue=id=>{const r=S.srs[id];return r&&r.seen>0&&r.due<=Date.now()};
const isMastered=id=>{const r=S.srs[id];return r&&r.int>=21};

/* ───────── utils ───────── */
const $=s=>document.querySelector(s);
function el(tag,attrs,...kids){
  const n=document.createElement(tag);
  if(attrs)for(const k in attrs){
    if(k==="class")n.className=attrs[k];
    else if(k==="html")n.innerHTML=attrs[k];
    else if(k.startsWith("on"))n.addEventListener(k.slice(2),attrs[k]);
    else n.setAttribute(k,attrs[k]);
  }
  kids.flat().forEach(c=>{ if(c==null)return; n.append(c.nodeType?c:document.createTextNode(c)); });
  return n;
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pct(a,b){return b?Math.round(100*a/b):0}
function stripAcc(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/g,"oe").replace(/æ/g,"ae")}
function normFr(s){return s.toLowerCase().replace(/’/g,"'").replace(/\s*\([^)]*\)/g,"").replace(/\.{3}$/,"").replace(/[¡!¿?]/g,"").replace(/\s+/g," ").trim()}
function stripArt(s){return s.replace(/^(el |la |los |las |un |una |unos |unas |lo )/,"")}
function normEn(s){return s.toLowerCase().replace(/’/g,"'").replace(/-/g," ").replace(/(\w)iz(e[sdr]?|ing|ation)\b/g,"$1is$2").replace(/\s*\([^)]*\)/g,"").replace(/\.{3}$/,"").replace(/[!?.]+$/,"").replace(/\s+/g," ").trim()}
function stripEnLead(s){return s.replace(/^(the |a |an |to )/,"")}
function lev1(a,b){ // true if levenshtein distance ≤1
  if(a===b)return true;
  if(Math.abs(a.length-b.length)>1)return false;
  let i=0,j=0,edits=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){i++;j++;continue}
    if(++edits>1)return false;
    if(a.length>b.length)i++; else if(b.length>a.length)j++; else{i++;j++}
  }
  return edits+(a.length-i)+(b.length-j)<=1;
}

/* answer checking — returns {q, msg, cls[, alt]} */
function frTiers(raw, variants){
  const vars=variants.map(normFr);
  if(vars.includes(raw)) return {q:5,msg:"Exacto.",cls:"good"};
  if(vars.map(stripAcc).includes(stripAcc(raw))) return {q:4,msg:"Bien — pero cuidado con las tildes.",cls:"good"};
  if(vars.map(v=>stripArt(v)).includes(stripArt(raw))||vars.map(v=>stripAcc(stripArt(v))).includes(stripAcc(stripArt(raw))))
    return {q:3,msg:"La palabra es correcta — revisa el artículo.",cls:"good"};
  if(vars.some(v=>lev1(stripAcc(stripArt(v)),stripAcc(stripArt(raw)))&&stripArt(v).length>=5))
    return {q:3,msg:"Casi — revisa la ortografía.",cls:"good"};
  return null;
}
function checkFr(ans, entry, promptedGloss){
  const raw=normFr(ans); if(!raw)return null;
  const own=frTiers(raw, entry.es);
  if(own) return own;
  // cross-acceptance: any entry in the lists sharing the prompted gloss
  const sibs=(GLOSS_TO_ENTRIES[xCanonEn(promptedGloss||entry.en[0])]||[]).filter(x=>x.id!==entry.id);
  for(const s of sibs){
    const hit=frTiers(raw, s.es);
    if(hit) return {...hit, alt:s};
  }
  return {q:1,msg:"No.",cls:"bad"};
}
function checkEn(ans, entry){
  const raw=normEn(ans); if(!raw)return null;
  // union of glosses across every duplicate of this lexeme in the corpus
  const pool=new Set(entry.en);
  entry.es.forEach(f=>{
    const s=LEX_TO_GLOSSES[xLexkey(f)];
    if(s)s.forEach(g=>pool.add(g));
  });
  const vars=[...pool].map(normEn);
  if(vars.includes(raw)||vars.map(stripEnLead).includes(stripEnLead(raw)))
    return {q:5,msg:"Exacto.",cls:"good"};
  if(vars.some(v=>lev1(stripEnLead(v),stripEnLead(raw))&&stripEnLead(v).length>=5))
    return {q:4,msg:"Bien — pequeño error de ortografía.",cls:"good"};
  return {q:1,msg:"No.",cls:"bad"};
}

/* ───────── accent pad ─────────
   Only the characters that actually occur in the Spanish lists. */
const ACCENTS=["á","é","í","ó","ú","ñ","ü","¡","¿"];
let padTarget=null;
const pad=(function(){
  const p=el("div",{class:"accent-pad hidden",role:"toolbar","aria-label":"Tildes y signos españoles"});
  ACCENTS.forEach(ch=>{
    const b=el("button",{type:"button",tabindex:"-1"},ch);
    b.addEventListener("mousedown",ev=>ev.preventDefault()); // keep input focus
    b.addEventListener("click",()=>{
      if(!padTarget)return;
      const st=padTarget.selectionStart??padTarget.value.length,
            en=padTarget.selectionEnd??padTarget.value.length;
      padTarget.setRangeText(ch,st,en,"end");
      padTarget.dispatchEvent(new Event("input",{bubbles:true}));
      padTarget.focus();
    });
    p.append(b);
  });
  document.body.append(p);
  return p;
})();
function showPad(input){ padTarget=input; pad.classList.remove("hidden"); document.body.classList.add("pad-on"); }
function hidePad(){ padTarget=null; pad.classList.add("hidden"); document.body.classList.remove("pad-on"); }

/* ───────── router ───────── */
const VIEWS=["accueil","revision","suivi"];
function go(v){
  hidePad();
  VIEWS.forEach(x=>{
    $("#view-"+x).classList.toggle("hidden",x!==v);
    $("#tab-"+x).setAttribute("aria-selected",x===v?"true":"false");
  });
  if(v==="accueil")renderAccueil();
  if(v==="revision")renderRevisionConfig();
  if(v==="suivi")renderSuivi();
  window.scrollTo(0,0);
}
VIEWS.forEach(v=>$("#tab-"+v).addEventListener("click",()=>go(v)));

function kpi(n,l){return el("div",{class:"kpi"},el("div",{class:"n"},String(n)),el("div",{class:"l"},l))}
function pills(items,current,on){
  const w=el("div",{class:"pill-select"});
  items.forEach(([val,label])=>{
    const b=el("button",{class:val===current?"on":"",onclick:()=>{on(val);[...w.children].forEach(c=>c.classList.remove("on"));b.classList.add("on")}},label);
    w.append(b);
  });
  return w;
}

/* ═════════ ACCUEIL — units → lessons → liste / practice ═════════ */
let openUnit=null;
function renderAccueil(){
  const v=$("#view-accueil"); v.innerHTML="";
  const due=Object.keys(S.srs).filter(isDue).length;
  v.append(
    el("h2",null,"Tus listas de vocabulario"),
    el("p",{class:"lede"},"Las listas reproducen exactamente el cuaderno: elige una unidad y luego una lección. Consulta la lista o practica escribiendo tus respuestas — en los dos sentidos. Tu progreso se guarda en este dispositivo; exporta tu código en Progreso para enviárselo al profesor."),
    el("div",{class:"card"},
      el("label",{for:"student-name",style:"font-weight:600;font-size:.9rem"},"Tu nombre (para el código exportado)"),
      el("input",{id:"student-name",class:"typed",style:"margin-top:8px",value:S.name||"",placeholder:"Nombre + inicial, p. ej. Lucía G.",
        oninput:e=>{S.name=e.target.value.trim();save()}})),
    due? el("div",{class:"card",style:"margin-top:14px;border-color:var(--rouge)"},
      el("h3",null,due+" palabra"+(due>1?"s":"")+" por repasar hoy"),
      el("div",{class:"btn-row"},el("button",{class:"btn primary",onclick:()=>go("revision")},"Empezar el repaso →"))):null,
    el("div",{class:"section-label"},"Unidades")
  );
  UNIT_ORDER.forEach(uid=>{
    const u=UNITS[uid];
    const mast=u.ids.filter(isMastered).length, seen=u.ids.filter(isSeen).length;
    const head=el("button",{class:"unit-tile",style:"width:100%",onclick:()=>{openUnit=openUnit===uid?null:uid;renderAccueil()}},
      el("div",{style:"flex:1"},
        el("div",{class:"u-code"},uid+(openUnit===uid?" ▾":" ▸")),
        el("div",{class:"u-name"},u.name),
        el("div",{class:"u-meta"},`${u.lessonOrder.length} lecciones · ${u.ids.length} palabras · ${seen} vistas · ${mast} dominadas`),
        el("div",{class:"u-bar"},el("i",{style:"width:"+pct(mast,u.ids.length)+"%"}))));
    v.append(head);
    if(openUnit===uid){
      const wrap=el("div",{style:"margin:6px 0 14px 10px;display:grid;gap:6px"});
      u.lessonOrder.forEach(lid=>{
        const L=u.lessons[lid];
        const n=L.ids.length, m=L.ids.filter(isMastered).length, s=L.ids.filter(isSeen).length;
        let a=0,c=0; L.ids.forEach(id=>{const r=S.srs[id];if(r){a+=r.seen;c+=r.ok}});
        wrap.append(el("div",{class:"card",style:"display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px"},
          el("div",{style:"flex:1;min-width:220px"},
            el("div",{style:"font-weight:600"},`Lección ${lid.split(".")[1]} — ${L.title} (${n} palabras)`),
            el("div",{class:"u-meta"},`${s} vistas · ${m} dominadas`+(a?` · ${pct(c,a)} % de precisión`:"")),
            el("div",{class:"u-bar",style:"max-width:220px"},el("i",{style:"width:"+pct(m,n)+"%"}))),
          el("div",{class:"btn-row",style:"margin:0"},
            el("button",{class:"btn small ghost",onclick:()=>renderListe(uid,lid)},"Lista"),
            el("button",{class:"btn small primary",onclick:()=>startLesson(uid,lid)},"Practicar"))));
      });
      v.append(wrap);
    }
  });
}

/* — liste view: mirrors the workbook table — */
function renderListe(uid,lid){
  const v=$("#view-accueil"); v.innerHTML="";
  const u=UNITS[uid], L=u.lessons[lid];
  v.append(
    el("div",{class:"session-bar"},
      el("button",{class:"btn small ghost",onclick:renderAccueil},"← Volver a las unidades"),
      el("button",{class:"btn small primary",style:"margin-left:auto",onclick:()=>startLesson(uid,lid)},"Practicar esta lista")),
    el("h2",null,`${uid} ${u.name} · Lección ${lid.split(".")[1]} — ${L.title} (${L.ids.length} palabras)`));
  const tbl=el("table",{class:"stats"},
    el("thead",null,el("tr",null,el("th",null,"Español"),el("th",null,"English"),el("th",{style:"width:70px"},"Estado"))));
  const tb=el("tbody");
  L.ids.forEach(id=>{
    const e=byId[id], r=S.srs[id];
    const st=isMastered(id)?"●":isSeen(id)?"◐":"○";
    const stTitle=isMastered(id)?"dominada":isSeen(id)?"en curso":"sin ver";
    tb.append(el("tr",null,
      el("td",null,el("b",null,e.es.join(" ; "))),
      el("td",null,e.en.join(" ; ")),
      el("td",{class:"num",title:stTitle,style:"color:"+(isMastered(id)?"var(--vert)":isSeen(id)?"var(--bleu)":"var(--muted)")},st)));
  });
  tbl.append(tb);
  v.append(tbl,
    el("p",{style:"font-size:.82rem;color:var(--muted);margin-top:10px"},"○ sin ver · ◐ en curso · ● dominada (intervalo ≥ 3 semanas). Las formas separadas por « ; » son intercambiables: cualquiera cuenta como correcta."));
}

/* ═════════ SESSIONS (typed only) ═════════ */
let sess=null;
let lessonPrefs={dir:"mixte"};
function startLesson(uid,lid){
  const v=$("#view-accueil"); v.innerHTML="";
  const u=UNITS[uid], L=u.lessons[lid];
  v.append(
    el("div",{class:"session-bar"},el("button",{class:"btn small ghost",onclick:renderAccueil},"← Volver")),
    el("h2",null,`Lección ${lid.split(".")[1]} — ${L.title} (${L.ids.length} palabras)`),
    el("div",{class:"card"},
      el("h3",null,"Dirección de traducción"),
      pills([["enfr","Inglés → Español"],["fren","Español → Inglés"],["mixte","Mixto"]],lessonPrefs.dir,d=>lessonPrefs.dir=d),
      el("div",{class:"btn-row"},
        el("button",{class:"btn primary",onclick:()=>{
          const ids=shuffle(L.ids);
          sess={queue:ids.map((id,i)=>({id,dir:lessonPrefs.dir==="mixte"?(i%2?"fren":"enfr"):lessonPrefs.dir})),
                i:0,ok:0,wrong:[],back:renderAccueil,label:`${uid} · Leçon ${lid.split(".")[1]}`,view:"#view-accueil"};
          renderQ();
        }},"Empezar — toda la lección"))));
}

function renderRevisionConfig(){
  const v=$("#view-revision"); v.innerHTML="";
  const due=shuffle(Object.keys(S.srs).filter(isDue));
  v.append(
    el("h2",null,"Repaso del día"),
    el("p",{class:"lede"},due.length?
      `${due.length} palabra${due.length>1?"s":""} han llegado a su fecha de repaso (todas las unidades). La repetición espaciada elige por ti.`:
      "Nada que repasar por ahora — practica una lección desde Inicio, y las palabras volverán aquí en el momento adecuado."),
    due.length? el("div",{class:"card"},
      el("h3",null,"Número de palabras"),
      pills([["10","10"],["20","20"],["30","30"],["999","Todo"]],"20",n=>revLen=+n),
      el("div",{class:"btn-row"},el("button",{class:"btn primary",onclick:()=>{
        const q=due.slice(0,revLen).map((id,i)=>({id,dir:i%2?"fren":"enfr"}));
        sess={queue:q,i:0,ok:0,wrong:[],back:renderRevisionConfig,label:"Révision",view:"#view-revision"};
        renderQ();
      }},"Empezar")) ):null
  );
}
let revLen=20;

function renderQ(){
  const v=$(sess.view);
  hidePad();
  if(sess.i>=sess.queue.length)return sessionEnd(v);
  v.innerHTML="";
  const p=pct(sess.i,sess.queue.length);
  v.append(el("div",{class:"session-bar"},
    el("button",{class:"btn small ghost",onclick:sess.back},"← Salir"),
    el("div",{class:"progress"},el("i",{style:"width:"+p+"%"})),
    el("span",{class:"session-count"},`${sess.i+1} / ${sess.queue.length}`),
    el("span",{class:"score-pill"},`✓ ${sess.ok}`)));
  const {id,dir}=sess.queue[sess.i], e=byId[id];
  const enfr=dir==="enfr";
  const promptTxt=enfr? e.en[0] : e.es[0];
  const card=el("div",{class:"entry"},
    el("div",{class:"entry-meta"},`${sess.label} · ${enfr?"inglés → español (con el artículo)":"español → inglés"}`),
    el("div",{class:"headword",style:enfr?"font-family:var(--font-body);font-weight:600;font-size:1.5rem":""},promptTxt),
    (enfr?e.en:e.es).length>1? el("div",{class:"gramm"},"también: "+(enfr?e.en:e.es).slice(1).join(" ; ")):null);
  const inp=el("input",{class:"typed",type:"text",autocapitalize:"off",autocomplete:"off",spellcheck:"false",
    placeholder:enfr?"tu respuesta en español…":"your answer in English…"});
  const row=el("div",{class:"btn-row"});
  const check=el("button",{class:"btn primary"},"Comprobar");
  let done=false;
  function doCheck(){
    if(done)return;
    const res=enfr? checkFr(inp.value,e,e.en[0]) : checkEn(inp.value,e);
    if(!res)return;
    done=true;
    srsGrade(e.id,res.q);
    if(res.q>=3)sess.ok++; else sess.wrong.push(e.id);
    inp.disabled=true; check.disabled=true;
    hidePad();
    card.append(
      el("div",{class:"feedback "+res.cls},res.msg,
        res.alt? el("span",{class:"note"},"Tu respuesta « ",res.alt.es[0]," » también figura en tus listas con este sentido — las dos valen."):null,
        el("span",{class:"note"},
          el("b",null,e.es.join(" ; "))," — ",e.en.join(" ; "))),
      nextBtn());
  }
  check.addEventListener("click",doCheck);
  inp.addEventListener("keydown",ev=>{if(ev.key==="Enter")doCheck()});
  row.append(check);
  card.append(inp,row);
  v.append(card);
  if(enfr) showPad(inp);
  setTimeout(()=>inp.focus(),50);
}
function nextBtn(){
  const b=el("button",{class:"btn primary",onclick:()=>{sess.i++;renderQ()}},"Siguiente →");
  setTimeout(()=>b.focus(),50);
  return el("div",{class:"btn-row"},b);
}
function sessionEnd(v){
  hidePad();
  v.innerHTML="";
  S.sessions.push({t:Date.now(),n:sess.queue.length,ok:sess.ok,label:sess.label});save();
  v.append(
    el("h2",null,"Sesión terminada"),
    el("div",{class:"kpi-row"},
      kpi(sess.queue.length,"preguntas"),
      kpi(sess.ok,"acertadas"),
      kpi(pct(sess.ok,sess.queue.length)+" %","precisión")),
    sess.wrong.length? el("div",{class:"card"},
      el("h3",null,"Para repasar"),
      el("div",{style:"margin-top:8px"},
        sess.wrong.map(id=>el("div",{style:"padding:4px 0;border-bottom:1px solid var(--line)"},
          el("b",null,byId[id].es.join(" ; "))," — ",byId[id].en.join(" ; "))))):null,
    el("div",{class:"btn-row"},
      el("button",{class:"btn primary",onclick:sess.back},"Continuar"),
      el("button",{class:"btn",onclick:()=>go("suivi")},"Ver mi progreso")));
}

/* ═════════ SUIVI ═════════ */
function renderSuivi(){
  const v=$("#view-suivi"); v.innerHTML="";
  const seenIds=Object.keys(S.srs).filter(isSeen);
  const seen=seenIds.length, mast=seenIds.filter(isMastered).length, due=seenIds.filter(isDue).length;
  let a=0,c=0; seenIds.forEach(id=>{a+=S.srs[id].seen;c+=S.srs[id].ok});
  v.append(
    el("h2",null,"Progreso"),
    el("p",{class:"lede"},"Tu progreso por unidad, tus lecciones más frágiles y tu código para enviar al profesor."),
    el("div",{class:"kpi-row"},
      kpi(seen,"palabras vistas / "+CORPUS.length),
      kpi(mast,"dominadas (≥ 3 sem.)"),
      kpi(due,"repasos pendientes"),
      kpi(a?pct(c,a)+" %":"—","precisión global")),
    el("div",{class:"section-label"},"Por unidad"));
  const tbl=el("table",{class:"stats"},
    el("thead",null,el("tr",null,el("th",null,"Unidad"),el("th",null,"Vistas"),el("th",null,"Dominadas"),el("th",null,"Precisión"),el("th",null,""))));
  const tb=el("tbody");
  UNIT_ORDER.forEach(uid=>{
    const u=UNITS[uid], s=u.ids.filter(isSeen), m=u.ids.filter(isMastered);
    let ua=0,uc=0; s.forEach(id=>{ua+=S.srs[id].seen;uc+=S.srs[id].ok});
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
  UNIT_ORDER.forEach(uid=>{
    const u=UNITS[uid];
    u.lessonOrder.forEach(lid=>{
      let la=0,lc=0; u.lessons[lid].ids.forEach(id=>{const r=S.srs[id];if(r){la+=r.seen;lc+=r.ok}});
      if(la>=5)rows.push({uid,lid,title:u.lessons[lid].title,acc:pct(lc,la),n:la});
    });
  });
  rows.sort((x,y)=>x.acc-y.acc);
  v.append(el("div",{class:"section-label"},"Lecciones por reforzar"));
  if(!rows.length)v.append(el("p",{style:"color:var(--muted)"},"Aún no hay datos suficientes — practica algunas lecciones."));
  else{
    const w=el("div",{class:"card"});
    rows.slice(0,8).forEach(r=>w.append(el("div",{style:"display:flex;gap:10px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)"},
      el("div",{style:"flex:1"},el("b",null,`${r.uid} · Lección ${r.lid.split(".")[1]}`)," — "+r.title),
      el("span",{class:"session-count"},r.acc+" %"),
      el("button",{class:"btn small ghost",onclick:()=>{go("accueil");renderListe(r.uid,r.lid)}},"Lista"))));
    v.append(w);
  }

  /* export */
  const code=buildExportCode();
  const ta=el("textarea",{class:"code",readonly:""},code);
  v.append(el("div",{class:"section-label"},"Enviar al profesor"),
    el("div",{class:"card"},
      el("p",{style:"margin:0 0 10px"},FORMS_URL?
        "Haz clic en « Enviar por MS Forms »: el formulario se abre con tu nombre y tu código ya rellenados — solo te queda pulsar Enviar. El código solo contiene tus estadísticas y el nombre escrito en Inicio.":
        "Copia este código y envíaselo a tu profesor (correo, Teams…). Solo contiene tus estadísticas y el nombre escrito en Inicio."),
      ta,
      el("div",{class:"btn-row"},
        FORMS_URL? el("button",{class:"btn primary",onclick:()=>{window.open(formsLink(S.name,code),"_blank")}},"Enviar por MS Forms"):null,
        el("button",{class:"btn"+(FORMS_URL?" ghost":" primary"),onclick:async()=>{try{await navigator.clipboard.writeText(code)}catch(e){ta.select();document.execCommand("copy")}}},"Copiar el código"),
        el("button",{class:"btn ghost",onclick:downloadBackup},"Copia de seguridad (.json)"),
        el("button",{class:"btn ghost",onclick:restoreBackup},"Restaurar copia"),
        el("button",{class:"btn ghost",style:"color:var(--rouge);border-color:var(--rouge)",onclick:()=>{
          if(confirm("¿Borrar todo el progreso en este dispositivo? Esta acción es definitiva.")){localStorage.removeItem(LS);S=load();renderSuivi()}
        }},"Reiniciar"))));
}
function buildExportCode(){
  const u={};
  UNIT_ORDER.forEach(uid=>{
    const ids=UNITS[uid].ids, s=ids.filter(isSeen);
    if(!s.length)return;
    let a=0,c=0; s.forEach(id=>{a+=S.srs[id].seen;c+=S.srs[id].ok});
    u[uid]=[s.length,ids.length,ids.filter(isMastered).length,pct(c,a)];
  });
  // weakest lessons (≥5 answers), top 6
  const w=[];
  UNIT_ORDER.forEach(uid=>UNITS[uid].lessonOrder.forEach(lid=>{
    let a=0,c=0; UNITS[uid].lessons[lid].ids.forEach(id=>{const r=S.srs[id];if(r){a+=r.seen;c+=r.ok}});
    if(a>=5)w.push([lid,UNITS[uid].lessons[lid].title,pct(c,a)]);
  }));
  w.sort((x,y)=>x[2]-y[2]);
  const payload={v:1,n:S.name||"(sin nombre)",t:Date.now(),
    o:{seen:Object.keys(S.srs).filter(isSeen).length,total:CORPUS.length,
       mast:Object.keys(S.srs).filter(isMastered).length,sess:S.sessions.length},
    u,w:w.slice(0,6)};
  return "LEXES1."+btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}
function downloadBackup(){
  const blob=new Blob([JSON.stringify(S)],{type:"application/json"});
  const a=el("a",{href:URL.createObjectURL(blob),download:"lexico-guardado.json"});a.click();
}
function restoreBackup(){
  const inp=el("input",{type:"file",accept:".json"});
  inp.addEventListener("change",()=>{
    const f=inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=()=>{try{const s=JSON.parse(r.result);if(!s.srs)throw 0;S=s;save();renderSuivi();alert("Copia restaurada.")}
      catch(e){alert("Archivo no reconocido — elige una copia exportada desde este sitio.")}};
    r.readAsText(f);
  });
  inp.click();
}

go("accueil");
})();
