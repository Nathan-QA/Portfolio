import { copy } from './i18n.mjs';
import { escapeHTML as e, localize as l, route, categories, categoryLabel, readingTime, slugify, markdown, safeURL } from '../scripts/content.mjs';

const paths = {
  arrow: 'M4 12h15m-6-6 6 6-6 6', down: 'M12 4v15m-6-6 6 6 6-6', up: 'M12 20V5m-6 6 6-6 6 6',
  external: 'M8 5H5v14h14v-3M12 5h7v7M10 14l9-9', sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z', menu: 'M4 7h16M4 12h16M4 17h16', close: 'm6 6 12 12M6 18 18 6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4', mail: 'M3 5h18v14H3ZM3 6l9 7 9-7', copy: 'M8 8h12v12H8ZM16 8V4H4v12h4',
  play: 'm9 5 11 7-11 7Z', pause: 'M8 5v14M16 5v14', chevron: 'm9 5 7 7-7 7', search: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  map: 'm3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3Zm6-3v17m6-14v17',
  focus: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  compass: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-7-4-2 5-5 2 2-5Z',
  leaf: 'M20 3C7 2 2 9 5 15s15 3 15-12ZM4 21 16 7'
};
export const icon = (name, extra = '') => `<svg class="icon ${extra}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.arrow}"/></svg>`;
const lines = text => e(text).replace(/\n/g, '<br>');
const pad = number => String(number).padStart(2, '0');
const paragraphs = array => (array || []).map(text => `<p>${e(text)}</p>`).join('');
const bullets = array => array?.length ? `<ul>${array.map(text => `<li>${e(text)}</li>`).join('')}</ul>` : '';
const tags = list => `<div class="tags">${(list || []).map(tag => `<span>${e(tag)}</span>`).join('')}</div>`;

export const themeBoot = `(()=>{try{const r=document.documentElement,t=localStorage.getItem('pref-theme'),m=localStorage.getItem('pref-motion');r.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';r.dataset.motion=m==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on'}catch{}})();`;

export function createTemplates(data, media) {
  const { site, projects, articles, skills } = data;
  const { image, imageURL } = media;
  const byProject = id => projects.find(p => p.id === id);
  const byArticle = id => articles.find(a => a.id === id);
  const localSkillImages = skill => (skill.images || []).filter(src => /^\/?assets\//.test(src));
  const projectTitle = (id, lang) => l(byProject(id)?.title, lang) || id;
  const articleTitle = (a, lang) => l(a.cardTitle || site.articleTitles?.[a.id] || a.title, lang);
  const projectSummary = (p, lang) => l(p.cardSummary || site.editorial?.[p.id] || p.summary, lang);
  const articleCover = a => a.cover || a.media?.images?.[0] || byProject(a.projects?.[0])?.images?.cover;
  const link = (url, label, className = 'text-link', external = false) => `<a class="${className}" href="${safeURL(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(label)}${icon(external ? 'external' : 'arrow')}</a>`;
  function chapter(number, kicker, title, intro, action = '') {
    return `<div class="section-heading"><div><div class="eyebrow"><span class="chapter-number">${pad(number)}</span>${e(kicker)}</div><h2>${lines(title)}</h2></div><div class="section-heading-aside">${intro ? `<p>${e(intro)}</p>` : ''}${action}</div></div>`;
  }
  function metadata(a, lang) {
    return `<span>${e(categoryLabel(categories(a)[0], lang))}</span><span class="meta-dot" aria-hidden="true">·</span><span>${readingTime(a, lang)} ${copy[lang].min}</span>`;
  }
  function projectCard(p, lang, featured = false, index = 0) {
    const t = copy[lang];
    return `<a class="project-card ${featured ? 'project-featured' : ''}" href="${route('projects', p.id, lang)}" data-filter-item data-categories="${e(categories(p).join(' '))}" data-search="${e([l(p.title, lang), l(p.role, lang), l(p.summary, lang), ...(l(p.tags, lang) || [])].join(' '))}" data-reveal>
      <div class="project-media" style="view-transition-name:project-${p.id}">${image(p.images.cover, { alt: '', sizes: featured ? '(max-width: 760px) 100vw, 62vw' : '(max-width: 760px) 100vw, 33vw' })}<span class="image-index" aria-hidden="true">${pad(index + 1)}</span>${featured ? `<span class="featured-stamp">${icon('leaf')}${t.featured}</span>` : ''}<span class="media-arrow">${icon('arrow')}</span></div>
      <div class="project-copy"><div class="eyebrow project-role">${e(l(p.role, lang))}</div><h3>${e(l(p.title, lang))}</h3><p>${e(projectSummary(p, lang))}</p>${featured ? `${tags((l(p.tags, lang) || []).slice(0, 3))}<span class="text-link">${t.openProject}${icon('arrow')}</span>` : `<span class="card-foot">${e(l(p.projectInfo?.engine, lang))}<span>${t.openProject}${icon('arrow')}</span></span>`}</div>
    </a>`;
  }
  function articleCard(a, lang, mode = 'grid') {
    const cover = articleCover(a);
    return `<a class="article-card article-${mode}" href="${route('articles', a.id, lang)}" data-filter-item data-categories="${e(categories(a).join(' '))}" data-projects="${e((a.projects || []).join(' '))}" data-search="${e([l(a.title, lang), l(a.abstract || a.summary, lang), ...(a.tags || [])].join(' '))}" data-reveal>
      ${cover ? `<div class="article-thumb">${image(cover, { alt: '', sizes: mode === 'row' ? '180px' : '(max-width: 760px) 100vw, 50vw' })}${mode !== 'row' ? `<span class="media-arrow">${icon('arrow')}</span>` : ''}</div>` : ''}
      <div class="article-copy"><div class="metadata">${metadata(a, lang)}</div><h3>${e(articleTitle(a, lang))}</h3>${mode !== 'row' ? `<p class="article-excerpt">${e(l(a.summary || a.abstract, lang))}</p>` : ''}<div class="article-bottom"><span>${(a.projects || []).map(id => e(projectTitle(id, lang))).join(' / ') || e(categoryLabel('explorations', lang))}</span><span class="article-read">${copy[lang].read}${icon('arrow')}</span></div></div>
    </a>`;
  }
  function header(lang, kind, id) {
    const t = copy[lang], home = route('home', '', lang);
    const navItems = [['projects', '#projects', t.projects], ['articles', '#journal', t.articles], ['skills', '#skills', t.skills]];
    return `<header class="site-header" id="top"><div class="header-inner"><a class="brand" href="${home}" aria-label="${e(site.name)} · ${t.home}"><span class="brand-mark" aria-hidden="true">nt<span>✦</span></span><span class="brand-name">Nathan Tandille<small>Level designer</small></span></a>
      <nav id="primary-nav" class="primary-nav" aria-label="${lang === 'fr' ? 'Navigation principale' : 'Main navigation'}">${navItems.map(([key, hash, label]) => `<a href="${home}${hash}" data-nav="${hash.slice(1)}"${kind === key ? ' aria-current="page"' : ''}>${e(label)}</a>`).join('')}<a class="nav-contact" href="${home}#contact" data-nav="contact">${t.contact}${icon('external')}</a><a class="mobile-cv" href="/${site.cv}" target="_blank" rel="noopener" aria-label="${t.cvLabel}">${t.cv}${icon('download')}</a></nav>
      <div class="header-actions"><a class="cv-link" href="/${site.cv}" target="_blank" rel="noopener" aria-label="${t.cvLabel}">${t.cv}${icon('download')}</a><span class="action-separator" aria-hidden="true"></span><button class="theme-toggle" type="button" aria-label="${t.changeTheme}" aria-pressed="false" title="${t.changeTheme}"><span class="theme-icons">${icon('sun', 'sun-icon')}${icon('moon', 'moon-icon')}</span><span class="theme-label">${t.day}</span></button><a class="lang-link" href="${route(kind === '404' ? 'home' : kind, id, lang === 'fr' ? 'en' : 'fr')}" lang="${lang === 'fr' ? 'en' : 'fr'}" hreflang="${lang === 'fr' ? 'en' : 'fr'}" aria-label="${lang === 'fr' ? 'Read this page in English' : 'Lire cette page en français'}">${lang === 'fr' ? 'EN' : 'FR'}</a><button class="menu-toggle icon-button" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="${t.menu}">${icon('menu')}</button></div>
    </div><div class="reading-progress" aria-hidden="true"><span></span></div></header>`;
  }
  function ambient() {
    return `<div class="ambient" aria-hidden="true"><div class="tree">${image('assets/leaf_right.png', { alt: '', className: 'tree-day', sizes: '480px', eager: true })}${image('assets/leaf_rightN.png', { alt: '', className: 'tree-night', sizes: '480px', eager: true })}</div><canvas id="leaf-canvas" data-day="${imageURL('assets/leaf_cliff_particles_grid_export.png')}" data-night="${imageURL('assets/leafN_cliff_particles_grid_export.png')}"></canvas></div>`;
  }
  function footer(lang) {
    const t = copy[lang];
    return `<footer class="site-footer"><div class="container footer-top"><a class="footer-signature" href="${route('home', '', lang)}">Nathan Tandille<span>${t.footerLine}</span></a><div class="footer-links"><a href="mailto:${e(site.email)}">E-mail${icon('external')}</a><a href="${site.linkedin}" target="_blank" rel="noopener">LinkedIn${icon('external')}</a><a href="${site.mobygames}" target="_blank" rel="noopener">MobyGames${icon('external')}</a></div><a class="back-top" href="#top">${t.backTop}${icon('up')}</a></div><div class="container footer-bottom"><p>© ${new Date().getUTCFullYear()} Nathan Tandille<span>${t.rights}</span></p><div><button class="motion-toggle" type="button" aria-pressed="true">${icon('pause')}<span>${t.animations}</span><span class="motion-state">On</span></button><a href="${route('legal', '', lang)}">${t.legal}</a></div></div></footer>`;
  }
  function galleryShell(lang) {
    const t = copy[lang];
    return `<dialog id="lightbox" aria-labelledby="lightbox-title"><h2 class="sr-only" id="lightbox-title">${t.gallery}</h2><button class="lightbox-close icon-button" type="button" aria-label="${t.close}" data-lightbox-close>${icon('close')}</button><button class="lightbox-prev icon-button" type="button" aria-label="${t.previous}" data-lightbox-prev>${icon('chevron')}</button><figure><img alt="" width="1600" height="900"><figcaption></figcaption></figure><button class="lightbox-next icon-button" type="button" aria-label="${t.next}" data-lightbox-next>${icon('chevron')}</button><span class="lightbox-counter" aria-live="polite"></span></dialog><div class="toast" role="status" aria-live="polite"></div>`;
  }
  function shell(lang, kind, id, body, options = {}) {
    const t = copy[lang], url = site.url + route(kind === '404' ? 'home' : kind, id, lang);
    const title = options.title ? `${options.title} | Nathan Tandille` : `Nathan Tandille | Level Designer`;
    const description = options.description || l(site.hero, lang).description;
    const socialImage = options.cover ? imageURL(options.cover, 1600) : imageURL('assets/bannerD.png', 1600);
    const preview = process.env.VERCEL_ENV === 'preview' || kind === '404';
    const schema = kind === 'articles' && id ? { '@context': 'https://schema.org', '@type': 'Article', headline: options.title, author: { '@type': 'Person', name: site.name }, description, url, image: site.url + socialImage, inLanguage: lang, ...(options.date ? { datePublished: options.date } : {}) } : { '@context': 'https://schema.org', '@type': 'Person', name: site.name, jobTitle: 'Level Designer / QA Producer / Producer', url: site.url, sameAs: [site.linkedin, site.mobygames] };
    return `<!doctype html><html lang="${lang}" data-theme="light" data-motion="on"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${e(description)}"><meta name="theme-color" content="#f6f3ea"><title>${e(title)}</title><script>${themeBoot}</script><link rel="canonical" href="${url}"><link rel="alternate" hreflang="fr" href="${site.url}${route(kind === '404' ? 'home' : kind, id, 'fr')}"><link rel="alternate" hreflang="en" href="${site.url}${route(kind === '404' ? 'home' : kind, id, 'en')}"><link rel="alternate" hreflang="x-default" href="${site.url}${route(kind === '404' ? 'home' : kind, id, 'fr')}">${preview ? '<meta name="robots" content="noindex, nofollow">' : ''}<meta property="og:type" content="${kind === 'articles' && id ? 'article' : 'website'}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${site.url}${socialImage}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head><body data-page="${kind}" data-id="${e(id)}"><a class="skip-link" href="#main">${t.skip}</a>${header(lang, kind, id)}${ambient()}<main id="main" tabindex="-1">${body}</main>${footer(lang)}${galleryShell(lang)}<noscript><p class="noscript container">${t.noJS}</p></noscript></body></html>`;
  }
  function home(lang) {
    const t = copy[lang], h = l(site.hero, lang);
    const selected = (site.featuredProjects || []).map(byProject).filter(Boolean);
    const work = selected.length ? selected : projects.slice(0, 4);
    const chosenArticles = (site.featuredArticles || []).map(byArticle).filter(Boolean);
    const journal = (chosenArticles.length ? chosenArticles : articles).slice(0, 3);
    const body = `<section class="hero-frame" aria-label="${e(site.name)} · Portfolio"><div class="hero-landscape" aria-hidden="true">${image('assets/bannerD.png', { alt: '', className: 'hero-day', sizes: '100vw', eager: true, priority: true })}${image('assets/bannerN.png', { alt: '', className: 'hero-night', sizes: '100vw', eager: true })}<div class="hero-wash"></div></div><div class="hero-inner"><div class="hero-overline"><span>Portfolio</span><span>${e(site.location)}</span></div><div class="hero-copy"><p class="eyebrow">${e(h.eyebrow)}</p><h1>${e(h.line1)}<br><em>${e(h.line2)}</em></h1><p class="hero-description">${e(h.description)}</p><div class="hero-actions">${link('#projects', t.seeProjects, 'button button-primary')}${link('#journal', t.readJournal, 'text-link')}</div></div><div class="hero-bottom"><span class="scene-caption">${icon('compass')}${t.heroCaption}<span class="scene-caption-number">01 / 02</span></span><a href="#projects" class="scroll-cue">${t.scroll}${icon('down')}</a></div></div></section>
      <div class="container"><section id="projects" class="section projects-section">${chapter(1, t.projectsEyebrow, t.projectsHeading, t.projectsIntro, link(route('projects', '', lang), `${t.allProjects} (${pad(projects.length)})`))}<div class="projects-selected">${work.map((p, i) => projectCard(p, lang, i === 0, i)).join('')}</div></section>
      <section id="journal" class="section journal-section">${chapter(2, t.journalEyebrow, t.journalHeading, t.journalIntro, link(route('articles', '', lang), t.allArticles))}<div class="journal-selected">${journal.map((a, i) => articleCard(a, lang, i === 0 ? 'feature' : 'row')).join('')}</div></section>
      <section id="skills" class="section expertise-section">${chapter(3, t.skillsEyebrow, t.skillsHeading, t.skillsIntro, link(route('skills', '', lang), t.allSkills))}<div class="expertise-grid">${site.expertise.map((skill, i) => `<article class="expertise-card" data-reveal><div class="expertise-top">${icon(skill.icon)}<span>${pad(i + 1)}</span></div><span class="eyebrow">${e(l(skill.verb, lang))}</span><h3>${e(l(skill.title, lang))}</h3><p>${e(l(skill.text, lang))}</p>${tags(skill.tags)}<a class="expertise-proof" href="${route('projects', skill.project, lang)}"><span>${t.inPractice}<strong>${e(projectTitle(skill.project, lang))}</strong></span>${icon('arrow')}</a></article>`).join('')}</div><div class="profile-note">${image('assets/PP.png', { alt: 'Nathan Tandille', className: 'profile-avatar', sizes: '64px' })}<p>${lang === 'fr' ? 'Un parcours entre design, QA et production. Une même attention à la façon dont le joueur vit l’expérience.' : 'A background across design, QA and production. The same attention to how the player experiences the game.'}</p>${link('/' + site.cv, t.cv, 'text-link', true)}</div></section>
      <section id="contact" class="section contact-section"><div class="contact-ornament" aria-hidden="true">${icon('compass')}</div><div class="eyebrow">04 <span></span>${t.contactEyebrow}</div><h2>${lines(t.contactHeading)}</h2><p>${t.contactIntro}</p><div class="contact-actions">${link('mailto:' + site.email, t.sendEmail, 'button button-primary')}<button class="copy-email icon-button" data-copy="${e(site.email)}" type="button" aria-label="${t.copyEmail}" title="${t.copyEmail}">${icon('copy')}</button><a class="contact-email" href="mailto:${e(site.email)}">${e(site.email)}</a></div><div class="contact-note">${t.contactNote}</div></section></div>`;
    return shell(lang, 'home', '', body);
  }
  function filters(kind, lang, items) {
    const t = copy[lang], keys = [...new Set(items.flatMap(categories))];
    return `<form class="collection-filters" role="search" data-filter-form><div class="filter-controls"><label class="search-field">${icon('search')}<span class="sr-only">${t.search}</span><input name="q" type="search" placeholder="${t.searchPlaceholder}" autocomplete="off"></label>${kind === 'articles' ? `<label class="project-select"><span class="sr-only">${t.projectFilter}</span><select name="project"><option value="">${t.allRelated}</option>${projects.map(p => `<option value="${p.id}">${e(l(p.title, lang))}</option>`).join('')}</select></label>` : ''}</div><div class="filter-bottom"><div class="filter-chips" role="group" aria-label="${lang === 'fr' ? 'Filtrer par domaine' : 'Filter by discipline'}"><button type="button" data-filter="" aria-pressed="true">${t.all}</button>${keys.map(key => `<button type="button" data-filter="${key}" aria-pressed="false">${e(categoryLabel(key, lang))}</button>`).join('')}</div><span class="result-count" role="status" aria-live="polite">${items.length} ${t.results}</span></div><input type="hidden" name="type" value=""></form>`;
  }
  function archive(kind, lang) {
    const t = copy[lang], isProjects = kind === 'projects', items = isProjects ? projects : articles;
    const title = isProjects ? t.projectsArchive : t.journalArchive;
    const intro = isProjects ? t.archiveIntro : t.archiveJournalIntro;
    return shell(lang, kind, '', `<div class="container"><header class="page-intro"><a class="breadcrumb-back" href="${route('home', '', lang)}">${icon('arrow')}${t.home}</a><div class="eyebrow">${isProjects ? t.projectsEyebrow : t.journalEyebrow}<span class="collection-total">${pad(items.length)}</span></div><h1>${title}<em>.</em></h1><p>${intro}</p></header><section class="collection" aria-label="${title}">${filters(kind, lang, items)}<div class="${isProjects ? 'project-grid' : 'article-grid'}" data-collection>${items.map((item, i) => isProjects ? projectCard(item, lang, false, i) : articleCard(item, lang)).join('')}</div><div class="empty-state" hidden><h2>${t.noResults}</h2><button class="button" type="button" data-reset-filters>${t.clear}${icon('arrow')}</button></div></section></div>`, { title, description: intro });
  }
  function gallery(images, lang, title, group = 'project', caption = '') {
    const t = copy[lang];
    return `<div class="gallery-grid">${images.map((src, i) => `<a class="gallery-image" href="${imageURL(src, 2400)}" data-gallery="${e(group)}" data-caption="${e(caption || `${title} · ${t.visualNote} ${i + 1}`)}" aria-label="${t.openImage} ${i + 1} · ${e(title)}">${image(src, { alt: `${title} · ${t.visualNote} ${i + 1}`, sizes: '(max-width: 760px) 100vw, 45vw' })}<span>${icon('focus')}</span></a>`).join('')}</div>`;
  }
  function projectPage(p, lang) {
    const t = copy[lang], info = p.projectInfo || {}, related = articles.filter(a => (a.projects || []).includes(p.id));
    const facts = l(p.facts, lang) || [];
    const specifications = [['publisher', lang === 'fr' ? 'Éditeur' : 'Publisher'], ['platforms', lang === 'fr' ? 'Plateformes' : 'Platforms'], ['releaseDate', lang === 'fr' ? 'Sortie' : 'Release'], ['genres', lang === 'fr' ? 'Genres' : 'Genres'], ['languages', lang === 'fr' ? 'Langues' : 'Languages']].filter(([key]) => l(info[key], lang));
    const next = projects[(projects.indexOf(p) + 1) % projects.length];
    const body = `<div class="container"><header class="page-intro project-intro"><a class="breadcrumb-back" href="${route('projects', '', lang)}">${icon('arrow')}${t.allProjects}</a><div class="eyebrow">${e(l(p.role, lang))}</div><h1>${e(l(p.title, lang))}</h1><p>${e(projectSummary(p, lang))}</p><div class="project-intro-meta"><span>${e(l(info.developer, lang))}</span><span>${e(l(info.engine, lang))}</span>${tags(l(p.tags, lang) || [])}</div></header><figure class="project-cover" style="view-transition-name:project-${p.id}">${image(p.images.cover, { alt: `${l(p.title, lang)} · ${t.visualNote}`, sizes: '100vw', eager: true, priority: true })}</figure><nav class="section-nav" aria-label="${lang === 'fr' ? 'Dans ce projet' : 'In this project'}"><a href="#overview">${t.overview}</a><a href="#contribution">${t.contribution}</a>${p.images.gallery?.length ? `<a href="#gallery">${t.images}</a>` : ''}${related.length ? `<a href="#related">${t.relatedArticles}</a>` : ''}</nav>
      <div class="project-body"><aside class="project-facts"><span class="eyebrow">${t.scope}</span><dl>${facts.map(f => `<div><dt>${e(f.label)}</dt><dd>${e(f.value)}</dd></div>`).join('')}</dl>${specifications.length ? `<details class="project-specs"><summary>${lang === 'fr' ? 'Fiche du jeu' : 'Game details'}${icon('down')}</summary><dl>${specifications.map(([key, label]) => `<div><dt>${e(label)}</dt><dd>${e(l(info[key], lang))}</dd></div>`).join('')}</dl></details>` : ''}<div class="project-external">${(p.links || []).map(x => link(x.url, l(x.label, lang), 'text-link', true)).join('')}${p.trailer ? link(p.trailer, t.trailer, 'text-link', true) : ''}</div></aside><div class="project-story prose"><section id="overview"><span class="eyebrow">${t.context}</span><h2>${t.overview}</h2>${info.description ? `<p class="lead">${e(l(info.description, lang))}</p>` : ''}${paragraphs(l(p.overview, lang))}</section><section id="contribution"><span class="eyebrow">${t.role}</span><h2>${t.contribution}</h2>${bullets(l(p.contribution, lang))}${related[0] ? `<aside class="inline-note"><span class="eyebrow">${t.relatedArticles}</span><a href="${route('articles', related[0].id, lang)}">${e(articleTitle(related[0], lang))}${icon('arrow')}</a></aside>` : ''}</section></div></div>
      ${p.images.gallery?.length ? `<section id="gallery" class="section gallery-section"><div class="eyebrow">${t.visualNote}</div><h2>${t.images}</h2>${gallery(p.images.gallery, lang, l(p.title, lang))}</section>` : ''}
      ${related.length ? `<section id="related" class="section related-section"><div class="section-heading"><h2>${t.relatedArticles}</h2>${link(route('articles', '', lang), t.allArticles)}</div><div class="article-grid">${related.map(a => articleCard(a, lang)).join('')}</div></section>` : ''}${next !== p ? `<section class="next-project"><span class="eyebrow">${t.nextProject}</span><a href="${route('projects', next.id, lang)}"><h2>${e(l(next.title, lang))}</h2>${icon('arrow')}</a></section>` : ''}</div>`;
    return shell(lang, 'projects', p.id, body, { title: l(p.title, lang), description: l(p.summary, lang), cover: p.images.cover });
  }
  function articleContent(a, lang) {
    const t = copy[lang];
    if (a.markdown) return markdown(a.markdown[lang], (src, alt) => `<a href="${imageURL(src, 2400)}" data-gallery="article" data-caption="${e(alt)}" aria-label="${t.openImage}: ${e(alt)}">${image(src, { alt, sizes: '(max-width: 760px) 100vw, 720px' })}</a>`);
    const source = l(a.article, lang), toc = [];
    let html = `<div class="article-opening">${paragraphs(source.intro)}</div>`;
    for (const [i, section] of (source.sections || []).entries()) {
      const id = `section-${i + 1}-${slugify(section.heading)}`;
      toc.push({ id, title: section.heading });
      html += `<section class="article-section" id="${id}"><h2>${e(section.heading)}</h2>${paragraphs(section.paragraphs)}${bullets(section.bullets)}`;
      if (section.media) {
        const m = section.media, sources = m.images || (m.src ? [m.src] : []);
        html += `<figure class="article-figure">${gallery(sources, lang, l(a.title, lang), 'article', m.caption)}${m.caption ? `<figcaption>${e(m.caption)}</figcaption>` : ''}</figure>`;
      }
      html += '</section>';
    }
    if (source.blocks?.length) html += `<div class="article-notes">${source.blocks.map(b => `<aside class="inline-note"><h3>${e(b.title)}</h3><p>${e(b.text)}</p></aside>`).join('')}</div>`;
    if (source.closing) { toc.push({ id: 'conclusion', title: t.conclusion }); html += `<section id="conclusion"><h2>${t.conclusion}</h2><p>${e(source.closing)}</p></section>`; }
    return { html, toc };
  }
  function articlePage(a, lang) {
    const t = copy[lang], cover = articleCover(a), content = articleContent(a, lang), related = (a.projects || []).map(byProject).filter(Boolean);
    const next = articles.filter(x => x.id !== a.id).slice(0, 2);
    const intro = l(a.summary || a.abstract, lang);
    const dateLabel = a.date ? new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(a.date)) : a.timeframe;
    const body = `<div class="container"><header class="page-intro article-intro"><a class="breadcrumb-back" href="${route('articles', '', lang)}">${icon('arrow')}${t.allJournal}</a><div class="metadata">${metadata(a, lang)}</div><h1>${e(l(a.title, lang))}</h1><p>${e(intro)}</p><div class="byline"><span class="byline-mark" aria-hidden="true">nt</span><span>Nathan Tandille${dateLabel ? `<small>${a.date ? t.published : t.period} : ${e(dateLabel)}</small>` : ''}</span><button class="share-button icon-button" type="button" data-share aria-label="${t.share}" title="${t.share}">${icon('copy')}</button></div></header>${cover ? `<figure class="article-cover">${image(cover, { alt: `${l(a.title, lang)} · ${t.visualNote}`, sizes: '100vw', eager: true, priority: true })}<figcaption>${t.visualNote}${related.length ? ` · ${related.map(p => e(l(p.title, lang))).join(' / ')}` : ''}</figcaption></figure>` : ''}
      <div class="reading-layout"><aside class="reading-aside"><details class="toc" open><summary>${t.toc}${icon('down')}</summary><nav aria-label="${t.toc}">${content.toc.map((entry, i) => `<a href="#${entry.id}"><span>${pad(i + 1)}</span>${e(entry.title)}</a>`).join('')}</nav></details>${related.map(p => `<a class="related-project-note" href="${route('projects', p.id, lang)}"><span class="eyebrow">${t.relatedProject}</span>${image(p.images.cover, { alt: '', sizes: '220px' })}<strong>${e(l(p.title, lang))}</strong><span>${t.openProject}${icon('arrow')}</span></a>`).join('')}</aside><article class="prose article-prose">${a.metrics?.length ? `<section class="article-metrics" aria-label="${t.summary}">${a.metrics.map(metric => `<div><strong>${e(metric.value)}</strong><span>${e(l(metric.label, lang))}</span></div>`).join('')}</section>` : ''}${content.html}<div class="article-endmark" aria-hidden="true">${icon('leaf')}</div>${link(route('articles', '', lang), t.allJournal, 'text-link')}</article></div>${next.length ? `<section class="section related-section"><div class="section-heading"><h2>${t.nextArticle}</h2>${link(route('articles', '', lang), t.allArticles)}</div><div class="article-grid two-columns">${next.map(x => articleCard(x, lang)).join('')}</div></section>` : ''}</div>`;
    return shell(lang, 'articles', a.id, body, { title: l(a.title, lang), description: intro, cover, date: a.date });
  }
  function skillsPage(lang) {
    const t = copy[lang];
    const body = `<div class="container"><header class="page-intro"><a class="breadcrumb-back" href="${route('home', '', lang)}#skills">${icon('arrow')}${t.home}</a><div class="eyebrow">${t.skills}</div><h1>${t.skillsPageTitle}</h1><p>${t.skillsPageIntro}</p></header><nav class="skills-index" aria-label="${t.skills}">${skills[lang].map((g, i) => `<a href="#skill-group-${i}">${pad(i + 1)} <span>${e(g.cat)}</span>${icon('down')}</a>`).join('')}</nav><div class="skill-groups">${skills[lang].map((g, i) => `<section class="skill-group" id="skill-group-${i}"><header><span class="eyebrow">${pad(i + 1)}</span><h2>${e(g.cat)}</h2></header><div class="skill-items">${g.items.map(s => `<details class="skill-detail" id="${s.id}"><summary>${e(s.name)}${icon('down')}</summary><div class="skill-detail-body"><p class="lead">${e(s.summary)}</p>${bullets(s.bullets)}${tags(s.tags)}${localSkillImages(s).length ? gallery(localSkillImages(s), lang, s.name, s.id) : ''}<div class="skill-related">${(s.related?.projects || []).map(id => link(route('projects', id, lang), projectTitle(id, lang))).join('')}${(s.related?.cases || []).map(id => link(route('articles', id, lang), articleTitle(byArticle(id), lang))).join('')}</div></div></details>`).join('')}</div></section>`).join('')}</div></div>`;
    return shell(lang, 'skills', '', body, { title: t.skills, description: t.skillsPageIntro });
  }
  function legalPage(lang) {
    const t = copy[lang];
    const text = lang === 'fr' ? `<h2>Éditeur & contact</h2><p>Portfolio personnel de Nathan Tandille. Contact : <a href="mailto:${site.email}">${site.email}</a></p><h2>Hébergement</h2><p>Le site est hébergé sur Vercel.</p><h2>Univers & crédits</h2><p>Les illustrations, captures, marques et univers des projets restent la propriété de leurs ayants droit respectifs. Les visuels du portfolio existant ont été conservés. Les pages projet renvoient vers leurs sources officielles lorsque ces liens sont disponibles.</p><h2>Préférences & services externes</h2><p>Le thème et le réglage des animations sont enregistrés localement dans votre navigateur. Aucun outil d’analyse, formulaire de collecte ou script publicitaire n’est intégré à cette version du site. L’hébergeur et les services externes peuvent appliquer leurs propres traitements et politiques.</p><p>Les liens vers YouTube, LinkedIn et les autres sites s’ouvrent uniquement à votre demande. Aucune vidéo tierce n’est chargée automatiquement. Le bouton e-mail ouvre votre messagerie.</p>` : `<h2>Publisher & contact</h2><p>Personal portfolio of Nathan Tandille. Contact: <a href="mailto:${site.email}">${site.email}</a></p><h2>Hosting</h2><p>This site is hosted on Vercel.</p><h2>Worlds & credits</h2><p>Project illustrations, screenshots, brands and worlds remain the property of their respective rights holders. Existing portfolio visuals have been retained. Project pages link to official sources where available.</p><h2>Preferences & external services</h2><p>Theme and motion preferences are stored locally in your browser. This version includes no analytics, data collection form or advertising script. The hosting provider and external services may apply their own data processing and policies.</p><p>YouTube, LinkedIn and other external sites open only on request. No third-party video is loaded automatically. The email button opens your email application.</p>`;
    return shell(lang, 'legal', '', `<div class="container"><header class="page-intro"><a class="breadcrumb-back" href="${route('home', '', lang)}">${icon('arrow')}${t.home}</a><h1>${t.legal}</h1></header><div class="prose legal-prose">${text}</div></div>`, { title: t.legal });
  }
  function notFound(lang = 'fr') {
    const t = copy[lang];
    return shell(lang, '404', '', `<section class="container not-found"><span class="eyebrow">404</span><h1>${t.notFound}</h1><p>${t.notFoundText}</p>${link(route('home', '', lang), t.backHome, 'button button-primary')}</section>`, { title: '404' });
  }
  return { home, archive, projectPage, articlePage, skillsPage, legalPage, notFound };
}
