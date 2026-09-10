// Native history for the existing modal URLs. Normal section anchors stay intact.
export const parseHash = () => {
  const q = new URLSearchParams(location.hash.slice(1));
  return {project:q.get('project'), kase:q.get('case') || q.get('kase')};
};
export const setHash = (o={}) => {
  const q = new URLSearchParams();
  if(o.project) q.set('project',o.project);
  if(o.kase) q.set('case',o.kase);
  const hash=q.size ? '#'+q : '';
  if(location.hash===hash) return;
  const old=parseHash();
  // Reopening the same article must retain its exact section on refresh.
  if((old.project||null)===(o.project||null) && (old.kase||null)===(o.kase||null) && (old.project||old.kase)) return;
  const origin=(old.project||old.kase)
    ? history.state?.portfolioOrigin || (old.kase?'#cases':'#projects')
    : location.hash || (o.kase?'#cases':'#projects');
  history.pushState({portfolioOrigin:origin},'',location.pathname+location.search+hash);
};
export const clearContentHash = () => {
  const route=parseHash();
  if(!route.project&&!route.kase) return;
  const origin=history.state?.portfolioOrigin || (route.kase?'#cases':'#projects');
  history.replaceState(null,'',location.pathname+location.search+origin);
};
