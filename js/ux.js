// Focused enhancements using main's existing elements and visual vocabulary.
import {state} from './state.js';
import {byId} from './utils.js';
import {closeModal,closeGallery} from './ui.js';
const copy={
 fr:{seeProjects:'Voir les projets',projectIntro:'Les jeux sur lesquels j’ai travaillé, mon rôle et mes contributions',articleIntro:'Un projet, une question de design, une méthode de travail : les sujets en détail',skillsIntro:'Mes compétences et les expériences sur lesquelles elles s’appuient',skillsMore:'Explorer toutes les compétences',careerMore:'Voir le parcours complet',articles:'Articles',articleTitle:'Articles & études de cas',search:'Rechercher un article',filter:'Projet associé',all:'Tous les sujets',other:'Autres sujets',empty:'Aucun article ne correspond à cette recherche',reset:'Réinitialiser',results:'article(s)',reading:'min de lecture estimée',toc:'Sommaire de l’article',close:'Fermer',back:'Retour',copied:'Adresse e-mail copiée',failed:'Copie impossible, sélectionne l’adresse e-mail'},
 en:{seeProjects:'View projects',projectIntro:'The games I worked on, my role and contributions',articleIntro:'A project, a design question, a way of working: the subjects in detail',skillsIntro:'My skills and the experiences behind them',skillsMore:'Explore all skills',careerMore:'View the full timeline',articles:'Articles',articleTitle:'Articles & case studies',search:'Search articles',filter:'Related project',all:'All subjects',other:'Other subjects',empty:'No articles match this search',reset:'Reset',results:'article(s)',reading:'min estimated read',toc:'Article contents',close:'Close',back:'Back',copied:'Email address copied',failed:'Could not copy, please select the email address'}
};
const label=()=>copy[state.lang]||copy.fr;
const local=value=>value?.[state.lang]||value?.fr||value?.en||value||'';
const clean=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function wordCount(value){
 if(typeof value==='string')return value.trim().split(/\s+/).length;
 if(Array.isArray(value))return value.reduce((n,v)=>n+wordCount(v),0);
 if(value&&typeof value==='object')return Object.entries(value).filter(([k])=>!['src','url','image','images','gallery','trailer','alt'].includes(k)).reduce((n,[,v])=>n+wordCount(v),0);
 return 0;
}
let search='',filter='',toastTimer;
function element(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e}
export function refreshUX(){
 const t=label();
 document.querySelectorAll('[data-ux-i18n]').forEach(e=>e.textContent=t[e.dataset.uxI18n]||'');
 document.querySelector('[data-i18n="nav_cases"]').textContent=t.articles;
 document.querySelector('[data-i18n="cases_title"]').textContent=t.articleTitle;
 const legal=document.querySelector('[data-legal-btn]');if(legal)legal.textContent=state.lang==='fr'?'Mentions légales':'Legal notice';
 byId('langBtn')?.setAttribute('aria-label',state.lang==='fr'?'Switch to English':'Passer en français');
 byId('navToggle')?.setAttribute('aria-label',state.lang==='fr'?'Ouvrir ou fermer le menu':'Open or close menu');
 document.querySelectorAll('#projectList .project-tile').forEach((tile,i)=>{
  const project=state.projects[i];if(!project)return;
  const summary=local(project.cardSummary||state.presentation?.projects?.[project.id]);
  if(summary&&tile.querySelector('.project-tile-summary'))tile.querySelector('.project-tile-summary').textContent=summary;
 });
 document.querySelectorAll('#caseList .case-tile').forEach((tile,i)=>{
  const article=state.cases[i];if(!article)return;
  const summary=local(article.cardSummary||state.presentation?.articles?.[article.id]);
  if(summary)tile.querySelector('.case-lead').textContent=summary;
  const minutes=Math.max(1,Math.ceil(wordCount(local(article.article)||local(article.abstract))/210));
  tile.querySelector('.case-body').prepend(element('p',`${minutes} ${t.reading}`,'ux-article-meta'));
  const meta=tile.querySelector('.case-thumb-meta');meta.replaceChildren();
  const names=(article.projects||[]).map(id=>state.projects.find(p=>p.id===id)).filter(Boolean).map(p=>local(p.title));
  for(const name of names.length?names:[t.other])meta.append(element('span',name));
 });
 const mount=byId('articleTools');mount.replaceChildren();
 if(!state.cases.length)return;
 const tools=element('div',null,'ux-article-tools');
 const searchLabel=element('label',t.search,'ux-search'), input=element('input');input.type='search';input.value=search;input.setAttribute('aria-controls','caseList');searchLabel.append(input);
 const filterLabel=element('label',t.filter,'ux-filter'),select=element('select');select.setAttribute('aria-controls','caseList');
 select.append(new Option(t.all,''));
 for(const project of state.projects.filter(p=>state.cases.some(c=>c.projects?.includes(p.id))))select.append(new Option(local(project.title),project.id));
 if(state.cases.some(c=>!c.projects?.length))select.append(new Option(t.other,'__other'));
 select.value=filter;if(select.selectedIndex<0){filter='';select.value='';}
 filterLabel.append(select);tools.append(searchLabel,filterLabel);
 const results=element('p',null,'ux-results');results.setAttribute('role','status');results.setAttribute('aria-live','polite');
 const empty=element('div',null,'card ux-empty');empty.hidden=true;empty.append(element('p',t.empty));
 const reset=element('button',t.reset,'btn');reset.type='button';empty.append(reset);
 mount.append(tools,results,empty);
 function update(){
  search=input.value;filter=select.value;let count=0;
  document.querySelectorAll('#caseList .case-tile').forEach((tile,i)=>{
   const c=state.cases[i];const related=(c.projects||[]).map(id=>local(state.projects.find(p=>p.id===id)?.title)).join(' ');
   const searchable=[local(c.title),local(c.abstract),local(c.tags),related].join(' ');
   const matchesProject=!filter||(filter==='__other'?!c.projects?.length:c.projects?.includes(filter));
   tile.hidden=!(matchesProject&&clean(searchable).includes(clean(search.trim())));if(!tile.hidden)count++;
  });
  results.textContent=`${count} ${t.results}`;empty.hidden=count>0;
 }
 input.addEventListener('input',update);select.addEventListener('change',update);
 reset.addEventListener('click',()=>{input.value='';select.value='';update();input.focus()});update();
}
export function initUX(){
 const modalRoot=byId('modalRoot'),galleryRoot=byId('lightboxRoot');
 let lastTrigger=null,focusBefore=null,wasOpen=false,modalNode=null,galleryNode=null;
 let inertStates=[];
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('.project-tile,.case-tile,.skill-card');
  if(trigger&&!modalRoot.contains(trigger))lastTrigger=trigger.querySelector('a')||trigger;
  if(event.target.closest('[data-copy-email]')){
   navigator.clipboard?.writeText('tandille.nathan@gmail.com').then(()=>status(label().copied)).catch(()=>status(label().failed));
   if(!navigator.clipboard)status(label().failed);
  }
 },true);
 function status(text){const el=byId('uxStatus');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3200)}
 function focusables(scope){return [...scope.querySelectorAll('a[href],button,input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter(e=>!e.disabled&&e.getClientRects().length&&!e.closest('[hidden]'))}
 function updateDialogs(){
  const modal=modalRoot.querySelector('.modal'), gallery=galleryRoot.querySelector('.lightbox');
  const open=!!(modal||gallery);
  if(open&&!wasOpen){
   focusBefore=lastTrigger||document.activeElement;
   inertStates=[...document.body.children].filter(e=>e!==modalRoot&&e!==galleryRoot&&e.id!=='uxStatus'&&!['SCRIPT','STYLE'].includes(e.tagName)).map(e=>[e,e.inert]);
   inertStates.forEach(([e])=>e.inert=true);
  }
  modalRoot.inert=!!gallery;
  if(modalNode&&modalNode!==modal)modalNode._uxCleanup?.();
  if(modal&&modal!==modalNode){
   const heading=modal.querySelector('header h3');heading.id='uxDialogTitle';modal.setAttribute('aria-labelledby',heading.id);
   const close=modal.querySelector('header .x');close.textContent=label().close+' ×';close.setAttribute('aria-label',label().close);
   const back=modal.querySelector('header .back');if(back){back.textContent='← '+label().back;back.setAttribute('aria-label',label().back);}
   if(modal.classList.contains('modal--case-study'))enhanceArticle(modal);
   setTimeout(()=>{if(modal.isConnected&&!galleryRoot.firstChild)close.focus({preventScroll:true})},370);
  }
  if(gallery&&gallery!==galleryNode){gallery.setAttribute('aria-label',state.lang==='fr'?'Galerie d’images':'Image gallery');gallery.querySelector('.x')?.focus();}
  if(!gallery&&galleryNode&&modal)modal.querySelector('header .x')?.focus({preventScroll:true});
  if(!open&&wasOpen){
   inertStates.forEach(([e,value])=>e.inert=value);inertStates=[];
   document.body.classList.remove('no-scroll');
   if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});
   lastTrigger=null;focusBefore=null;
   window.dispatchEvent(new Event('portfolio:modalclosed'));
  }
  wasOpen=open;modalNode=modal;galleryNode=gallery;
 }
 new MutationObserver(updateDialogs).observe(modalRoot,{childList:true});
 new MutationObserver(updateDialogs).observe(galleryRoot,{childList:true});
 document.addEventListener('keydown',event=>{
  const gallery=galleryRoot.querySelector('.lightbox'),modal=modalRoot.querySelector('.modal'),scope=gallery||modal;
  if(!scope)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();gallery?closeGallery():closeModal();return;}
  if(event.key==='Tab'){
   const items=focusables(scope);if(!items.length){event.preventDefault();return;}
   const first=items[0],last=items.at(-1);
   if(event.shiftKey&&(document.activeElement===first||!scope.contains(document.activeElement))){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||!scope.contains(document.activeElement))){event.preventDefault();first.focus()}
  }
 },true);
 let queued=false;
 function updateNav(){
  queued=false;const threshold=(document.querySelector('.header')?.offsetHeight||90)+140;
  let active='';for(const id of ['projects','cases','about','contact'])if(byId(id)?.getBoundingClientRect().top<=threshold)active=id;
  document.querySelectorAll('#primaryNav a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 }
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateNav)}},{passive:true});
 addEventListener('resize',updateNav,{passive:true});document.addEventListener('portfolio:ready',updateNav);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');reduce.addEventListener('change',e=>state.prefersReduced=e.matches);
}
function enhanceArticle(modal){
 const article=modal.querySelector('.case-article');if(!article)return;
 const sections=[...article.querySelectorAll('.case-section')].filter(s=>s.querySelector('h4'));
 if(!sections.length)return;
 const toc=element('details',null,'ux-disclosure ux-toc'),summary=element('summary',label().toc),list=element('ol');
 sections.forEach((section,i)=>{
  section.id='article-section-'+(i+1);
  const li=element('li'),a=element('a',section.querySelector('h4').textContent);a.href='#'+section.id;
  a.addEventListener('click',event=>{event.preventDefault();section.scrollIntoView({behavior:state.prefersReduced?'instant':'smooth',block:'start'})});
  li.append(a);list.append(li);
 });
 toc.append(summary,list);article.before(toc);
 const bar=element('span',null,'ux-reader-bar');bar.setAttribute('aria-hidden','true');modal.querySelector('header').append(bar);
 let queued=false;
 const update=()=>{queued=false;const max=modal.scrollHeight-modal.clientHeight;bar.style.setProperty('--read-progress',max>0?Math.min(1,modal.scrollTop/max):1)};
 modal.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});
 const observer=new ResizeObserver(update);observer.observe(article);
 modal._uxCleanup=()=>observer.disconnect();update();
}
