import './author.js';
import {CONFIG,I,LANG_KEY,THEME_KEY,detectLang} from './config.js';
import {byId,txt,safeGet,safeSet} from './utils.js';
import {state} from './state.js';
import {initHeader} from './header.js';
import {startCurtain,initLeafParticles,closeModal} from './ui.js';
import {renderProjects,openProject,renderCases,openCase,renderSkills,renderContact,openCVModal} from './render.js';
import {loadContent} from './data.js';
import {parseHash,clearContentHash} from './router.js';
import {initUX,refreshUX} from './ux.js';

function setLang(lang){
  state.lang=lang==='en'?'en':'fr';safeSet(LANG_KEY,state.lang);
  document.documentElement.lang=state.lang;
  txt(byId('langBtn'),state.lang==='fr'?'FR 🇫🇷':'EN 🇬🇧');
  txt(byId('heroDesc'),I[state.lang].hero_desc);
  document.querySelectorAll('[data-i18n]').forEach(n=>{
    const text=I[state.lang][n.dataset.i18n];if(text!=null)n.textContent=text;
  });
  txt(byId('footText'),`© ${new Date().getFullYear()} Nathan Tandille - ${state.lang==='fr'?'Tous droits réservés':'All rights reserved'}`);
  renderProjects();renderCases();renderContact();
  if(byId('skillsDetails')?.open)renderSkills();
  refreshUX();
}
function applyTheme(mode){
  document.documentElement.dataset.theme=mode;
  const btn=byId('themeBtn');
  if(btn){btn.textContent=mode==='dark'?'☾':'☀';btn.setAttribute('aria-label',state.lang==='fr'?(mode==='dark'?'Passer en mode jour':'Passer en mode nuit'):(mode==='dark'?'Switch to day':'Switch to night'));}
}
function initTheme(){
  const os=matchMedia('(prefers-color-scheme: dark)');
  const stored=safeGet(THEME_KEY);state.themeLock=['dark','light'].includes(stored);
  const fromOS=()=>{if(!state.themeLock)applyTheme(os.matches?'dark':'light')};
  applyTheme(state.themeLock?stored:(os.matches?'dark':'light'));
  os.addEventListener('change',fromOS);
  byId('themeBtn')?.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    state.themeLock=true;safeSet(THEME_KEY,next);applyTheme(next);
    document.body.classList.add('theme-anim');setTimeout(()=>document.body.classList.remove('theme-anim'),400);
  });
  byId('themeBtn')?.addEventListener('contextmenu',e=>{e.preventDefault();state.themeLock=false;safeSet(THEME_KEY,null);fromOS()});
}
function restoreRoute(){
  const {project,kase}=parseHash();
  const item=kase?state.cases.find(c=>c.id===kase):state.projects.find(p=>p.id===project);
  const key=item?(kase?'case:':'project:')+item.id:null;
  if(key && key===state.modalRoute && byId('modalRoot')?.firstChild)return;
  if(byId('modalRoot')?.firstChild)closeModal();
  state.modalRoute=null;
  if(item){if(kase)openCase(item);else openProject(item);}
}
state.lang=safeGet(LANG_KEY)||detectLang();
if(!['fr','en'].includes(state.lang))state.lang='fr';
byId('lkdLink').href=CONFIG.SOCIAL.linkedin;
byId('mobyLink').href=CONFIG.SOCIAL.mobygames;
initTheme();initHeader();initUX();setLang(state.lang);
byId('langBtn')?.addEventListener('click',()=>{setLang(state.lang==='fr'?'en':'fr');applyTheme(document.documentElement.dataset.theme)});
for(const id of ['cvBtn','cvCTA','cvFab'])byId(id)?.addEventListener('click',()=>openCVModal(state.lang==='fr'?CONFIG.CV_FR_URL:CONFIG.CV_EN_URL));
byId('skillsDetails')?.addEventListener('toggle',()=>{if(byId('skillsDetails').open)renderSkills()});

(async()=>{
  const skillsPromise=fetch('content/skills.json').then(r=>r.ok?r.json():null).catch(()=>null);
  const presentationPromise=fetch('content/presentation.json').then(r=>r.ok?r.json():{}).catch(()=>({}));
  const [{projects,cases},skills,presentation]=await Promise.all([loadContent(),skillsPromise,presentationPromise]);
  state.projects=projects;state.cases=cases;state.skills=skills||{fr:[],en:[]};
  const rank=cat=>/production/i.test(cat)?0:/QA|Quality/i.test(cat)?1:/Level Design/i.test(cat)?2:3;
  for(const lang of ['fr','en'])state.skills[lang]?.sort((a,b)=>rank(a.cat)-rank(b.cat));
  state.presentation=presentation;
  setLang(state.lang);
  restoreRoute();
  // No forced scroll to top and no deletion of direct links at reload.
  if(location.hash&&!parseHash().project&&!parseHash().kase){
    let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{}
    if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));
  }
  startCurtain();initLeafParticles();
  document.dispatchEvent(new Event('portfolio:ready'));
})().catch(error=>{
  console.error('Portfolio content could not load',error);
  const list=byId('projectList');
  if(list&&!list.children.length)list.textContent=state.lang==='fr'?'Le contenu n’a pas pu être chargé, recharge la page':'Content could not load, please reload the page';
});
window.addEventListener('popstate',restoreRoute);
window.addEventListener('hashchange',restoreRoute);
window.addEventListener('portfolio:modalclosed',()=>{state.modalRoute=null;clearContentHash()});
