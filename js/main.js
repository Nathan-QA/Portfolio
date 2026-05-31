// Point d’entrée
import { CONFIG, I, LANG_KEY, THEME_KEY, detectLang } from './config.js';
import { byId, txt, safeGet, safeSet } from './utils.js';
import { state } from './state.js';
import { initHeader } from './header.js';
import { startCurtain, initLeafParticles } from './ui.js';
import { renderProjects, openProject, renderCases, openCase, renderSkills, renderContact, openCVModal } from './render.js';
import { loadContent } from './data.js';
import { parseHash } from './router.js';

// Anti double-inclusion
if (window.__APP_INIT__) { console.warn('main déjà initialisé'); }
else { window.__APP_INIT__ = true; }

function updateLangButton(){ const b=byId('langBtn'); if(b) b.textContent = state.lang==='fr' ? 'FR 🇫🇷' : 'EN 🇬🇧'; }
function setLang(l){
  state.lang = l; safeSet(LANG_KEY, l);
  document.documentElement.lang = l;
  updateLangButton();
  txt(byId('heroDesc'), I[state.lang].hero_desc);
  [
    'skip_content','nav_projects','nav_cases','nav_about','nav_contact','cv_fr','cv_en',
    'hero_kicker','hero_title','hero_roles',
    'hero_focus_label','hero_focus_value','hero_scope_label','hero_scope_value','hero_tools_label','hero_tools_value',
    'timeline_kicker','timeline_title',
    'timeline_education_time','timeline_education_title','timeline_education_text',
    'timeline_uma_time','timeline_uma_title','timeline_uma_text',
    'timeline_ltag_time','timeline_ltag_title','timeline_ltag_text',
    'timeline_bretagne_time','timeline_bretagne_title','timeline_bretagne_text',
    'timeline_pyla_time','timeline_pyla_title','timeline_pyla_text',
    'timeline_next_time','timeline_next_title','timeline_next_text',
    'projects_title','cases_title','about_role_title','about_skills_title',
    'contact_title','legal_title','open_cv'
  ].forEach(k=>{
    document.querySelectorAll(`[data-i18n="${k}"]`).forEach(n=>n.textContent=I[state.lang][k]);
  });
  txt(byId('footText'), `© ${new Date().getFullYear()} Nathan Tandille - ${state.lang==='fr'?'Tous droits réservés':'All rights reserved'}`);
  renderProjects(); renderCases(); renderSkills(); renderContact();
}

// Thème
function applyTheme(mode){
  document.documentElement.dataset.theme = mode;
  const tb = byId('themeBtn'); if (tb) tb.textContent = mode==='dark'?'☾':'☀';
}
function applyThemeFromOS(){
  if (state.themeLock) return;
  const m=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = !!(m && m.matches);
  applyTheme(isDark?'dark':'light');
}
function initTheme(){
  applyThemeFromOS();
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mql){
    if (mql.addEventListener) mql.addEventListener('change', applyThemeFromOS);
    else if (mql.addListener) mql.addListener(applyThemeFromOS);
  }
  const stored = safeGet(THEME_KEY);
  if (stored) { state.themeLock = true; applyTheme(stored); }
  // boutons
  byId('themeBtn')?.addEventListener('click',()=>{
    const cur = document.documentElement.dataset.theme;
    const next = (cur==='dark'?'light':'dark');
    state.themeLock = true; safeSet(THEME_KEY, next);
    applyTheme(next); document.body.classList.add('theme-anim'); setTimeout(()=>document.body.classList.remove('theme-anim'), 400);
  });
  byId('themeBtn')?.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
    state.themeLock = false; safeSet(THEME_KEY, null);
    applyThemeFromOS(); document.body.classList.add('theme-anim'); setTimeout(()=>document.body.classList.remove('theme-anim'), 400);
  });
}

// Liens sociaux
(function initLinks(){
  const lkdLink = byId('lkdLink'); if(lkdLink) lkdLink.href = CONFIG.SOCIAL.linkedin || '#';
  const mobyLink = byId('mobyLink'); if(mobyLink) mobyLink.href = CONFIG.SOCIAL.mobygames || '#';
})();

// Préférences & boutons
state.lang = safeGet(LANG_KEY) || detectLang();
initTheme();
byId('langBtn')?.addEventListener('click',()=>setLang(state.lang==='fr'?'en':'fr'));
setLang(state.lang); // premier rendu

// CV buttons
function openCVForLang(){ openCVModal(state.lang==='fr' ? CONFIG.CV_FR_URL : CONFIG.CV_EN_URL); }
;['cvBtn','cvCTA','cvFab'].forEach(id=>{ const n=byId(id); if(n) n.addEventListener('click', openCVForLang); });

// Router - empêcher restauration des modales au reload
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const navEntries = performance.getEntriesByType?.('navigation') || [];
const isReload = navEntries[0]?.type === 'reload' || performance.navigation?.type === 1;
(function clearHashIfReload(){
  const hasDeep = location.hash.includes('project=') || location.hash.includes('kase=');
  const sameOriginRef = document.referrer && new URL(document.referrer).origin === location.origin;
  if (hasDeep && (isReload || sameOriginRef)) {
    history.replaceState(null,'',location.pathname+location.search);
  }
})();
window.addEventListener('pageshow', ()=>{ window.scrollTo(0,0); });

// Chargement contenu + skills.json (fusionné)
(async ()=>{
  // load skills.json from /content and keep its original shape
  const skillsFetch = (async ()=>{
    try{
      const res = await fetch('content/skills.json', { cache: 'no-store' });
      if(!res.ok) return null;
      return await res.json(); // shape: {fr:[...], en:[...]} (ton JSON)
    }catch{ return null; }
  })();

  const [{projects, cases}, skillsRaw] = await Promise.all([ loadContent(), skillsFetch ]);

  state.projects = projects;
  state.cases    = cases;

  // On conserve l’objet pour supporter FR/EN
  state.skills = skillsRaw || { fr: [], en: [] };

  renderProjects(); renderCases(); renderSkills(); renderContact();

  const hasDeepLink = location.hash && ( !isReload && !(document.referrer && new URL(document.referrer).origin===location.origin) );
  if (hasDeepLink){
    const { project, kase } = parseHash();
    if (project){ const p=state.projects.find(x=>x.id===project); if(p) openProject(p,{originEl:null}); }
    if (kase){ const c=state.cases.find(x=>x.id===kase); if(c) openCase(c,{originEl:null}); }
  } else {
    window.scrollTo(0,0);
    if (location.hash) history.replaceState(null,'',location.pathname+location.search);
  }

  startCurtain();
  initLeafParticles();
})();

// Header interactions
initHeader();

// hashchange (si aucune modale ouverte)
window.addEventListener('hashchange',()=>{
  if(!byId('modalRoot').firstChild){
    const { project, kase } = parseHash();
    if (project){ const p=state.projects.find(x=>x.id===project); if(p) openProject(p,{originEl:null}); }
    if (kase){ const c=state.cases.find(x=>x.id===kase); if(c) openCase(c,{originEl:null}); }
  }
},{passive:true});
