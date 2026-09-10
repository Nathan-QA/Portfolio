// Presentation adapter for the existing content renderers. One caption per
// project; data, modal routes, hover previews and keyboard links are unchanged.
import {state} from './state.js';
function arrangeProjects(){
  document.querySelectorAll('#projectList .project-tile').forEach(card=>{
    if(card.querySelector(':scope > .project-caption'))return;
    const caption=document.createElement('div');caption.className='project-caption';
    const copy=card.querySelector('.project-copy'),role=card.querySelector('.role-badge');
    if(!copy)return;
    if(role)caption.append(role);
    caption.append(copy);card.append(caption);
    card.querySelector('.ovr')?.remove();
  });
}
function refineTools(){
  const fr=state.lang==='fr';
  const scrollCue=document.querySelector('.ux-explore');
  if(scrollCue){scrollCue.href='#projects';scrollCue.setAttribute('aria-label',fr?'Découvrir les projets':'Discover the projects')}
  const input=document.querySelector('.ux-search input');
  if(input)input.placeholder=fr?'Un projet, un sujet…':'A project, a subject…';
}
const projects=document.getElementById('projectList');
new MutationObserver(arrangeProjects).observe(projects,{childList:true});
new MutationObserver(refineTools).observe(document.getElementById('articleTools'),{childList:true});
document.addEventListener('portfolio:ready',()=>{arrangeProjects();refineTools()});
arrangeProjects();refineTools();
