// Garde-fou pour éviter double init si le script est chargé 2x
if (window.__APP_INIT__) {
  console.warn('app.js déjà initialisé');
} else {
  window.__APP_INIT__ = true;
}

// IMPORTANT : pas de "bare specifier" — imports via URL CDN
import * as THREE from 'https://esm.sh/three@0.164.1';
import { GLTFLoader } from 'https://esm.sh/three@0.164.1/examples/jsm/loaders/GLTFLoader.js';

(()=>{
  // ===== Configs =====
  const CONFIG = {
    MODEL_URL: null,
    CV_FR_URL: 'assets/Nathan_Tandille_CV_2025.pdf',
    CV_EN_URL: 'assets/Nathan_Tandille_CV_EN_2025.pdf',
    SOCIAL: {
      linkedin: 'https://www.linkedin.com/in/nathan-tandille/',
      mobygames: ''
    },
CURTAIN: {
  leftImg: 'assets/leaf_left.png',
  rightImg: 'assets/leaf_right.png',
  leafSize: 'contain',
  // Distance d’ouverture (inchangé) :
  maxScrollVh: 160,
  baseGapVW: 1,
  tightGapVW: 210,

  // --- Nouveau : organique ---
  easing: 'easeOut',   // 'smoother' | 'easeOut' | 'easeInOut'
  followHz: 5,          // inertie (↑ = plus “lourd” mais fluide)
  wobbleGain: 0.018,    // quantité de rebond injectée quand tu scrolles
  wobbleFreq: 5.5,      // Hz du petit rebond
  wobbleDecay: 4,       // vitesse d’amortissement
  desync: 0.06,         // très légère désynchro L/R (échelle/lumière)

  scaleDelta: 0.10,
  darkDelta: 0.50
}
  };

  // === Contact / Email config ===
  const MAILCFG = {
    TO: 'tandille.nathan@gmail.com',
    EMAILJS_PUBLIC_KEY: '',
    EMAILJS_SERVICE_ID: '',
    EMAILJS_TEMPLATE_ID: '',
    GOOGLE_CLIENT_ID: ''
  };

  // ===== Profil =====
  const PROFILE = {
    tagline: {
      fr: "QA Producer facilitant la compréhension entre équipes pour fluidifier la production et garantir la qualité. Expériences en Game & Level Design.",
      en: "QA Producer improving cross-team understanding to streamline production and ensure quality. Hands-on Game & Level Design experience."
    },
    skills: {
      fr: [
        { title: "Production & QA", items: ["Gestion de production", "Build management", "Supervision QA interne/externe (Huwiz)", "Reporting", "TRC & soumissions", "Multiplateforme & 14 langues", "Outils QA en C#"] },
        { title: "Engines", items: ["Unity", "Unreal Engine"] },
        { title: "Outils", items: ["ClickUp (cert.)", "Jira", "Miro", "Office 365", "Google Workspace", "Sourcetree/Git", "Notion", "Figma"] },
        { title: "Design", items: ["Level Design (block-out, passes)", "Prototypage", "Docs GD"] }
      ],
      en: [
        { title: "Production & QA", items: ["Production management", "Build management", "Internal/external QA (Huwiz)", "Detailed reporting", "TRC submissions", "Multiplatform & 14 languages", "C# QA tools"] },
        { title: "Engines", items: ["Unity", "Unreal Engine"] },
        { title: "Tools", items: ["ClickUp (cert.)", "Jira", "Miro", "Office 365", "Google Workspace", "Sourcetree/Git", "Notion", "Figma"] },
        { title: "Design", items: ["Level Design (block-out, passes)", "Prototyping", "GD docs"] }
      ]
    },
    links: { email: "tandille.nathan@gmail.com", location: "Bordeaux, France" }
  };

  // ===== Utils DOM & storage =====
  const $=s=>document.querySelector(s), byId=id=>document.getElementById(id);
  const el=h=>{const t=document.createElement('template');t.innerHTML=h.trim();return t.content.firstChild};
  const txt=(n,v)=>n&&(n.textContent=v);
  const addThemeAnim=()=>{document.body.classList.add('theme-anim');setTimeout(()=>document.body.classList.remove('theme-anim'),400)};
  const safeGet=(k)=>{try{return localStorage.getItem(k)}catch{return null}};
  const safeSet=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch{}};

  // ===== Langue & Thème (persistants) =====
  const LANG_KEY='pref-lang';
  const THEME_KEY='pref-theme';

  const detectLang = ()=>{
    const l = (navigator.language || 'en').toLowerCase();
    return l.startsWith('fr') ? 'fr' : 'en';
  };
  let lang = safeGet(LANG_KEY) || detectLang();

  const I={
    fr:{nav_projects:"Projets",nav_cases:"Études de cas",nav_about:"À propos",nav_contact:"Contact",
      cv_fr:"CV FR",cv_en:"CV EN",hero_kicker:"Portfolio",
      hero_desc:"Production QA, coordination multi-équipes, outils et process. Expérience multi-plateformes et multilingue.",
      projects_title:"Projets phares",cases_title:"Études de cas",about_role_title:"Rôle & forces",
      about_skills_title:"Compétences",contact_title:"Me contacter",legal_title:"Mentions légales",
      dl_cv_fr:"Télécharger CV (FR)",dl_cv_en:"Télécharger CV (EN)",
      chip_overview:"Présentation",chip_trailer:"Trailer",chip_images:"Images",chip_anecdotes:"Anecdotes",
      btn_open_gallery:"Ouvrir la galerie",btn_open_case:"Voir l’étude de cas",btn_open_case2:"Ouvrir l'étude",
      footer:"Tous droits réservés",open_cv:"Ouvrir le CV",
      contact_name:"Nom",contact_email:"Email",contact_subject:"Objet",contact_message:"Message",
      contact_sign_google:"Se connecter avec Google",contact_send:"Envoyer",contact_or:"ou",
      contact_placeholder_msg:"Écris ton message ici… (mise en forme autorisée)"},
    en:{nav_projects:"Projects",nav_cases:"Case Studies",nav_about:"About",nav_contact:"Contact",
      cv_fr:"CV FR",cv_en:"CV EN",hero_kicker:"Portfolio",
      hero_desc:"QA production, cross-team coordination, tools and processes. Multiplatform and multilingual experience.",
      projects_title:"Highlighted projects",cases_title:"Case studies",about_role_title:"Role & strengths",
      about_skills_title:"Skills",contact_title:"Contact me",legal_title:"Legal notice",
      dl_cv_fr:"Download CV (FR)",dl_cv_en:"Download CV (EN)",
      chip_overview:"Overview",chip_trailer:"Trailer",chip_images:"Images",chip_anecdotes:"Anecdotes",
      btn_open_gallery:"Open gallery",btn_open_case:"Open study",btn_open_case2:"Open study",
      footer:"All rights reserved",open_cv:"Open CV",
      contact_name:"Name",contact_email:"Email",contact_subject:"Subject",contact_message:"Message",
      contact_sign_google:"Sign in with Google",contact_send:"Send",contact_or:"or",
      contact_placeholder_msg:"Write your message here… (rich text allowed)"}
  };
  const T=k=>I[lang][k]||k;

  // Thème : auto (OS) ou override
  let themeLock = !!safeGet(THEME_KEY);
  const applyTheme = (mode)=>{
    document.documentElement.dataset.theme = mode;
    const tb = byId('themeBtn'); if (tb) tb.textContent = mode==='dark'?'☾':'☀';
  };
  const applyThemeFromOS = ()=>{
    if (themeLock) return;
    const m=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = !!(m && m.matches);
    applyTheme(isDark?'dark':'light');
  };
  applyThemeFromOS();
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mql){
    if (mql.addEventListener) mql.addEventListener('change', applyThemeFromOS);
    else if (mql.addListener) mql.addListener(applyThemeFromOS);
  }
  const storedTheme = safeGet(THEME_KEY);
  if (storedTheme) applyTheme(storedTheme);

  // ====== État & refs DOM ======
  const $PL=byId('projectList'), $CL=byId('caseList'), $MR=byId('modalRoot'), $LB=byId('lightboxRoot');
  let projects=[], cases=[];
  const modalStack=[];
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Static text & i18n init =====
  function updateLangButton(){ const b=byId('langBtn'); if(b) b.textContent = lang==='fr' ? 'FR 🇫🇷' : 'EN 🇬🇧'; }
  function setLang(l){
    lang=l; safeSet(LANG_KEY, l);
    updateLangButton();
    txt(byId('heroDesc'), I[lang].hero_desc);
    ['nav_projects','nav_cases','nav_about','nav_contact','cv_fr','cv_en','hero_kicker','dl_cv_fr','dl_cv_en','projects_title','cases_title','about_role_title','about_skills_title','contact_title','legal_title','open_cv'].forEach(k=>{
      document.querySelectorAll(`[data-i18n="${k}"]`).forEach(n=>n.textContent=I[lang][k]);
    });
    txt(byId('footText'), `© ${new Date().getFullYear()} Nathan Tandille — ${T('footer')}`);
    renderProjects(); renderCases(); renderSkills(); renderContact();
  }
  setLang(lang);
  byId('langBtn')?.addEventListener('click',()=>setLang(lang==='fr'?'en':'fr'));

  // Thème bouton
  byId('themeBtn')?.addEventListener('click',()=>{
    const cur = document.documentElement.dataset.theme;
    const next = (cur==='dark'?'light':'dark');
    themeLock = true; safeSet(THEME_KEY, next);
    applyTheme(next); addThemeAnim();
  });
  byId('themeBtn')?.addEventListener('contextmenu',(e)=>{
    e.preventDefault();
    themeLock = false; safeSet(THEME_KEY, null);
    applyThemeFromOS(); addThemeAnim();
  });

  (function leafParticles(){
  const banner = document.getElementById('hero-banner');
  const rightPanel = document.querySelector('#curtain .right');
  if (!banner || !rightPanel) return;

  // ---- Couche globale fixe pour les feuilles
  const layer = document.getElementById('leafLayer') || (() => {
    const n = document.createElement('div');
    n.id = 'leafLayer';
    n.className = 'leaf-layer';
    document.documentElement.appendChild(n);
    return n;
  })();

  // --- spritesheets
  const SPRITE_COLS = 3, SPRITE_ROWS = 3;
  const SPRITE_DAY   = 'assets/leaf_cliff_particles_grid_export.png';
  const SPRITE_NIGHT = 'assets/leafN_cliff_particles_grid_export.png';
  const isDark = () => document.documentElement.dataset.theme === 'dark';

  const spritePos = (i)=>({ 
    bx:`${(i%SPRITE_COLS)/(SPRITE_COLS-1)*100}%`,
    by:`${Math.floor(i/SPRITE_COLS)/(SPRITE_ROWS-1)*100}%`
  });

  // --- sampling des points (alpha ignoré)
  const IMG_DAY='assets/leaf_right.png', IMG_NIGHT='assets/leaf_rightN.png';
  let imgW=0,imgH=0,sample=[];
  const src = new Image(); src.crossOrigin='anonymous'; src.decoding='async';
  const maskURL = ()=> isDark()?IMG_NIGHT:IMG_DAY;

  async function rebuildSamples(){
    await new Promise(res=>{
      const u=maskURL();
      if(src.src.endsWith(u)) return res();
      src.onload=res; 
      src.src=u;
    });
    const c=document.createElement('canvas'); 
    const ctx=c.getContext('2d',{willReadFrequently:true});
    imgW=c.width = src.naturalWidth||src.width; 
    imgH=c.height = src.naturalHeight||src.height;
    ctx.drawImage(src,0,0);
    const {data}=ctx.getImageData(0,0,imgW,imgH);
    sample.length=0;
    const STRIDE=Math.max(2, Math.round(Math.min(imgW,imgH)/160));
    for(let y=0;y<imgH;y+=STRIDE){
      for(let x=0;x<imgW;x+=STRIDE){
        const i=(y*imgW+x)*4, r=data[i], g=data[i+1], b=data[i+2];
        const Y=0.2126*r+0.7152*g+0.0722*b; // alpha ignoré
        if(Y>24) sample.push([x,y]);
      }
    }
  }

  // --- mapping image -> viewport absolu
  function mapToPanel(x,y){
    const pr=rightPanel.getBoundingClientRect(), pw=pr.width, ph=pr.height;
    const ir=imgW/imgH, prr=pw/ph;
    let dw,dh,ox,oy;
    if(prr>=ir){ dh=ph; dw=dh*ir; ox=pr.right-dw; oy=pr.top+(ph-dh)/2; }
    else { dw=pw; dh=dw/ir; ox=pr.right-dw; oy=pr.top+(ph-dh)/2; }
    return { x: ox + (x/imgW)*dw, y: oy + (y/imgH)*dh };
  }

  // --- vent lissé
  let wind=-30, target=-30;
  function updateWind(dt){
    target += (Math.random()*20-10)*dt;
    target = Math.max(-120, Math.min(40, target));
    wind += (target - wind) * Math.min(1, dt*1.8);
  }

  // --- particules
  const MAX=100; 
  const leaves=[];

  function spawnOne(){
    if(sample.length===0 || leaves.length>=MAX) return;
    const pick = sample[(Math.random()*sample.length)|0];
    const {x,y}=mapToPanel(pick[0],pick[1]);

    const el=document.createElement('div'); 
    el.className='leaf';
    el.style.backgroundImage = `url("${isDark() ? SPRITE_NIGHT : SPRITE_DAY}")`;

    const size=16+Math.random()*26; 
    const {bx,by}=spritePos((Math.random()*9)|0);
    el.style.setProperty('--w', size+'px');
    el.style.setProperty('--h', size+'px');
    el.style.setProperty('--bx', bx);
    el.style.setProperty('--by', by);
    el.style.opacity='1';
    layer.appendChild(el);

    leaves.push({
      el, x, y,
      vx: (-40 - Math.random()*60),
      vy: (30 + Math.random()*70),
      rot: (Math.random()*60-30)*Math.PI/180,
      spin:(80 + Math.random()*220)*(Math.random()<.5?-1:1)*Math.PI/180,
      swayA: 8 + Math.random()*18,
      swayF: 0.6 + Math.random()*0.9,
      life: 0, max: 7 + Math.random()*5,
      fade: 1.6,
      scroll0: window.scrollY,
      fading: false,
      fadeStartLife: null
    });
  }

  // --- rafale au scroll
  let lastY=window.scrollY, budget=0;
  function onScroll(){
    const y=window.scrollY, dy=Math.abs(y-lastY); lastY=y;
    budget += dy*0.2; if(budget>160) budget=160;
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  // --- drip constant
  setInterval(()=>{ if(Math.random()<.9) spawnOne(); }, 350);

  // --- rebuild des points d’émission sur changement de thème
  new MutationObserver(m=>{
    if(m.some(x=>x.type==='attributes'&&x.attributeName==='data-theme')) rebuildSamples();
  }).observe(document.documentElement,{attributes:true});

  // --- swap live des sprites jour/nuit
  new MutationObserver(() => {
    const url = isDark() ? SPRITE_NIGHT : SPRITE_DAY;
    document.querySelectorAll('.leaf').forEach(el => {
      el.style.backgroundImage = `url("${url}")`;
    });
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // --- boucle
  let prev = performance.now();
  function tick(t) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.033, (t - prev) / 1000); 
    prev = t;

    updateWind(dt);

    while (budget > 2) { spawnOne(); budget -= 2; }

    const vh = window.innerHeight;
    for (let i = leaves.length - 1; i >= 0; i--) {
      const L = leaves[i];
      L.vy += 240 * dt; 
      const sway = L.swayA * Math.sin(t * 0.001 * L.swayF * 2 * Math.PI);
      L.vx += (wind - L.vx) * dt * 0.8;
      L.x += (L.vx + sway) * dt;
      L.y += L.vy * dt;
      L.rot += L.spin * dt;

      const dyScroll = window.scrollY - L.scroll0;

      // Lancer le fade-out si fin de vie ou sortie écran
      if ((L.max - L.life <= L.fade) || (L.y > vh && !L.fading)) {
        L.fading = true;
        L.fadeStartLife = L.life;
      }

      let scale = 1, opacity = 1;
      if (L.fading) {
        const elapsedFade = L.life - L.fadeStartLife;
        const progress = Math.min(1, elapsedFade / L.fade);
        const eased = (1 - progress) ** 2; // easing doux
        scale = eased;
        opacity = eased;
        if (progress >= 1) {
          L.el.remove();
          leaves.splice(i, 1);
          continue;
        }
      }

      L.el.style.opacity = opacity;
      L.el.style.transform = `translate(${L.x}px, ${L.y - dyScroll}px) rotate(${L.rot}rad) scale(${scale})`;

      L.life += dt;
    }
  }

  (async()=>{ await rebuildSamples(); requestAnimationFrame(tick); })();
})();

  // Avatar + liens
  const avatar = byId('avatarImg');
  const lkdLink = byId('lkdLink'); if(lkdLink) lkdLink.href = CONFIG.SOCIAL.linkedin || '#';
  const mobyLink = byId('mobyLink'); if(mobyLink) mobyLink.href = CONFIG.SOCIAL.mobygames || '#';
  byId('avatarBtn')?.addEventListener('click',()=>{
    const src = avatar?.src || '';
    openModal('Photo', `<div class="media-shell"><img src="${src}" alt="Photo"/></div>`, {originEl: byId('avatarBtn')});
  });

  // ===== Empêcher restauration scroll / modales =====
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const navEntries = performance.getEntriesByType?.('navigation') || [];
  const isReload = navEntries[0]?.type === 'reload' || performance.navigation?.type === 1;
  function clearHashIfReload(){
    const hasDeep = location.hash.includes('project=') || location.hash.includes('case=');
    const sameOriginRef = document.referrer && new URL(document.referrer).origin === location.origin;
    if (hasDeep && (isReload || sameOriginRef)) {
      history.replaceState(null,'',location.pathname+location.search);
    }
  }
  window.addEventListener('pageshow', ()=>{ window.scrollTo(0,0); });
  clearHashIfReload();

  // ===== Boutons CV =====
  function openCVForLang(){ openCVModal(lang==='fr' ? CONFIG.CV_FR_URL : CONFIG.CV_EN_URL); }
  ;['cvBtn','cvCTA','cvFab'].forEach(id=>{ const n=byId(id); if(n) n.addEventListener('click', openCVForLang); });

  // ===== JSON load =====
  const tryPaths=['content/content_manifest.json','content/manifest.json','content_manifest.json'];
  async function j(u){try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw 0;return await r.json()}catch{return null}}
  const isHttp=u=>/^https?:\/\//i.test(u);
  const dir=p=>{const m=p.match(/^(.*)\/[^/]+$/);return m?m[1]:''};
  const join=(d,f)=>isHttp(f)?f:(f.includes('/')?f:(d?`${d}/${f}`:f));

  (async()=>{
    let mf=null,url=null; for(const p of tryPaths){const m=await j(p); if(m){mf=m; url=p; break}}

    renderProjects(); renderCases(); renderSkills(); renderContact();

    if(!mf){ startCurtain(); return; }

    const base=dir(url);
    const pfiles=(mf.projects||[]).map(f=>join(base,f));
    const cfiles=(mf.cases||[]).map(f=>join(base,f));
    projects=(await Promise.all(pfiles.map(j))).filter(Boolean);
    cases=(await Promise.all(cfiles.map(j))).filter(Boolean);
    renderProjects(); renderCases(); renderSkills(); renderContact();

    const hasDeepLink = location.hash && ( !isReload && !(document.referrer && new URL(document.referrer).origin===location.origin) );
    if (hasDeepLink) syncFromHash();
    else { window.scrollTo(0,0); if (location.hash) history.replaceState(null,'',location.pathname+location.search); }

    startCurtain();
  })();

 function startCurtain(){
  const wrap  = document.getElementById('curtain');
  if(!wrap) return;
  const left  = wrap.querySelector('.left');
  const right = wrap.querySelector('.right');

  const {
    maxScrollVh = 80, baseGapVW = 18, tightGapVW = 190,
    scaleDelta = 0.10, darkDelta = 0.50,
    easing = 'smoother', followHz = 9,
    wobbleGain = 0.018, wobbleFreq = 5.5, wobbleDecay = 4,
    desync = 0.06
  } = CONFIG.CURTAIN;

  // Pose images & état initial
  if (CONFIG.CURTAIN.leftImg)  left .style.setProperty('--leaf-img', `url("${CONFIG.CURTAIN.leftImg}")`);
  if (CONFIG.CURTAIN.rightImg) right.style.setProperty('--leaf-img', `var(--leaf-img-day)`);
  if (CONFIG.CURTAIN.leafSize) {
    left .style.setProperty('--leaf-size',  CONFIG.CURTAIN.leafSize);
    right.style.setProperty('--leaf-size', CONFIG.CURTAIN.leafSize);
  }
  wrap .style.setProperty('--slidePct','0%');
  left .style.setProperty('--leafScale','1');  right.style.setProperty('--leafScale','1');
  left .style.setProperty('--leafBright','1'); right.style.setProperty('--leafBright','1');

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = (t)=>{
    t = clamp01(t);
    if (easing === 'easeOut')    return 1 - Math.pow(1 - t, 3);
    if (easing === 'easeInOut')  return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    // smootherstep
    return t*t*t*(t*(t*6 - 15) + 10);
  };

  let maxScrollPx = window.innerHeight * (maxScrollVh / 100);
  let target = ease(Math.max(0, window.scrollY) / Math.max(1, maxScrollPx));
  let cur = target;
  let lastT = performance.now();
  let raf = 0;

  // petit rebond amorti
  let wobbleA = 0;                 // amplitude dynamique
  const maxWobble = 0.04;          // garde-fou

  function apply(t, nowSec){
    const gap = baseGapVW + (tightGapVW - baseGapVW) * t; // en vw
    const slidePct = gap / 2;

    // base visuelle
    const leafScale  = 1 - t * scaleDelta;
    const leafBright = 1 - t * darkDelta;

    // micro désynchro L/R (très léger, dépend de l’ouverture)
    const micro = desync * 0.06 * (1 - t); // diminue en fin d’ouverture

    wrap .style.setProperty('--slidePct',  slidePct.toFixed(3) + '%');
    left .style.setProperty('--leafScale',  (leafScale * (1 + micro)).toFixed(4));
    right.style.setProperty('--leafScale',  (leafScale * (1 - micro)).toFixed(4));
    left .style.setProperty('--leafBright', Math.max(0, leafBright * (1 + micro*0.4)).toFixed(4));
    right.style.setProperty('--leafBright', Math.max(0, leafBright * (1 - micro*0.4)).toFixed(4));
  }

  function loop(ts){
    const dt = Math.min(0.033, (ts - lastT) / 1000);
    lastT = ts;

    // inertie (exponentiel continu)
    const alpha = 1 - Math.exp(-dt * followHz);
    cur += (target - cur) * alpha;

    // wobble amorti
    wobbleA *= Math.exp(-dt * wobbleDecay);
    const wobble = Math.sin(ts/1000 * wobbleFreq * 2*Math.PI) * wobbleA;

    const displayT = clamp01(cur + wobble);
    apply(displayT, ts/1000);

    if (Math.abs(target - cur) > 0.0008 || wobbleA > 0.0008) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
    }
  }
  function ensureLoop(){ if(!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); } }

  function recomputeTarget(){
    maxScrollPx = window.innerHeight * (maxScrollVh / 100);
    const raw = Math.max(0, window.scrollY) / Math.max(1, maxScrollPx);
    const next = ease(raw);
    // injecte un peu de rebond proportionnel au changement ET à la fermeture
    const delta = Math.abs(next - target);
    wobbleA = Math.min(maxWobble, wobbleA + delta * wobbleGain * (1 - next));
    target = next;
    ensureLoop();
  }

  window.addEventListener('scroll',  recomputeTarget, {passive:true});
  window.addEventListener('resize',  recomputeTarget, {passive:true});
  window.addEventListener('orientationchange', recomputeTarget, {passive:true});

  // premier rendu
  apply(cur, performance.now()/1000);
}

  // ===== Helpers images =====
  function imgsArr(imgs){ if(!imgs) return []; if(Array.isArray(imgs)) return imgs; if(typeof imgs==='string') return [imgs]; if(typeof imgs==='object'){const out=[]; for(const k in imgs){const v=imgs[k]; if(Array.isArray(v)) out.push(...v); else if(typeof v==='string') out.push(v)} return [...new Set(out)]} return [] }
  function cover(imgs){ if(!imgs) return ''; if(Array.isArray(imgs)) return imgs[0]||''; if(typeof imgs==='object') return imgs.cover||imgs.hero||(Array.isArray(imgs.gallery)?imgs.gallery[0]:imgs.gallery)||imgsArr(imgs)[0]||''; if(typeof imgs==='string') return imgs; return '' }

  // ===== Lightbox =====
  function openGallery(imgs,i=0){
    closeGallery(); const list=imgsArr(imgs); if(!list.length) return;
    document.body.classList.add('no-scroll');
    let k=i; const n=el(`<div class="lightbox" role="dialog" aria-modal="true">
      <button class="lb-btn x" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Prev">‹</button>
      <img src="${list[k]}" alt="">
      <button class="lb-next" aria-label="Next">›</button>
    </div>`);
    $LB.appendChild(n); requestAnimationFrame(()=>n.classList.add('show'));
    const img=()=>n.querySelector('img').setAttribute('src',list[k]);
    const prev=()=>{k=(k-1+list.length)%list.length; img()}, next=()=>{k=(k+1)%list.length; img()};
    n.addEventListener('click',e=>{if(e.target===n) closeGallery()});
    n.querySelector('.x').addEventListener('click',closeGallery);
    n.querySelector('.lb-prev').addEventListener('click',prev);
    n.querySelector('.lb-next').addEventListener('click',next);
    window.addEventListener('keydown',onKey); function onKey(e){ if(e.key==='Escape') closeGallery(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next() }
  }
  function closeGallery(){ $LB.innerHTML=''; document.body.classList.remove('no-scroll') }

  // ===== Modal (FLIP + fade + scroll lock) =====
  function ghostFrom(el, r, extra={}){const g=el.cloneNode(true); g.classList.add('ghost'); Object.assign(g.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',transformOrigin:'top left',margin:0,zIndex:1000,pointerEvents:'none',...extra}); document.body.appendChild(g); return g}

  function openModal(title, bodyHTML, {originEl=null, showBack=false, onBack=null, onReady}={}){
    const backdrop=el(`<div class="modal-backdrop"><div class="modal"><header>${showBack?`<button class="back" aria-label="Back">←</button>`:''}<h3 style="margin:0">${title}</h3><button class="x" aria-label="Close">✕</button></header><div class="modal-body">${bodyHTML}</div></div></div>`);
    $MR.innerHTML=''; $MR.appendChild(backdrop);
    const modal=backdrop.querySelector('.modal');
    const shell=modal.querySelector('[data-media-shell]')||modal;

    const show=()=>{
      backdrop.classList.add('backdrop-show');
      requestAnimationFrame(()=>modal.classList.add('show'));
      document.body.classList.add('no-scroll');
      backdrop.addEventListener('click',e=>{ if(e.target===backdrop) closeModal({originEl}) }, {passive:true});
      modal.querySelector('.x').addEventListener('click',()=>closeModal({originEl}));
      if(showBack && onBack){ modal.querySelector('.back').addEventListener('click',()=>onBack()); }
      onReady&&onReady(modal);
    };

    if(!originEl || prefersReduced){ requestAnimationFrame(show); return }

    const from=originEl.getBoundingClientRect(), to=shell.getBoundingClientRect();
    const g=ghostFrom(originEl, from, {borderRadius:getComputedStyle(originEl).borderRadius});
    backdrop.classList.add('backdrop-show');
    g.animate(
      [{transform:'translate(0,0) scale(1,1)'},
       {transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,borderRadius:getComputedStyle(shell).borderRadius}],
      {duration:320,easing:'cubic-bezier(.2,.8,.2,1)'}
    ).onfinish=()=>{ g.remove(); show(); };
  }

  function closeModal({originEl=null}={}){
    const backdrop=$MR.firstChild; if(!backdrop){$MR.innerHTML='';return}
    if(prefersReduced||!originEl){ $MR.innerHTML=''; document.body.classList.remove('no-scroll'); return }
    const modal=backdrop.querySelector('.modal');
    const shell=modal.querySelector('[data-media-shell]')||modal;
    const from=shell.getBoundingClientRect(), to=originEl.getBoundingClientRect();
    const g=ghostFrom(shell,from,{borderRadius:getComputedStyle(shell).borderRadius});
    $MR.innerHTML=''; document.body.classList.remove('no-scroll');
    g.animate(
      [{transform:'translate(0,0) scale(1,1)'},
       {transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,borderRadius:getComputedStyle(originEl).borderRadius}],
      {duration:280,easing:'cubic-bezier(.2,.8,.2,1)'}
    ).onfinish=()=>g.remove();
  }

  const yt = (id,autoplay=false,muted=false)=>`<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay?'&autoplay=1':''}${muted?'&mute=1':''}" allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  const mediaShellHtml = (inner='')=>`<div class="media-shell" data-media-shell>${inner}</div>`;

  // ===== Projects =====
  function renderProjects(){
    if(!$PL) return;
    $PL.innerHTML='';
    projects.forEach(p=>{
      const gallery=imgsArr(p.images);
      const cov=cover(p.images)||gallery[0]||`https://picsum.photos/seed/${p.id||'p'}/1280/720`;
      const hasT=!!p.trailer, nA=p.anecdotes?.[lang]?.length||0;

      const tile=el(`<article class="tile organic" tabindex="0" aria-label="${p.title?.[lang]||p.title}">
        <div class="thumb"><img src="${cov}" alt="${p.title?.[lang]||p.title}" loading="lazy" decoding="async"/></div>
        <div class="meta-row">
          <div>
            <h3>${p.title?.[lang]||p.title}</h3>
            ${p.role ? `<span class="role-badge"><span class="dot"></span>${p.role?.[lang]||p.role}</span>` : ''}
          </div>
        </div>
        ${ (p.summary&&p.summary[lang]) ? `<p class="summary">${p.summary[lang]}</p>` : '<p class="summary"></p>' }
        <div class="chips">
          <span class="chip">${T('chip_overview')}</span>
          ${hasT?`<span class="chip">${T('chip_trailer')}</span>`:''}
          ${gallery.length?`<button class="chip-btn" data-images>${T('chip_images')} (${gallery.length})</button>`:''}
          ${nA?`<span class="chip">${T('chip_anecdotes')} (${nA})</span>`:''}
        </div>
      </article>`);
      tile.style.borderRadius = organicRadius(p.id||p.title?.[lang]||'x');

      if(hasT){
        let hoverTimer=null, playing=false, savedHTML=null;
        const thumb=tile.querySelector('.thumb');
        tile.addEventListener('mouseenter',()=>{
          hoverTimer=setTimeout(()=>{
            if(playing) return;
            savedHTML=thumb.innerHTML;
            thumb.innerHTML=yt(p.trailer,true,true);
            playing=true;
          },1000);
        });
        tile.addEventListener('mouseleave',()=>{
          if(hoverTimer){clearTimeout(hoverTimer); hoverTimer=null}
          if(playing){thumb.innerHTML=savedHTML; playing=false}
        });
      }

      const originMedia = tile.querySelector('.thumb');
      tile.addEventListener('click',()=>openProject(p,{originEl:originMedia}));
      tile.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openProject(p,{originEl:originMedia}); }});
      const b=tile.querySelector('[data-images]'); if(b) b.addEventListener('click',ev=>{ ev.stopPropagation(); openGallery(p.images) });

      $PL.appendChild(tile);
    });
  }
  function organicRadius(id){const r=[['28px 20px 32px 18px/24px 28px 20px 30px'],['30px 18px 28px 22px/22px 32px 22px 28px'],['26px 26px 34px 18px/24px 28px 22px 30px']];const h=String(id||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0);return r[h%r.length]}

  // ===== Modal projet =====
  function openProject(p,{originEl=null}={}){
    setHash({project:p.id});
    modalStack.length=0;

    const gallery=imgsArr(p.images);
    const cov=cover(p.images)||gallery[0]||'';
    const initial = p.trailer ? yt(p.trailer,true,false) : (cov?`<img src="${cov}" alt="" style="object-fit:cover"/>`:'');
    const relCase = cases.find(c=>c.projects?.includes(p.id));

    const body = `
      ${mediaShellHtml(initial)}
      <div class="row" style="margin:10px 0">
        ${gallery.length?`<button class="btn" data-gallery>${T('btn_open_gallery')}</button>`:''}
        ${relCase?`<button class="btn" data-case>${T('btn_open_case')}</button>`:''}
        ${(p.links||[]).map(l=>`<a class="btn" target="_blank" rel="noopener" href="${l.url}">${l.label?.[lang]||l.label}</a>`).join('')}
      </div>
      ${(p.summary&&p.summary[lang] ? `<p class="fade-in" style="color:var(--ink-700)">${p.summary[lang]}</p>` : '')}
      ${gallery.length?`<div class="media-strip fade-in">${gallery.map(u=>`<img src="${u}" alt="">`).join('')}</div>`:''}
      ${p.anecdotes?.[lang]?.length?`<h4 class="fade-in" style="margin:12px 0 6px">${T('chip_anecdotes')}</h4><ul class="fade-in" style="margin:0 0 0 18px">${p.anecdotes[lang].map(a=>`<li>${a}</li>`).join('')}</ul>`:''}
    `;
    openModal(p.title?.[lang]||p.title, body, {originEl, onReady(m){
      const shell=m.querySelector('[data-media-shell]');
      const gbtn=m.querySelector('[data-gallery]'); if(gbtn) gbtn.addEventListener('click',()=>openGallery(p.images));
      const strip=m.querySelector('.media-strip'); if(strip){
        strip.querySelectorAll('img').forEach(th=>th.addEventListener('click',()=>{ shell.innerHTML=''; shell.innerHTML=`<img src="${th.src}" alt="" style="object-fit:cover"/>`; }));
      }
      const cb=m.querySelector('[data-case]'); if(cb) cb.addEventListener('click',()=>{
        modalStack.push(()=> openProject(p,{originEl:shell}));
        openCase(relCase,{originEl:shell});
      });
    }});
  }

  // ===== Cases =====
  function renderCases(){
    if(!$CL) return;
    $CL.innerHTML='';
    cases.forEach(c=>{
      const imgs=Array.isArray(c.media?.images)?c.media.images:(c.media?.images?[c.media.images]:[]);
      const cov=c.media?.trailer?`https://img.youtube.com/vi/${c.media.trailer}/hqdefault.jpg`:(imgs[0]||`https://picsum.photos/seed/${c.id||'c'}/1280/720`);
      const tile=el(`<article class="tile organic" tabindex="0" aria-label="${c.title?.[lang]||c.title}">
        <div class="thumb"><img src="${cov}" alt="${c.title?.[lang]||c.title}" loading="lazy" decoding="async"/></div>
        <div class="meta-row"><h3>${c.title?.[lang]||c.title}</h3></div>
        <p class="summary">${(c.abstract&&c.abstract[lang])||c.abstract||''}</p>
      </article>`);
      tile.style.borderRadius=organicRadius(c.id||c.title?.[lang]||'y');
      const originMedia=tile.querySelector('.thumb');
      tile.addEventListener('click',()=>openCase(c,{originEl:originMedia}));
      tile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault(); openCase(c,{originEl:originMedia})}});
      $CL.appendChild(tile);
    });
  }

  function openCase(c,{originEl=null}={}){
    const fromProject = modalStack.length>0;
    setHash(fromProject?{project:(projects.find(p=>c.projects?.includes(p.id))||{}).id,kase:c.id}:{kase:c.id});

    const imgs=Array.isArray(c.media?.images)?c.media.images:(c.media?.images?[c.media.images]:[]);
    const initial = c.media?.trailer ? yt(c.media.trailer,true,false) : (imgs[0]?`<img src="${imgs[0]}" alt="" style="object-fit:cover"/>`:'');

    const body = `
      ${mediaShellHtml(initial)}
      <div class="row" style="margin:10px 0">
        ${imgs.length?`<button class="btn" data-gallery>${T('btn_open_gallery')}</button>`:''}
      </div>
      <p class="fade-in" style="color:var(--ink-700)">${(c.abstract&&c.abstract[lang])||c.abstract||''}</p>
      <div class="grid grid3 fade-in">
        ${listBlock(lang==='fr'?'Objectifs':'Objectives', c.objectives?.[lang])}
        ${listBlock(lang==='fr'?'Responsabilités':'Responsibilities', c.responsibilities?.[lang])}
        ${listBlock('Impact', c.impact?.[lang])}
      </div>
      ${imgs.length?`<div class="media-strip fade-in">${imgs.map(u=>`<img src="${u}" alt="">`).join('')}</div>`:''}
    `;
    openModal(c.title?.[lang]||c.title, body, {
      originEl,
      showBack: fromProject,
      onBack: ()=>{
        const prev = modalStack.pop();
        const pr = projects.find(p=>c.projects?.includes(p.id));
        setHash({project: pr?.id});
        prev && prev();
      },
      onReady(m){
        const shell=m.querySelector('[data-media-shell]');
        const gbtn=m.querySelector('[data-gallery]'); if(gbtn) gbtn.addEventListener('click',()=>openGallery(imgs));
        const strip=m.querySelector('.media-strip'); if(strip){
          strip.querySelectorAll('img').forEach(th=>th.addEventListener('click',()=>{ shell.innerHTML=''; shell.innerHTML=`<img src="${th.src}" alt="" style="object-fit:cover"/>`; }));
        }
      }
    });
  }
  function listBlock(title, items){return `<div class="card"><h4 style="margin:0 0 4px">${title}</h4><ul style="margin:8px 0 0 18px">${(items||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div>`}

  // ===== CV Modal =====
  function openCVModal(pdfUrl){
    const body=`
      <div class="cv-toolbar">
        <button class="btn" data-zoom="in">＋</button>
        <button class="btn" data-zoom="out">－</button>
        <button class="btn" data-fit>⤢</button>
        <a class="btn" href="${pdfUrl}" download>⬇︎</a>
      </div>
      <div class="cv-view"><div class="cv-zoom" data-cvzoom style="transform:scale(1)">
        <iframe src="${pdfUrl}#toolbar=0" style="width:100%;height:78vh;border:0"></iframe>
      </div></div>
    `;
    openModal(lang==='fr'?'CV':'Resume', body, {originEl:null, onReady(m){
      let scale=1, dx=0, dy=0, drag=false, px=0, py=0;
      const z=m.querySelector('[data-cvzoom]'), view=m.querySelector('.cv-view');
      const set=(s)=>{scale=Math.min(3,Math.max(.6,s)); z.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`};
      m.querySelector('[data-zoom="in"]').addEventListener('click',()=>set(scale+0.12));
      m.querySelector('[data-zoom="out"]').addEventListener('click',()=>set(scale-0.12));
      m.querySelector('[data-fit]').addEventListener('click',()=>{scale=1;dx=dy=0;set(scale)});
      view.addEventListener('wheel',e=>{ e.preventDefault(); set(scale + (e.deltaY<0?.08:-.08)); }, {passive:false});
      view.addEventListener('mousedown',e=>{drag=true;px=e.clientX;py=e.clientY;view.style.cursor='grabbing'});
      window.addEventListener('mouseup',()=>{drag=false;view.style.cursor=''});
      view.addEventListener('mousemove',e=>{
        if(!drag)return; dx+=e.clientX-px; dy+=e.clientY-py; px=e.clientX; py=e.clientY; set(scale);
      });
    }});
  }

  // ===== Three.js (stable, rendu "on‑demand") =====
  const canvas = document.getElementById('r3f');
  let renderer, scene, camera, head, eyeL, eyeR, loadedModel = null;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const hasGL = (()=>{ try{
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  }catch{ return false } })();

  if(!hasGL){
    const fb = document.getElementById('webglFallback');
    fb?.classList.remove('sr-only');
    if (fb) fb.textContent = lang==='fr' ? 'Votre navigateur ne supporte pas WebGL.' : 'Your browser does not support WebGL.';
  } else {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    function sizeFromContainer(){
      const parent = canvas.parentElement || document.body;
      const rect = parent.getBoundingClientRect();

      const wCSS = Math.max(1, Math.floor(rect.width));
      const hCSS = Math.max(1, Math.floor(rect.height));

      let pr = clamp(window.devicePixelRatio || 1, 1, 2);
      const estPixels = wCSS * hCSS * pr * pr;
      const MAX_PIXELS = 10_000_000; // ~10MP
      if (estPixels > MAX_PIXELS) {
        pr = Math.sqrt(MAX_PIXELS / (wCSS * hCSS));
      }
      renderer.setPixelRatio(pr);
      renderer.setSize(wCSS, hCSS, true); // updateStyle = true

      camera.aspect = wCSS / hCSS;
      camera.updateProjectionMatrix();
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.set(0,0,2.9);
    const dl=new THREE.DirectionalLight(0xffffff,1.1); dl.position.set(1,2,3); scene.add(dl);
    scene.add(new THREE.AmbientLight(0xffffff,.45));

    function fallbackHead(){
      head=new THREE.Mesh(new THREE.SphereGeometry(1,42,42),new THREE.MeshStandardMaterial({roughness:.35,metalness:.05}));
      scene.add(head);
      const eyeG=new THREE.SphereGeometry(.08,24,24), eyeM=new THREE.MeshStandardMaterial({color:0x222222,roughness:.3});
      eyeL=new THREE.Mesh(eyeG,eyeM); eyeR=new THREE.Mesh(eyeG,eyeM); eyeL.position.set(-.28,.15,.93); eyeR.position.set(.28,.15,.93); scene.add(eyeL,eyeR);
    }

    if(CONFIG.MODEL_URL){
      const loader=new GLTFLoader();
      loader.load(CONFIG.MODEL_URL,
        (gltf)=>{ loadedModel=gltf.scene; scene.add(loadedModel); renderOnce(); },
        undefined,
        (e)=>{ console.warn('GLTF load error',e); fallbackHead(); renderOnce(); }
      );
    } else {
      fallbackHead(); renderOnce();
    }

    let moveRAF = 0;
    function onMoveGlobal(e){
      if (moveRAF) return;
      moveRAF = requestAnimationFrame(()=>{
        moveRAF = 0;
        const vw=window.innerWidth, vh=window.innerHeight;
        const x=(e.clientX/vw)*2-1; 
        const y=-((e.clientY/vh)*2-1);
        if(loadedModel){
          loadedModel.rotation.y = x * 0.8;
          loadedModel.rotation.x = y * 0.55;
        } else if(head){
          head.rotation.y = x * 0.45;
          head.rotation.x = y * 0.35;
          if(eyeL&&eyeR){
            eyeL.position.x = -0.28 + x*0.12;
            eyeR.position.x =  0.28 + x*0.12;
            eyeL.position.y =  0.15 + y*0.08;
            eyeR.position.y =  0.15 + y*0.08;
          }
        }
        renderOnce();
      });
    }
    document.addEventListener('pointermove', onMoveGlobal, {passive:true});

    window.addEventListener('resize', ()=>{ sizeFromContainer(); renderOnce(); }, {passive:true});
    window.addEventListener('orientationchange', ()=>{ sizeFromContainer(); renderOnce(); }, {passive:true});
    sizeFromContainer();

    function renderOnce(){ renderer.render(scene,camera) }
  }

  // ===== Skills / Contact =====
  function renderSkills(){
    const wrap = byId('skillsWrap'); if(!wrap) return;
    const groups = PROFILE.skills[lang];
    wrap.innerHTML = `
      <div class="card">
        <p style="margin:0 0 8px">${PROFILE.tagline[lang]}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:14px;opacity:.85">
          <a class="pill" href="mailto:${PROFILE.links.email}">${PROFILE.links.email}</a>
          <span class="pill">${PROFILE.links.location}</span>
        </div>
      </div>
      ${groups.map(g=>`
        <div class="skill-group">
          <h3>${g.title}</h3>
          <div class="skill-badges">${g.items.map(x=>`<span class="badge">${x}</span>`).join(' ')}</div>
        </div>`).join('')}
    `;
  }
  function renderContact(){
    const mount = byId('contactMount'); if(!mount) return;
    mount.innerHTML = `
      <div class="contact-grid">
        <div>
          <div style="display:grid;gap:8px">
            <input id="cName" class="input" type="text" placeholder="${I[lang].contact_name}">
            <input id="cEmail" class="input" type="email" placeholder="${I[lang].contact_email}">
            <input id="cSubj" class="input" type="text" placeholder="${I[lang].contact_subject}">
            <div class="row" style="align-items:center;gap:8px">
              <div id="googleBtn"></div>
              <span style="opacity:.6">${I[lang].contact_or}</span>
              <a class="pill" href="mailto:${MAILCFG.TO}">${MAILCFG.TO}</a>
            </div>
          </div>
        </div>
        <div>
          <div class="rte">
            <div class="rte-toolbar">
              <button class="btn" data-cmd="bold"><b>B</b></button>
              <button class="btn" data-cmd="italic"><i>I</i></button>
              <button class="btn" data-cmd="underline"><u>U</u></button>
              <button class="btn" data-cmd="insertUnorderedList">• List</button>
              <button class="btn" data-cmd="insertOrderedList">1. List</button>
              <button class="btn" data-link>🔗</button>
            </div>
            <div id="cEditor" class="rte-editor" contenteditable="true" data-placeholder="${I[lang].contact_placeholder_msg}"></div>
          </div>
          <div class="actions" style="margin-top:10px">
            <button id="cSend" class="btn btn-cta">${I[lang].contact_send}</button>
          </div>
        </div>
      </div>
    `;

    const ed = byId('cEditor');
    mount.querySelectorAll('[data-cmd]').forEach(b=>{
      b.addEventListener('click', ()=> { try{ document.execCommand(b.dataset.cmd,false,null);}catch{} });
    });
    mount.querySelector('[data-link]').addEventListener('click', ()=>{
      const url = prompt('URL:'); if(!url) return;
      try{ document.execCommand('createLink', false, url); }catch{}
    });

    if (MAILCFG.GOOGLE_CLIENT_ID && window.google?.accounts?.id){
      google.accounts.id.initialize({
        client_id: MAILCFG.GOOGLE_CLIENT_ID,
        callback: (resp)=>{
          try{
            const payload = JSON.parse(atob(resp.credential.split(".")[1]));
            const full = payload.name || '';
            const email = payload.email || '';
            const name = full || email.split('@')[0];
            byId('cName').value = name;
            byId('cEmail').value = email;
          }catch(e){ console.warn('Google decode error', e) }
        }
      });
      google.accounts.id.renderButton(byId('googleBtn'), { theme:'outline', size:'large', text:'continue_with', shape:'pill' });
    } else {
      byId('googleBtn').innerHTML = `<button class="btn" disabled title="Configurer GOOGLE_CLIENT_ID dans app.js">Google</button>`;
    }

    byId('cSend').addEventListener('click', async ()=>{
      const name = (byId('cName').value || '').trim();
      const email= (byId('cEmail').value||'').trim();
      const subj = (byId('cSubj').value || '').trim() || `[Portfolio] Message de ${name||'inconnu'}`;
      const html = ed.innerHTML.trim();

      if(!email){ alert(lang==='fr'?'Merci de renseigner un email.':'Please provide an email.'); return; }
      if(!html){ alert(lang==='fr'?'Message vide.':'Empty message.'); return; }

      const useEmailJS = MAILCFG.EMAILJS_PUBLIC_KEY && MAILCFG.EMAILJS_SERVICE_ID && MAILCFG.EMAILJS_TEMPLATE_ID && window.emailjs;
      try{
        if(useEmailJS){
          emailjs.init({ publicKey: MAILCFG.EMAILJS_PUBLIC_KEY });
          await emailjs.send(MAILCFG.EMAILJS_SERVICE_ID, MAILCFG.EMAILJS_TEMPLATE_ID, {
            to_email: MAILCFG.TO,
            from_email: email,
            from_name: name || email,
            subject: subj,
            message_html: html
          });
          alert(lang==='fr'?'Message envoyé, merci !':'Message sent, thanks!');
          ed.innerHTML=''; byId('cSubj').value='';
        }else{
          const tmp = document.createElement('div'); tmp.innerHTML = html;
          const plain = tmp.innerText.replace(/\n{3,}/g,'\n\n');
          const href = `mailto:${encodeURIComponent(MAILCFG.TO)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(plain + `\n\n— ${name} <${email}>`)}`;
          location.href = href;
        }
      }catch(err){
        console.error(err);
        alert(lang==='fr'?'Échec de l’envoi. Essaie via ton client mail.':'Send failed. Try your mail client.');
        const tmp = document.createElement('div'); tmp.innerHTML = html;
        const plain = tmp.innerText.replace(/\n{3,}/g,'\n\n');
        const href = `mailto:${encodeURIComponent(MAILCFG.TO)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(plain + `\n\n— ${name} <${email}>`)}`;
        location.href = href;
      }
    });
  }

  // ===== Initial render =====
  function renderInit(){ renderProjects(); renderCases(); renderSkills(); renderContact(); }
  renderInit();

  // ===== Router =====
  const parseHash = () => {
    const q = new URLSearchParams(location.hash.slice(1));
    return { project: q.get('project'), kase: q.get('case') };
  };
  const setHash = (o = {}) => {
    const q = new URLSearchParams(location.hash.slice(1));
    if ('project' in o) { o.project ? q.set('project', o.project) : q.delete('project'); }
    if ('kase' in o)    { o.kase    ? q.set('case', o.kase)     : q.delete('case'); }
    const s = q.toString();
    location.hash = s ? `#${s}` : '';
  };
  function syncFromHash(){
    const {project,kase}=parseHash();
    if(project){ const p=projects.find(x=>x.id===project); if(p) openProject(p,{originEl:null}); }
    if(kase){ const c=cases.find(x=>x.id===kase); if(c) openCase(c,{originEl:null}); }
  }
  window.addEventListener('hashchange',()=>{ if(!byId('modalRoot').firstChild) syncFromHash() }, {passive:true});
})();
