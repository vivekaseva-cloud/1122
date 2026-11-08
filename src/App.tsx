import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  FolderGit2,
  Globe,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { BigRockAuditCenter } from './components/BigRockAuditCenter';
import { ReporterDashboard } from './components/ReporterDashboard';
import { ReporterIdCardView } from './components/ReporterIdCardView';
import { ReporterRegistrationForm } from './components/ReporterRegistrationForm';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import {
  AdvertisementItem,
  DistrictItem,
  MandalItem,
  NewsArticle,
  NewsCategory,
  PublicPageView,
  ReporterProfile,
  StateItem,
  UserRole,
  VillageItem,
} from './types';

export default function App() {
  const [pageView, setPageView] = useState<PublicPageView>('HOME');
  const [sessionToken, setSessionToken] = useState<string>(() => localStorage.getItem('NB_SESSION_TOKEN') || '');
  const [userRole, setUserRole] = useState<UserRole>('PUBLIC');
  const [adminSetupRequired, setAdminSetupRequired] = useState<boolean>(false);

  const [settings, setSettings] = useState<Record<string, string>>({
    site_title: 'NETI BHARATHAM – నేటి భారతం',
    site_tagline: 'నిజం నిప్పులాంటిది – ప్రజా గొంతుక నేటి భారతం',
    domain_url: 'https://netibhaaratham.com',
    contact_email: 'netibhaarathamtelugu@gmail.com',
    contact_location: 'Hyderabad, Telangana, India.',
    contact_phone: '+91 98480 24700',
    breaking_ticker_text:
      'తెలంగాణ సచివాలయంలో కీలక మంత్రివర్గ సమావేశం • అమరావతి రాజధాని మౌలిక సదుపాయాల పనుల్లో వేగం • నేటి భారతం మండల మరియు జిల్లా రిపోర్టర్ల ఆన్‌లైన్ నమోదు ప్రారంభం',
    apk_version: '2.4.0',
    apk_file_size: '4.8 MB',
  });

  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [mandals, setMandals] = useState<MandalItem[]>([]);
  const [villages, setVillages] = useState<VillageItem[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [advertisements, setAdvertisements] = useState<AdvertisementItem[]>([]);
  const [publicReporters, setPublicReporters] = useState<ReporterProfile[]>([]);
  const [adsensePublic, setAdsensePublic] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Navigation Selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filterStateId, setFilterStateId] = useState<number | ''>('');
  const [filterDistrictId, setFilterDistrictId] = useState<number | ''>('');
  const [filterMandalId, setFilterMandalId] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedPublicReporter, setSelectedPublicReporter] = useState<ReporterProfile | null>(null);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const articlesPerPage = 8;

  // Login & First-Run Setup States
  const [loginRoleType, setLoginRoleType] = useState<'REPORTER' | 'ADMIN'>('REPORTER');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [setupAdminUsername, setSetupAdminUsername] = useState<string>('Admin');
  const [setupAdminEmail, setSetupAdminEmail] = useState<string>('netibhaarathamtelugu@gmail.com');
  const [setupAdminPassword, setSetupAdminPassword] = useState<string>('');
  const [setupAdminConfirm, setSetupAdminConfirm] = useState<string>('');

  // Contact Us Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  // PWA & Connectivity Hooks
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isOnline = useOnlineStatus();

  const fetchBootstrapData = async (overrideToken?: string) => {
    try {
      const tok = overrideToken ?? sessionToken;
      const res = await fetch('/api/bootstrap', {
        headers: tok ? { 'x-nb-session': tok } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session_token && !tok) {
          setSessionToken(data.session_token);
          localStorage.setItem('NB_SESSION_TOKEN', data.session_token);
        }
        if (data.role) setUserRole(data.role);
        setAdminSetupRequired(Boolean(data.admin_setup_required));
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        setCategories(data.categories || []);
        setStates(data.states || []);
        setDistricts(data.districts || []);
        setMandals(data.mandals || []);
        setVillages(data.villages || []);
        setArticles(data.articles || []);
        setAdvertisements(data.advertisements || []);
        setPublicReporters(data.public_reporters || []);
        setAdsensePublic(data.adsense_public || {});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBootstrapData();
  }, []);

  // Update Dynamic SEO Meta Title, Description & NewsArticle JSON-LD
  useEffect(() => {
    if (pageView === 'ARTICLE_DETAIL' && selectedArticle) {
      document.title = `${selectedArticle.seo_title || selectedArticle.telugu_title} | NETI BHARATHAM`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', selectedArticle.seo_description || selectedArticle.short_description);
      }
    } else {
      document.title = `${settings.site_title || 'NETI BHARATHAM – నేటి భారతం'} | Telugu Digital News Portal`;
    }
  }, [pageView, selectedArticle, settings.site_title]);

  const featuredArticles = useMemo(() => {
    const feat = articles.filter((a) => a.is_featured === 1);
    return feat.length > 0 ? feat : articles.slice(0, 3);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (pageView === 'BREAKING_NEWS' && art.is_breaking !== 1) return false;
      if (pageView === 'NATIONAL_NEWS' && art.category_id !== 2) return false;
      if (pageView === 'STATE_NEWS' && art.category_id !== 3 && art.state_id !== 1 && art.state_id !== 2) return false;
      if (pageView === 'TELANGANA_NEWS' && art.state_id !== 1 && art.category_id !== 5) return false;
      if (pageView === 'ANDHRA_PRADESH_NEWS' && art.state_id !== 2 && art.category_id !== 6) return false;
      if (pageView === 'CATEGORY_PAGE' && selectedCategoryId && art.category_id !== selectedCategoryId) return false;

      if (filterStateId && art.state_id !== Number(filterStateId)) return false;
      if (filterDistrictId && art.district_id !== Number(filterDistrictId)) return false;
      if (filterMandalId && art.mandal_id !== Number(filterMandalId)) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTe = art.telugu_title.toLowerCase().includes(q);
        const matchEn = art.headline.toLowerCase().includes(q);
        const matchDesc = art.short_description.toLowerCase().includes(q);
        const matchRep = art.reporter_name.toLowerCase().includes(q);
        if (!matchTe && !matchEn && !matchDesc && !matchRep) return false;
      }
      return true;
    });
  }, [articles, pageView, selectedCategoryId, filterStateId, filterDistrictId, filterMandalId, searchQuery]);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * articlesPerPage;
    return filteredArticles.slice(start, start + articlesPerPage);
  }, [filteredArticles, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / articlesPerPage));

  const openArticleDetail = (art: NewsArticle) => {
    setSelectedArticle(art);
    setPageView('ARTICLE_DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetch(`/api/articles/${art.id}/view`, { method: 'POST' }).catch(() => {});
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        role_type: loginRoleType,
        identifier: loginIdentifier,
        password: loginPassword,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || 'Authentication failed.');
      return;
    }
    setSessionToken(data.session_token);
    localStorage.setItem('NB_SESSION_TOKEN', data.session_token);
    setUserRole(data.role);
    setLoginPassword('');
    await fetchBootstrapData(data.session_token);
    setPageView(data.role === 'SUPER_ADMIN' ? 'ADMIN_DASHBOARD' : 'REPORTER_DASHBOARD');
  };

  const handleInitialAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch('/api/auth/setup-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        username: setupAdminUsername,
        email: setupAdminEmail,
        password: setupAdminPassword,
        confirm_password: setupAdminConfirm,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || 'Setup failed.');
      return;
    }
    setSessionToken(data.session_token);
    localStorage.setItem('NB_SESSION_TOKEN', data.session_token);
    setUserRole('SUPER_ADMIN');
    setAdminSetupRequired(false);
    await fetchBootstrapData(data.session_token);
    setPageView('ADMIN_DASHBOARD');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'x-nb-session': sessionToken },
    });
    setUserRole('PUBLIC');
    setPageView('HOME');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: contactName,
        email: contactEmail,
        mobile: contactMobile,
        subject: contactSubject,
        message: contactMessage,
      }),
    });
    if (res.ok) {
      setContactStatus('మీ సందేశం నేటి భారతం ఎడిటోరియల్ డెస్క్‌కు విజయవంతంగా చేరింది (Message Sent).');
      setContactName('');
      setContactEmail('');
      setContactMobile('');
      setContactSubject('');
      setContactMessage('');
    }
  };

  const sidebarAds = advertisements.filter((a) => a.placement === 'SIDEBAR' || a.placement === 'HEADER');
  const betweenArticleAds = advertisements.filter((a) => a.placement === 'BETWEEN_ARTICLES');

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900">
      {/* Offline Mode Connectivity Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center">
          Offline Mode — ఆఫ్‌లైన్ మోడ్‌లో క్యాష్ చేసిన వార్తలు ప్రదర్శించబడుతున్నాయి.
        </div>
      )}

      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-stone-200 sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setSelectedCategoryId(null);
            setFilterStateId('');
            setFilterDistrictId('');
            setFilterMandalId('');
            setSearchQuery('');
            setPageView('HOME');
          }}
          className="text-xl md:text-2xl font-extrabold tracking-tight text-[#991B1B] whitespace-nowrap shrink-0"
        >
          NETI BHARATHAM – నేటి భారతం
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-stone-700">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setSelectedCategoryId(null);
              setFilterStateId('');
              setPageView('HOME');
            }}
            className={`hover:text-[#991B1B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              pageView === 'HOME' ? 'text-[#991B1B] underline' : ''
            }`}
          >
            హోమ్
          </a>
          <a
            href="#latest"
            onClick={(e) => {
              e.preventDefault();
              setSelectedCategoryId(null);
              setPageView('LATEST_NEWS');
            }}
            className={`hover:text-[#991B1B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              pageView === 'LATEST_NEWS' ? 'text-[#991B1B] underline' : ''
            }`}
          >
            తాజా వార్తలు
          </a>
          <a
            href="#telangana"
            onClick={(e) => {
              e.preventDefault();
              setFilterStateId(1);
              setFilterDistrictId('');
              setFilterMandalId('');
              setPageView('TELANGANA_NEWS');
            }}
            className={`hover:text-[#991B1B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              pageView === 'TELANGANA_NEWS' ? 'text-[#991B1B] underline' : ''
            }`}
          >
            తెలంగాణ
          </a>
          <a
            href="#andhra-pradesh"
            onClick={(e) => {
              e.preventDefault();
              setFilterStateId(2);
              setFilterDistrictId('');
              setFilterMandalId('');
              setPageView('ANDHRA_PRADESH_NEWS');
            }}
            className={`hover:text-[#991B1B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              pageView === 'ANDHRA_PRADESH_NEWS' ? 'text-[#991B1B] underline' : ''
            }`}
          >
            ఆంధ్రప్రదేశ్
          </a>
          <a
            href="#register-reporter"
            onClick={(e) => {
              e.preventDefault();
              setPageView('REPORTER_REGISTER');
            }}
            className={`hover:text-[#991B1B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              pageView === 'REPORTER_REGISTER' ? 'text-[#991B1B] underline' : ''
            }`}
          >
            రిపోర్టర్ నమోదు
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {userRole === 'PUBLIC' ? (
            <button
              type="button"
              onClick={() => setPageView('REPORTER_LOGIN')}
              className="px-4 py-2 text-xs font-bold text-white bg-[#991B1B] hover:bg-red-900 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              రిపోర్టర్ / అడ్మిన్ లాగిన్
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setPageView(userRole === 'SUPER_ADMIN' ? 'ADMIN_DASHBOARD' : 'REPORTER_DASHBOARD')
              }
              className="px-4 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-blue-950 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {userRole === 'SUPER_ADMIN' ? 'Super Admin Panel' : 'Reporter Dashboard'}
            </button>
          )}
        </div>
      </header>

      {/* Secondary Editorial Utility Bar & Breaking News Ticker (Below <header>) */}
      <div className="bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          {/* Breaking News Marquee */}
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <button
              type="button"
              onClick={() => setPageView('BREAKING_NEWS')}
              className="px-2.5 py-1 bg-[#991B1B] text-white font-extrabold uppercase tracking-wider rounded text-[11px] whitespace-nowrap shrink-0 cursor-pointer"
            >
              బ్రేకింగ్ న్యూస్
            </button>
            <div className="overflow-hidden w-full">
              <div className="animate-news-ticker text-stone-200 font-medium">
                <span>{settings.breaking_ticker_text}</span>
                <span className="mx-8">•</span>
                <span>{settings.breaking_ticker_text}</span>
              </div>
            </div>
          </div>

          {/* Operational Utility Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setPageView('BIGROCK_AUDIT_CENTER')}
              className="text-amber-400 hover:underline font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              BigRock cPanel &amp; Audit
            </button>
            {userRole !== 'PUBLIC' && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-300 hover:text-white font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category & Location Navigation Ribbon */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId(null);
              setFilterStateId('');
              setFilterDistrictId('');
              setFilterMandalId('');
              setPageView('HOME');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              pageView === 'HOME' && !selectedCategoryId
                ? 'bg-[#991B1B] text-white'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            అన్ని వార్తలు (All)
          </button>
          <button
            type="button"
            onClick={() => setPageView('NATIONAL_NEWS')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              pageView === 'NATIONAL_NEWS' ? 'bg-[#991B1B] text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            జాతీయ వార్తలు
          </button>
          <button
            type="button"
            onClick={() => setPageView('DISTRICT_NEWS')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              pageView === 'DISTRICT_NEWS' ? 'bg-[#991B1B] text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            జిల్లా వార్తలు
          </button>
          <button
            type="button"
            onClick={() => setPageView('MANDAL_NEWS')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              pageView === 'MANDAL_NEWS' ? 'bg-[#991B1B] text-white' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            మండల వార్తలు
          </button>
          {categories
            .filter((c) => c.is_active === 1)
            .slice(3, 18)
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setCurrentPage(1);
                  setPageView('CATEGORY_PAGE');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  pageView === 'CATEGORY_PAGE' && selectedCategoryId === cat.id
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {cat.name_te}
              </button>
            ))}
        </div>
      </div>

      {/* ROUTED VIEWS */}
      {pageView === 'REPORTER_REGISTER' && (
        <ReporterRegistrationForm
          states={states}
          districts={districts}
          mandals={mandals}
          villages={villages}
          categories={categories}
          onSuccessLoginRedirect={() => setPageView('REPORTER_LOGIN')}
        />
      )}

      {pageView === 'REPORTER_DASHBOARD' && (
        <ReporterDashboard
          sessionToken={sessionToken}
          states={states}
          districts={districts}
          mandals={mandals}
          villages={villages}
          categories={categories}
          onRefreshPublicData={() => fetchBootstrapData()}
        />
      )}

      {pageView === 'ADMIN_DASHBOARD' && (
        <SuperAdminDashboard
          sessionToken={sessionToken}
          states={states}
          districts={districts}
          mandals={mandals}
          villages={villages}
          categories={categories}
          settings={settings}
          onRefreshPublicData={() => fetchBootstrapData()}
        />
      )}

      {pageView === 'BIGROCK_AUDIT_CENTER' && <BigRockAuditCenter />}

      {/* LOGIN & FIRST-RUN SUPER ADMIN INSTALLATION WIZARD VIEW */}
      {pageView === 'REPORTER_LOGIN' && (
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Login Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
            <h1 className="text-xl font-bold text-stone-900 mb-1">
              నేటి భారతం లాగిన్ (Reporter &amp; Super Admin Login)
            </h1>
            <p className="text-xs text-stone-500 mb-5">
              Strict backend role-based access control with rate limiting and session protection.
            </p>

            <div className="flex gap-2 p-1 bg-stone-100 rounded-lg mb-5">
              <button
                type="button"
                onClick={() => setLoginRoleType('REPORTER')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  loginRoleType === 'REPORTER' ? 'bg-[#991B1B] text-white' : 'text-stone-700'
                }`}
              >
                Approved / Pending Reporter
              </button>
              <button
                type="button"
                onClick={() => setLoginRoleType('ADMIN')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  loginRoleType === 'ADMIN' ? 'bg-[#1E3A8A] text-white' : 'text-stone-700'
                }`}
              >
                Super Admin
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-lg font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {loginRoleType === 'ADMIN' ? 'Admin Username or Email' : 'Reporter Username / Mobile / Email'}
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder={loginRoleType === 'ADMIN' ? 'Admin' : 'ramesh_hyd'}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#991B1B] hover:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Sign In to Workspace
              </button>
            </form>

            {loginRoleType === 'REPORTER' && (
              <div className="mt-5 pt-4 border-t border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="font-semibold text-stone-800">Quick Verified Reporter Accounts for Testing:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRoleType('REPORTER');
                      setLoginIdentifier('ramesh_hyd');
                      setLoginPassword('Reporter@123');
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-mono cursor-pointer"
                  >
                    Approved: ramesh_hyd / Reporter@123
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRoleType('REPORTER');
                      setLoginIdentifier('srinivas_knr');
                      setLoginPassword('Reporter@123');
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-mono cursor-pointer"
                  >
                    Pending: srinivas_knr / Reporter@123
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Card: First-Run Super Admin Installation Wizard (Zero Hardcoded Passwords) */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
            {adminSetupRequired ? (
              <form onSubmit={handleInitialAdminSetup} className="space-y-4">
                <div className="border-b border-stone-200 pb-3">
                  <span className="text-[11px] font-mono font-bold text-[#991B1B] uppercase">
                    FIRST-RUN INSTALLATION WIZARD
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                    Configure Initial Super Admin Password
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    In compliance with Section 14 Security Rules, no administrator password is hardcoded in source code or SQL seeds. Set your initial Super Admin password now.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Display Username</label>
                  <input
                    type="text"
                    required
                    value={setupAdminUsername}
                    onChange={(e) => setSetupAdminUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Official Admin Email</label>
                  <input
                    type="email"
                    required
                    value={setupAdminEmail}
                    onChange={(e) => setSetupAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Create Strong Initial Password (Min 8 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={setupAdminPassword}
                    onChange={(e) => setSetupAdminPassword(e.target.value)}
                    placeholder="Choose your Super Admin password"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Initial Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={setupAdminConfirm}
                    onChange={(e) => setSetupAdminConfirm(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-950 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Initialize Super Admin &amp; Enter Control Panel
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Super Admin Account Provisioned</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  The initial Super Admin account is active and locked against re-initialization. Use the Super Admin tab on the left to sign in, or register as a new Reporter below.
                </p>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                  <h3 className="text-xs font-bold text-stone-900">Want to join NETI BHARATHAM as a Reporter?</h3>
                  <p className="text-xs text-stone-600">
                    Submit your application with your photograph and encrypted identity verification document to receive your official 6-month Press ID Card.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPageView('REPORTER_REGISTER')}
                    className="px-4 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Open Reporter Registration Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORTER PUBLIC PROFILE VIEW */}
      {pageView === 'REPORTER_PUBLIC_PROFILE' && selectedPublicReporter && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            type="button"
            onClick={() => setPageView('HOME')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#991B1B] mb-4 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to News Portal</span>
          </button>
          <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs text-stone-500 tabular-nums">
                <span>Verified Reporter Profile</span>
                <span className="mx-1.5">·</span>
                <span>ID: {selectedPublicReporter.unique_reporter_id}</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-900 mt-1">{selectedPublicReporter.full_name}</h1>
              <p className="text-sm font-semibold text-[#991B1B] mt-0.5">{selectedPublicReporter.designation}</p>
              <p className="text-xs text-stone-600 mt-2">
                Jurisdiction: {selectedPublicReporter.mandal_name_te || selectedPublicReporter.village_name},{' '}
                {selectedPublicReporter.district_name_te}, {selectedPublicReporter.state_name_te}
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200 text-xs text-stone-600">
                All private identity documents for this reporter are verified and stored in encrypted private storage.
              </div>
            </div>
            <ReporterIdCardView reporter={selectedPublicReporter} />
          </div>
        </div>
      )}

      {/* INDIVIDUAL NEWS ARTICLE PAGE */}
      {pageView === 'ARTICLE_DETAIL' && selectedArticle && (
        <article className="max-w-5xl mx-auto px-4 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="text-xs text-stone-500 mb-4 flex flex-wrap items-center gap-1.5 tabular-nums">
            <button type="button" onClick={() => setPageView('HOME')} className="hover:text-[#991B1B] cursor-pointer">
              హోమ్
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId(selectedArticle.category_id);
                setPageView('CATEGORY_PAGE');
              }}
              className="hover:text-[#991B1B] cursor-pointer"
            >
              {selectedArticle.category_name_te || 'వార్తలు'}
            </button>
            <span>/</span>
            <span>{selectedArticle.state_name_te}</span>
            {selectedArticle.district_name_te && (
              <>
                <span>/</span>
                <span>{selectedArticle.district_name_te}</span>
              </>
            )}
          </nav>

          <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-10">
            {/* Unboxed Clean Metadata Kicker */}
            <div className="text-xs text-stone-500 mb-2 tabular-nums">
              <span className="font-bold text-[#991B1B]">{selectedArticle.category_name_te}</span>
              <span className="mx-2">·</span>
              <span>
                {selectedArticle.mandal_name_te || selectedArticle.village_name || selectedArticle.district_name_te},{' '}
                {selectedArticle.state_name_te}
              </span>
              <span className="mx-2">·</span>
              <span>{new Date(selectedArticle.news_date).toLocaleString('en-IN')}</span>
              <span className="mx-2">·</span>
              <span>{selectedArticle.views_count + 1} views</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold text-stone-900 leading-snug">
              {selectedArticle.telugu_title}
            </h1>
            <p className="text-base text-stone-600 mt-3 leading-relaxed">{selectedArticle.short_description}</p>

            {/* Reporter Attribution & Social Share Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 my-5 border-y border-stone-200 text-xs">
              <div>
                <span className="text-stone-500">రిపోర్టర్ (By): </span>
                <strong className="text-stone-900">{selectedArticle.reporter_name}</strong>
                <span className="mx-1.5 text-stone-400">·</span>
                <span className="font-mono text-stone-600">{selectedArticle.reporter_unique_id}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `${selectedArticle.telugu_title} - https://netibhaaratham.com/article/${selectedArticle.slug}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded-md"
                >
                  Share on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-md cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Main Featured Image */}
            <figure className="mb-6">
              <img
                src={selectedArticle.main_image}
                alt={selectedArticle.image_alt_text || selectedArticle.telugu_title}
                referrerPolicy="no-referrer"
                className="w-full max-h-[480px] object-cover rounded-lg border border-stone-200"
              />
              {selectedArticle.image_caption && (
                <figcaption className="text-xs text-stone-500 italic mt-2">
                  {selectedArticle.image_caption}
                </figcaption>
              )}
            </figure>

            {/* Full Editorial Prose */}
            <div
              className="max-w-prose text-base text-stone-800 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: selectedArticle.full_content }}
            />

            {/* Supporting Images Gallery */}
            {selectedArticle.supporting_images && selectedArticle.supporting_images.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <h3 className="text-base font-bold text-stone-900 mb-4">వార్తా చిత్రమాలిక (Supporting Photo Gallery)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedArticle.supporting_images.map((img, idx) => (
                    <figure key={idx} className="border border-stone-200 rounded-lg p-2">
                      <img
                        src={img.image_path}
                        alt={img.alt_text || selectedArticle.telugu_title}
                        referrerPolicy="no-referrer"
                        className="w-full h-52 object-cover rounded"
                      />
                      {img.caption && <figcaption className="text-xs text-stone-500 mt-1.5">{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related News */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-2 mb-4">
              సంబంధిత వార్తలు (Related News)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles
                .filter((a) => a.id !== selectedArticle.id)
                .slice(0, 3)
                .map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => openArticleDetail(rel)}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden cursor-pointer hover:border-stone-400 transition-colors"
                  >
                    <img
                      src={rel.main_image}
                      alt={rel.image_alt_text}
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="text-xs text-stone-500 tabular-nums">
                        <span>{rel.category_name_te}</span>
                        <span className="mx-1.5">·</span>
                        <span>{new Date(rel.news_date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 mt-1 line-clamp-2">{rel.telugu_title}</h3>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </article>
      )}

      {/* STATIC / INFORMATIONAL PAGES (About Us, Contact Us, Privacy, Terms, Advertisement Info) */}
      {(pageView === 'ABOUT_US' ||
        pageView === 'PRIVACY_POLICY' ||
        pageView === 'TERMS_CONDITIONS' ||
        pageView === 'ADVERTISEMENT_INFO') && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white border border-stone-200 rounded-xl p-8 space-y-4">
            <h1 className="text-2xl font-bold text-stone-900 border-b border-stone-200 pb-3">
              {pageView === 'ABOUT_US' && 'మా గురించి (About NETI BHARATHAM)'}
              {pageView === 'PRIVACY_POLICY' && 'గోప్యతా విధానం (Privacy Policy)'}
              {pageView === 'TERMS_CONDITIONS' && 'నిబంధనలు & షరతులు (Terms and Conditions)'}
              {pageView === 'ADVERTISEMENT_INFO' && 'ప్రకటనల సమాచారం (Advertisement Information)'}
            </h1>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {pageView === 'ABOUT_US' && settings.about_us_content}
              {pageView === 'PRIVACY_POLICY' && settings.privacy_policy_content}
              {pageView === 'TERMS_CONDITIONS' && `${settings.terms_conditions_content}\n\n${settings.disclaimer_content || ''}`}
              {pageView === 'ADVERTISEMENT_INFO' && settings.advertisement_info_content}
            </p>
            <div className="pt-4 border-t border-stone-200 text-xs text-stone-500">
              Official Contact: <strong>{settings.contact_email}</strong> • Location: <strong>{settings.contact_location}</strong>
            </div>
          </div>
        </div>
      )}

      {pageView === 'CONTACT_US' && (
        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h1 className="text-xl font-bold text-stone-900">సంప్రదించండి (Contact NETI BHARATHAM)</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              వార్తలు, ప్రకటనలు మరియు రిపోర్టర్ వివరాల కోసం మా ప్రధాన కార్యాలయాన్ని సంప్రదించండి.
            </p>
            <div className="space-y-3 text-xs text-stone-700 pt-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#991B1B]" />
                <span>Website: {settings.domain_url}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#991B1B]" />
                <span>Email: {settings.contact_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#991B1B]" />
                <span>Location: {settings.contact_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#991B1B]" />
                <span>Phone: {settings.contact_phone}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-bold text-stone-900">Send a Message to Editorial Desk</h2>
            {contactStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg">
                {contactStatus}
              </div>
            )}
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your Full Name *"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
            />
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Your Email *"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
            />
            <input
              type="tel"
              value={contactMobile}
              onChange={(e) => setContactMobile(e.target.value)}
              placeholder="Mobile Number"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
            />
            <input
              type="text"
              required
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              placeholder="Subject *"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
            />
            <textarea
              rows={3}
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Your Message *"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Submit Message
            </button>
          </form>
        </div>
      )}

      {/* MAIN PUBLIC NEWS PORTAL CANVAS (HOME, LATEST, BREAKING, NATIONAL, STATE, TELANGANA, AP, DISTRICT, MANDAL, CATEGORY, SEARCH) */}
      {(pageView === 'HOME' ||
        pageView === 'LATEST_NEWS' ||
        pageView === 'BREAKING_NEWS' ||
        pageView === 'NATIONAL_NEWS' ||
        pageView === 'STATE_NEWS' ||
        pageView === 'TELANGANA_NEWS' ||
        pageView === 'ANDHRA_PRADESH_NEWS' ||
        pageView === 'DISTRICT_NEWS' ||
        pageView === 'MANDAL_NEWS' ||
        pageView === 'CATEGORY_PAGE' ||
        pageView === 'SEARCH_RESULTS') && (
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-8 flex-1 w-full">
          {/* Search & Hierarchical India Location Filter Bar (State -> District -> Mandal) */}
          <section className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-100 text-xs tabular-nums">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilterStateId(1);
                    setFilterDistrictId('');
                    setFilterMandalId('');
                    setCurrentPage(1);
                  }}
                  className={`text-left transition-colors cursor-pointer ${
                    filterStateId === 1 ? 'text-[#991B1B] font-bold underline underline-offset-4' : 'text-stone-700 hover:text-[#991B1B]'
                  }`}
                >
                  <strong>తెలంగాణ:</strong>{' '}
                  {districts.filter((d) => d.state_id === 1).length} జిల్లాలు •{' '}
                  {mandals.filter((m) => districts.some((d) => d.id === m.district_id && d.state_id === 1)).length} మండలాలు
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStateId(2);
                    setFilterDistrictId('');
                    setFilterMandalId('');
                    setCurrentPage(1);
                  }}
                  className={`text-left transition-colors cursor-pointer ${
                    filterStateId === 2 ? 'text-[#1E3A8A] font-bold underline underline-offset-4' : 'text-stone-700 hover:text-[#1E3A8A]'
                  }`}
                >
                  <strong>ఆంధ్ర ప్రదేశ్:</strong>{' '}
                  {districts.filter((d) => d.state_id === 2).length} జిల్లాలు (పోలవరం, మార్కాపురం జిల్లాలతో కలిపి) •{' '}
                  {mandals.filter((m) => districts.some((d) => d.id === m.district_id && d.state_id === 2)).length} మండలాలు
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setFilterStateId(2);
                    setFilterDistrictId(227);
                    setFilterMandalId('');
                    setCurrentPage(1);
                  }}
                  className="text-[#1E3A8A] hover:underline font-semibold cursor-pointer"
                >
                  పోలవరం జిల్లా (14 మండలాలు)
                </button>
                <span className="text-stone-300">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setFilterStateId(2);
                    setFilterDistrictId(228);
                    setFilterMandalId('');
                    setCurrentPage(1);
                  }}
                  className="text-[#1E3A8A] hover:underline font-semibold cursor-pointer"
                >
                  మార్కాపురం జిల్లా (16 మండలాలు)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="వార్తలు వెతకండి (Search News)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <select
                value={filterStateId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setFilterStateId(val);
                  setFilterDistrictId('');
                  setFilterMandalId('');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              >
                <option value="">అన్ని రాష్ట్రాలు (All 28 States &amp; 8 UTs)</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_te} ({s.name_en})
                  </option>
                ))}
              </select>

              <select
                value={filterDistrictId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setFilterDistrictId(val);
                  setFilterMandalId('');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              >
                <option value="">
                  అన్ని జిల్లాలు ({districts.filter((d) => !filterStateId || d.state_id === Number(filterStateId)).length} Districts)
                </option>
                {districts
                  .filter((d) => !filterStateId || d.state_id === Number(filterStateId))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_te} ({d.name_en})
                    </option>
                  ))}
              </select>

              <select
                value={filterMandalId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setFilterMandalId(val);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              >
                <option value="">
                  అన్ని మండలాలు (
                  {
                    mandals.filter((m) => {
                      if (filterDistrictId) return m.district_id === Number(filterDistrictId);
                      if (filterStateId) {
                        return districts.some((d) => d.id === m.district_id && d.state_id === Number(filterStateId));
                      }
                      return true;
                    }).length
                  }{' '}
                  Mandals)
                </option>
                {mandals
                  .filter((m) => {
                    if (filterDistrictId) return m.district_id === Number(filterDistrictId);
                    if (filterStateId) {
                      return districts.some((d) => d.id === m.district_id && d.state_id === Number(filterStateId));
                    }
                    return true;
                  })
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name_te} ({m.name_en})
                    </option>
                  ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilterStateId('');
                    setFilterDistrictId('');
                    setFilterMandalId('');
                    setSelectedCategoryId(null);
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </section>

          {/* HOMEPAGE OFFICIAL ANDROID APK DOWNLOAD & PWA INSTALL BANNER */}
          <section className="bg-gradient-to-r from-[#991B1B] via-[#7F1D1D] to-slate-950 text-white rounded-xl p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                OFFICIAL MOBILE APPLICATION • ANDROID APK v{settings.apk_version || '2.4.0'} ({settings.apk_file_size || '4.8 MB'})
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold">
                నేటి భారతం అధికారిక ఆండ్రాయిడ్ యాప్ (Download Official Android APK)
              </h2>
              <p className="text-xs text-red-100 max-w-2xl leading-relaxed">
                తెలంగాణ, ఆంధ్రప్రదేశ్ మరియు జాతీయ తాజా వార్తలు, బ్రేకింగ్ న్యూస్ నోటిఫికేషన్లు మరియు రిపోర్టర్ డాష్‌బోర్డ్‌ను మీ మొబైల్‌లో వేగంగా పొందడానికి అధికారిక APK డౌన్‌లోడ్ చేసుకోండి.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/api/download/apk"
                download="neti-bharatham-telugu-news-v2.4.apk"
                className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download Android APK (v2.4.0)</span>
              </a>

              {!isInstalled && isInstallable && (
                <button
                  type="button"
                  onClick={install}
                  className="flex items-center gap-2 px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install Web App (PWA)</span>
                </button>
              )}

              {!isInstalled && isIOS && (
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install on iPhone / iPad</span>
                </button>
              )}
            </div>
          </section>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-6">
                <h3 className="text-base font-bold text-stone-900">Install NETI BHARATHAM on iOS</h3>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                  1. Tap the <strong>Share</strong> button in Safari toolbar.
                  <br />
                  2. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-4 w-full rounded-lg bg-stone-100 py-2 text-xs font-bold text-stone-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* TIER 1: FEATURED NEWS SLIDER & TOP HEADLINES (When on HOME without search filter) */}
          {pageView === 'HOME' && !searchQuery && !filterStateId && featuredArticles.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Dominant Lead Story Slider (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between">
                {(() => {
                  const activeSlide = featuredArticles[featuredSlideIndex % featuredArticles.length];
                  return (
                    <>
                      <div
                        onClick={() => openArticleDetail(activeSlide)}
                        className="relative h-72 sm:h-96 cursor-pointer overflow-hidden group"
                      >
                        <img
                          src={activeSlide.main_image}
                          alt={activeSlide.image_alt_text || activeSlide.telugu_title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-6 flex flex-col justify-end text-white">
                          <div className="text-xs text-amber-300 font-semibold tabular-nums">
                            <span>{activeSlide.category_name_te}</span>
                            <span className="mx-2">·</span>
                            <span>{activeSlide.state_name_te}</span>
                            <span className="mx-2">·</span>
                            <span>{new Date(activeSlide.news_date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1.5 leading-snug">
                            {activeSlide.telugu_title}
                          </h2>
                          <p className="text-xs sm:text-sm text-stone-200 mt-2 line-clamp-2">
                            {activeSlide.short_description}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                        <span className="text-stone-600 font-medium tabular-nums">
                          Featured Story {(featuredSlideIndex % featuredArticles.length) + 1} of {featuredArticles.length} · By{' '}
                          {activeSlide.reporter_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFeaturedSlideIndex(
                                (prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length
                              )
                            }
                            className="p-1.5 bg-white border border-stone-300 rounded hover:bg-stone-100 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFeaturedSlideIndex((prev) => (prev + 1) % featuredArticles.length)}
                            className="p-1.5 bg-white border border-stone-300 rounded hover:bg-stone-100 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Secondary Top Stories Column (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                    <h2 className="text-base font-bold text-[#991B1B]">ప్రధాన వార్తలు (Top Stories)</h2>
                    <button
                      type="button"
                      onClick={() => setPageView('BREAKING_NEWS')}
                      className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      View Breaking
                    </button>
                  </div>

                  <div className="divide-y divide-stone-200">
                    {articles.slice(0, 4).map((art) => (
                      <div
                        key={art.id}
                        onClick={() => openArticleDetail(art)}
                        className="py-3 first:pt-0 last:pb-0 flex gap-3.5 cursor-pointer group"
                      >
                        <img
                          src={art.main_image}
                          alt={art.image_alt_text}
                          referrerPolicy="no-referrer"
                          className="w-24 h-20 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] text-stone-500 tabular-nums">
                            <span className="font-semibold text-[#991B1B]">{art.category_name_te}</span>
                            <span className="mx-1.5">·</span>
                            <span>{art.district_name_te || art.state_name_te}</span>
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#991B1B] transition-colors line-clamp-2 mt-0.5 leading-snug">
                            {art.telugu_title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Want to report from your Mandal?</span>
                  <button
                    type="button"
                    onClick={() => setPageView('REPORTER_REGISTER')}
                    className="font-bold text-[#991B1B] hover:underline cursor-pointer"
                  >
                    Register as Reporter →
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* MAIN 2-COLUMN ASYMMETRIC EDITORIAL GRID (8 Cols News Feed + 4 Cols Trending, Ads & Reporters) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Columns: Filtered News Articles Feed */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h2 className="text-xl font-bold text-stone-900">
                  {pageView === 'TELANGANA_NEWS' && 'తెలంగాణ వార్తలు (Telangana News)'}
                  {pageView === 'ANDHRA_PRADESH_NEWS' && 'ఆంధ్రప్రదేశ్ వార్తలు (Andhra Pradesh News)'}
                  {pageView === 'BREAKING_NEWS' && 'బ్రేకింగ్ న్యూస్ (Breaking News)'}
                  {pageView === 'NATIONAL_NEWS' && 'జాతీయ వార్తలు (National News)'}
                  {pageView === 'DISTRICT_NEWS' && 'జిల్లా వార్తలు (District News)'}
                  {pageView === 'MANDAL_NEWS' && 'మండల వార్తలు (Mandal News)'}
                  {pageView === 'CATEGORY_PAGE' &&
                    (categories.find((c) => c.id === selectedCategoryId)?.name_te || 'విభాగం వార్తలు')}
                  {(pageView === 'HOME' || pageView === 'LATEST_NEWS' || pageView === 'SEARCH_RESULTS' || pageView === 'STATE_NEWS') &&
                    'తాజా వార్తా కథనాలు (Latest Published News)'}
                </h2>
                <span className="text-xs text-stone-500 tabular-nums">{filteredArticles.length} కథనాలు</span>
              </div>

              {paginatedArticles.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
                  <p className="text-sm font-semibold text-stone-700">
                    ఎంచుకున్న విభాగం / ప్రాంతంలో ప్రస్తుతం వార్తలు లేవు (No matching articles found).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStateId('');
                      setFilterDistrictId('');
                      setFilterMandalId('');
                      setSelectedCategoryId(null);
                      setSearchQuery('');
                      setPageView('HOME');
                    }}
                    className="mt-3 px-4 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Show All Published News
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => openArticleDetail(art)}
                      className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer hover:border-stone-400 transition-colors group"
                    >
                      <div>
                        <img
                          src={art.main_image}
                          alt={art.image_alt_text || art.telugu_title}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-48 object-cover border-b border-stone-100"
                        />
                        <div className="p-5">
                          {/* Clean Unboxed Metadata with Typographic Separators */}
                          <div className="text-xs text-stone-500 tabular-nums">
                            <span className="font-bold text-[#991B1B]">{art.category_name_te}</span>
                            <span className="mx-1.5">·</span>
                            <span>{art.mandal_name_te || art.district_name_te || art.state_name_te}</span>
                            <span className="mx-1.5">·</span>
                            <span>{new Date(art.news_date).toLocaleDateString('en-IN')}</span>
                          </div>
                          <h3 className="text-base font-bold text-stone-900 group-hover:text-[#991B1B] transition-colors mt-1.5 leading-snug">
                            {art.telugu_title}
                          </h3>
                          <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                            {art.short_description}
                          </p>
                        </div>
                      </div>
                      <div className="px-5 py-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between tabular-nums">
                        <span>By {art.reporter_name}</span>
                        <span>{art.views_count} views</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 tabular-nums">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-md cursor-pointer ${
                        currentPage === p ? 'bg-[#991B1B] text-white' : 'bg-white border border-stone-300 text-stone-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Between-Articles Approved Private Advertisement Slot */}
              {betweenArticleAds.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-xl p-5">
                  <div className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">
                    SPONSORED ADVERTISEMENT • ప్రకటన
                  </div>
                  {betweenArticleAds.slice(0, 1).map((ad) => (
                    <div key={ad.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {ad.images && ad.images[0] && (
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-32 object-cover rounded-lg border border-stone-200"
                        />
                      )}
                      <div className="md:col-span-2 space-y-1">
                        <h3 className="text-base font-bold text-stone-900">{ad.title}</h3>
                        <p className="text-xs text-stone-600">{ad.description}</p>
                        <div className="text-xs font-semibold text-[#1E3A8A] pt-1">
                          {ad.advertiser_name} • Contact: {ad.contact_mobile}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 Columns: Trending News, Approved Private Ads, AdSense Slot & Verified Reporters */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Trending News List */}
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-2.5 mb-4">
                  ట్రెండింగ్ వార్తలు (Trending News)
                </h3>
                <div className="divide-y divide-stone-200">
                  {[...articles]
                    .sort((a, b) => b.views_count - a.views_count)
                    .slice(0, 5)
                    .map((t, index) => (
                      <div
                        key={t.id}
                        onClick={() => openArticleDetail(t)}
                        className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 cursor-pointer group"
                      >
                        <span className="text-lg font-mono font-bold text-stone-300 tabular-nums">
                          0{index + 1}
                        </span>
                        <div>
                          <div className="text-[11px] text-stone-500 tabular-nums">
                            {t.category_name_te} · {t.views_count} views
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#991B1B] transition-colors mt-0.5 leading-snug">
                            {t.telugu_title}
                          </h4>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Approved Private Advertisements Sidebar */}
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                  <span className="text-xs font-bold text-stone-900">ప్రైవేట్ ప్రకటనలు (Featured Advertisements)</span>
                  <button
                    type="button"
                    onClick={() => setPageView('ADVERTISEMENT_INFO')}
                    className="text-[11px] text-[#991B1B] font-semibold hover:underline cursor-pointer"
                  >
                    Advertise Here
                  </button>
                </div>
                {sidebarAds.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4">Contact Editorial Desk for sidebar ad placement.</p>
                ) : (
                  <div className="space-y-4">
                    {sidebarAds.map((ad) => (
                      <div key={ad.id} className="space-y-2">
                        {ad.images && ad.images.length > 0 && (
                          <div className={`grid gap-2 ${ad.images.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {ad.images.slice(0, 2).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={ad.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-36 object-cover rounded-lg border border-stone-200"
                              />
                            ))}
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-stone-900">{ad.title}</h4>
                        <p className="text-xs text-stone-600">{ad.description}</p>
                        <div className="text-xs font-semibold text-[#991B1B] tabular-nums">
                          {ad.advertiser_name} • Ph: {ad.contact_mobile}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {Boolean(adsensePublic?.enabled) && Boolean(adsensePublic?.sidebar_enabled) && (
                  <div className="mt-4 pt-3 border-t border-stone-200 text-center p-4 bg-stone-50 rounded-lg text-[11px] text-stone-500">
                    Google AdSense Authorized Placement Slot
                  </div>
                )}
              </div>

              {/* Verified Reporters Directory */}
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 mb-3">
                  <h3 className="text-sm font-bold text-stone-900">ఆమోదిత రిపోర్టర్లు (Verified Press Team)</h3>
                  <button
                    type="button"
                    onClick={() => setPageView('REPORTER_REGISTER')}
                    className="text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                  >
                    + Join Us
                  </button>
                </div>
                <div className="space-y-3">
                  {publicReporters.map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => {
                        setSelectedPublicReporter(rep);
                        setPageView('REPORTER_PUBLIC_PROFILE');
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer border border-transparent hover:border-stone-200"
                    >
                      <img
                        src={rep.profile_photo_path || '/icon.svg'}
                        alt={rep.full_name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-stone-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">{rep.full_name}</div>
                        <div className="text-[11px] text-[#991B1B] font-semibold">{rep.designation}</div>
                        <div className="text-[11px] text-stone-500 tabular-nums">
                          ID: {rep.unique_reporter_id} · {rep.district_name_te}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </main>
      )}

      {/* OFFICIAL NEWSPAPER FOOTER */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="text-lg font-extrabold text-white">NETI BHARATHAM – నేటి భారతం</div>
            <p className="text-slate-400 leading-relaxed">{settings.site_tagline}</p>
            <div className="text-slate-300 space-y-1">
              <div>Domain: {settings.domain_url}</div>
              <div>Email: {settings.contact_email}</div>
              <div>Location: {settings.contact_location}</div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">వార్తా విభాగాలు (News Sections)</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => setPageView('BREAKING_NEWS')} className="hover:text-white cursor-pointer">
                  బ్రేకింగ్ న్యూస్ (Breaking News)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setPageView('TELANGANA_NEWS')} className="hover:text-white cursor-pointer">
                  తెలంగాణ వార్తలు (Telangana)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPageView('ANDHRA_PRADESH_NEWS')}
                  className="hover:text-white cursor-pointer"
                >
                  ఆంధ్రప్రదేశ్ వార్తలు (Andhra Pradesh)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setPageView('DISTRICT_NEWS')} className="hover:text-white cursor-pointer">
                  జిల్లా &amp; మండల వార్తలు (District &amp; Mandal)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">రిపోర్టర్ &amp; అధికారిక లింకులు</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => setPageView('REPORTER_REGISTER')}
                  className="hover:text-white cursor-pointer"
                >
                  రిపోర్టర్ రిజిస్ట్రేషన్ (Reporter Registration)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setPageView('REPORTER_LOGIN')} className="hover:text-white cursor-pointer">
                  రిపోర్టర్ / అడ్మిన్ లాగిన్ (Portal Login)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPageView('ADVERTISEMENT_INFO')}
                  className="hover:text-white cursor-pointer"
                >
                  ప్రకటనల సమాచారం (Advertisement Info)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPageView('BIGROCK_AUDIT_CENTER')}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  BigRock cPanel Deployment &amp; Audit Report
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">చట్టపరమైన సమాచారం &amp; యాప్</h4>
            <ul className="space-y-2 mb-4">
              <li>
                <button type="button" onClick={() => setPageView('ABOUT_US')} className="hover:text-white cursor-pointer">
                  మా గురించి (About Us)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setPageView('CONTACT_US')} className="hover:text-white cursor-pointer">
                  సంప్రదించండి (Contact Us)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setPageView('PRIVACY_POLICY')} className="hover:text-white cursor-pointer">
                  గోప్యతా విధానం (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPageView('TERMS_CONDITIONS')}
                  className="hover:text-white cursor-pointer"
                >
                  నిబంధనలు &amp; షరతులు (Terms &amp; Disclaimer)
                </button>
              </li>
            </ul>
            <a
              href="/api/download/apk"
              download="neti-bharatham-telugu-news-v2.4.apk"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#991B1B] hover:bg-red-800 text-white font-bold rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Official APK</span>
            </a>
          </div>
        </div>

        <div className="border-t border-slate-900 py-4 px-6 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} NETI BHARATHAM (నేటి భారతం – https://netibhaaratham.com). All Rights Reserved • Hyderabad, Telangana, India.
        </div>
      </footer>
    </div>
  );
}
