// Reading tools for the existing modal. No changes to the original scenery.
import {state} from './state.js';
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n};
const words=v=>typeof v==='string'?v.trim().split(/\s+/).length:Array.isArray(v)?v.reduce((n,x)=>n+words(x),0):v&&typeof v==='object'?Object.entries(v).filter(([k])=>!['src','url','images','trailer','alt'].includes(k)).reduce((n,[,x])=>n+words(x),0):0;
export const readingMinutes=article=>Math.max(1,Math.ceil(words(article)/210));

export function enhanceReading(modal,t,copy){
 const header=modal.querySelector('header');
 const share=node('button',null,'btn ux-share');share.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l2-2"/></svg>';share.type='button';share.title=t.share;share.setAttribute('aria-label',t.share);
 share.addEventListener('click',()=>copy(location.href,t.linkCopied));header.insertBefore(share,header.querySelector('.x'));
 // Existing clickable thumbnails gain keyboard support without changing their look.
 const thumbs=[...modal.querySelectorAll('.media-strip img')];
 thumbs.forEach((img,i)=>{
  img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`${t.image} ${i+1} / ${thumbs.length}`);
  img.addEventListener('click',()=>thumbs.forEach(th=>th.setAttribute('aria-pressed',String(th===img))));
  img.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();img.click()}
   if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=thumbs[(i+(e.key==='ArrowRight'?1:thumbs.length-1))%thumbs.length];next.focus();next.click()}
  });
 });
 const article=modal.querySelector('.case-article');if(!article)return;
 const sections=[...article.querySelectorAll('.case-section')].filter(s=>s.querySelector('h4'));
 if(!sections.length)return;
 const heading=node('div',null,'ux-reading-heading');heading.append(node('h2',header.querySelector('h3').textContent));article.before(heading);
 const toc=node('details',null,'ux-disclosure ux-toc');const summary=node('summary',t.toc),list=node('ol');
 const links=sections.map((section,i)=>{
  section.id='article-section-'+(i+1);
  const li=node('li'),link=node('a',section.querySelector('h4').textContent);link.href='#'+section.id;
  link.addEventListener('click',event=>{
   event.preventDefault();
   go(section);
   // A copied link can point to this exact part of the article, not just its top.
   try{const params=new URLSearchParams(location.hash.slice(1));params.set('section',section.id);history.replaceState(history.state,'',location.pathname+location.search+'#'+params)}catch{/* file previews have no history API */}
  });
  li.append(link);list.append(li);return link;
 });
 toc.append(summary,list);article.before(toc);
 const context=[...article.parentElement.children].filter(el=>![article,toc,heading].includes(el));
 context.forEach(el=>el.classList.add('ux-reader-context'));
 modal.classList.add('ux-reading-mode');
 const mode=node('button',t.mediaContext,'btn ux-read-toggle');mode.type='button';mode.setAttribute('aria-pressed','true');mode.title=t.mediaContext;
 header.insertBefore(mode,share);
 const jump=node('button',t.contents,'btn ux-toc-toggle');jump.type='button';header.insertBefore(jump,share);
 let navigationId=0;
 const navigationEvents=new AbortController();
 for(const type of ['wheel','touchstart'])modal.addEventListener(type,()=>navigationId++,{passive:true,signal:navigationEvents.signal});
 async function go(el,instant=false){
  const request=++navigationId;
  // Lazy images above the target must have their intrinsic size before jumping.
  // Otherwise Firefox can shift the target after the smooth scroll has finished.
  const images=[...article.querySelectorAll('img')].filter(img=>img.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
  const pending=images.filter(img=>!img.complete||!img.naturalWidth);
  pending.forEach(img=>img.loading='eager');
  let deadline;
  if(pending.length){
   await Promise.race([
    Promise.all(pending.map(img=>img.decode().catch(()=>null))),
    new Promise(resolve=>deadline=setTimeout(resolve,2000))
   ]);
   clearTimeout(deadline);
  }
  if(request!==navigationId||!modal.isConnected)return;
  // Layout coordinates are independent of the opening scale animation.
  let top=0,current=el;
  while(current&&current!==modal){top+=current.offsetTop;current=current.offsetParent;}
  modal.scrollTo({top:Math.max(0,top-header.offsetHeight-20),behavior:instant||state.prefersReduced?'instant':'smooth'});
 }
 mode.addEventListener('click',()=>{
  const active=modal.classList.toggle('ux-reading-mode');mode.setAttribute('aria-pressed',String(active));mode.textContent=active?t.mediaContext:t.readMode;
  modal.scrollTo({top:0,behavior:'instant'});update();
 });
 jump.addEventListener('click',()=>{toc.open=true;go(toc);summary.focus({preventScroll:true})});
 const bar=node('span',null,'ux-reader-bar');bar.setAttribute('aria-hidden','true');header.append(bar);
 let queued=false;
 function update(){
  queued=false;const max=modal.scrollHeight-modal.clientHeight;
  bar.style.setProperty('--read-progress',max>0?Math.min(1,modal.scrollTop/max):1);
  let active=sections[0];const edge=header.getBoundingClientRect().bottom+55;
  for(const section of sections)if(section.getBoundingClientRect().top<=edge)active=section;
  links.forEach(link=>{if(link.hash==='#'+active.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
 }
 const scroll=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
 modal.addEventListener('scroll',scroll,{passive:true});
 const observer=new ResizeObserver(scroll);observer.observe(article);observer.observe(modal);
 const sectionId=new URLSearchParams(location.hash.slice(1)).get('section');
 const target=sections.find(section=>section.id===sectionId);
 // Wait for main's existing card-to-modal transition, never race its focus handling.
 const timer=target?setTimeout(()=>{if(modal.isConnected)go(target,true)},420):null;
 modal._uxCleanup=()=>{navigationId++;navigationEvents.abort();observer.disconnect();modal.removeEventListener('scroll',scroll);clearTimeout(timer)};
 update();
}
