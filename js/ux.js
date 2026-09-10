// Focused enhancements using main's existing elements and visual vocabulary.
import {state} from './state.js';
import {byId} from './utils.js';
import {closeModal,closeGallery} from './ui.js';
import {openCase} from './render.js';
import {enhanceReading,readingMinutes} from './reading.js';
const copy={
 fr:{explore:'Explorer le portfolio',contribution:'Voir le projet',relatedArticle:'Lire l’étude de cas',share:'Copier le lien',linkCopied:'Lien copié',image:'Afficher l’image',readMode:'Lecture',mediaContext:'Contexte & médias',contents:'Sommaire',placeholder:'Un jeu, un sujet, une méthode…',clear:'Effacer la recherche',seeProjects:'Voir les projets',projectIntro:'Les jeux sur lesquels j’ai travaillé, mon rôle et mes contributions',articleIntro:'Un projet, une question de design, une méthode de travail : les sujets en détail',skillsIntro:'Mes compétences et les expériences sur lesquelles elles s’appuient',skillsMore:'Explorer toutes les compétences',careerMore:'Voir le parcours complet',articles:'Articles',articleTitle:'Articles & études de cas',search:'Rechercher un article',filter:'Projet associé',all:'Tous les sujets',other:'Autres sujets',empty:'Aucun article ne correspond à cette recherche',reset:'Réinitialiser',results:'article(s)',reading:'min de lecture estimée',toc:'Sommaire de l’article',close:'Fermer',back:'Retour',copied:'Adresse e-mail copiée',failed:'Copie impossible, sélectionne l’adresse e-mail'},
 en:{explore:'Explore the portfolio',contribution:'View project',relatedArticle:'Read case study',share:'Copy link',linkCopied:'Link copied',image:'Show image',readMode:'Read',mediaContext:'Context & media',contents:'Contents',placeholder:'A game, a topic, a method…',clear:'Clear search',seeProjects:'View projects',projectIntro:'The games I worked on, my role and contributions',articleIntro:'A project, a design question, a way of working: the subjects in detail',skillsIntro:'My skills and the experiences behind them',skillsMore:'Explore all skills',careerMore:'View the full timeline',articles:'Articles',articleTitle:'Articles & case studies',search:'Search articles',filter:'Related project',all:'All subjects',other:'Other subjects',empty:'No articles match this search',reset:'Reset',results:'article(s)',reading:'min estimated read',toc:'Article contents',close:'Close',back:'Back',copied:'Email address copied',failed:'Could not copy, please select the email address'}
};
const label=()=>copy[state.lang]||copy.fr;
const local=value=>value?.[state.lang]||value?.fr||value?.en||value||'';
const clean=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let search='',filter='',toastTimer;
try{const q=new URLSearchParams(location.search);search=q.get('q')||'';filter=q.get('topic')||''}catch{}
function status(text){const el=byId('uxStatus');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3200)}
async function copyText(text,message){
 let success=false;
 try{await navigator.clipboard.writeText(text);success=true}catch{
  const active=document.activeElement,area=document.createElement('textarea');area.value=text;area.readOnly=true;area.className='sr-only';document.body.append(area);area.select();
  try{success=document.execCommand('copy')}catch{}area.remove();active?.focus({preventScroll:true});
 }
 status(success?message:(state.lang==='fr'?'Copie indisponible dans ce navigateur':'Copy unavailable in this browser'));
}
function element(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e}
export function refreshUX(){
 const t=label();
 let cue=document.querySelector('.ux-explore');
 if(!cue){cue=element('a',null,'btn ux-explore');cue.href='#main';byId('hero-banner').append(cue)}
 cue.textContent=t.explore+' ↓';
 document.querySelector('.brand-name').closest('a')?.setAttribute('aria-label',state.lang==='fr'?'Nathan Tandille, retour en haut':'Nathan Tandille, back to top');
 document.querySelector('#primaryNav').setAttribute('aria-label',state.lang==='fr'?'Navigation principale':'Main navigation');
 document.querySelectorAll('[data-ux-i18n]').forEach(e=>e.textContent=t[e.dataset.uxI18n]||'');
 document.querySelector('[data-i18n="nav_cases"]').textContent=t.articles;
 document.querySelector('[data-i18n="cases_title"]').textContent=t.articleTitle;
 const legal=document.querySelector('[data-legal-btn]');if(legal)legal.textContent=state.lang==='fr'?'Mentions légales':'Legal notice';
 byId('langBtn')?.setAttribute('aria-label',state.lang==='fr'?'Switch to English':'Passer en français');
 byId('navToggle')?.setAttribute('aria-label',state.lang==='fr'?'Ouvrir ou fermer le menu':'Open or close menu');
 document.querySelectorAll('#projectList .project-tile').forEach((tile,i)=>{
  const project=state.projects[i];if(!project)return;tile.dataset.projectId=project.id;
  const summary=local(project.cardSummary||state.presentation?.projects?.[project.id]);
  if(summary&&tile.querySelector('.project-tile-summary'))tile.querySelector('.project-tile-summary').textContent=summary;
  const cta=tile.querySelector('.project-cta');if(cta)cta.innerHTML=t.contribution+' <span class="arr" aria-hidden="true">→</span>';
  const engine=local(project.projectInfo?.engine);let badge=tile.querySelector('.ux-engine');
  if(engine&&typeof engine==='string'&&engine.length<=20&&!badge){badge=element('span',engine,'role-badge o ux-engine');tile.querySelector('.ovr-top').append(badge)}
  tile.querySelector('.ux-project-actions')?.replaceWith(...tile.querySelector('.ux-project-actions').childNodes);
  tile.querySelectorAll('.ux-related-article').forEach(el=>el.remove());
  const related=state.cases.filter(c=>c.projects?.includes(project.id));
  if(cta){const actions=element('div',null,'ux-project-actions');cta.replaceWith(actions);actions.append(cta);
   if(related.length){const link=element('a',t.relatedArticle+' ↗','ux-related-article');link.href='#case='+encodeURIComponent(related[0].id);link.setAttribute('aria-label',t.relatedArticle+' : '+local(related[0].title));
    link.addEventListener('click',event=>{event.stopPropagation();if(event.button||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();state.modalStack.length=0;openCase(related[0])});actions.append(link)}
  }
 });
 document.querySelectorAll('#caseList .case-tile').forEach((tile,i)=>{
  const article=state.cases[i];if(!article)return;
  const summary=local(article.cardSummary||state.presentation?.articles?.[article.id]);
  if(summary)tile.querySelector('.case-lead').textContent=summary;
  const shortTitle=local(article.cardTitle||state.presentation?.articleTitles?.[article.id]);
  if(shortTitle)tile.querySelector('.case-title a').textContent=shortTitle;
  tile.querySelector('.ux-article-meta')?.remove();
  const minutes=readingMinutes(local(article.article)||local(article.abstract));
  tile.querySelector('.case-body').prepend(element('p',`${minutes} ${t.reading}`,'ux-article-meta'));
  const meta=tile.querySelector('.case-thumb-meta');meta.replaceChildren();
  const names=(article.projects||[]).map(id=>state.projects.find(p=>p.id===id)).filter(Boolean).map(p=>local(p.title));
  for(const name of names.length?names:[t.other])meta.append(element('span',name));
 });
 const mount=byId('articleTools');mount.replaceChildren();
 if(!state.cases.length)return;
 const tools=element('div',null,'ux-article-tools');
 const searchLabel=element('label',t.search,'ux-search'), input=element('input');input.type='search';input.value=search;input.placeholder=t.placeholder;input.autocomplete='off';input.setAttribute('aria-controls','caseList');searchLabel.append(input);
 const filterLabel=element('label',t.filter,'ux-filter'),select=element('select');select.setAttribute('aria-controls','caseList');
 select.append(new Option(t.all,''));
 for(const project of state.projects.filter(p=>state.cases.some(c=>c.projects?.includes(p.id))))select.append(new Option(local(project.title),project.id));
 if(state.cases.some(c=>!c.projects?.length))select.append(new Option(t.other,'__other'));
 select.value=filter;if(select.selectedIndex<0){filter='';select.value='';}
 filterLabel.append(select);
 const clear=element('button',t.reset,'btn ux-clear-search');clear.type='button';
 tools.append(searchLabel,filterLabel,clear);
 const results=element('p',null,'ux-results');results.setAttribute('role','status');results.setAttribute('aria-live','polite');
 const empty=element('div',null,'card ux-empty');empty.hidden=true;empty.append(element('p',t.empty));
 const reset=element('button',t.reset,'btn');reset.type='button';empty.append(reset);
 mount.append(tools,results,empty);
 function update(){
  search=input.value;filter=select.value;let count=0;
  document.querySelectorAll('#caseList .case-tile').forEach((tile,i)=>{
   const c=state.cases[i];const related=(c.projects||[]).map(id=>local(state.projects.find(p=>p.id===id)?.title)).join(' ');
   const searchable=[tile.textContent,local(c.title),local(c.abstract),local(c.tags),related].join(' ');
   const matchesProject=!filter||(filter==='__other'?!c.projects?.length:c.projects?.includes(filter));
   tile.hidden=!(matchesProject&&clean(searchable).includes(clean(search.trim())));if(!tile.hidden)count++;
  });
  results.textContent=`${count} article${count===1?'':'s'}`;empty.hidden=count>0;
  clear.hidden=!search&&!filter;
  try{const url=new URL(location.href);search?url.searchParams.set('q',search):url.searchParams.delete('q');filter?url.searchParams.set('topic',filter):url.searchParams.delete('topic');history.replaceState(history.state,'',url)}catch{}

 }
 input.addEventListener('input',update);select.addEventListener('change',update);
 const resetSearch=()=>{input.value='';select.value='';update();input.focus()};
 reset.addEventListener('click',resetSearch);clear.addEventListener('click',resetSearch);update();
}
export function initUX(){
 const modalRoot=byId('modalRoot'),galleryRoot=byId('lightboxRoot');
 let lastTrigger=null,focusBefore=null,galleryTrigger=null,wasOpen=false,modalNode=null,galleryNode=null;
 let inertStates=[];
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('.project-tile,.case-tile,.skill-card');
  if(trigger&&!modalRoot.contains(trigger))lastTrigger=event.target.closest('a')||trigger.querySelector('a')||trigger;
  const galleryButton=event.target.closest('[data-gallery],.case-gallery-item');if(galleryButton)galleryTrigger=galleryButton;
  if(event.target.closest('[data-copy-email]'))copyText('tandille.nathan@gmail.com',label().copied);
 },true);
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
   enhanceReading(modal,label(),copyText);
   setTimeout(()=>{if(modal.isConnected&&!galleryRoot.firstChild&&!modal.contains(document.activeElement))close.focus({preventScroll:true})},370);
  }
  if(gallery&&gallery!==galleryNode){gallery.setAttribute('aria-label',state.lang==='fr'?'Galerie d’images':'Image gallery');gallery.querySelector('.x')?.focus();enhanceGallery(gallery,modal);}
  if(!gallery&&galleryNode&&modal)(galleryTrigger?.isConnected?galleryTrigger:modal.querySelector('header .x'))?.focus({preventScroll:true});
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
function enhanceGallery(gallery,modal){
 const images=[...modal?.querySelectorAll('.media-strip img')||[]].map(img=>img.src),image=gallery.querySelector('img');
 const counter=element('p',null,'ux-gallery-counter');counter.setAttribute('aria-live','polite');counter.setAttribute('role','status');gallery.append(counter);
 function update(){const index=images.indexOf(image.src);counter.textContent=index>=0?`${index+1} / ${images.length}`:'';image.alt=state.lang==='fr'?'Image du projet':'Project image'}
 const observer=new MutationObserver(update);observer.observe(image,{attributes:true,attributeFilter:['src']});update();
 const removeObserver=new MutationObserver(()=>{if(!gallery.isConnected){observer.disconnect();removeObserver.disconnect()}});removeObserver.observe(byId('lightboxRoot'),{childList:true});
 let touch=null;gallery.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null},{passive:true});
 gallery.addEventListener('touchend',e=>{if(!touch)return;const point=e.changedTouches[0],dx=point.clientX-touch.x,dy=point.clientY-touch.y;touch=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)gallery.querySelector(dx<0?'.lb-next':'.lb-prev').click()},{passive:true});
}
