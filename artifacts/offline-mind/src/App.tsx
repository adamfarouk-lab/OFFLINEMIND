import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, HeartHandshake, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { Logo } from './components/Logo';
import { getFaq } from './data/faq';
import { getFeelings } from './data/feelings';
import { getSituations, situations } from './data/situations';
import { resourceCategories, resources } from './data/resources';
import type { FeelingGuideData } from './data/types';
import { getTopics } from './data/topics';
import { getToolCards } from './data/tools';

type Language = 'en' | 'fr';

type TranslationSet = {
  nav: Record<string, string>;
  pageTitles: Record<string, string>;
  footer: {
    quietPlace: string;
    informationNote: string;
    explore: string;
    nextSteps: string;
    brand: string;
    madeFor: string;
  };
  home: {
    eyebrow: string;
    heading: string;
    intro: string;
    cta: string;
    secondary: string;
    feelingsTitle: string;
    situationsTitle: string;
    exploreTitle: string;
    urgentTitle: string;
    urgentText: string;
    urgentButton: string;
    feelingsHeading: string;
    feelingsLink: string;
    situationHeading: string;
    situationsLink: string;
    toolsLabel: string;
    toolsText: string;
    learnLabel: string;
    learnText: string;
    findHelpLabel: string;
    findHelpText: string;
    illustration: string;
  };
  feelings: {
    eyebrow: string;
    title: string;
    copy: string;
    openGuide: string;
    allFeelings: string;
    closeWords: string;
    related: string;
    relatedSituations: string;
    note: string;
  };
  situations: {
    eyebrow: string;
    title: string;
    copy: string;
    openGuide: string;
    allSituations: string;
    oneMoment: string;
    commonQuestions: string;
    immediateSafety: string;
    urgentLink: string;
    searchLabel: string;
  };
  about: {
    eyebrow: string;
    title: string;
    copy: string;
    whatItIsTitle: string;
    whyItExistsTitle: string;
    whatItIsNotTitle: string;
    privacyTitle: string;
    whatItIs: string;
    whyItExists: string;
    whatItIsNot: string;
    privacy: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    body: string;
    home: string;
    browseFeelings: string;
  };
  common: {
    openMenu: string;
    closeMenu: string;
    languageLabel: string;
    search: string;
    clearSearch: string;
    openGuide: string;
    browseAll: string;
    whatMightBeHappening: string;
    whatCanITryRightNow: string;
    whatMayHelpOverNextFewDays: string;
    whenProfessionalHelpMayBeUseful: string;
    related: string;
    generalInfo: string;
    aPlaceToBegin: string;
    chooseWhatFits: string;
  };
};

const LANGUAGE_STORAGE_KEY = 'offline-mind-language';

const translations: Record<Language, TranslationSet> = {
  en: {
    nav: {
      home: 'Home',
      feelings: "What I'm Feeling",
      situations: 'Situations',
      learn: 'Learn',
      tools: 'Tools',
      findHelp: 'Find Help',
      urgent: 'Urgent help',
      faq: 'FAQ',
      about: 'About & Privacy',
    },
    pageTitles: {
      home: 'A Quieter Place to Begin',
      feelings: "What I'm Feeling",
      situations: 'Situations',
      learn: 'Learn',
      tools: 'Tools',
      findHelp: 'Find Help',
      urgentHelp: 'Urgent Help',
      faq: 'Frequently Asked Questions',
      about: 'About & Privacy',
      notFound: 'Page Not Found',
    },
    footer: {
      quietPlace: 'A quiet place to understand what you are going through.',
      informationNote: 'Information and self-help, not a substitute for professional care.',
      explore: 'Explore',
      nextSteps: 'Next steps',
      brand: 'OFFLINE MIND',
      madeFor: 'Made for a quieter next step.',
    },
    home: {
      eyebrow: 'A quieter place to begin',
      heading: 'You do not need the perfect words.',
      intro: 'Take a calm step toward understanding what you are feeling, what is happening, and what might help next.',
      cta: 'Start here',
      secondary: 'Explore resources',
      feelingsTitle: 'Start with a feeling',
      situationsTitle: 'Start with a situation',
      exploreTitle: 'Explore what might help',
      urgentTitle: 'Need help right now?',
      urgentText: 'If you or someone else may be in immediate danger, seek urgent support now.',
      urgentButton: 'I need help right now',
      feelingsHeading: 'What are you feeling?',
      feelingsLink: 'See all feelings',
      situationHeading: 'Sometimes the situation is easier to name.',
      situationsLink: 'All situations',
      toolsLabel: 'Tools',
      toolsText: 'Take a small pause.',
      learnLabel: 'Learn',
      learnText: 'Understand what you are experiencing.',
      findHelpLabel: 'Find Help',
      findHelpText: 'Reach supportive services.',
      illustration: 'A calm illustration',
    },
    feelings: {
      eyebrow: 'Start with what feels closest',
      title: "What I'm Feeling",
      copy: 'You do not need the perfect words. Start with what feels closest.',
      openGuide: 'Open guide',
      allFeelings: 'All feelings',
      closeWords: 'Words that might feel close',
      related: 'Related',
      relatedSituations: 'Related situations',
      note: 'This guide offers general information, not diagnosis.',
    },
    situations: {
      eyebrow: 'A moment, a problem, a next step',
      title: 'Situations',
      copy: 'Find a guide for something happening in your life right now.',
      openGuide: 'Open guide',
      allSituations: 'All situations',
      oneMoment: 'You can take this one moment at a time.',
      commonQuestions: 'Common questions',
      immediateSafety: 'Immediate safety matters.',
      urgentLink: 'Urgent help',
      searchLabel: 'Search situations',
    },
    about: {
      eyebrow: 'A little about us',
      title: 'Words for the days that don’t have them.',
      copy: 'OFFLINE MIND is a calm information and self-help resource, made with people in Morocco in mind.',
      whatItIsTitle: 'What it is',
      whyItExistsTitle: 'Why it exists',
      whatItIsNotTitle: 'What it is not',
      privacyTitle: 'Privacy, by default',
      whatItIs: 'A place to explore what you may be feeling, find practical ways to steady a moment, and understand possible next steps toward support.',
      whyItExists: 'People do not always have the words to explain how they feel. We want the first step to feel possible, even when the feeling is difficult to name.',
      whatItIsNot: 'OFFLINE MIND is not a clinic, a diagnosis tool, or a replacement for professional care.',
      privacy: 'No account is needed. The site is designed without tracking or advertising.',
    },
    notFound: {
      eyebrow: '404 / A quiet wrong turn',
      title: 'This page isn’t here.',
      body: 'It may have moved, or the address may not be quite right.',
      home: 'Go to home',
      browseFeelings: 'Browse feelings',
    },
    common: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      languageLabel: 'Language selector',
      search: 'Search',
      clearSearch: 'Clear search',
      openGuide: 'Open guide',
      browseAll: 'Browse all',
      whatMightBeHappening: 'What might be happening',
      whatCanITryRightNow: 'What you can try right now',
      whatMayHelpOverNextFewDays: 'What may help over the next few days',
      whenProfessionalHelpMayBeUseful: 'When professional help may be useful',
      related: 'Related',
      generalInfo: 'This guide offers general information, not diagnosis.',
      aPlaceToBegin: 'A place to begin',
      chooseWhatFits: 'Choose what fits',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      feelings: 'Ce que je ressens',
      situations: 'Situations',
      learn: 'Apprendre',
      tools: 'Outils',
      findHelp: 'Trouver de l’aide',
      urgent: 'Aide urgente',
      faq: 'FAQ',
      about: 'À propos & confidentialité',
    },
    pageTitles: {
      home: 'Un lieu plus calme pour commencer',
      feelings: 'Ce que je ressens',
      situations: 'Situations',
      learn: 'Apprendre',
      tools: 'Outils',
      findHelp: 'Trouver de l’aide',
      urgentHelp: 'Aide urgente',
      faq: 'Questions fréquentes',
      about: 'À propos & confidentialité',
      notFound: 'Page introuvable',
    },
    footer: {
      quietPlace: 'Un endroit calme pour comprendre ce que vous traversez.',
      informationNote: 'Des informations et de l’auto-assistance, pas un remplacement des soins professionnels.',
      explore: 'Explorer',
      nextSteps: 'Prochaines étapes',
      brand: 'OFFLINE MIND',
      madeFor: 'Fait pour une prochaine étape plus paisible.',
    },
    home: {
      eyebrow: 'Un lieu plus calme pour commencer',
      heading: 'Vous n’avez pas besoin des mots parfaits.',
      intro: 'Faites un pas calme vers une meilleure compréhension de ce que vous ressentez, de ce qui se passe et de ce qui peut aider ensuite.',
      cta: 'Commencer ici',
      secondary: 'Explorer les ressources',
      feelingsTitle: 'Commencez par un ressenti',
      situationsTitle: 'Commencez par une situation',
      exploreTitle: 'Explorer ce qui peut aider',
      urgentTitle: 'Besoin d’aide tout de suite ?',
      urgentText: 'Si vous ou quelqu’un d’autre risque d’être en danger immédiat, cherchez une aide urgente maintenant.',
      urgentButton: 'J’ai besoin d’aide maintenant',
      feelingsHeading: 'Que ressentez-vous ?',
      feelingsLink: 'Voir tous les ressentis',
      situationHeading: 'Parfois, il est plus facile de nommer la situation.',
      situationsLink: 'Toutes les situations',
      toolsLabel: 'Outils',
      toolsText: 'Faites une petite pause.',
      learnLabel: 'Apprendre',
      learnText: 'Comprenez ce que vous vivez.',
      findHelpLabel: 'Trouver de l’aide',
      findHelpText: 'Trouvez des services de soutien.',
      illustration: 'Une illustration calme',
    },
    feelings: {
      eyebrow: 'Commencez par ce qui semble le plus proche',
      title: 'Ce que je ressens',
      copy: 'Vous n’avez pas besoin des mots parfaits. Commencez par ce qui semble le plus proche.',
      openGuide: 'Ouvrir le guide',
      allFeelings: 'Tous les ressentis',
      closeWords: 'Mots qui peuvent sembler proches',
      related: 'Liens',
      relatedSituations: 'Situations liées',
      note: 'Ce guide offre des informations générales, pas un diagnostic.',
    },
    situations: {
      eyebrow: 'Un moment, un problème, une prochaine étape',
      title: 'Situations',
      copy: 'Trouvez un guide pour quelque chose qui se produit dans votre vie en ce moment.',
      openGuide: 'Ouvrir le guide',
      allSituations: 'Toutes les situations',
      oneMoment: 'Vous pouvez prendre cela un moment à la fois.',
      commonQuestions: 'Questions courantes',
      immediateSafety: 'La sécurité immédiate compte.',
      urgentLink: 'Aide urgente',
      searchLabel: 'Rechercher une situation',
    },
    about: {
      eyebrow: 'Un peu à propos de nous',
      title: 'Des mots pour les jours qui n’en ont pas.',
      copy: 'OFFLINE MIND est une ressource calme d’information et d’auto-assistance, pensée pour les personnes au Maroc.',
      whatItIsTitle: 'Ce que c’est',
      whyItExistsTitle: 'Pourquoi cela existe',
      whatItIsNotTitle: 'Ce que ce n’est pas',
      privacyTitle: 'Confidentialité, par défaut',
      whatItIs: 'Un endroit pour explorer ce que vous ressentez, trouver des moyens pratiques de stabiliser un moment et comprendre les prochaines étapes possibles vers le soutien.',
      whyItExists: 'Les gens n’ont pas toujours les mots pour expliquer ce qu’ils ressentent. Nous voulons que la première étape soit possible, même quand le ressenti est difficile à nommer.',
      whatItIsNot: 'OFFLINE MIND n’est ni une clinique, ni un outil de diagnostic, ni un remplacement des soins professionnels.',
      privacy: 'Aucun compte n’est nécessaire. Le site est conçu sans suivi ni publicité.',
    },
    notFound: {
      eyebrow: '404 / Un faux pas paisible',
      title: 'Cette page n’est pas ici.',
      body: 'Elle a peut-être été déplacée, ou l’adresse n’est pas tout à fait correcte.',
      home: 'Retour à l’accueil',
      browseFeelings: 'Parcourir les ressentis',
    },
    common: {
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      languageLabel: 'Sélecteur de langue',
      search: 'Recherche',
      clearSearch: 'Effacer la recherche',
      openGuide: 'Ouvrir le guide',
      browseAll: 'Tout parcourir',
      whatMightBeHappening: 'Qu’est-ce qui peut se passer ?',
      whatCanITryRightNow: 'Ce que vous pouvez essayer maintenant',
      whatMayHelpOverNextFewDays: 'Ce qui peut aider au cours des prochains jours',
      whenProfessionalHelpMayBeUseful: 'Quand l’aide professionnelle peut être utile',
      related: 'Liens',
      generalInfo: 'Ce guide offre des informations générales, pas un diagnostic.',
      aPlaceToBegin: 'Un point de départ',
      chooseWhatFits: 'Choisissez ce qui convient',
    },
  },
};

const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void; t: TranslationSet } | null>(null);

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'fr' ? 'fr' : 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: translations[language] }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage called outside provider');
  return context;
}

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const options: Language[] = ['en', 'fr'];

  return (
    <div role="group" aria-label={t.common.languageLabel} style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center', border: '1px solid rgba(27,60,83,0.2)', borderRadius: '999px', background: 'rgba(251,249,245,0.7)', padding: '0.2rem' }}>
      {options.map((option) => {
        const active = option === language;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => setLanguage(option)}
            data-testid={`button-language-${option}`}
            style={{
              border: 'none',
              borderRadius: '999px',
              background: active ? '#1B3C53' : 'transparent',
              color: active ? '#fff' : '#1B3C53',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              padding: '0.35rem 0.5rem',
              cursor: 'pointer',
            }}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', description);
  }, [title, description]);

  return null;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
}

function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    ['/', t.nav.home],
    ['/feelings', t.nav.feelings],
    ['/situations', t.nav.situations],
    ['/learn', t.nav.learn],
    ['/tools', t.nav.tools],
    ['/find-help', t.nav.findHelp],
  ] as const;

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <header className="site-header">
        <div className="page-wrap header-inner">
          <div className="logo-plate">
            <Logo />
          </div>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map(([to, label]) => (
              <Link key={to} to={to} className={location.pathname === to ? 'nav-link active' : 'nav-link'}>
                {label}
              </Link>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LanguageSwitcher />
            <button className="menu-toggle" aria-label={open ? t.common.closeMenu : t.common.openMenu} aria-expanded={open} onClick={() => setOpen(!open)} data-testid="button-mobile-menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav page-wrap" aria-label="Mobile navigation">
            {navItems.map(([to, label]) => (
              <Link key={to} to={to} className="mobile-nav-link">
                {label}
              </Link>
            ))}
            <Link to="/urgent-help" className="mobile-nav-link urgent-mobile">
              {t.nav.urgent}
            </Link>
          </nav>
        )}
      </header>

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feelings" element={<FeelingsPage />} />
          <Route path="/feelings/:slug" element={<FeelingDetailPage />} />
          <Route path="/situations" element={<SituationsPage />} />
          <Route path="/situations/:slug" element={<SituationDetailPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:slug" element={<LearnDetailPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/find-help" element={<FindHelpPage />} />
          <Route path="/urgent-help" element={<UrgentHelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

function Footer() {
  const { t, language } = useLanguage();
  const creatorText = language === 'fr' ? 'Créé par' : 'Created by';

  return (
    <footer className="footer">
      <div className="page-wrap footer-grid">
        <div>
          <div className="logo-plate">
            <Logo />
          </div>
          <p>{t.footer.quietPlace}</p>
          <small>{t.footer.informationNote}</small>
        </div>
        <div>
          <b>{t.footer.explore}</b>
          <Link to="/feelings">{t.nav.feelings}</Link>
          <Link to="/situations">{t.nav.situations}</Link>
          <Link to="/learn">{t.nav.learn}</Link>
        </div>
        <div>
          <b>{t.footer.nextSteps}</b>
          <Link to="/tools">{t.nav.tools}</Link>
          <Link to="/find-help">{t.nav.findHelp}</Link>
          <Link to="/urgent-help">{t.nav.urgent}</Link>
          <Link to="/about">{t.nav.about}</Link>
        </div>
      </div>
      <div className="page-wrap footer-credit" aria-label={language === 'fr' ? 'Créé par Adam, ouvre Instagram' : 'Created by Adam, opens Instagram'}>
        <span>{creatorText}</span>{' '}
        <a
          href="https://www.instagram.com/adamm.obv/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={language === 'fr' ? 'Adam sur Instagram' : 'Adam on Instagram'}
        >
          Adam
        </a>
      </div>
      <div className="page-wrap footer-bottom">
        <span>{t.footer.brand}</span>
        <span>{t.footer.madeFor}</span>
      </div>
    </footer>
  );
}

function Home() {
  const { language, t } = useLanguage();
  const feelings = getFeelings(language);
  const situationsList = getSituations(language).slice(0, 6);

  return (
    <>
      <Meta title={t.pageTitles.home} description="Understand what you are feeling, find small practical supports, and learn what help might look like." />
      <section className="hero">
        <div className="page-wrap hero-grid hero-grid-no-art">
          <div className="hero-copy">
            <span className="eyebrow">{t.home.eyebrow}</span>
            <h1 className="display">{t.home.heading}</h1>
            <p>{t.home.intro}</p>
            <div className="hero-actions">
              <Link to="/feelings" className="button">{t.home.cta}<ArrowRight size={17} /></Link>
              <Link to="/learn" className="text-link">{t.home.secondary}<ArrowRight size={16} /></Link>
            </div>
            <div className="privacy-note"><ShieldCheck size={14} /> <span>{t.about.privacy}</span></div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="page-wrap">
          <div className="split-heading">
            <div>
              <span className="eyebrow">{t.home.feelingsTitle}</span>
              <h2 className="section-title">{t.home.feelingsHeading}</h2>
            </div>
            <Link to="/feelings" className="underlined-link">{t.home.feelingsLink} <ArrowRight size={15} /></Link>
          </div>
          <div className="feeling-links">
            {feelings.slice(0, 6).map((item, index) => (
              <Link key={item.slug} to={`/feelings/${item.slug}`} className="feeling-link" data-testid={`feeling-home-${item.slug}`}>
                <span className="feeling-num">{String(index + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-wrap">
          <div className="section-topline">
            <span className="eyebrow">{t.home.situationsTitle}</span>
            <Link to="/situations" className="underlined-link">{t.home.situationsLink} <ArrowRight size={16} /></Link>
          </div>
          <h2 className="section-title">{t.home.situationHeading}</h2>
          <div className="situation-grid">
            {situationsList.map((item, index) => (
              <Link key={item.slug} to={`/situations/${item.slug}`} className="situation-item" data-testid={`situation-home-${item.slug}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="page-wrap">
          <div className="split-heading">
            <div>
              <span className="eyebrow">{t.footer.explore}</span>
              <h2 className="section-title">{t.home.exploreTitle}</h2>
            </div>
          </div>
          <div className="topic-row">
            <Link to="/tools" className="topic-link"><span>01</span><div><strong>{t.home.toolsLabel}</strong><small>{t.home.toolsText}</small></div><ArrowRight size={16} /></Link>
            <Link to="/learn" className="topic-link"><span>02</span><div><strong>{t.home.learnLabel}</strong><small>{t.home.learnText}</small></div><ArrowRight size={16} /></Link>
            <Link to="/find-help" className="topic-link"><span>03</span><div><strong>{t.home.findHelpLabel}</strong><small>{t.home.findHelpText}</small></div><ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="urgent-strip">
        <div className="page-wrap urgent-inner">
          <div>
            <span className="eyebrow">{t.nav.urgent}</span>
            <h2>{t.home.urgentTitle}</h2>
            <p>{t.home.urgentText}</p>
          </div>
          <Link to="/urgent-help" className="urgent-button">
            {t.home.urgentButton} <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}

function FeelingsPage() {
  const { language, t } = useLanguage();
  const feelings = getFeelings(language);

  return (
    <>
      <Meta title={t.pageTitles.feelings} description="A gentle way to explore common feelings and start with what feels closest." />
      <section className="section listing-page">
        <div className="page-wrap">
          <PageHeading eyebrow={t.feelings.eyebrow} title={t.feelings.title} copy={t.feelings.copy} />
          <div className="listing-grid">
            {feelings.map((item) => (
              <Link key={item.slug} to={`/feelings/${item.slug}`} className="listing-card">
                <h2>{item.label}</h2>
                <p>{item.shortDescription}</p>
                <span className="card-action">{t.feelings.openGuide} <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FeelingDetailPage() {
  const { slug = '' } = useParams();
  const { language } = useLanguage();
  const feeling = getFeelings(language).find((item) => item.slug === slug);

  if (!feeling) return <NotFoundPage />;

  return <FeelingDetail feeling={feeling} />;
}

function FeelingDetail({ feeling }: { feeling: FeelingGuideData }) {
  const { language, t } = useLanguage();

  return (
    <>
      <Meta title={feeling.title} description={feeling.introduction} />
      <article className="article-page">
        <div className="reading-width">
          <Link to="/feelings" className="back-link"><ArrowLeft size={16} /> {t.feelings.allFeelings}</Link>
          <h1 className="article-title">{feeling.title}</h1>
          <p className="article-lede">{feeling.introduction}</p>
          <div className="guide-callout">
            <strong>{t.feelings.closeWords}</strong>
            <div className="tag-cloud">
              {(feeling.startingPoints ?? []).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <GuideSection n="01" title={t.common.whatMightBeHappening} body={feeling.whatMightBeHappening} />
          <ListSection n="02" title={t.common.whatCanITryRightNow} items={feeling.thingsToTry} />
          <ListSection n="03" title={t.common.whatMayHelpOverNextFewDays} items={feeling.nextFewDays} />
          <GuideSection n="04" title={t.common.whenProfessionalHelpMayBeUseful} body={feeling.professionalHelp} />
          {feeling.relatedSituations.length > 0 && (
            <section className="article-section">
              <span className="eyebrow">{t.feelings.related}</span>
              <h2>{t.feelings.relatedSituations}</h2>
              <div className="related-links">
                {feeling.relatedSituations.map((slug) => {
                  const item = getSituations(language).find((s) => s.slug === slug);
                  return item ? <Link key={slug} to={`/situations/${slug}`}>{item.title}<ArrowRight size={15} /></Link> : null;
                })}
              </div>
            </section>
          )}
          <p className="article-note">{t.feelings.note}</p>
        </div>
      </article>
    </>
  );
}

function SituationsPage() {
  const { language, t } = useLanguage();
  const items = getSituations(language);

  return (
    <>
      <Meta title={t.pageTitles.situations} description="Explore common situations and gentle guidance for what may help next." />
      <section className="section listing-page">
        <div className="page-wrap">
          <PageHeading eyebrow={t.situations.eyebrow} title={t.situations.title} copy={t.situations.copy} />
          <div className="listing-grid">
            {items.map((item) => (
              <Link key={item.slug} to={`/situations/${item.slug}`} className="listing-card">
                <h2>{item.title}</h2>
                <p>{item.short}</p>
                <span className="card-action">{t.situations.openGuide} <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SituationDetailPage() {
  const { slug = '' } = useParams();
  const { language, t } = useLanguage();
  const item = getSituations(language).find((entry) => entry.slug === slug);

  if (!item) return <NotFoundPage />;

  return (
    <>
      <Meta title={item.title} description={item.might} />
      <article className="article-page">
        <div className="reading-width">
          <Link to="/situations" className="back-link"><ArrowLeft size={16} /> {t.situations.allSituations}</Link>
          <h1 className="article-title">{item.title}</h1>
          <p className="article-lede">{t.situations.oneMoment}</p>
          <GuideSection n="01" title={t.common.whatMightBeHappening} body={item.might} />
          <ListSection n="02" title={t.common.whatCanITryRightNow} items={item.now} />
          <GuideSection n="03" title="Try this" body={item.tryThis} />
          <section className="article-section">
            <span className="eyebrow">04 / {t.situations.commonQuestions}</span>
            <h2>{t.situations.commonQuestions}</h2>
            <div className="faq-list">
              {item.questions.map((q, index) => (
                <details key={q.question} className="accordion-item">
                  <summary data-testid={`faq-question-${index}`}>{q.question}<ChevronDown size={18} /></summary>
                  <p>{q.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <GuideSection n="05" title={t.common.whenProfessionalHelpMayBeUseful} body={item.professional} />
          {item.urgent && (
            <section className="article-section">
              <span className="eyebrow">06 / {t.situations.immediateSafety}</span>
              <h2>{t.situations.immediateSafety}</h2>
              <p>{language === 'fr' ? 'Si quelqu’un est en danger immédiat, demandez immédiatement une aide urgente en personne.' : 'If anyone may be in immediate danger, seek urgent in-person support now.'}</p>
              <Link to="/urgent-help" className="underlined-link">{t.situations.urgentLink} <ArrowRight size={15} /></Link>
            </section>
          )}
        </div>
      </article>
    </>
  );
}

function LearnPage() {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const items = getTopics(language);
  const filtered = items.filter((topic) => `${topic.title} ${topic.summary}`.toLowerCase().includes(query.toLowerCase()));
  const isFrench = language === 'fr';

  return (
    <>
      <Meta title={isFrench ? 'Apprendre' : 'Learn'} description="Clear, approachable information about mental health, difficult emotions, and situations." />
      <section className="section listing-page">
        <div className="page-wrap">
          <PageHeading
            eyebrow={isFrench ? 'Des introductions claires et respectueuses' : 'Clear, careful introductions'}
            title={isFrench ? 'Apprendre' : 'Learn'}
            copy={isFrench
              ? 'Explorez les sujets à votre rythme. Ces articles offrent de l’information générale, pas un diagnostic ni un conseil médical individuel.'
              : 'Explore topics at your own pace. These articles offer general information, not diagnosis or individual medical advice.'}
          />
          <label className="search-field" style={{ marginBottom: '1.25rem' }}>
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isFrench ? 'Rechercher un sujet' : 'Search learning topics'} />
            {query && <button type="button" aria-label={isFrench ? 'Effacer la recherche' : 'Clear search'} onClick={() => setQuery('')}><X size={16} /></button>}
          </label>
          <div className="listing-grid">
            {filtered.map((item) => (
              <Link key={item.slug} to={`/learn/${item.slug}`} className="listing-card">
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <span className="card-action">{isFrench ? 'En savoir plus' : 'Learn more'} <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function LearnDetailPage() {
  const { slug = '' } = useParams();
  const { language } = useLanguage();
  const topic = getTopics(language).find((item) => item.slug === slug);
  const isFrench = language === 'fr';

  if (!topic) return <NotFoundPage />;

  const relatedSituations = topic.relatedSituations
    .map((s) => getSituations(language).find((item) => item.slug === s))
    .filter(Boolean) as typeof situations;

  return (
    <>
      <Meta title={topic.title} description={topic.summary} />
      <article className="article-page">
        <div className="reading-width">
          <Link to="/learn" className="back-link"><ArrowLeft size={16} /> {isFrench ? 'Tous les sujets' : 'All topics'}</Link>
          <h1 className="article-title">{topic.title}</h1>
          <p className="article-lede">{topic.summary}</p>
          <div className="gentle-note">
            <ShieldCheck size={18} />
            <p>{isFrench ? 'Information éducative seulement. Elle ne peut pas déterminer ce qui se passe pour vous ni remplacer les soins professionnels.' : 'Educational information only. It cannot determine what is happening for you or replace professional care.'}</p>
          </div>

          {topic.sections.map((section, index) => (
            <section key={section.heading} className="article-section">
              <span className="eyebrow">{String(index + 1).padStart(2, '0')} / {isFrench ? 'Un point de départ' : 'A place to begin'}</span>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}

          {relatedSituations.length > 0 && (
            <section className="article-section">
              <span className="eyebrow">{isFrench ? 'Situations liées' : 'Related situations'}</span>
              <h2>{isFrench ? 'Contexte utile' : 'Helpful context'}</h2>
              <div className="related-links">
                {relatedSituations.map((item) => (
                  <Link key={item.slug} to={`/situations/${item.slug}`}>{item.title}<ArrowRight size={15} /></Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}

function FaqPage() {
  const { language } = useLanguage();
  const faq = getFaq(language);
  const [query, setQuery] = useState('');
  const isFrench = language === 'fr';
  const shown = faq.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <Meta title={isFrench ? 'FAQ' : 'Frequently Asked Questions'} description={isFrench ? 'Des réponses douces à des questions courantes sur les ressentis, le soutien et les prochaines étapes.' : 'Gentle answers to common questions about feelings, support, and next steps.'} />
      <section className="section faq-page">
        <div className="reading-width">
          <PageHeading
            eyebrow={isFrench ? 'Quelques réponses claires' : 'A few clear answers'}
            title={isFrench ? 'Questions, avec douceur.' : 'Questions, met gently.'}
            copy={isFrench ? 'Recherche une question, ou parcoure-les toutes.' : 'Search for a question, or browse them all.'}
          />
          <label className="search-field">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isFrench ? 'Rechercher une question' : 'Search questions'} aria-label={isFrench ? 'Rechercher dans les questions fréquentes' : 'Search FAQ'} />
            {query && <button type="button" aria-label={isFrench ? 'Effacer la recherche' : 'Clear search'} onClick={() => setQuery('')}><X size={16} /></button>}
          </label>
          {query && shown.length === 0 && (
            <p className="faq-footnote" role="status" aria-live="polite">{isFrench ? 'Aucune question ne correspond à votre recherche.' : 'No questions match your search.'}</p>
          )}
          <div className="faq-list">
            {shown.map((item, index) => (
              <details key={item.question} className="accordion-item" data-testid={`faq-question-${index}`}>
                <summary>{item.question}<ChevronDown size={18} /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ToolsPage() {
  const { language } = useLanguage();
  const isFrench = language === 'fr';
  const cards = getToolCards(language);

  return (
    <>
      <Meta title={isFrench ? 'Outils' : 'Tools'} description={isFrench ? 'Exercices de recentrage, respiration, écriture et petites pauses qui aident dans l’instant.' : 'Grounding prompts, breathing, journaling, and small pauses that help in the moment.'} />
      <section className="section tools-page">
        <div className="page-wrap">
          <PageHeading
            eyebrow={isFrench ? 'Petits gestes, quand ils aident' : 'Small steps, when they help'}
            title={isFrench ? 'Outils pour ce moment.' : 'Tools for this moment.'}
            copy={isFrench ? 'Ce sont des invitations, pas des tâches. Choisissez-en une qui vous semble adaptée ; vous pouvez arrêter à tout moment.' : 'These are invitations, not tasks. Choose one that feels okay; you can stop at any time.'}
          />
          <div className="tool-layout">
            <div className="tool-stack">
              {cards.map((card, index) => (
                <ToolCard key={card.id} id={card.id} number={String(index + 1).padStart(2, '0')} title={card.title} description={card.text} language={language} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ToolCard({ id, number, title, description, language }: { id: string; number: string; title: string; description: string; language: Language }) {
  return (
    <section className="tool-panel" id={id}>
      <div className="tool-heading">
        <span className="tool-number">{number}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <ToolBody id={id} language={language} />
    </section>
  );
}

function ToolBody({ id, language }: { id: string; language: Language }) {
  const isFrench = language === 'fr';

  if (id === 'breathing') {
    const phases = isFrench ? [
      { label: 'Inspiration', duration: 4000 },
      { label: 'Pause', duration: 2000 },
      { label: 'Expiration', duration: 4000 },
    ] : [
      { label: 'Inhale', duration: 4000 },
      { label: 'Hold', duration: 2000 },
      { label: 'Exhale', duration: 4000 },
    ];

    const [isRunning, setIsRunning] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);

    useEffect(() => {
      if (!isRunning) return undefined;
      const timer = window.setTimeout(() => {
        setPhaseIndex((previous) => (previous + 1) % phases.length);
      }, phases[phaseIndex].duration);

      return () => window.clearTimeout(timer);
    }, [isRunning, phaseIndex, phases]);

    const activePhase = phases[phaseIndex];

    return (
      <div className="breathing-content">
        <div className={`breath-circle ${isRunning ? 'breath-active' : ''}`} aria-live="polite">
          <span>{isRunning ? activePhase.label : isFrench ? 'Repos' : 'Rest'}</span>
          <small>{isRunning ? `${activePhase.duration / 1000}s` : isFrench ? 'Pause guidée' : 'Guided pause'}</small>
        </div>
        <div className="tool-controls">
          <button type="button" className="button" onClick={() => setIsRunning((value) => !value)}>
            {isRunning ? (isFrench ? 'Pause' : 'Pause') : (isFrench ? 'Commencer' : 'Start')}
          </button>
          <button type="button" className="quiet-button" onClick={() => { setPhaseIndex(0); setIsRunning(false); }}>
            {isFrench ? 'Réinitialiser' : 'Reset'}
          </button>
        </div>
      </div>
    );
  }

  if (id === 'grounding') {
    const senses = isFrench ? [
      'Voir',
      'Entendre',
      'Toucher',
      'Sentir',
      'Goûter',
    ] : [
      'See',
      'Hear',
      'Feel',
      'Smell',
      'Taste',
    ];
    const [checked, setChecked] = useState<boolean[]>(Array(senses.length).fill(false));

    return (
      <>
        <div className="check-steps">
          {senses.map((sense, index) => (
            <button
              key={sense}
              type="button"
              className={`check-step ${checked[index] ? 'checked' : ''}`}
              onClick={() => setChecked((previous) => previous.map((entry, entryIndex) => entryIndex === index ? !entry : entry))}
            >
              <span>{checked[index] ? '✓' : index + 1}</span>
              {sense}
            </button>
          ))}
        </div>
        <button type="button" className="quiet-button" onClick={() => setChecked(Array(senses.length).fill(false))}>
          {isFrench ? 'Réinitialiser' : 'Reset'}
        </button>
      </>
    );
  }

  if (id === 'offline-moment') {
    const steps = isFrench ? [
      'Prenez une grande respiration et laissez les épaules se détendre.',
      'Regardez autour de vous et remarquez ce qui est visible.',
      'Notez une chose qui semble sûre ou connue.',
      'Demandez-vous : qu’est-ce qui a besoin d’être plus petit pour maintenant ?',
      'Choisissez une action simple que vous pouvez faire en ce moment.',
      'Prenez une autre lente respiration et laissez le moment se calmer.',
      'Quand vous êtes prêt, revenez à la prochaine chose, une petite étape à la fois.',
    ] : [
      'Take one slow breath and let your shoulders soften.',
      'Look around and notice what is visible in the room.',
      'Notice one thing that feels familiar or steady.',
      'Ask: what needs to feel smaller for this moment?',
      'Choose one simple action you can take right now.',
      'Take one more slow breath and let the moment settle.',
      'When ready, return to the next small step.',
    ];
    const [stepIndex, setStepIndex] = useState(0);
    const progress = ((stepIndex + 1) / steps.length) * 100;

    return (
      <div className="moment-panel">
        <div className="moment-card">
          <span className="eyebrow">{String(stepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
          <p>{steps[stepIndex]}</p>
          <div className="moment-progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="moment-controls">
            <button type="button" className="quiet-button" disabled={stepIndex === 0} onClick={() => setStepIndex((value) => Math.max(value - 1, 0))}>
              {isFrench ? 'Précédent' : 'Previous'}
            </button>
            <button type="button" className="button" disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((value) => Math.min(value + 1, steps.length - 1))}>
              {isFrench ? 'Suivant' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (id === 'journal') {
    const prompts = isFrench ? [
      'Que se passe-t-il vraiment dans ce moment ?',
      'Qu’est-ce qui semble le plus lourd à porter en ce moment ?',
      'Quelle petite chose aidez-vous à maintenir ?',
      'Que voulez-vous retenir de cette journée ?',
    ] : [
      'What is actually happening in this moment?',
      'What feels the heaviest to carry right now?',
      'What small thing is helping you stay steady?',
      'What do you want to remember from this day?',
    ];
    const [promptIndex, setPromptIndex] = useState(0);
    const [entry, setEntry] = useState('');

    return (
      <>
        <div className="prompt-box">
          <span className="eyebrow">{isFrench ? 'Invitation' : 'Prompt'}</span>
          <p>{prompts[promptIndex]}</p>
          <button type="button" className="text-link" onClick={() => setPromptIndex((value) => (value + 1) % prompts.length)}>
            {isFrench ? 'Autre invitation' : 'Another prompt'}
          </button>
        </div>
        <textarea
          rows={5}
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          placeholder={isFrench ? 'Écrivez ici, si vous le souhaitez…' : 'Write here if you want…'}
          aria-label={isFrench ? 'Écriture privée' : 'Private journaling'}
        />
        <div className="journal-footer">
          <button type="button" className="quiet-button" onClick={() => setEntry('')}>
            {isFrench ? 'Effacer' : 'Clear'}
          </button>
          <span>{entry.trim().length > 0 ? `${entry.trim().length} ${isFrench ? 'caractères' : 'characters'}` : (isFrench ? 'Pas encore écrit' : 'Nothing written yet')}</span>
        </div>
      </>
    );
  }

  if (id === 'mood') {
    const choices = isFrench ? [
      { label: 'Calme', symbol: '○' },
      { label: 'Stable', symbol: '◐' },
      { label: 'Tendu', symbol: '◔' },
      { label: 'Déséquilibré', symbol: '◑' },
      { label: 'Très lourd', symbol: '◉' },
    ] : [
      { label: 'Calm', symbol: '○' },
      { label: 'Steady', symbol: '◐' },
      { label: 'Tense', symbol: '◔' },
      { label: 'Unsettled', symbol: '◑' },
      { label: 'Very heavy', symbol: '◉' },
    ];
    const [selected, setSelected] = useState<number | null>(null);
    const [note, setNote] = useState('');

    return (
      <>
        <p className="mood-question">{isFrench ? 'Comment cela se sent-il en ce moment ?' : 'How does this moment feel?'}</p>
        <div className="mood-options">
          {choices.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              className={`mood-option ${selected === index ? 'selected' : ''}`}
              onClick={() => setSelected(index)}
            >
              <span>{choice.symbol}</span>
              {choice.label}
            </button>
          ))}
        </div>
        {selected !== null && (
          <div className="mood-reflection">
            <b>{choices[selected].label}</b>
            <p>{isFrench ? 'Vous pouvez noter une pensée ou un détail utile, si cela aide.' : 'You can note a thought or detail that helps, if it helps.'}</p>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={isFrench ? 'Ajoutez un détail ou une observation…' : 'Add one detail or observation…'}
              aria-label={isFrench ? 'Observation de l’humeur' : 'Mood note'}
            />
          </div>
        )}
        <div className="journal-footer">
          <button type="button" className="quiet-button" onClick={() => { setSelected(null); setNote(''); }}>
            {isFrench ? 'Effacer' : 'Clear'}
          </button>
          <span>{note.trim() ? `${note.trim().length} ${isFrench ? 'caractères' : 'characters'}` : (isFrench ? 'Aucune note' : 'No note')}</span>
        </div>
      </>
    );
  }

  return null;
}

function FindHelpPage() {
  const { language } = useLanguage();
  const isFrench = language === 'fr';
  const resourceTypeLabels: Record<string, string> = {
    'All types': isFrench ? 'Tous types' : 'All types',
    'Urgent help': isFrench ? 'Aide urgente' : 'Urgent help',
    'Child protection': isFrench ? 'Protection de l’enfance' : 'Child protection',
    'Women and girls': isFrench ? 'Femmes et filles' : 'Women and girls',
    'Public mental-health care': isFrench ? 'Soins de santé mentale publics' : 'Public mental-health care',
    'Professional/regulatory information': isFrench ? 'Informations professionnelles et réglementaires' : 'Professional/regulatory information',
  };
  const [category, setCategory] = useState('All types');
  const visible = resources.filter((item) => category === 'All types' || item.type === category);

  return (
    <>
      <Meta title={isFrench ? 'Trouver de l’aide' : 'Find Help'} description={isFrench ? 'Informations vérifiées sur les services de soutien publics au Maroc.' : 'Verified public support and service information for Morocco.'} />
      <section className="section help-page">
        <div className="page-wrap">
          <PageHeading
            eyebrow={isFrench ? 'Soutien au Maroc' : 'Support in Morocco'}
            title={isFrench ? 'Trouver le bon soutien.' : 'Finding the right support.'}
            copy={isFrench ? 'Utilisez les listes vérifiées ci-dessous pour les prochaines étapes pratiques.' : 'Use the verified listings below for practical next steps.'}
          />
          <label className="filter-label" htmlFor="resource-category">{isFrench ? 'Explorer par type' : 'Explore by type'}</label>
          <select id="resource-category" className="resource-type-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {['All types', ...resourceCategories].map((item) => <option key={item} value={item}>{resourceTypeLabels[item]}</option>)}
          </select>
          <div className="directory-main">
            {visible.map((resource, index) => (
              <article className="resource-card" key={`${resource.name}-${index}`}>
                <span className="eyebrow">{resourceTypeLabels[resource.type] ?? resource.type}</span>
                <h2>{resource.name}</h2>
                {resource.scope && <p><strong>{isFrench ? 'Portée :' : 'Scope:'}</strong> {resource.scope}</p>}
                {resource.city && <p><strong>{isFrench ? 'Lieu :' : 'Location:'}</strong> {resource.city}</p>}
                {resource.description && <p>{resource.description}</p>}
                {resource.phone && <p><strong>{isFrench ? 'Téléphone :' : 'Phone:'}</strong> <a href={`tel:${resource.phone.replace(/\s+/g, '')}`}>{resource.phone}</a></p>}
                {resource.email && <p><strong>{isFrench ? 'Courriel :' : 'Email:'}</strong> <a href={`mailto:${resource.email}`}>{resource.email}</a></p>}
                {resource.address && <p><strong>{isFrench ? 'Adresse :' : 'Address:'}</strong> {resource.address}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function UrgentHelpPage() {
  const { language } = useLanguage();
  const isFrench = language === 'fr';
  const resourceTypeLabels: Record<string, string> = {
    'Urgent help': isFrench ? 'Aide urgente' : 'Urgent help',
    'Child protection': isFrench ? 'Protection de l’enfance' : 'Child protection',
    'Women and girls': isFrench ? 'Femmes et filles' : 'Women and girls',
    'Public mental-health care': isFrench ? 'Soins de santé mentale publics' : 'Public mental-health care',
    'Professional/regulatory information': isFrench ? 'Informations professionnelles et réglementaires' : 'Professional/regulatory information',
  };
  const urgent = resources.filter((item) => ['Urgent help', 'Child protection', 'Women and girls'].includes(item.type));

  return (
    <>
      <Meta title={isFrench ? 'Aide urgente' : 'Urgent Help'} description={isFrench ? 'Informations immédiates sur la sécurité et les contacts de soutien urgent.' : 'Immediate safety information and urgent support contacts.'} />
      <section className="urgent-page">
        <div className="page-wrap">
          <div className="urgent-page-head">
            <span className="eyebrow">{isFrench ? 'Un moment qui ne peut pas attendre' : 'For a moment that cannot wait'}</span>
            <h1 className="section-title">{isFrench ? 'Votre sécurité vient d’abord.' : 'Your safety comes first.'}</h1>
            <p>{isFrench ? 'Si vous êtes en danger immédiat, craignez de vous faire du mal ou de faire du mal à quelqu’un, ou ne pouvez pas vous protéger, cherchez immédiatement une aide urgente en personne.' : 'If you are in immediate danger, fear you may hurt yourself or someone else, or cannot keep yourself safe, seek urgent in-person support now.'}</p>
          </div>
          <div className="urgent-columns">
            <div className="urgent-actions">
              <h2>{isFrench ? 'Que faire maintenant' : 'What you can do now'}</h2>
              <ol className="step-list">
                <li><span>01</span><p>{isFrench ? 'Allez vers un endroit plus sûr avec une autre personne, si vous le pouvez.' : 'Move toward a safer place with another person, if you can.'}</p></li>
                <li><span>02</span><p>{isFrench ? 'Dites clairement à une personne de confiance : « Je ne me sens pas en sécurité si je reste seul·e maintenant. »' : 'Tell someone you trust clearly: “I don’t feel safe being alone right now.”'}</p></li>
                <li><span>03</span><p>{isFrench ? 'Demandez-lui de rester avec vous et de vous aider à joindre une aide urgente.' : 'Ask them to stay with you and help you reach urgent support.'}</p></li>
              </ol>
            </div>
            <aside className="urgent-warning">
              <HeartHandshake size={26} />
              <h2>{isFrench ? 'Contacts urgents vérifiés' : 'Verified urgent contacts'}</h2>
              <p>{isFrench ? 'Ce sont les numéros de soutien public vérifiés inclus ici.' : 'These are verified public support numbers included here.'}</p>
            </aside>
          </div>
          <div className="urgent-resource-list">
            {urgent.map((item, index) => (
              <article className="resource-card" key={`${item.name}-${index}`}>
                <span className="eyebrow">{resourceTypeLabels[item.type] ?? item.type}</span>
                <h2>{item.name}</h2>
                {item.phone && <p><strong>{isFrench ? 'Téléphone :' : 'Phone:'}</strong> <a href={`tel:${item.phone.replace(/\s+/g, '')}`}>{item.phone}</a></p>}
                {item.address && <p><strong>{isFrench ? 'Adresse :' : 'Address:'}</strong> {item.address}</p>}
                {item.description && <p>{item.description}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  const { language, t } = useLanguage();

  return (
    <>
      <Meta title={t.pageTitles.about} description={language === 'fr' ? 'Pourquoi OFFLINE MIND existe, ce qu’il propose et comment la confidentialité est traitée.' : 'Why OFFLINE MIND exists, what it offers, and how it treats privacy.'} />
      <section className="section about-page">
        <div className="reading-width">
          <PageHeading eyebrow={t.about.eyebrow} title={t.about.title} copy={t.about.copy} />
          <GuideSection n="01" title={t.about.whatItIsTitle} body={t.about.whatItIs} />
          <GuideSection n="02" title={t.about.whyItExistsTitle} body={t.about.whyItExists} />
          <GuideSection n="03" title={t.about.whatItIsNotTitle} body={t.about.whatItIsNot} />
          <GuideSection n="04" title={t.about.privacyTitle} body={t.about.privacy} />
        </div>
      </section>
    </>
  );
}

function NotFoundPage() {
  const { language, t } = useLanguage();

  return (
    <>
      <Meta title={t.pageTitles.notFound} description={language === 'fr' ? 'Cette page n’est pas là. Retrouvez le chemin vers les ressources OFFLINE MIND.' : 'This page is not here. Find your way back to OFFLINE MIND resources.'} />
      <section className="not-found">
        <div className="page-wrap">
          <span className="eyebrow">{t.notFound.eyebrow}</span>
          <h1 className="display">{t.notFound.title}</h1>
          <p>{t.notFound.body}</p>
          <div className="hero-actions">
            <Link to="/" className="button">{t.notFound.home}</Link>
            <Link to="/feelings" className="text-link">{t.notFound.browseFeelings} <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function PageHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="section-title">{title}</h1>
      <p>{copy}</p>
    </div>
  );
}

function GuideSection({ n, title, body }: { n: string; title: string; body: string }) {
  const { t } = useLanguage();

  return (
    <section className="article-section">
      <span className="eyebrow">{n} / {t.common.aPlaceToBegin}</span>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function ListSection({ n, title, items }: { n: string; title: string; items: string[] }) {
  const { t } = useLanguage();

  return (
    <section className="article-section">
      <span className="eyebrow">{n} / {t.common.chooseWhatFits}</span>
      <h2>{title}</h2>
      <ol className="step-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppShell />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
