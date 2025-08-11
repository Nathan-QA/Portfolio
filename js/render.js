// render.js
import { byId, el, imgsArr, cover } from './utils.js';
import { state } from './state.js';
import { I, PROFILE, MAILCFG } from './config.js';
import { openModal, openGallery, yt, mediaShellHtml } from './ui.js';
import { setHash } from './router.js';

const T = (k, fallback) => (I?.[state.lang]?.[k]) || fallback || k;

function organicRadius(id){
  const r=[['28px 20px 32px 18px/24px 28px 20px 30px'],['30px 18px 28px 22px/22px 32px 22px 28px'],['26px 26px 34px 18px/24px 28px 22px 30px']];
  const h=String(id||'x').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return r[h%r.length];
}
function hueFromStr(s='skills'){ return [...String(s)].reduce((a,c)=>a+c.charCodeAt(0),0)%360; }

/* ---------------------------
   Gabarit de modale UNIFIÉ
---------------------------- */
function modalScaffold({ initial, images=[], actionsHTML='', leadHTML='', blocksHTML='' }){
  return `
    ${mediaShellHtml(initial)}
    ${images.length ? `<div class="media-strip" style="margin-top:10px">${images.map(u=>`<img src="${u}" alt="">`).join('')}</div>` : ''}
    ${actionsHTML ? `<div class="row" style="margin:10px 0; display:flex; gap:8px; flex-wrap:wrap">${actionsHTML}</div>` : ''}
    ${leadHTML || ''}
    ${blocksHTML || ''}
  `;
}

// applatie les comportements communs (miniatures → hero)
function wireStandardModal(m, {images=[]}={}){
  const shell = m.querySelector('[data-media-shell]');
  const strip = m.querySelector('.media-strip');
  if(strip && shell){
    strip.querySelectorAll('img').forEach(th=>{
      th.addEventListener('click', ()=>{
        shell.innerHTML = `<img src="${th.src}" alt="" style="object-fit:cover"/>`;
      });
    });
  }
  return { shell };
}

/* ---------- Mentions légales ---------- */
function ensureLegalFooter(){
  const sec = byId('legal'); if (sec) sec.style.display = 'none';
  const foot = document.querySelector('.footer .container');
  if (!foot) return;
  if (!foot.querySelector('[data-legal-btn]')){
    const btn = el(`<button class="btn" data-legal-btn style="margin-left:12px">${state.lang==='fr'?'Mentions légales':'Legal notice'}</button>`);
    foot.appendChild(btn);
    btn.addEventListener('click', ()=> openLegalModal());
  }
}
function openLegalModal(){
  const fr = state.lang==='fr';
  const body = `
    <div class="card">
      <h3 style="margin:0 0 6px">${fr?'Mentions légales':'Legal notice'}</h3>
      <p style="opacity:.8">${fr?'Informations conformes au droit français (LCEN, RGPD, Propriété intellectuelle).':'Information compliant with French law (LCEN, GDPR, IP).'}</p>
    </div>
    <div class="grid grid3" style="margin-top:10px">
      <div class="card"><h4 style="margin:0 0 6px">${fr?'Éditeur':'Publisher'}</h4><p style="margin:0">Nathan Tandille — Portfolio non commercial.</p><p style="margin:6px 0 0">${fr?'Contact :':'Contact:'} <a href="mailto:${PROFILE.links.email}">${PROFILE.links.email}</a></p></div>
      <div class="card"><h4 style="margin:0 0 6px">${fr?'Hébergement':'Hosting'}</h4><p style="margin:0">Vercel Inc.</p></div>
      <div class="card"><h4 style="margin:0 0 6px">${fr?'Données personnelles':'Privacy'}</h4><p style="margin:0">${fr?'Ce site ne collecte pas de données nominatives. Aucune analyse tierce n\'est active (ou restreinte à des statistiques anonymisées si activées).':'This site does not collect personally identifiable data. No third-party analytics are active (or limited to anonymized stats if enabled).'}</p></div>
      <div class="card"><h4 style="margin:0 0 6px">${fr?'Propriété intellectuelle':'Intellectual Property'}</h4><p style="margin:0">${fr?'Les contenus et marques cités restent la propriété de leurs détenteurs.':'All referenced content and trademarks remain the property of their respective owners.'}</p></div>
      <div class="card"><h4 style="margin:0 0 6px">Cookies</h4><p style="margin:0">${fr?'Fonctionnels uniquement (aucun ciblage).':'Functional only (no targeting).'}</p></div>
    </div>`;
  openModal(fr?'Mentions légales':'Legal notice', body, {originEl:null});
}

/* ---------- Projects ---------- */
export function renderProjects(){
  const list = byId('projectList'); if(!list) return;
  list.classList.add('projects-grid');
  list.innerHTML='';

  state.projects.forEach(p=>{
    const gallery=imgsArr(p.images);
    const cov=cover(p.images)||gallery[0]||`https://picsum.photos/seed/${p.id||'p'}/1600/900`;
    const title = p.title?.[state.lang] || p.title;

    const tile=el(`
      <article class="tile project-tile organic" tabindex="0" aria-label="${title}">
        <div class="thumb">
          <div class="media" data-media>
            <img src="${cov}" alt="${title}" loading="lazy" decoding="async"/>
          </div>
          <div class="ovr">
            <div class="ovr-top">
              ${p.role ? `<span class="role-badge o"><span class="dot"></span>${p.role?.[state.lang]||p.role}</span>` : ''}
            </div>
            <div class="ovr-bottom">
              <h3 class="t">${title}</h3>
              <button class="project-cta" data-open aria-label="${state.lang==='fr'?'Ouvrir le projet':'Open project'}">
                <span class="label">${state.lang==='fr'?'Détails':'Details'}</span><span class="arr">➜</span>
              </button>
            </div>
          </div>
        </div>
      </article>`);
    tile.style.borderRadius=organicRadius(p.id||title||'x');

    const mediaEl = tile.querySelector('[data-media]');

    // Trailer au hover
    let wasVideo=false;
    if (p.trailer){
      const toVideo = ()=>{ if(wasVideo) return; mediaEl.innerHTML = yt(p.trailer,true,true); wasVideo=true; };
      const toImg   = ()=>{ if(!wasVideo) return; mediaEl.innerHTML = `<img src="${cov}" alt="${title}" loading="lazy" decoding="async"/>`; wasVideo=false; };
      tile.addEventListener('mouseenter', toVideo, {passive:true});
      tile.addEventListener('mouseleave', toImg, {passive:true});
    }

    const open = ()=> openProject(p,{originEl:mediaEl});
    tile.addEventListener('click', open);
    tile.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); }});
    tile.querySelector('[data-open]').addEventListener('click', e=>{ e.stopPropagation(); open(); });

    list.appendChild(tile);
  });

  ensureLegalFooter();
}

/* ---------- Modale Projet ---------- */
export function openProject(p,{originEl=null}={}){
  setHash({project:p.id});
  state.modalStack.length=0;

  const gallery = imgsArr(p.images);
  const cov = cover(p.images) || gallery[0] || '';
  const initial = p.trailer ? yt(p.trailer,true,false)
                            : (cov?`<img src="${cov}" alt="" style="object-fit:cover"/>`:'');
  const relCase = state.cases.find(c=>c.projects?.includes(p.id));

  const actions = [
    gallery.length ? `<button class="btn" data-gallery>${T('btn_open_gallery','Open gallery')}</button>` : '',
    relCase       ? `<button class="btn" data-case>${T('btn_open_case','Open study')}</button>` : '',
    ...(p.links||[]).map(l=>`<a class="btn" target="_blank" rel="noopener" href="${l.url}">${l.label?.[state.lang]||l.label}</a>`)
  ].join('');

  const leadHTML = (p.summary?.[state.lang] || '')
    ? `<div class="card" style="margin-top:10px"><p style="margin:0;color:var(--ink-700)">${p.summary[state.lang]}</p></div>` : '';

  const blocksHTML = (p.anecdotes?.[state.lang]?.length)
    ? `<div class="card" style="margin-top:10px">
         <h4 style="margin:0 0 6px">${T('chip_anecdotes','Anecdotes')}</h4>
         <ul style="margin:0 0 0 18px">${p.anecdotes[state.lang].map(a=>`<li>${a}</li>`).join('')}</ul>
       </div>`
    : '';

  const body = modalScaffold({
    initial, images: gallery, actionsHTML: actions, leadHTML, blocksHTML
  });

  openModal(p.title?.[state.lang]||p.title, body, {
    originEl,
    onReady(m){
      const { shell } = wireStandardModal(m, {images:gallery});
      const gbtn = m.querySelector('[data-gallery]');
      if(gbtn) gbtn.addEventListener('click',()=>openGallery(p.images));
      const cbtn = m.querySelector('[data-case]');
      if(cbtn) cbtn.addEventListener('click',()=>{
        state.modalStack.push(()=> openProject(p,{originEl:shell}));
        const relCase2 = state.cases.find(c=>c.projects?.includes(p.id));
        if(relCase2) openCase(relCase2,{originEl:shell});
      });
    }
  });
}

/* ---------- Cases ---------- */
export function renderCases(){
  const list = byId('caseList'); if(!list) return;
  list.classList.add('cases-grid');
  list.innerHTML='';
  state.cases.forEach(c=>{
    const imgs=Array.isArray(c.media?.images)?c.media.images:(c.media?.images?[c.media.images]:[]);
    const cov=c.media?.trailer?`https://img.youtube.com/vi/${c.media.trailer}/hqdefault.jpg`:(imgs[0]||`https://picsum.photos/seed/${c.id||'c'}/1280/720`);
    const title = c.title?.[state.lang]||c.title;
    const lead = (c.abstract&&c.abstract[state.lang])||c.abstract||'';

    const tile=el(`<article class="tile tile--wide case-tile organic" tabindex="0" aria-label="${title}">
      <div class="thumb"><div class="media" data-media><img src="${cov}" alt="${title}" loading="lazy" decoding="async"/></div></div>
      <div class="case-body">
        <h3 class="case-title">${title}</h3>
        <p class="case-lead">${lead}</p>
        <div class="case-cta"><button class="btn btn-cta" data-open>${state.lang==='fr'?'Ouvrir pour détails':'Open for details'}</button></div>
      </div>
    </article>`);
    tile.style.borderRadius=organicRadius(c.id||title||'y');

    const open=()=>openCase(c,{originEl:tile.querySelector('[data-media]')});
    tile.addEventListener('click',open);
    tile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault(); open()}});
    tile.querySelector('[data-open]').addEventListener('click',e=>{e.stopPropagation(); open()});
    list.appendChild(tile);
  });

  ensureLegalFooter();
}

/* ---------- Modale Étude de cas ---------- */
export function openCase(c,{originEl=null}={}){
  const fromProject = state.modalStack.length>0;
  const pr = state.projects.find(p=>c.projects?.includes(p.id));
  setHash(fromProject?{project:pr?.id,kase:c.id}:{kase:c.id});

  const imgs = Array.isArray(c.media?.images) ? c.media.images
             : (c.media?.images ? [c.media.images] : []);
  const initial = c.media?.trailer ? yt(c.media.trailer,true,false)
                                   : (imgs[0]?`<img src="${imgs[0]}" alt="" style="object-fit:cover"/>`:'');

  const actions = [
    imgs.length ? `<button class="btn" data-gallery>${T('btn_open_gallery','Open gallery')}</button>` : ''
  ].join('');

  const leadHTML = (c.abstract && (c.abstract[state.lang]||c.abstract))
    ? `<div class="card" style="margin-top:10px"><p class="fade-in" style="margin:0;color:var(--ink-700)">${c.abstract[state.lang]||c.abstract}</p></div>`
    : '';

  const blocksHTML = `
    <div class="grid grid3 fade-in" style="margin-top:10px">
      ${listBlock(state.lang==='fr'?'Objectifs':'Objectives', c.objectives?.[state.lang])}
      ${listBlock(state.lang==='fr'?'Responsabilités':'Responsibilities', c.responsibilities?.[state.lang])}
      ${listBlock('Impact', c.impact?.[state.lang])}
    </div>
  `;

  const body = modalScaffold({
    initial, images: imgs, actionsHTML: actions, leadHTML, blocksHTML
  });

  openModal(c.title?.[state.lang]||c.title, body, {
    originEl,
    showBack: fromProject,
    onBack: ()=>{
      const prev = state.modalStack.pop();
      setHash({project: pr?.id});
      prev && prev();
    },
    onReady(m){
      wireStandardModal(m,{images:imgs});
      const gbtn = m.querySelector('[data-gallery]');
      if(gbtn) gbtn.addEventListener('click',()=>openGallery(imgs));
    }
  });
}

function listBlock(title, items){
  return `<div class="card"><h4 style="margin:0 0 4px">${title}</h4><ul style="margin:8px 0 0 18px">${(items||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
}

/* ---------- Skills ---------- */
export function renderSkills(){
  const mount = byId('skillsWrap'); if(!mount) return;

  const categoriesSrc = (() => {
    if (Array.isArray(state.skills?.categories)) return state.skills.categories;
    if (Array.isArray(state.skills?.[state.lang])) return state.skills[state.lang];
    if (Array.isArray(state.skills?.fr)) return state.skills.fr;
    if (Array.isArray(state.skills)) return state.skills;
    return null;
  })();

  const flatCards = (() => {
    if (categoriesSrc) {
      return categoriesSrc.flatMap(cat => {
        const catLabel =
          (cat.label && (cat.label[state.lang] || cat.label)) ||
          cat.name || cat.cat || cat.id || '';
        const secHue   = cat.hue ?? hueFromStr(catLabel);
        return (cat.items||[]).map(it => ({
          cat: catLabel, catId: cat.id || catLabel, hue: secHue,
          id: it.id || it.name,
          name: (it.title && (it.title[state.lang] || it.title)) || it.name || '',
          summary: (it.blurb && (it.blurb[state.lang] || it.blurb)) || it.summary || '',
          bullets: (it.bullets && (it.bullets[state.lang] || it.bullets)) || [],
          tags: it.tags || [],
          images: it.images || [],
          logo: it.logo || null,
          projects: (it.related?.projects || it.projects || []),
          cases: (it.related?.cases || it.cases || [])
        }));
      });
    }
    const deep = PROFILE.skillsDeep?.[state.lang];
    if (deep) {
      return deep.flatMap(cat => (cat.items||[]).map(it => ({
        cat: cat.cat, catId: cat.cat, hue: hueFromStr(cat.cat), id: it.name, name: it.name,
        summary: it.desc || '', bullets: it.examples || [], tags: it.tags || [],
        images: [], logo:null, projects: [], cases: []
      })));
    }
    const simple = PROFILE.skills?.[state.lang] || [];
    return simple.flatMap(g => (g.items||[]).map(n => ({
      cat: g.title, catId: g.title, hue: hueFromStr(g.title), id: n, name: n,
      summary: '', bullets: [], tags: [], images: [], logo:null, projects: [], cases: []
    })));
  })();

  // group by category
  const byCat = new Map();
  flatCards.forEach(s=>{
    const k = s.cat || 'Other';
    if(!byCat.has(k)) byCat.set(k,{hue:s.hue||210, items:[]});
    byCat.get(k).items.push(s);
  });

  const allLabel = state.lang==='fr'?'Tous':'All';
  const filters = [allLabel, ...[...byCat.keys()]];
  let current = allLabel;

  const filterBar = el(`<div class="skills-filter card" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"></div>`);
  filters.forEach(f=>{
    const b=el(`<button class="btn" data-filter="${f}" aria-pressed="${f===current?'true':'false'}">${f}</button>`);
    b.addEventListener('click',()=>{
      current=f;
      filterBar.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed', String(x===b)));
      renderSections();
    });
    filterBar.appendChild(b);
  });

  mount.innerHTML = '';
  mount.appendChild(filterBar);

  renderSections();

  function renderSections(){
    const wrapper = el(`<div class="skills-sections"></div>`);
    const cats = [...byCat.entries()].filter(([name]) => current===allLabel || name===current);

    cats.forEach(([name, data])=>{
      const sec = el(`
        <section class="skills-sec" style="--sec-h:${data.hue||210}">
          <div class="skills-sec-head"><h3 class="skills-sec-title">${name}</h3></div>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px"></div>
        </section>`);
      const grid = sec.querySelector('.grid');

      data.items.forEach(s=>{
        const firstImg = Array.isArray(s.images)&&s.images.length?s.images[0]:null;
        const logo = s.logo ? `<img class="skill-logo" src="${s.logo}" alt="">` : '';

        const node = el(`
          <article class="card skill-card" tabindex="0" role="button" aria-label="${s.name}">
            <div class="skill-thumb" ${firstImg?'' : 'data-empty'}>
              ${firstImg?`<img src="${firstImg}" alt="">`:''}
              ${logo}
            </div>
            <div class="skill-body">
              <div style="display:flex;align-items:flex-start;gap:8px;justify-content:space-between">
                <h3 class="skill-title">${s.name}</h3>
                <span class="pill sec-pill" style="white-space:nowrap">${s.cat}</span>
              </div>
              ${s.summary?`<p class="skill-sum">${s.summary}</p>`:''}
              ${s.bullets?.length?`<ul class="skill-bul">${s.bullets.slice(0,2).map(b=>`<li>${b}</li>`).join('')}</ul>`:''}
              ${s.tags?.length?`<div class="skill-badges" style="margin-top:6px">${s.tags.map(t=>`<span class="badge">${t}</span>`).join('')}</div>`:''}
              <div style="margin-top:auto"><button class="btn btn-cta" data-open>${state.lang==='fr'?'Voir les détails':'See details'}</button></div>
            </div>
          </article>
        `);
        node.__skill = s;

        // *** ORIGIN = vignette image (pas la card) ***
        const originThumb = node.querySelector('.skill-thumb');

        const open = ()=>openSkillModal(s, originThumb);
        node.addEventListener('click', e=>{
          if(e.target.closest('a,button')) return;
          open();
        });
        node.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); }});
        node.querySelector('[data-open]').addEventListener('click', e=>{ e.stopPropagation(); open(); });

        grid.appendChild(node);
      });

      wrapper.appendChild(sec);
    });

    const old = mount.querySelector('.skills-sections');
    if (old) old.replaceWith(wrapper); else mount.appendChild(wrapper);
  }

  // Modale Skill
  const openSkillModal = (s, originEl=null) => {
    const relProjects = (s.projects||[]).map(id => state.projects.find(p=>p.id===id)).filter(Boolean);
    const relCases    = (s.cases||[]).map(id => state.cases.find(c=>c.id===id)).filter(Boolean);

    const initial = s.images?.length ? `<img src="${s.images[0]}" alt="" style="object-fit:cover"/>` : '';
    const actions = [
      ...relProjects.map(p=>`<button class="btn" data-open-project="${p.id}">${p.title?.[state.lang]||p.title}</button>`),
      ...relCases.map(c=>`<button class="btn" data-open-case="${c.id}">${c.title?.[state.lang]||c.title}</button>`)
    ].join('');

    const leadHTML = `
      <div class="card" style="margin-top:10px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <h4 class="sm-title" style="margin:0">${s.name}</h4>
          <span class="pill">${s.cat}</span>
          ${(s.tags||[]).map(t=>`<span class="badge">${t}</span>`).join('')}
        </div>
        ${s.summary?`<p class="sm-sum" style="margin:8px 0 0">${s.summary}</p>`:''}
      </div>`;

    const blocksHTML = Array.isArray(s.bullets) && s.bullets.length ? `
      <div class="card" style="margin-top:10px">
        <h5 class="sm-sub" style="margin:0 0 6px">${state.lang==='fr'?'Exemples':'Examples'}</h5>
        <ul class="sm-list" style="margin:0 0 0 18px">${s.bullets.map(x=>`<li>${x}</li>`).join('')}</ul>
      </div>` : '';

    const body = modalScaffold({
      initial, images: s.images||[], actionsHTML: actions, leadHTML, blocksHTML
    });

    openModal(s.name, body, {
      originEl,
      onReady(m){
        const { shell } = wireStandardModal(m,{images:s.images||[]});

        m.querySelectorAll('[data-open-project]').forEach(b=>{
          b.addEventListener('click', ()=>{
            const id=b.getAttribute('data-open-project');
            const p=state.projects.find(x=>x.id===id);
            if(p) openProject(p,{originEl:shell||b});
          });
        });
        m.querySelectorAll('[data-open-case]').forEach(b=>{
          b.addEventListener('click', ()=>{
            const id=b.getAttribute('data-open-case');
            const c=state.cases.find(x=>x.id===id);
            if(c) openCase(c,{originEl:shell||b});
          });
        });
      }
    });
  };

  ensureLegalFooter();
}

/* ---------- Contact ---------- */
export function renderContact(){
  const mount = byId('contactMount'); if(!mount) return;
  mount.innerHTML = `
    <div class="contact-grid">
      <div>
        <div style="display:grid;gap:8px">
          <input id="cName" class="input" type="text" placeholder="${I[state.lang].contact_name}">
          <input id="cEmail" class="input" type="email" placeholder="${I[state.lang].contact_email}">
          <input id="cSubj" class="input" type="text" placeholder="${I[state.lang].contact_subject}">
          <div class="row" style="align-items:center;gap:8px">
            <div id="googleBtn"></div>
            <span style="opacity:.6">${I[state.lang].contact_or}</span>
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
          <div id="cEditor" class="rte-editor" contenteditable="true" data-placeholder="${I[state.lang].contact_placeholder_msg}"></div>
        </div>
        <div class="actions" style="margin-top:10px">
          <button id="cSend" class="btn btn-cta">${I[state.lang].contact_send}</button>
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

  byId('cSend').addEventListener('click', async ()=>{
    const name = (byId('cName').value || '').trim();
    const email= (byId('cEmail').value||'').trim();
    const subj = (byId('cSubj').value || '').trim() || `[Portfolio] Message de ${name||'inconnu'}`;
    const html = ed.innerHTML.trim();

    if(!email){ alert(state.lang==='fr'?'Merci de renseigner un email.':'Please provide an email.'); return; }
    if(!html){ alert(state.lang==='fr'?'Message vide.':'Empty message.'); return; }

    try{
      const tmp=document.createElement('div'); tmp.innerHTML=html;
      const plain=tmp.innerText.replace(/\n{3,}/g,'\n\n');
      const href=`mailto:${encodeURIComponent(MAILCFG.TO)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(plain + `\n\n— ${name} <${email}>`)}`;
      location.href=href;
    }catch(err){
      console.error(err);
      alert(state.lang==='fr'?'Échec de l’envoi. Essaie via ton client mail.':'Send failed. Try your mail client.');
    }
  });

  ensureLegalFooter();
}

/* ---------- CV modal ---------- */
export function openCVModal(pdfUrl){
  const body=`
    <div class="cv-toolbar">
      <button class="btn" data-zoom="in">＋</button>
      <button class="btn" data-zoom="out">－</button>
      <button class="btn" data-fit>⤢</button>
      <a class="btn" href="${pdfUrl}" download>⬇︎</a>
    </div>
    <div class="cv-view"><div class="cv-zoom" data-cvzoom style="transform:scale(1)">
      <iframe src="${pdfUrl}#toolbar=0" style="width:100%;height:78vh;border:0"></iframe>
    </div></div>`;
  openModal(state.lang==='fr'?'CV':'Resume', body, {originEl:null, onReady(m){
    let scale=1, dx=0, dy=0, drag=false, px=0, py=0;
    const z=m.querySelector('[data-cvzoom]'), view=m.querySelector('.cv-view');
    const set=(s)=>{scale=Math.min(3,Math.max(.6,s)); z.style.transform=`translate(${dx}px,${dy}px) scale(${scale})`};
    m.querySelector('[data-zoom="in"]').addEventListener('click',()=>set(scale+0.12));
    m.querySelector('[data-zoom="out"]').addEventListener('click',()=>set(scale-0.12));
    m.querySelector('[data-fit]').addEventListener('click',()=>{scale=1;dx=dy=0;set(scale)});
    view.addEventListener('wheel',e=>{ 
      e.preventDefault();
      set(scale + (e.deltaY < 0 ? 0.08 : -0.08));
    }, {passive:false});
    view.addEventListener('mousedown',e=>{drag=true;px=e.clientX;py=e.clientY;view.style.cursor='grabbing'});
    window.addEventListener('mouseup',()=>{drag=false;view.style.cursor=''});
    view.addEventListener('mousemove',e=>{ if(!drag)return; dx+=e.clientX-px; dy+=e.clientY-py; px=e.clientX; py=e.clientY; set(scale); });
  }});
}
