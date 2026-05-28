// config.js
// i18n + configs de l'app
export const CONFIG = {
  MODEL_URL: null,
  CV_FR_URL: 'assets/Nathan_Tandille_CV_2026.pdf',
  CV_EN_URL: 'assets/Nathan_Tandille_CV_2026.pdf',
  SOCIAL: {
    linkedin: 'https://www.linkedin.com/in/nathan-tandille/',
    mobygames: 'https://www.mobygames.com/person/1375320/nathan-tandille/'
  },
  CURTAIN: {
    leftImg: 'assets/leaf_left_off.png',
    rightImg: 'assets/leaf_right.png',
    leafSize: 'contain',
    maxScrollVh: 100,
    baseGapVW: 1,
    tightGapVW: 260,
    easing: 'smooth',
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
    fr: "Profil jeu vidéo entre conception de niveaux, suivi qualité et coordination de production, avec une approche concrète des builds, des retours de test, des outils et de la livraison.",
    en: "Game development profile combining level design, quality follow-up and production coordination, with a practical view of builds, test feedback, tools and shipping."
  },

  // (fallbacks conservés)
  skills: { /* ... inchangé ... */ },
  skillsDeep: { /* ... inchangé ... */ },

  links: { email: "tandille.nathan@gmail.com", location: "Bordeaux, France" }
};

export const I = {
  fr:{
    skip_content:"Aller au contenu",
    nav_projects:"Projets",nav_cases:"Études de cas",nav_about:"Skills",nav_contact:"Contact",
    cv_fr:"CV FR",cv_en:"CV EN",hero_kicker:"Portfolio",
    hero_desc:"Profil jeu vidéo entre conception de niveaux, suivi qualité et coordination de production, avec une approche concrète des builds, des retours de test, des outils et de la livraison.",
    projects_title:"Projets",cases_title:"Études de cas",
    about_role_title:"Skills",about_skills_title:"Compétences",
    contact_title:"Me contacter",legal_title:"Mentions légales",
    dl_cv_fr:"Télécharger CV (FR)",dl_cv_en:"Télécharger CV (EN)",
    chip_overview:"Présentation",chip_trailer:"Trailer",chip_images:"Images",chip_anecdotes:"Anecdotes",
    btn_open_gallery:"Ouvrir la galerie",btn_open_case:"Voir l’étude de cas",btn_open_case2:"Ouvrir l'étude",
    footer:"Tous droits réservés",open_cv:"Ouvrir le CV",
    contact_kicker:"Opportunités",
    contact_intro_title:"Disponible pour échanger",
    contact_intro_body:"Le plus simple reste un mail avec le contexte du projet, le rôle, les besoins et le timing. Je réponds volontiers aux échanges autour de design, QA, production, outils ou organisation d’équipe.",
    contact_email_direct:"Envoyer un mail",
    contact_cv:"Télécharger le CV",
    contact_note:"Réponse possible en français ou en anglais. Basé à Bordeaux, disponible pour discuter d’un projet en studio, hybride ou remote selon le contexte.",
    contact_name:"Nom",contact_email:"Email",contact_subject:"Objet",contact_message:"Message",
    contact_sign_google:"Se connecter avec Google",contact_send:"Envoyer",contact_or:"ou",
    contact_placeholder_msg:"Écris ton message ici…",

    /* Ajouts pour Skills */
    skills_examples:"Exemples",
    skills_related_projects:"Projets liés",
    skills_related_cases:"Études liées"
  },
  en:{
    skip_content:"Skip to content",
    nav_projects:"Projects",nav_cases:"Case Studies",nav_about:"Skills",nav_contact:"Contact",
    cv_fr:"CV FR",cv_en:"CV EN",hero_kicker:"Portfolio",
    hero_desc:"Game development profile combining level design, quality follow-up and production coordination, with a practical view of builds, test feedback, tools and shipping.",
    projects_title:"Projects",cases_title:"Case studies",
    about_role_title:"Skills",about_skills_title:"Skills",
    contact_title:"Contact me",legal_title:"Legal notice",
    dl_cv_fr:"Download CV (FR)",dl_cv_en:"Download CV (EN)",
    chip_overview:"Overview",chip_trailer:"Trailer",chip_images:"Images",chip_anecdotes:"Anecdotes",
    btn_open_gallery:"Open gallery",btn_open_case:"Open study",btn_open_case2:"Open study",
    footer:"All rights reserved",open_cv:"Open CV",
    contact_kicker:"Opportunities",
    contact_intro_title:"Available for conversations",
    contact_intro_body:"The easiest path is an email with the project context, role, needs and timing. I am happy to discuss design, QA, production, tools or team workflows.",
    contact_email_direct:"Send an email",
    contact_cv:"Download resume",
    contact_note:"I can answer in French or English. Based in Bordeaux, available to discuss studio, hybrid or remote contexts depending on the project.",
    contact_name:"Name",contact_email:"Email",contact_subject:"Subject",contact_message:"Message",
    contact_sign_google:"Sign in with Google",contact_send:"Send",contact_or:"or",
    contact_placeholder_msg:"Write your message here…",

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
