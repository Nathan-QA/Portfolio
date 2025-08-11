// config.js
// i18n + configs de l'app
export const CONFIG = {
  MODEL_URL: null,
  CV_FR_URL: 'assets/Nathan_Tandille_CV_2025.pdf',
  CV_EN_URL: 'assets/Nathan_Tandille_CV_EN_2025.pdf',
  SOCIAL: {
    linkedin: 'https://www.linkedin.com/in/nathan-tandille/',
    mobygames: ''
  },
  CURTAIN: {
    leftImg: 'assets/leaf_left_off.png',
    rightImg: 'assets/leaf_right.png',
    leafSize: 'contain',
    maxScrollVh: 160,
    baseGapVW: 1,
    tightGapVW: 260,
    easing: 'easeOut',
    followHz: 5,
    wobbleGain: 0.018,
    wobbleFreq: 5.5,
    wobbleDecay: 4,
    desync: 0.06,
    scaleDelta: 0.10,
    darkDelta: 0.50
  }
};

export const MAILCFG = {
  TO: 'tandille.nathan@gmail.com',
  EMAILJS_PUBLIC_KEY: '',
  EMAILJS_SERVICE_ID: '',
  EMAILJS_TEMPLATE_ID: '',
  GOOGLE_CLIENT_ID: ''
};

export const PROFILE = {
  tagline: {
    fr: "QA Producer facilitant la compréhension entre équipes pour fluidifier la production et garantir la qualité. Expériences en Game & Level Design.",
    en: "QA Producer improving cross-team understanding to streamline production and ensure quality. Hands-on Game & Level Design experience."
  },

  // (fallbacks conservés)
  skills: { /* ... inchangé ... */ },
  skillsDeep: { /* ... inchangé ... */ },

  links: { email: "tandille.nathan@gmail.com", location: "Bordeaux, France" }
};

export const I = {
  fr:{
    nav_projects:"Projets",nav_cases:"Études de cas",nav_about:"À propos",nav_contact:"Contact",
    cv_fr:"CV FR",cv_en:"CV EN",hero_kicker:"Portfolio",
    hero_desc:"Production QA, coordination multi-équipes, outils et process. Expérience multi-plateformes et multilingue.",
    projects_title:"Projets phares",cases_title:"Études de cas",
    about_role_title:"Compétences",about_skills_title:"Compétences",
    contact_title:"Me contacter",legal_title:"Mentions légales",
    dl_cv_fr:"Télécharger CV (FR)",dl_cv_en:"Télécharger CV (EN)",
    chip_overview:"Présentation",chip_trailer:"Trailer",chip_images:"Images",chip_anecdotes:"Anecdotes",
    btn_open_gallery:"Ouvrir la galerie",btn_open_case:"Voir l’étude de cas",btn_open_case2:"Ouvrir l'étude",
    footer:"Tous droits réservés",open_cv:"Ouvrir le CV",
    contact_name:"Nom",contact_email:"Email",contact_subject:"Objet",contact_message:"Message",
    contact_sign_google:"Se connecter avec Google",contact_send:"Envoyer",contact_or:"ou",
    contact_placeholder_msg:"Écris ton message ici… (mise en forme autorisée)",

    /* Ajouts pour Skills */
    skills_examples:"Exemples",
    skills_related_projects:"Projets liés",
    skills_related_cases:"Études liées"
  },
  en:{
    nav_projects:"Projects",nav_cases:"Case Studies",nav_about:"About",nav_contact:"Contact",
    cv_fr:"CV FR",cv_en:"CV EN",hero_kicker:"Portfolio",
    hero_desc:"QA production, cross-team coordination, tools and processes. Multiplatform and multilingual experience.",
    projects_title:"Highlighted projects",cases_title:"Case studies",
    about_role_title:"Skills",about_skills_title:"Skills",
    contact_title:"Contact me",legal_title:"Legal notice",
    dl_cv_fr:"Download CV (FR)",dl_cv_en:"Download CV (EN)",
    chip_overview:"Overview",chip_trailer:"Trailer",chip_images:"Images",chip_anecdotes:"Anecdotes",
    btn_open_gallery:"Open gallery",btn_open_case:"Open study",btn_open_case2:"Open study",
    footer:"All rights reserved",open_cv:"Open CV",
    contact_name:"Name",contact_email:"Email",contact_subject:"Subject",contact_message:"Message",
    contact_sign_google:"Sign in with Google",contact_send:"Send",contact_or:"or",
    contact_placeholder_msg:"Write your message here… (rich text allowed)",

    /* Added for Skills */
    skills_examples:"Examples",
    skills_related_projects:"Related projects",
    skills_related_cases:"Related studies"
  }
};

export const LANG_KEY = 'pref-lang';
export const THEME_KEY = 'pref-theme';

export const detectLang = ()=>{
  const l = (navigator.language || 'en').toLowerCase();
  return l.startsWith('fr') ? 'fr' : 'en';
};
