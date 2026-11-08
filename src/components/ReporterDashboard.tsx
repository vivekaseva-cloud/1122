import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bold,
  CheckCircle2,
  Clock,
  Edit3,
  FilePlus,
  Heading2,
  Image as ImageIcon,
  Italic,
  List,
  Lock,
  Megaphone,
  Plus,
  ShieldAlert,
  Trash2,
  UserCheck,
} from 'lucide-react';
import {
  AdvertisementItem,
  DistrictItem,
  MandalItem,
  NewsArticle,
  NewsCategory,
  ReporterProfile,
  StateItem,
  SupportingImage,
  VillageItem,
} from '../types';
import { ReporterIdCardView } from './ReporterIdCardView';

interface ReporterDashboardProps {
  sessionToken: string;
  states: StateItem[];
  districts: DistrictItem[];
  mandals: MandalItem[];
  villages: VillageItem[];
  categories: NewsCategory[];
  onRefreshPublicData: () => void;
}

type ReporterTab = 'OVERVIEW' | 'ID_CARD' | 'SUBMIT_NEWS' | 'MY_NEWS' | 'ADVERTISEMENTS' | 'PROFILE_SECURITY';

export const ReporterDashboard: React.FC<ReporterDashboardProps> = ({
  sessionToken,
  states,
  districts,
  mandals,
  villages,
  categories,
  onRefreshPublicData,
}) => {
  const [activeTab, setActiveTab] = useState<ReporterTab>('OVERVIEW');
  const [profile, setProfile] = useState<ReporterProfile | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [ads, setAds] = useState<AdvertisementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // News Editor State
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [headline, setHeadline] = useState('');
  const [teluguTitle, setTeluguTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAltText, setImageAltText] = useState('');
  const [supportingImages, setSupportingImages] = useState<SupportingImage[]>([]);
  const [categoryId, setCategoryId] = useState<number>(5);
  const [newsStateId, setNewsStateId] = useState<number>(1);
  const [newsDistrictId, setNewsDistrictId] = useState<number>(101);
  const [newsMandalId, setNewsMandalId] = useState<number>(1001);
  const [newsVillageId, setNewsVillageId] = useState<number | ''>(5001);
  const [newsVillageName, setNewsVillageName] = useState('Somajiguda');
  const [newsDate, setNewsDate] = useState(new Date().toISOString().slice(0, 16));
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Private Advertisement Form State (Max 2 Images)
  const [adTitle, setAdTitle] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [adMobile, setAdMobile] = useState('');
  const [adEmail, setAdEmail] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adStateId, setAdStateId] = useState<number>(1);
  const [adDistrictId, setAdDistrictId] = useState<number>(101);
  const [adMandalId, setAdMandalId] = useState<number>(1001);
  const [adStartDate, setAdStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [adEndDate, setAdEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [adPlacement, setAdPlacement] = useState('SIDEBAR');
  const [adImage1, setAdImage1] = useState('');
  const [adImage2, setAdImage2] = useState('');

  // Strict Self-Service Profile Edit State (ONLY residential_address & password permitted)
  const [editAddress, setEditAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchReporterDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reporter/dashboard', {
        headers: { 'x-nb-session': sessionToken },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setArticles(data.articles || []);
        setAds(data.advertisements || []);
        setEditAddress(data.profile.residential_address || '');
        if (data.profile.state_id) setNewsStateId(data.profile.state_id);
        if (data.profile.district_id) setNewsDistrictId(data.profile.district_id);
        if (data.profile.mandal_id) setNewsMandalId(data.profile.mandal_id);
        if (data.profile.village_name) setNewsVillageName(data.profile.village_name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporterDashboard();
  }, [sessionToken]);

  const insertRichTag = (openTag: string, closeTag: string) => {
    setFullContent((prev) => `${prev}${openTag}మీ తెలుగు వార్తా పాఠ్యం ఇక్కడ రాయండి${closeTag}\n`);
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setMainImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSupportingImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSupportingImages((prev) => [
            ...prev,
            { image_path: reader.result as string, caption: '', alt_text: teluguTitle || 'News Supporting Image' },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (slot === 1) setAdImage1(reader.result);
        else setAdImage2(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNews = async (saveAsDraft: boolean) => {
    setFeedback(null);
    if (!headline || !teluguTitle || !shortDesc || !fullContent || !mainImage) {
      setFeedback({ type: 'err', msg: 'Please fill Headline, Telugu Title, Short Description, Full Content, and Main Image.' });
      return;
    }

    const endpoint = editingArticleId ? `/api/reporter/articles/${editingArticleId}` : '/api/reporter/articles';
    const method = editingArticleId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        headline,
        telugu_title: teluguTitle,
        short_description: shortDesc,
        full_content: fullContent,
        main_image: mainImage,
        image_caption: imageCaption,
        image_alt_text: imageAltText || teluguTitle,
        supporting_images: supportingImages,
        category_id: categoryId,
        state_id: newsStateId,
        district_id: newsDistrictId,
        mandal_id: newsMandalId,
        village_id: newsVillageId || null,
        village_name: newsVillageName,
        news_date: new Date(newsDate).toISOString(),
        seo_title: seoTitle || teluguTitle,
        seo_description: seoDescription || shortDesc,
        save_as_draft: saveAsDraft,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: 'err', msg: data.error || 'Failed to save news article.' });
      return;
    }

    setFeedback({
      type: 'ok',
      msg: saveAsDraft
        ? 'వార్త డ్రాఫ్ట్‌గా భద్రపరచబడింది (Saved as DRAFT).'
        : editingArticleId
        ? 'వార్త మార్పులు విజయవంతంగా సేవ్ చేయబడి వెంటనే ప్రచురించబడ్డాయి (Updated & Published Immediately).'
        : 'వార్త వెంటనే ప్రచురించబడింది — అడ్మిన్ అప్రూవల్ అవసరం లేకుండా లైవ్ అయింది (Published Immediately).',
    });

    setEditingArticleId(null);
    setHeadline('');
    setTeluguTitle('');
    setShortDesc('');
    setFullContent('');
    setMainImage('');
    setImageCaption('');
    setImageAltText('');
    setSupportingImages([]);
    setSeoTitle('');
    setSeoDescription('');
    fetchReporterDashboard();
    onRefreshPublicData();
    setActiveTab('MY_NEWS');
  };

  const startEditArticle = (art: NewsArticle) => {
    setEditingArticleId(art.id);
    setHeadline(art.headline);
    setTeluguTitle(art.telugu_title);
    setShortDesc(art.short_description);
    setFullContent(art.full_content);
    setMainImage(art.main_image);
    setImageCaption(art.image_caption || '');
    setImageAltText(art.image_alt_text || '');
    setSupportingImages(art.supporting_images || []);
    setCategoryId(art.category_id);
    setNewsStateId(art.state_id);
    if (art.district_id) setNewsDistrictId(art.district_id);
    if (art.mandal_id) setNewsMandalId(art.mandal_id);
    setNewsVillageName(art.village_name || '');
    setSeoTitle(art.seo_title || '');
    setSeoDescription(art.seo_description || '');
    setActiveTab('SUBMIT_NEWS');
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!adImage1 && !adImage2) {
      setFeedback({ type: 'err', msg: 'Please upload at least 1 advertisement image (Maximum 2 images allowed).' });
      return;
    }

    const res = await fetch('/api/reporter/advertisements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        title: adTitle,
        advertiser_name: advertiserName,
        contact_mobile: adMobile,
        contact_email: adEmail,
        description: adDesc,
        state_id: adStateId,
        district_id: adDistrictId,
        mandal_id: adMandalId,
        start_date: adStartDate,
        end_date: adEndDate,
        placement: adPlacement,
        image_1: adImage1 || undefined,
        image_2: adImage2 || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: 'err', msg: data.error || 'Failed to submit advertisement.' });
      return;
    }

    setFeedback({
      type: 'ok',
      msg: 'ప్రైవేట్ ప్రకటన విజయవంతంగా సమర్పించబడింది (Status: PENDING). అడ్మిన్ ఆమోదం తర్వాత మాత్రమే వెబ్‌సైట్‌లో ప్రదర్శించబడుతుంది.',
    });
    setAdTitle('');
    setAdvertiserName('');
    setAdMobile('');
    setAdEmail('');
    setAdDesc('');
    setAdImage1('');
    setAdImage2('');
    fetchReporterDashboard();
  };

  const handleUpdatePermittedProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await fetch('/api/reporter/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        residential_address: editAddress,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback({ type: 'err', msg: data.error || 'Failed to update profile.' });
      return;
    }
    setFeedback({ type: 'ok', msg: data.message });
    setCurrentPassword('');
    setNewPassword('');
    fetchReporterDashboard();
  };

  if (loading || !profile) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center text-sm text-stone-600">
        Loading Reporter Workspace...
      </div>
    );
  }

  const isApprovedAndActive = profile.account_status === 'APPROVED';
  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const pendingCount = articles.filter((a) => a.status === 'PENDING' || a.status === 'DRAFT').length;
  const rejectedCount = articles.filter((a) => a.status === 'REJECTED').length;

  const filteredNewsDistricts = districts.filter((d) => d.state_id === Number(newsStateId));
  const filteredNewsMandals = mandals.filter((m) => m.district_id === Number(newsDistrictId));
  const filteredNewsVillages = villages.filter((v) => v.mandal_id === Number(newsMandalId));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Workspace Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={profile.profile_photo_path || '/icon.svg'}
            alt={profile.full_name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-lg object-cover border border-stone-300 shrink-0"
          />
          <div>
            <div className="text-xs text-stone-500 font-medium tabular-nums">
              <span>Reporter ID: {profile.unique_reporter_id || profile.registration_number}</span>
              <span className="mx-2">·</span>
              <span>Status: {profile.account_status}</span>
              {profile.expiry_date && (
                <>
                  <span className="mx-2">·</span>
                  <span>Valid Until: {new Date(profile.expiry_date).toLocaleDateString('en-IN')}</span>
                </>
              )}
            </div>
            <h1 className="text-xl font-bold text-stone-900 mt-0.5">{profile.full_name}</h1>
            <p className="text-xs text-[#991B1B] font-semibold">
              {profile.designation} • {profile.mandal_name_te || profile.village_name}, {profile.district_name_te} ({profile.state_name_te})
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-stone-100 p-1.5 rounded-lg">
          {[
            { id: 'OVERVIEW', label: 'Overview (సమీక్ష)' },
            { id: 'ID_CARD', label: 'Press ID Card' },
            { id: 'SUBMIT_NEWS', label: 'Upload News (వార్త అప్‌లోడ్)' },
            { id: 'MY_NEWS', label: `My News (${articles.length})` },
            { id: 'ADVERTISEMENTS', label: `Private Ads (${ads.length})` },
            { id: 'PROFILE_SECURITY', label: 'Address & Password' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setFeedback(null);
                setActiveTab(t.id as ReporterTab);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === t.id ? 'bg-[#991B1B] text-white' : 'text-stone-700 hover:bg-stone-200/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Account Status Banner if not APPROVED */}
      {!isApprovedAndActive && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block text-sm font-bold">
              Account Status: {profile.account_status} — Publishing Restricted
            </strong>
            {profile.account_status === 'PENDING' &&
              'మీ రిపోర్టర్ దరఖాస్తు అడ్మిన్ పరిశీలనలో ఉంది. ఆమోదం పొందిన వెంటనే వార్తలు మరియు ప్రకటనలు అప్‌లోడ్ చేయడానికి అనుమతి లభిస్తుంది.'}
            {profile.account_status === 'EXPIRED' &&
              'మీ 6 నెలల రిపోర్టర్ కాలపరిమితి ముగిసింది (Expired). తిరిగి పునరుద్ధరించడానికి (Renewal) సూపర్ అడ్మిన్‌ను సంప్రదించండి.'}
            {profile.account_status === 'SUSPENDED' &&
              'మీ రిపోర్టర్ ఖాతా తాత్కాలికంగా నిలిపివేయబడింది (Suspended).'}
            {profile.account_status === 'REJECTED' &&
              `మీ రిపోర్టర్ దరఖాస్తు తిరస్కరించబడింది. కారణం: ${profile.rejection_reason || 'ధృవీకరణ పత్రాలు అసంపూర్తిగా ఉన్నాయి.'}`}
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 tabular-nums">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-500">Total Submitted News</div>
              <div className="text-2xl font-bold text-stone-900 mt-1">{articles.length}</div>
              <div className="text-[11px] text-stone-500 mt-1">Unlimited Quota</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-500">Published News</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{publishedCount}</div>
              <div className="text-[11px] text-stone-500 mt-1">Live on Portal</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-500">Pending / Drafts</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
              <div className="text-[11px] text-stone-500 mt-1">Editorial Queue</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="text-xs text-stone-500">Rejected News</div>
              <div className="text-2xl font-bold text-red-700 mt-1">{rejectedCount}</div>
              <div className="text-[11px] text-stone-500 mt-1">Needs Revision</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 col-span-2 md:col-span-1">
              <div className="text-xs text-stone-500">Submitted Ads</div>
              <div className="text-2xl font-bold text-[#1E3A8A] mt-1">{ads.length}</div>
              <div className="text-[11px] text-stone-500 mt-1">
                Active: {ads.filter((a) => a.status === 'ACTIVE').length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                <h2 className="text-base font-bold text-stone-900">Recent News Submissions (ఇటీవలి వార్తలు)</h2>
                {isApprovedAndActive && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('SUBMIT_NEWS')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#991B1B] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Article</span>
                  </button>
                )}
              </div>
              {articles.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">No news articles submitted yet.</p>
              ) : (
                <div className="divide-y divide-stone-200">
                  {articles.slice(0, 6).map((art) => (
                    <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs text-stone-500 tabular-nums">
                          <span>{art.category_name_te}</span>
                          <span className="mx-1.5">·</span>
                          <span>{new Date(art.news_date).toLocaleDateString('en-IN')}</span>
                          <span className="mx-1.5">·</span>
                          <span className="font-semibold text-stone-800">Status: {art.status}</span>
                        </div>
                        <div className="text-sm font-bold text-stone-900 truncate mt-0.5">{art.telugu_title}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditArticle(art)}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md shrink-0 cursor-pointer"
                      >
                        Edit (సవరించు)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
                6-Month Validity &amp; Press ID
              </h2>
              {isApprovedAndActive ? (
                <ReporterIdCardView reporter={profile} />
              ) : (
                <div className="p-6 text-center text-xs text-stone-600 bg-stone-50 rounded-lg border border-stone-200">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="font-semibold text-stone-800">Press ID Card Pending Approval</p>
                  <p className="mt-1">
                    Your official NETI BHARATHAM Press ID Card with 6-month validity will be automatically generated once Super Admin approves your account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRESS ID CARD */}
      {activeTab === 'ID_CARD' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 max-w-xl mx-auto">
          <h2 className="text-lg font-bold text-stone-900 text-center mb-2">
            నేటి భారతం అధికారిక ప్రెస్ గుర్తింపు కార్డు (Official Reporter ID Card)
          </h2>
          <p className="text-xs text-stone-500 text-center mb-6">
            Valid for 6 months from approval date. Contains zero Aadhaar or private document numbers.
          </p>
          {isApprovedAndActive ? (
            <ReporterIdCardView reporter={profile} />
          ) : (
            <div className="text-center py-8 text-sm text-amber-800">
              Your account status is currently <strong>{profile.account_status}</strong>. ID card download is available only for APPROVED reporters.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UNLIMITED NEWS SUBMISSION EDITOR */}
      {activeTab === 'SUBMIT_NEWS' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {editingArticleId ? 'వార్త సవరణ (Edit News Submission)' : 'కొత్త వార్త అప్‌లోడ్ (Unlimited News Submission Studio)'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Reporter: <strong>{profile.full_name}</strong> ({profile.unique_reporter_id || profile.registration_number})
              </p>
            </div>
            {editingArticleId && (
              <button
                type="button"
                onClick={() => {
                  setEditingArticleId(null);
                  setHeadline('');
                  setTeluguTitle('');
                  setShortDesc('');
                  setFullContent('');
                  setMainImage('');
                }}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Telugu News Title (తెలుగు వార్తా శీర్షిక) *
              </label>
              <input
                type="text"
                value={teluguTitle}
                onChange={(e) => setTeluguTitle(e.target.value)}
                placeholder="ఉదా: తెలంగాణ సచివాలయంలో కీలక సమీక్ష..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                News Headline / English URL Title (ఇంగ్లీష్ హెడ్‌లైన్) *
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Telangana Secretariat Key Cabinet Review"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Short Description / Summary (సంక్షిప్త వివరణ) *
            </label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="వార్తలోని ముఖ్యాంశాన్ని 2-3 వాక్యాలలో రాయండి..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
            />
          </div>

          {/* Rich Text Editor with Telugu Unicode Support */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Full News Content (పూర్తి వార్తా కథనం - Rich Text &amp; Telugu Unicode) *
              </label>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-md border border-stone-200">
                <button
                  type="button"
                  onClick={() => insertRichTag('<strong>', '</strong>')}
                  title="Bold"
                  className="p-1.5 hover:bg-white rounded text-stone-700 cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTag('<em>', '</em>')}
                  title="Italic"
                  className="p-1.5 hover:bg-white rounded text-stone-700 cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTag('<h3>', '</h3>')}
                  title="Subheading"
                  className="p-1.5 hover:bg-white rounded text-stone-700 cursor-pointer"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertRichTag('<ul>\n  <li>', '</li>\n</ul>')}
                  title="Bullet List"
                  className="p-1.5 hover:bg-white rounded text-stone-700 cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              placeholder="<p>పూర్తి వార్తా కథనాన్ని తెలుగు యూనికోడ్‌లో ఇక్కడ టైప్ చేయండి...</p>"
              className="w-full px-3 py-2.5 text-sm border border-stone-300 rounded-lg font-sans leading-relaxed"
            />
          </div>

          {/* Category, Location & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">News Category (వార్తా విభాగం) *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_te} ({c.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">State (రాష్ట్రం) *</label>
              <select
                value={newsStateId}
                onChange={(e) => {
                  const sId = Number(e.target.value);
                  setNewsStateId(sId);
                  const d = districts.find((x) => x.state_id === sId);
                  setNewsDistrictId(d ? d.id : 0);
                }}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_te} ({s.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">District (జిల్లా)</label>
              <select
                value={newsDistrictId}
                onChange={(e) => {
                  const dId = Number(e.target.value);
                  setNewsDistrictId(dId);
                  const m = mandals.find((x) => x.district_id === dId);
                  setNewsMandalId(m ? m.id : 0);
                }}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              >
                {filteredNewsDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_te} ({d.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Mandal / Taluk / Block (మండలం)</label>
              <select
                value={newsMandalId}
                onChange={(e) => setNewsMandalId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              >
                {filteredNewsMandals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name_te} ({m.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Village / Town (గ్రామం / పట్టణం)</label>
              <div className="flex gap-2">
                {filteredNewsVillages.length > 0 && (
                  <select
                    value={newsVillageId}
                    onChange={(e) => {
                      const vId = Number(e.target.value);
                      setNewsVillageId(vId);
                      const v = filteredNewsVillages.find((x) => x.id === vId);
                      if (v) setNewsVillageName(v.name_en);
                    }}
                    className="w-1/2 px-2 py-2 text-sm border border-stone-300 rounded-lg"
                  >
                    {filteredNewsVillages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name_te}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  value={newsVillageName}
                  onChange={(e) => setNewsVillageName(e.target.value)}
                  placeholder="గ్రామం పేరు"
                  className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">News Date &amp; Time (తేదీ) *</label>
              <input
                type="datetime-local"
                value={newsDate}
                onChange={(e) => setNewsDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Main Featured Image & Supporting Images Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50/50">
              <label className="block text-xs font-bold text-stone-900 mb-2">
                Main Featured Image (ప్రధాన వార్తా చిత్రం) *
              </label>
              {mainImage ? (
                <div className="space-y-2">
                  <img src={mainImage} alt="Main Preview" className="w-full h-40 object-cover rounded-lg border border-stone-300" />
                  <button
                    type="button"
                    onClick={() => setMainImage('')}
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Remove / Replace Image
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-stone-300 rounded-lg bg-white hover:border-[#991B1B] cursor-pointer text-xs font-semibold text-stone-700">
                  <ImageIcon className="w-4 h-4 text-[#991B1B]" />
                  <span>Upload from Mobile Gallery / Computer</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleMainImageUpload} className="hidden" />
                </label>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Image Caption (చిత్రం వివరణ)"
                  className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-md bg-white"
                />
                <input
                  type="text"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Image Alt Text (SEO)"
                  className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-md bg-white"
                />
              </div>
            </div>

            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50/50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-900">
                  Multiple Supporting Images (అదనపు చిత్రాలు)
                </label>
                <label className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded cursor-pointer">
                  + Add Images
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSupportingImagesUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {supportingImages.length === 0 ? (
                <p className="text-xs text-stone-500 py-8 text-center">
                  Optional: Upload multiple gallery photos with captions for this news article.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {supportingImages.map((img, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded border border-stone-200">
                      <img src={img.image_path} alt="" className="w-12 h-12 object-cover rounded shrink-0" />
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSupportingImages((prev) => prev.map((item, idx) => (idx === i ? { ...item, caption: val } : item)));
                        }}
                        placeholder="Image caption..."
                        className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setSupportingImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SEO Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">SEO Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to Telugu Title"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">SEO Meta Description</label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Defaults to Short Description"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={!isApprovedAndActive}
              onClick={() => handleSaveNews(true)}
              className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-900 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Save as Draft (డ్రాఫ్ట్‌గా సేవ్ చేయండి)
            </button>
            <button
              type="button"
              disabled={!isApprovedAndActive}
              onClick={() => handleSaveNews(false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#991B1B] hover:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <FilePlus className="w-4 h-4" />
              <span>
                {editingArticleId
                  ? 'Save & Publish Updated News (మార్పులను సేవ్ చేసి ప్రచురించండి)'
                  : 'Publish News Immediately (వార్తను వెంటనే ప్రచురించండి)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MY SUBMITTED NEWS */}
      {activeTab === 'MY_NEWS' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
            నా వార్తా కథనాలు (My Submitted News Articles — {articles.length})
          </h2>
          {articles.length === 0 ? (
            <p className="text-sm text-stone-500 py-8 text-center">No news submissions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Telugu Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Views</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-stone-50">
                      <td className="py-3 px-3 whitespace-nowrap">
                        {new Date(art.news_date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-900 max-w-md">
                        <div>{art.telugu_title}</div>
                        {art.rejection_reason && (
                          <div className="text-[11px] text-red-700 font-normal mt-0.5">
                            Reason: {art.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">{art.category_name_te}</td>
                      <td className="py-3 px-3 font-semibold">
                        <span
                          className={
                            art.status === 'PUBLISHED'
                              ? 'text-emerald-700'
                              : art.status === 'REJECTED'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{art.views_count}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => startEditArticle(art)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit (సవరించు)</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PRIVATE ADVERTISEMENT SUBMISSION & STATUS */}
      {activeTab === 'ADVERTISEMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSubmitAd} className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#991B1B]" />
                <span>ప్రైవేట్ ప్రకటన సమర్పణ (Submit Private Advertisement)</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Maximum 2 advertisement images per submission. Admin approval is mandatory before public display.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Advertisement Title *</label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="ప్రకటన శీర్షిక"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Advertiser Name *</label>
                <input
                  type="text"
                  required
                  value={advertiserName}
                  onChange={(e) => setAdvertiserName(e.target.value)}
                  placeholder="సంస్థ / వ్యాపారి పేరు"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Mobile *</label>
                <input
                  type="tel"
                  required
                  value={adMobile}
                  onChange={(e) => setAdMobile(e.target.value)}
                  placeholder="98480XXXXX"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={adEmail}
                  onChange={(e) => setAdEmail(e.target.value)}
                  placeholder="advertiser@email.com"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Placement Slot *</label>
                <select
                  value={adPlacement}
                  onChange={(e) => setAdPlacement(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  <option value="HEADER">Header Banner</option>
                  <option value="SIDEBAR">Sidebar Ad</option>
                  <option value="BETWEEN_ARTICLES">Between Articles</option>
                  <option value="ARTICLE_PAGE">Inside News Article</option>
                  <option value="FOOTER">Footer Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                <select
                  value={adStateId}
                  onChange={(e) => setAdStateId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_te}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                <select
                  value={adDistrictId}
                  onChange={(e) => setAdDistrictId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  {districts
                    .filter((d) => d.state_id === Number(adStateId))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_te}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mandal</label>
                <select
                  value={adMandalId}
                  onChange={(e) => setAdMandalId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                >
                  {mandals
                    .filter((m) => m.district_id === Number(adDistrictId))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name_te}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={adStartDate}
                  onChange={(e) => setAdStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={adEndDate}
                  onChange={(e) => setAdEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Advertisement Description *</label>
                <textarea
                  rows={2}
                  required
                  value={adDesc}
                  onChange={(e) => setAdDesc(e.target.value)}
                  placeholder="ప్రకటన వివరాలు..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>

              {/* Max 2 Images Upload */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Advertisement Image 1 *</label>
                {adImage1 ? (
                  <div className="space-y-1">
                    <img src={adImage1} alt="Ad 1" className="h-24 w-full object-cover rounded border" />
                    <button type="button" onClick={() => setAdImage1('')} className="text-xs text-red-700 font-semibold">
                      Remove Image 1
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleAdImageUpload(e, 1)}
                    className="text-xs"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Advertisement Image 2 (Optional)</label>
                {adImage2 ? (
                  <div className="space-y-1">
                    <img src={adImage2} alt="Ad 2" className="h-24 w-full object-cover rounded border" />
                    <button type="button" onClick={() => setAdImage2('')} className="text-xs text-red-700 font-semibold">
                      Remove Image 2
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleAdImageUpload(e, 2)}
                    className="text-xs"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isApprovedAndActive}
              className="w-full py-2.5 bg-[#991B1B] hover:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Submit Private Advertisement for Admin Approval
            </button>
          </form>

          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
              My Submitted Advertisements ({ads.length})
            </h2>
            {ads.length === 0 ? (
              <p className="text-xs text-stone-500 py-8 text-center">No advertisements submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="p-4 border border-stone-200 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-stone-500 tabular-nums">
                      <span>Placement: {ad.placement}</span>
                      <span className="font-bold text-stone-900">Status: {ad.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 mt-1">{ad.title}</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {ad.advertiser_name} • {ad.start_date} to {ad.end_date}
                    </p>
                    {ad.images && ad.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {ad.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-20 h-14 object-cover rounded border border-stone-200" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: STRICT PROFILE & SECURITY PERMISSIONS */}
      {activeTab === 'PROFILE_SECURITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Read-Only Locked Fields (Only Super Admin Can Modify) */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-4">
              <Lock className="w-4 h-4 text-stone-500" />
              <h2 className="text-base font-bold text-stone-900">
                Verified Press Profile (Locked — Editable Only by Super Admin)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              For journalistic integrity and Press ID security, the following fields cannot be modified by Reporters. Contact Super Admin if any official correction is needed.
            </p>
            <dl className="space-y-2.5 text-xs tabular-nums">
              {[
                ['Full Name (పూర్తి పేరు)', profile.full_name],
                ['Unique Reporter ID', profile.unique_reporter_id || 'Pending Approval'],
                ['Designation (హోదా)', profile.designation],
                ['Mobile Number', profile.mobile],
                ['Email Address', profile.email],
                ['Date of Birth', profile.dob],
                ['State (రాష్ట్రం)', profile.state_name_te || profile.state_name_en],
                ['District (జిల్లా)', profile.district_name_te || profile.district_name_en],
                ['Mandal (మండలం)', profile.mandal_name_te || profile.mandal_name_en],
                ['Identity Verification', 'Encrypted in Private Storage (Verified)'],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between py-1.5 border-b border-stone-100">
                  <dt className="text-stone-500 font-medium">{label}:</dt>
                  <dd className="font-semibold text-stone-800">{val}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Permitted Self-Service Form: ONLY Residential Address & Password */}
          <form onSubmit={handleUpdatePermittedProfile} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">
                Permitted Self-Service Edits (చిరునామా &amp; పాస్‌వర్డ్ మార్పు మాత్రమే)
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                1. Complete Residential Address (నివాస చిరునామా)
              </label>
              <textarea
                rows={3}
                required
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-800">2. Change Account Password (పాస్‌వర్డ్ మార్పు)</h3>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to change password"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank if only updating address"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#991B1B] hover:bg-red-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Save Address / Password Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
