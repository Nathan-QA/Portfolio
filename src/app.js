/* Progressive enhancement only: all content and navigation exist in the HTML. */
(() => {
 'use strict';
 const root=document.documentElement;
 const cfg=JSON.parse(document.getElementById('site-config').textContent);
 const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
 const stored=k=>{try{return localStorage.getItem(k)}catch{return null}};
 const store=(k,v)=>{try{localStorage.setItem(k,v)}catch{/* private browsing still works */}};
 const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'), dark=matchMedia('(prefers-color-scheme: dark)');
 document.body.classList.add('enhanced');
 $$('[data-enhance], [data-copy], [data-copy-url], [data-theme-toggle], [data-motion-toggle], .menu-toggle').forEach(el=>el.hidden=false);

 // Keep old shared links working, but never discard normal URL fragments.
 if(cfg.legacy){
  const params=new URLSearchParams(location.hash.slice(1));
  const dest=cfg.legacy.projects[params.get('project')] || cfg.legacy.articles[params.get('kase')];
  if(dest){location.replace(dest);return}
  const alias={'#cases':'#journal','#about':'#skills','#main':'#main'}[location.hash];
  if(alias && alias!==location.hash) location.replace(alias);
 }

 let toastTimer;
 function toast(message){const el=$('.toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3200)}
 async function copy(text){
  let success=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);success=true}}catch{/* fallback below */}
  if(!success){
   const active=document.activeElement, area=document.createElement('textarea');
   area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(area);area.select();
   try{success=document.execCommand('copy')}catch{/* show an honest failure message */}area.remove();active?.focus({preventScroll:true});
  }
  toast(success?cfg.copied:cfg.copyFailed);
 }
 $$('[data-copy]').forEach(el=>el.addEventListener('click',()=>copy(el.dataset.copy)));
 $$('[data-copy-url]').forEach(el=>el.addEventListener('click',()=>copy(location.href)));

 const themeButton=$('[data-theme-toggle]');
 function applyTheme(theme){root.dataset.theme=theme;themeButton.setAttribute('aria-label',`${cfg.theme} : ${theme==='dark'?cfg.day:cfg.night}`);themeButton.title=themeButton.getAttribute('aria-label');$('meta[name="theme-color"]').content=theme==='dark'?'#181c27':'#f5f3e9'}
 applyTheme(root.dataset.theme);
 themeButton.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';store('pref-theme',next);applyTheme(next)});
 dark.addEventListener('change',()=>{if(!['dark','light'].includes(stored('pref-theme')))applyTheme(dark.matches?'dark':'light')});
 $('.language-switch')?.addEventListener('click',()=>store('pref-lang',cfg.lang==='fr'?'en':'fr'));

 const menu=$('.menu-toggle'), nav=$('.primary-nav');
 function closeMenu(returnFocus=false){document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');if(returnFocus)menu.focus()}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape' && menu.getAttribute('aria-expanded')==='true')closeMenu(true)});
 document.addEventListener('click',event=>{if(menu.getAttribute('aria-expanded')==='true'&&!event.target.closest('.site-header'))closeMenu()});
 matchMedia('(min-width: 651px)').addEventListener('change',event=>{if(event.matches)closeMenu()});

 // Search and filters are an enhancement over a complete, indexable list.
 const normal=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 $$('[data-filterable]').forEach(container=>{
  const cards=$$('[data-card]',container), input=$('[data-search-input]',container), buttons=$$('[data-filter]',container);
  const params=new URLSearchParams(location.search);
  let selected=buttons.some(b=>b.dataset.filter===params.get('type'))?params.get('type'):'all';
  input.value=params.get('q')||'';
  function update(writeURL=true){
   const query=normal(input.value.trim());let count=0;
   cards.forEach(card=>{card.hidden=!((selected==='all'||card.dataset.category===selected)&&normal(card.dataset.search).includes(query));if(!card.hidden)count++});
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===selected)));
   $('[data-empty]',container).hidden=count>0;
   $('[data-results]',container).textContent=`${count} ${cfg.results}`;
   container.classList.remove('filtering');void container.offsetWidth;container.classList.add('filtering');
   if(writeURL){try{const u=new URL(location.href);input.value.trim()?u.searchParams.set('q',input.value.trim()):u.searchParams.delete('q');selected!=='all'?u.searchParams.set('type',selected):u.searchParams.delete('type');history.replaceState(history.state,'',u)}catch{/* non-HTTP offline previews */}}
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.filter;update()}));
  input.addEventListener('input',()=>update());
  $('[data-reset]',container).addEventListener('click',()=>{selected='all';input.value='';update();input.focus()});
  update(false);
 });

 // Native dialog provides modal semantics, Escape and focus containment.
 const dialog=$('.lightbox');let images=[],imageIndex=0,opener=null;
 function showImage(i){imageIndex=clamp(i,0,images.length-1);const link=images[imageIndex], img=$('figure img',dialog);img.src=link.href;img.alt=$('img',link).alt;$('figcaption',dialog).textContent=`${imageIndex+1} / ${images.length} · ${link.dataset.caption||''}`;$('[data-prev]',dialog).disabled=imageIndex===0;$('[data-next]',dialog).disabled=imageIndex===images.length-1}
 $$('[data-lightbox]').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!dialog.showModal)return;
  event.preventDefault();opener=link;images=$$('[data-lightbox]',link.closest('.gallery'));showImage(images.indexOf(link));dialog.showModal();document.body.classList.add('dialog-open');$('[data-close]',dialog).focus();
 }));
 $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
 $('[data-prev]',dialog).addEventListener('click',()=>showImage(imageIndex-1));
 $('[data-next]',dialog).addEventListener('click',()=>showImage(imageIndex+1));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showImage(imageIndex+1)}if(event.key==='ArrowLeft'){event.preventDefault();showImage(imageIndex-1)}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');$('figure img',dialog).removeAttribute('src');opener?.focus({preventScroll:true})});

 // One rAF for scroll UI, separate from ambient animation; no scroll hijacking.
 const header=$('.site-header'), progress=$('[data-progress]'), reading=$('[data-reading]');
 const sections=$$('[data-toc-section]'), tocLinks=$$('.toc nav a');
 const homeSections=['projects','journal','skills','contact'].map(id=>document.getElementById(id)).filter(Boolean);
 const isHome=document.body.classList.contains('home-page');
 let scrollQueued=false, lastScroll=scrollY, impulse=0;
 function scrollUI(){
  scrollQueued=false;const y=scrollY,h=header.offsetHeight;
  document.body.classList.toggle('scrolled',y>20);
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  let ratio=y/max;
  if(reading){const r=reading.getBoundingClientRect();ratio=clamp((h+25-r.top)/Math.max(1,r.height-innerHeight+h+60));}
  progress.style.transform=`scaleX(${clamp(ratio)})`;
  if(isHome){let active='';for(const s of homeSections){if(s.getBoundingClientRect().top<h+innerHeight*.2)active=s.id}$$('a',nav).forEach(a=>{a.hash==='#'+active?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current')})}
  if(reading){let active=sections[0]?.id;for(const s of sections){if(s.getBoundingClientRect().top<h+105)active=s.id}tocLinks.forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+active)))}
 }
 addEventListener('scroll',()=>{impulse=Math.min(10,impulse+Math.abs(scrollY-lastScroll)*.018);lastScroll=scrollY;if(!scrollQueued){requestAnimationFrame(scrollUI);scrollQueued=true}},{passive:true});
 addEventListener('resize',scrollUI,{passive:true});addEventListener('pageshow',scrollUI);scrollUI();
 // Opening a linked skill should not require finding it a second time.
 function openLinkedSkill(){if(!location.hash)return;let el;try{el=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{return}if(el?.matches('.skill-item'))el.open=true}
 addEventListener('hashchange',openLinkedSkill);openLinkedSkill();

 // The existing watercolour sprite sheet supplies the leaves (3 × 3 cells).
 const canvas=$('.leaf-canvas'), context=canvas.getContext('2d'), tree=$('.world-tree'), motionButton=$('[data-motion-toggle]');
 let frame=0, time=0, budget=0, treeX=0, treeY=0, width=innerWidth,height=innerHeight, enabled=false;
 const leaves=[],sprite={day:null,night:null};
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context?.setTransform(dpr,0,0,dpr,0,0);if(width<=650)tree.style.transform='';}
 function allowed(){return !reduce.matches&&stored('pref-motion')!=='off'}
 function loadSprites(){for(const mode of ['day','night']){if(!sprite[mode]){const img=new Image();img.src=cfg.sprites[mode];sprite[mode]=img}}}
 function start(){if(frame||!enabled||document.hidden||width<=650||!context)return;loadSprites();time=performance.now();frame=requestAnimationFrame(tick)}
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;leaves.length=0;context?.clearRect(0,0,width,height)}
 function setMotion(){enabled=allowed();root.dataset.motion=enabled?'on':'off';motionButton.setAttribute('aria-pressed',String(enabled));$('span',motionButton).textContent=enabled?cfg.motion:cfg.motionOff;motionButton.title=reduce.matches?cfg.systemMotion:(enabled?cfg.motionOff:cfg.motion);motionButton.disabled=reduce.matches;if(enabled)start();else{stop();tree.style.transform=''}}
 motionButton.addEventListener('click',()=>{store('pref-motion',enabled?'off':'on');setMotion()});
 reduce.addEventListener('change',setMotion);
 addEventListener('resize',()=>{resize();if(width<=650)stop();else start()},{passive:true});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 addEventListener('pagehide',stop);addEventListener('pageshow',start);
 function tick(now){
  frame=0;if(!enabled||document.hidden||width<=650)return;
  const dt=Math.min(.045,(now-time)/1000);time=now;
  const p=clamp(scrollY/650), gutter=Math.max(15,(width-Math.min(1160,width-96))/2);
  const targetX=isHome?p*Math.max(20,155-gutter*.4):Math.max(20,140-gutter*.4);
  const targetY=isHome?p*130:90;
  treeX+=(targetX-treeX)*Math.min(1,dt*4);treeY+=(targetY-treeY)*Math.min(1,dt*4);
  tree.style.transform=`translate3d(${treeX.toFixed(2)}px,${treeY.toFixed(2)}px,0) rotate(${(Math.sin(now*.00027)*.35).toFixed(3)}deg)`;
  context.clearRect(0,0,width,height);
  const maxLeaves=width<1000?9:16;
  budget+=dt*(.6+Math.min(2,impulse));impulse*=Math.exp(-dt*3);
  if(budget>1&&leaves.length<maxLeaves){budget=0;const box=tree.getBoundingClientRect();leaves.push({x:width-15-Math.random()*Math.min(95,gutter),y:box.top+35+Math.random()*125,age:0,life:7+Math.random()*3,vx:-18-Math.random()*23,vy:25+Math.random()*22,size:14+Math.random()*14,rotation:Math.random()*6,spin:(Math.random()-.5)*1.7,cell:Math.floor(Math.random()*9)})}
  const img=sprite[root.dataset.theme==='dark'?'night':'day'];
  for(let i=leaves.length-1;i>=0;i--){const leaf=leaves[i];leaf.age+=dt;if(leaf.age>leaf.life||leaf.y>height+40){leaves.splice(i,1);continue}leaf.x+=leaf.vx*dt;leaf.y+=leaf.vy*dt;leaf.rotation+=leaf.spin*dt;const opacity=clamp(leaf.age)*clamp((leaf.life-leaf.age)/2)*.7;
   if(img?.complete&&img.naturalWidth){context.save();context.globalAlpha=opacity;context.translate(leaf.x+Math.sin(leaf.age*1.5)*9,leaf.y);context.rotate(leaf.rotation);const cellW=img.naturalWidth/3,cellH=img.naturalHeight/3;context.drawImage(img,(leaf.cell%3)*cellW,Math.floor(leaf.cell/3)*cellH,cellW,cellH,-leaf.size/2,-leaf.size/2,leaf.size,leaf.size);context.restore()}
  }
  frame=requestAnimationFrame(tick);
 }
 resize();setMotion();
})();
