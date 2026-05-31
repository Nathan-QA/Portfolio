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
    maxScrollVh: 94,
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
    fr: "Level Designer avec un background QA et production, orienté lisibilité, playtests, documentation et faisabilité d’équipe.",
    en: "Level Designer with a QA and production background, focused on readability, playtests, documentation and team feasibility."
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
    hero_title:"Level Designer",
    hero_roles:"Background QA & production au service du level design.",
    hero_focus_label:"Level design",
    hero_focus_value:"Exploration, guidage, rythme, objectifs, documentation LD, intégration moteur et scripting d’éléments LD",
    hero_scope_label:"Ce que la QA ajoute",
    hero_scope_value:"Repérer tôt les frictions : lisibilité, bugs de progression, cas limites et retours de test quand ils existent",
    hero_tools_label:"Ce que la production ajoute",
    hero_tools_value:"Relier les intentions aux contraintes de scope, budget et planning : priorités, tickets, builds et dépendances",
    hero_desc:"",
    timeline_kicker:"Parcours",
    timeline_title:"Projets, périodes et rôles",
    timeline_education_time:"Sept. 2019 - Juil. 2022",
    timeline_education_title:"E-artsup Bordeaux",
    timeline_education_text:"Formation Game Design, projets étudiants et diplôme.",
    timeline_uma_time:"Août 2022 - Septembre 2023",
    timeline_uma_title:"UMANIMATION - Dordogne",
    timeline_uma_text:"Stage QA, CDD QA Manager puis CDI QA Producer : builds, tickets, certification et livraison.",
    timeline_ltag_time:"Octobre 2023 - Mars 2025",
    timeline_ltag_title:"UMANIMATION - Long Time a Girl",
    timeline_ltag_text:"Level Designer & Assistant Game Designer, zones, documentation, intégration et suivi design.",
    timeline_bretagne_time:"Mai 2025 - Fév. 2026",
    timeline_bretagne_title:"Distant Shore: Bretagne",
    timeline_bretagne_text:"Freelance Level Designer : exploration, reprise de zones et documentation LD.",
    timeline_pyla_time:"Oct. 2025 - Mai 2026",
    timeline_pyla_title:"Pepin Kojo - PYLA",
    timeline_pyla_text:"Producer freelance chez Pepin Kojo : coordination, priorités, planning, budget et suivi projet.",
    timeline_next_time:"Mai 2026",
    timeline_next_title:"Nouvelle aventure",
    timeline_next_text:"Fin des missions Bretagne et Pyla, recherche d’un nouveau projet.",
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
    hero_title:"Level Designer",
    hero_roles:"QA & production background serving level design.",
    hero_focus_label:"Level design",
    hero_focus_value:"Exploration, guidance, pacing, objectives, LD documentation, engine integration and LD element scripting",
    hero_scope_label:"What QA adds",
    hero_scope_value:"Spot friction early: readability, progression bugs, edge cases and test feedback when available",
    hero_tools_label:"What production adds",
    hero_tools_value:"Connect design intent to scope, budget and schedule constraints: priorities, tickets, builds and dependencies",
    hero_desc:"I can start from an intention, a gameplay need or a blank page, then build it into a playable proposal: structure, pacing, guidance, engine constraints, useful documentation and team iteration.",
    timeline_kicker:"Path",
    timeline_title:"Projects, periods and roles",
    timeline_education_time:"Sep. 2019 - Jul. 2022",
    timeline_education_title:"E-artsup Bordeaux",
    timeline_education_text:"Game Design studies, student projects and degree.",
    timeline_uma_time:"Aug. 2022 - Mar. 2024",
    timeline_uma_title:"UMANIMATION - Dordogne",
    timeline_uma_text:"QA internship, fixed-term QA Manager, then QA Producer: builds, tickets, certification and release.",
    timeline_ltag_time:"Mar. 2024 - Mar. 2025",
    timeline_ltag_title:"UMANIMATION - Long Time a Girl",
    timeline_ltag_text:"Post-Dordogne unsigned project: Level Designer & Assistant Game Designer, areas, documentation, integration and design follow-up.",
    timeline_bretagne_time:"May 2025 - Feb. 2026",
    timeline_bretagne_title:"Distant Shore: Bretagne",
    timeline_bretagne_text:"Freelance Level Designer: exploration, area rework and LD documentation.",
    timeline_pyla_time:"Oct. 2025 - May 2026",
    timeline_pyla_title:"Pyla",
    timeline_pyla_text:"Freelance Producer at Pepin Kojo: coordination, priorities, planning, budget and project follow-up.",
    timeline_next_time:"May 2026",
    timeline_next_title:"New adventure",
    timeline_next_text:"Bretagne and Pyla missions wrapped, looking for a new project.",
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
