export const $  = (s)=>document.querySelector(s);
export const byId = (id)=>document.getElementById(id);
export const el = (html)=>{ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; };
export const txt = (n,v)=>n&&(n.textContent=v);

export const safeGet = (k)=>{ try{return localStorage.getItem(k)}catch{return null} };
export const safeSet = (k,v)=>{ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,v) }catch{} };

export function imgsArr(imgs){
  if(!imgs) return [];
  if(Array.isArray(imgs)) return imgs;
  if(typeof imgs==='string') return [imgs];
  if(typeof imgs==='object'){
    const out=[]; for(const k in imgs){ const v=imgs[k];
      if(Array.isArray(v)) out.push(...v); else if(typeof v==='string') out.push(v);
    }
    return [...new Set(out)];
  }
  return [];
}
export function cover(imgs){
  if(!imgs) return '';
  if(Array.isArray(imgs)) return imgs[0]||'';
  if(typeof imgs==='object') return imgs.cover||imgs.hero||(Array.isArray(imgs.gallery)?imgs.gallery[0]:imgs.gallery)||imgsArr(imgs)[0]||'';
  if(typeof imgs==='string') return imgs;
  return '';
}
