export const parseHash = () => {
  const q = new URLSearchParams(location.hash.slice(1));
  return { project: q.get('project'), kase: q.get('case') };
};
export const setHash = (o = {}) => {
  const q = new URLSearchParams(location.hash.slice(1));
  if ('project' in o) { o.project ? q.set('project', o.project) : q.delete('project'); }
  if ('kase' in o)    { o.kase    ? q.set('case', o.kase)     : q.delete('case'); }
  const s = q.toString();
  location.hash = s ? `#${s}` : '';
};
