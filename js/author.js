// Presentation-only structure. Project data and modal behaviour keep one source.
// Called after each render (including a language change), safe to call twice.
export function applyAuthorCards() {
  const addLeaf = parent => {
    if (!parent || parent.querySelector('.card-leaf')) return;
    const leaf = document.createElement('span');
    leaf.className = 'pressed-leaf card-leaf';
    leaf.setAttribute('aria-hidden', 'true');
    parent.append(leaf);
  };
  for (const card of document.querySelectorAll('#projectList .project-tile')) {
    const caption = card.querySelector('.ovr-bottom');
    if (!caption) continue;
    if (!caption.classList.contains('project-caption')) {
      caption.classList.add('project-caption');
      const role = card.querySelector('.role-badge');
      if (role) caption.prepend(role);
      card.append(caption);
      card.querySelector('.ovr')?.remove();
    }
    addLeaf(caption);
  }
  for (const body of document.querySelectorAll('#caseList .case-body')) addLeaf(body);
}

// Observe only list replacement, not mutations inside a caption. This avoids
// observer loops and keeps decoration in place after bilingual rerenders.
for (const id of ['projectList', 'caseList']) {
  const list = document.getElementById(id);
  if (list) new MutationObserver(applyAuthorCards).observe(list, {childList:true});
}
document.addEventListener('portfolio:ready', applyAuthorCards);
applyAuthorCards();
