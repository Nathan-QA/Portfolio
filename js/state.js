export const state = {
  lang: 'fr',
  themeLock: false,
  projects: [],
  cases: [],
  modalStack: [],
  prefersReduced: matchMedia('(prefers-reduced-motion: reduce)').matches
};
