import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
      holdMs: 1200,

      // === OUVERTURE EN % (identique sur tous les écrans desktop) ===
      baseVW: 16,       // largeur de chaque feuille après ouverture initiale (en % du viewport)
      tightVW: 10,      // largeur quand on a scrollé (en % du viewport)
      maxScrollVh: 40, // distance de scroll pour aller de base -> tight, en % de la hauteur d’écran
      minClampVW: 0.8  // largeur minimale par feuille (en %), évite “trop fin” sur ultra-wide

      // Si tu préfères un calcul basé sur le gutter du container, supprime baseVW/tightVW
      // et dé-commente les lignes ci-dessous (option “auto”):
      // extraBaseVW: 7,
      // extraTightVW: 12,
      // minClampVW: 0.8
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

  // ===== Profil (extrait CV) =====
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
  const THEME_KEY='pref-theme'; // 'light' | 'dark' | (absent => auto)

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

  // Thème : auto (OS) ou override utilisateur
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

  // Thème bouton : clic = toggle / clic droit = auto (OS)
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

  // ===== Rideau (100% ratios : vw / vh) =====
  function startCurtain(){
    const wrap = byId('curtain');
    if(!wrap) return;
    const left = wrap.querySelector('.left');
    const right = wrap.querySelector('.right');

    if (CONFIG.CURTAIN.leftImg)  left.style.setProperty('--leaf-img', `url("${CONFIG.CURTAIN.leftImg}")`);
    if (CONFIG.CURTAIN.rightImg) right.style.setProperty('--leaf-img', `url("${CONFIG.CURTAIN.rightImg}")`);
    if (CONFIG.CURTAIN.leafSize) { 
      left.style.setProperty('--leaf-size', CONFIG.CURTAIN.leafSize);
      right.style.setProperty('--leaf-size', CONFIG.CURTAIN.leafSize);
    }

    // --- Paramètres en ratios ---
    const hasFixed = Number.isFinite(CONFIG.CURTAIN.baseVW) && Number.isFinite(CONFIG.CURTAIN.tightVW);
    const minClampVW = Number.isFinite(CONFIG.CURTAIN.minClampVW) ? CONFIG.CURTAIN.minClampVW : 0.8;
    const baseVW_fixed  = hasFixed ? +CONFIG.CURTAIN.baseVW  : 6;
    const tightVW_fixed = hasFixed ? +CONFIG.CURTAIN.tightVW : 3;
    const maxScrollVh   = Number.isFinite(CONFIG.CURTAIN.maxScrollVh) ? CONFIG.CURTAIN.maxScrollVh : 40;
    let maxScrollPx = window.innerHeight * (maxScrollVh / 100);

    // Option “auto via gutter” (si tu supprimes baseVW/tightVW)
    const containerMaxPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--container-max')) || 1280;
    function gutterVW(){
      const vw = window.innerWidth;
      const cm = Math.min(containerMaxPx, vw);
      const gutterPx = Math.max(0, (vw - cm) / 2);
      return (gutterPx / vw) * 100;
    }
    const extraBaseVW  = Number.isFinite(CONFIG.CURTAIN.extraBaseVW)  ? CONFIG.CURTAIN.extraBaseVW  : 7;
    const extraTightVW = Number.isFinite(CONFIG.CURTAIN.extraTightVW) ? CONFIG.CURTAIN.extraTightVW : 12;

    let baseVW, tightVW;
    function recompute(){
      if (hasFixed){
        baseVW  = Math.max(minClampVW, baseVW_fixed);
        tightVW = Math.max(minClampVW, tightVW_fixed);
      } else {
        const g = gutterVW();
        baseVW  = Math.max(minClampVW, g - extraBaseVW);
        tightVW = Math.max(minClampVW, g - extraTightVW);
      }
      maxScrollPx = window.innerHeight * (maxScrollVh / 100);
    }

    const setWidthsVW = (vwVal)=>{
      const v = Math.max(minClampVW, vwVal);
      wrap.style.setProperty('--leftW',  v + 'vw');
      wrap.style.setProperty('--rightW', v + 'vw');
    };

    // Fermé au départ
    setWidthsVW(50);
    recompute();

    setTimeout(()=>{
      recompute();
      setWidthsVW(baseVW);

      const onScroll = ()=>{
        const y = Math.max(0, window.scrollY);
        const t = Math.min(1, y / Math.max(1, maxScrollPx));
        const current = baseVW + (tightVW - baseVW) * t;
        setWidthsVW(current);
      };
      const onResize = ()=>{
        recompute();
        onScroll();
      };

      window.addEventListener('scroll', onScroll, {passive:true});
      window.addEventListener('resize', onResize, {passive:true});
      onScroll();
    }, CONFIG.CURTAIN.holdMs ?? 900);
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

  // ===== Three.js (suivi accentué) =====
  const canvas=byId('r3f');
  let renderer,scene,camera,head,eyeL,eyeR,loadedModel=null;
  const hasGL=(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl')||c.getContext('experimental-webgl'))}catch{return false}})();
  if(!hasGL){ const fb=byId('webglFallback'); fb?.classList.remove('sr-only'); if(fb) fb.textContent=lang==='fr'?'Votre navigateur ne supporte pas WebGL.':'Your browser does not support WebGL.' }
  else{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.8));
    const sizeFromContainer=()=>{
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.set(0,0,2.9);
    const dl=new THREE.DirectionalLight(0xffffff,1.1); dl.position.set(1,2,3); scene.add(dl);
    scene.add(new THREE.AmbientLight(0xffffff,.45));

    if(CONFIG.MODEL_URL){
      const loader=new GLTFLoader();
      loader.load(CONFIG.MODEL_URL,(gltf)=>{
        loadedModel=gltf.scene; loadedModel.scale.set(1,1,1); scene.add(loadedModel); renderOnce();
      },undefined,(e)=>{console.warn('GLTF load error',e); fallbackHead(); renderOnce();});
    } else { fallbackHead(); renderOnce(); }

    function fallbackHead(){
      head=new THREE.Mesh(new THREE.SphereGeometry(1,42,42),new THREE.MeshStandardMaterial({roughness:.35,metalness:.05}));
      scene.add(head);
      const eyeG=new THREE.SphereGeometry(.08,24,24), eyeM=new THREE.MeshStandardMaterial({color:0x222222,roughness:.3});
      eyeL=new THREE.Mesh(eyeG,eyeM); eyeR=new THREE.Mesh(eyeG,eyeM); eyeL.position.set(-.28,.15,.93); eyeR.position.set(.28,.15,.93); scene.add(eyeL,eyeR);
    }

    function onMoveGlobal(e){
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
    }
    document.addEventListener('pointermove', onMoveGlobal, {passive:true});

    const ro = new ResizeObserver(()=>{ sizeFromContainer(); renderOnce(); });
    ro.observe(canvas);
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
