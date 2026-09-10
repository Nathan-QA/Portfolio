// A stable header above the opening: the same navigation on every screen.
export function initHeader(){
  const header=document.querySelector('.header'), toggle=document.getElementById('navToggle');
  const checkbox=document.getElementById('navChk'), nav=document.getElementById('primaryNav');
  if(!header)return;
  const setOpen=open=>{checkbox.checked=open;header.classList.toggle('menu-open',open);toggle.setAttribute('aria-expanded',String(open))};
  toggle.addEventListener('click',()=>setOpen(!checkbox.checked));
  nav.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&checkbox.checked){setOpen(false);toggle.focus({preventScroll:true})}});
  document.addEventListener('click',e=>{if(checkbox.checked&&!header.contains(e.target))setOpen(false)});
  matchMedia('(min-width: 861px)').addEventListener('change',e=>{if(e.matches)setOpen(false)});
  const measure=()=>document.documentElement.style.setProperty('--headerH',Math.ceil(header.getBoundingClientRect().height)+'px');
  new ResizeObserver(measure).observe(header);measure();
  let pending=false;
  const update=()=>{pending=false;document.body.classList.toggle('after-hero',document.getElementById('hero-banner').getBoundingClientRect().bottom<100);header.classList.toggle('has-scrolled',scrollY>24)};
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});
  update();
}
