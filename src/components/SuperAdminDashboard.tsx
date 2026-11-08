import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  Edit3,
  Eye,
  FileCheck,
  FolderGit2,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Newspaper,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  AdSenseSettings,
  AdvertisementItem,
  DistrictItem,
  MandalItem,
  NewsArticle,
  NewsCategory,
  ReporterProfile,
  StateItem,
  VillageItem,
} from '../types';
import { ReporterIdCardView } from './ReporterIdCardView';

interface SuperAdminDashboardProps {
  sessionToken: string;
  states: StateItem[];
  districts: DistrictItem[];
  mandals: MandalItem[];
  villages: VillageItem[];
  categories: NewsCategory[];
  settings: Record<string, string>;
  onRefreshPublicData: () => void;
}

type AdminSection =
  | 'OVERVIEW'
  | 'REPORTERS'
  | 'NEWS'
  | 'ADVERTISEMENTS'
  | 'LOCATIONS'
  | 'CATEGORIES'
  | 'WEBSITE_SETTINGS'
  | 'ADSENSE'
  | 'SECURITY_BACKUPS';

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  sessionToken,
  states,
  districts,
  mandals,
  villages,
  categories,
  settings,
  onRefreshPublicData,
}) => {
  const [section, setSection] = useState<AdminSection>('OVERVIEW');
  const [reporters, setReporters] = useState<ReporterProfile[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [ads, setAds] = useState<AdvertisementItem[]>([]);
  const [adsense, setAdsense] = useState<AdSenseSettings>({
    enabled: 0,
    publisher_id: '',
    header_slot_id: '',
    news_page_slot_id: '',
    sidebar_slot_id: '',
    between_articles_slot_id: '',
    footer_slot_id: '',
    header_enabled: 1,
    news_page_enabled: 1,
    sidebar_enabled: 1,
    between_articles_enabled: 1,
    footer_enabled: 1,
    mobile_ads_enabled: 1,
  });
  const [loginLogs, setLoginLogs] = useState<Array<Record<string, unknown>>>([]);
  const [activityLogs, setActivityLogs] = useState<Array<Record<string, unknown>>>([]);
  const [backups, setBackups] = useState<Array<{ filename: string; size_bytes: number; created_at: string }>>([]);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Modals & Editor States
  const [selectedReporterForCard, setSelectedReporterForCard] = useState<ReporterProfile | null>(null);
  const [editingReporter, setEditingReporter] = useState<ReporterProfile | null>(null);
  const [editRepPassword, setEditRepPassword] = useState('');
  const [docPreviewModal, setDocPreviewModal] = useState<{
    reporterName: string;
    docType: string;
    maskedRef: string;
    sha256: string;
    decryptedPreview: string | null;
  } | null>(null);

  // News Editor Modal State
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle> | null>(null);

  // Category Form State
  const [newCatTe, setNewCatTe] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatOrder, setNewCatOrder] = useState<number>(categories.length + 1);

  // Location Form State
  const [locType, setLocType] = useState<'state' | 'district' | 'mandal' | 'village'>('mandal');
  const [locParentStateId, setLocParentStateId] = useState<number>(1);
  const [locParentDistrictId, setLocParentDistrictId] = useState<number>(101);
  const [locParentMandalId, setLocParentMandalId] = useState<number>(1001);
  const [locNameTe, setLocNameTe] = useState('');
  const [locNameEn, setLocNameEn] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locAdminTerm, setLocAdminTerm] = useState<'Mandal' | 'Tehsil' | 'Taluk' | 'Block' | 'Subdistrict'>('Mandal');
  const [locPinCode, setLocPinCode] = useState('');

  // Website Settings Form State
  const [siteSettingsForm, setSiteSettingsForm] = useState<Record<string, string>>(settings);

  // Admin Password Change
  const [adminCurrentPw, setAdminCurrentPw] = useState('');
  const [adminNewPw, setAdminNewPw] = useState('');

  const loadAdminOverview = async () => {
    const res = await fetch('/api/admin/overview', {
      headers: { 'x-nb-session': sessionToken },
    });
    if (res.ok) {
      const data = await res.json();
      setReporters(data.reporters || []);
      setArticles(data.articles || []);
      setAds(data.advertisements || []);
      if (data.adsense) setAdsense(data.adsense);
      setLoginLogs(data.login_logs || []);
      setActivityLogs(data.activity_logs || []);
      setBackups(data.backups || []);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, [sessionToken]);

  useEffect(() => {
    setSiteSettingsForm(settings);
  }, [settings]);

  const handleReporterStatusAction = async (reporterId: number, action: string) => {
    let rejectionReason = '';
    if (action === 'REJECT') {
      rejectionReason = 'Verification document unclear or incomplete details.';
    }
    const res = await fetch(`/api/admin/reporters/${reporterId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({ action, rejection_reason: rejectionReason }),
    });
    const data = await res.json();
    if (res.ok) {
      setToast({
        type: 'ok',
        text: `Reporter #${reporterId} action '${action}' executed. ${
          data.unique_reporter_id ? `Assigned ID: ${data.unique_reporter_id}` : ''
        }`,
      });
      loadAdminOverview();
      onRefreshPublicData();
    } else {
      setToast({ type: 'err', text: data.error || 'Failed to update reporter status.' });
    }
  };

  const handleViewEncryptedDocument = async (rep: ReporterProfile) => {
    const res = await fetch(`/api/admin/reporters/${rep.id}/document`, {
      headers: { 'x-nb-session': sessionToken },
    });
    const data = await res.json();
    if (res.ok) {
      setDocPreviewModal({
        reporterName: rep.full_name,
        docType: data.document_type,
        maskedRef: data.masked_document_ref,
        sha256: data.sha256_checksum,
        decryptedPreview: data.decrypted_preview,
      });
    } else {
      setToast({ type: 'err', text: data.error || 'Could not load verification document.' });
    }
  };

  const handleSaveEditedReporter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReporter) return;
    const res = await fetch(`/api/admin/reporters/${editingReporter.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        ...editingReporter,
        new_password: editRepPassword || undefined,
      }),
    });
    if (res.ok) {
      setToast({ type: 'ok', text: `Reporter ${editingReporter.full_name} updated successfully.` });
      setEditingReporter(null);
      setEditRepPassword('');
      loadAdminOverview();
      onRefreshPublicData();
    }
  };

  const handleQuickUpdateArticle = async (art: NewsArticle, patch: Partial<NewsArticle>) => {
    const res = await fetch(`/api/admin/articles/${art.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({ ...art, ...patch }),
    });
    if (res.ok) {
      setToast({ type: 'ok', text: `Article "${art.telugu_title.slice(0, 32)}..." updated.` });
      loadAdminOverview();
      onRefreshPublicData();
    }
  };

  const handleSaveArticleModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    const isNew = !editingArticle.id;
    const url = isNew ? '/api/admin/articles' : `/api/admin/articles/${editingArticle.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify(editingArticle),
    });
    const data = await res.json();
    if (res.ok) {
      setToast({ type: 'ok', text: isNew ? 'New article published by Admin.' : 'Article changes saved.' });
      setEditingArticle(null);
      loadAdminOverview();
      onRefreshPublicData();
    } else {
      setToast({ type: 'err', text: data.error || 'Failed to save article.' });
    }
  };

  const handleControlledDeleteArticle = async (articleId: number) => {
    const res = await fetch(`/api/admin/articles/${articleId}?confirm=true`, {
      method: 'DELETE',
      headers: { 'x-nb-session': sessionToken },
    });
    if (res.ok) {
      setToast({ type: 'ok', text: `Article #${articleId} archived to private/backups/ and deleted.` });
      loadAdminOverview();
      onRefreshPublicData();
    }
  };

  const handleUpdateAdStatus = async (adId: number, status: string) => {
    const res = await fetch(`/api/admin/advertisements/${adId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setToast({ type: 'ok', text: `Advertisement #${adId} status updated to ${status}.` });
      loadAdminOverview();
      onRefreshPublicData();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        name_te: newCatTe,
        name_en: newCatEn,
        display_order: newCatOrder,
      }),
    });
    if (res.ok) {
      setNewCatTe('');
      setNewCatEn('');
      setToast({ type: 'ok', text: 'Category added successfully.' });
      onRefreshPublicData();
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/locations/${locType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({
        state_id: locParentStateId,
        district_id: locParentDistrictId,
        mandal_id: locParentMandalId,
        name_te: locNameTe,
        name_en: locNameEn,
        lgd_code: locCode || `${Date.now().toString().slice(-5)}`,
        subdistrict_term: locAdminTerm,
        admin_term: locAdminTerm,
        pin_code: locPinCode,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setLocNameTe('');
      setLocNameEn('');
      setLocCode('');
      setToast({ type: 'ok', text: `Added new ${locType} record to LGD database.` });
      onRefreshPublicData();
    } else {
      setToast({ type: 'err', text: data.error || 'Failed to add location.' });
    }
  };

  const handleDeleteLocation = async (type: string, id: number) => {
    const res = await fetch(`/api/admin/locations/${type}/${id}`, {
      method: 'DELETE',
      headers: { 'x-nb-session': sessionToken },
    });
    const data = await res.json();
    if (res.ok) {
      setToast({ type: 'ok', text: `Deleted ${type} #${id}.` });
      onRefreshPublicData();
    } else {
      setToast({ type: 'err', text: data.error || 'Dependency check blocked deletion.' });
    }
  };

  const handleExportLocationsCsv = () => {
    const rows = ['Level,ID,LGD_Code,Name_English,Name_Telugu,Parent_ID'];
    states.forEach((s) => rows.push(`STATE,${s.id},${s.lgd_code},"${s.name_en}","${s.name_te}",0`));
    districts.forEach((d) => rows.push(`DISTRICT,${d.id},${d.lgd_code},"${d.name_en}","${d.name_te}",${d.state_id}`));
    mandals.forEach((m) => rows.push(`${m.admin_term.toUpperCase()},${m.id},${m.lgd_code},"${m.name_en}","${m.name_te}",${m.district_id}`));
    villages.forEach((v) => rows.push(`VILLAGE,${v.id},${v.lgd_code || ''},"${v.name_en}","${v.name_te}",${v.mandal_id}`));

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neti_bharatham_lgd_locations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify({ settings: siteSettingsForm }),
    });
    if (res.ok) {
      setToast({ type: 'ok', text: 'Website settings, branding, ticker, and contact details updated.' });
      onRefreshPublicData();
    }
  };

  const handleSaveAdSense = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/adsense', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-nb-session': sessionToken,
      },
      body: JSON.stringify(adsense),
    });
    if (res.ok) {
      setToast({ type: 'ok', text: 'Google AdSense configuration saved securely.' });
      onRefreshPublicData();
    }
  };

  const handleCreateBackup = async () => {
    const res = await fetch('/api/admin/backups/create', {
      method: 'POST',
      headers: { 'x-nb-session': sessionToken },
    });
    const data = await res.json();
    if (res.ok) {
      setToast({ type: 'ok', text: `Backup ${data.filename} created in private/backups/.` });
      const blob = new Blob([JSON.stringify(data.snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      loadAdminOverview();
    }
  };

  const pendingReporters = reporters.filter((r) => r.account_status === 'PENDING').length;
  const approvedReporters = reporters.filter((r) => r.account_status === 'APPROVED').length;
  const suspendedReporters = reporters.filter((r) => r.account_status === 'SUSPENDED').length;
  const expiredReporters = reporters.filter((r) => r.account_status === 'EXPIRED').length;

  const publishedNews = articles.filter((a) => a.status === 'PUBLISHED').length;
  const pendingNews = articles.filter((a) => a.status === 'PENDING' || a.status === 'DRAFT').length;
  const rejectedNews = articles.filter((a) => a.status === 'REJECTED').length;

  const pendingAds = ads.filter((a) => a.status === 'PENDING').length;
  const activeAds = ads.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-stone-100">
      {/* Left Admin Sidebar (260px) */}
      <aside className="w-full lg:w-64 bg-slate-950 text-slate-200 shrink-0 p-4 flex flex-col justify-between">
        <div>
          <div className="px-3 py-2 border-b border-slate-800 mb-4">
            <div className="text-xs font-mono text-amber-400">SUPER ADMIN CONSOLE</div>
            <div className="text-base font-bold text-white mt-0.5">నేటి భారతం కంట్రోల్ ప్యానెల్</div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'OVERVIEW', label: 'Dashboard Overview', icon: Layers },
              { id: 'REPORTERS', label: `Reporters (${reporters.length})`, icon: Users },
              { id: 'NEWS', label: `News Management (${articles.length})`, icon: Newspaper },
              { id: 'ADVERTISEMENTS', label: `Private Ads (${ads.length})`, icon: Megaphone },
              { id: 'LOCATIONS', label: `LGD India Locations`, icon: MapPin },
              { id: 'CATEGORIES', label: `Categories (${categories.length})`, icon: FileCheck },
              { id: 'WEBSITE_SETTINGS', label: 'Website & Branding', icon: Globe },
              { id: 'ADSENSE', label: 'Google AdSense', icon: Database },
              { id: 'SECURITY_BACKUPS', label: 'Security & Backups', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setToast(null);
                    setSection(item.id as AdminSection);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    active ? 'bg-[#991B1B] text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
          <a
            href="/api/download/deployment-package"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>BigRock cPanel ZIP</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
        {toast && (
          <div
            className={`mb-5 p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              toast.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <span>{toast.text}</span>
            <button type="button" onClick={() => setToast(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal: Encrypted Identity Document Viewer */}
        {docPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Private Encrypted Identity Document Review
                  </h3>
                  <p className="text-xs text-stone-500">Reporter: {docPreviewModal.reporterName}</p>
                </div>
                <button type="button" onClick={() => setDocPreviewModal(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <dl className="text-xs space-y-1.5 mb-4 bg-stone-50 p-3 rounded-lg border border-stone-200 tabular-nums">
                <div>
                  <strong>Document Type:</strong> {docPreviewModal.docType}
                </div>
                <div>
                  <strong>Masked Reference:</strong> {docPreviewModal.maskedRef}
                </div>
                <div className="truncate">
                  <strong>SHA-256 Checksum:</strong> <span className="font-mono">{docPreviewModal.sha256}</span>
                </div>
              </dl>
              {docPreviewModal.decryptedPreview?.startsWith('data:image/') ? (
                <img
                  src={docPreviewModal.decryptedPreview}
                  alt="Decrypted Verification ID"
                  className="w-full max-h-72 object-contain rounded border border-stone-300"
                />
              ) : (
                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg break-all">
                  AES-256-CBC Decrypted Payload: {docPreviewModal.decryptedPreview || 'Verified Private Binary Document'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Reporter ID Card Preview */}
        {selectedReporterForCard && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                <h3 className="text-base font-bold text-stone-900">Reporter Press ID Card</h3>
                <button type="button" onClick={() => setSelectedReporterForCard(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ReporterIdCardView reporter={selectedReporterForCard} />
            </div>
          </div>
        )}

        {/* SECTION 1: OVERVIEW */}
        {section === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-stone-900">Super Admin Control Panel Overview</h1>
                <p className="text-xs text-stone-600">
                  NETI BHARATHAM (https://netibhaaratham.com) • Complete Portal, Reporter, News &amp; Advertisement Governance
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingArticle({
                    headline: '',
                    telugu_title: '',
                    short_description: '',
                    full_content: '<p></p>',
                    main_image: '/src/assets/images/news_telangana_secretariat_1794106864016.jpg',
                    category_id: 1,
                    state_id: 1,
                    district_id: 101,
                    mandal_id: 1001,
                    village_name: 'Hyderabad',
                    status: 'PUBLISHED',
                    is_breaking: 1,
                    is_featured: 1,
                  });
                  setSection('NEWS');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Breaking News</span>
              </button>
            </div>

            {/* 12 Required Admin Overview Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 tabular-nums">
              {[
                ['Total Reporters', reporters.length, 'Registered Accounts'],
                ['Pending Reporters', pendingReporters, 'Awaiting Verification'],
                ['Approved Reporters', approvedReporters, 'Active 6-Month ID'],
                ['Suspended / Expired', `${suspendedReporters} / ${expiredReporters}`, 'Publishing Blocked'],
                ['Total News Articles', articles.length, 'All Submissions'],
                ['Published News', publishedNews, 'Live on Portal'],
                ['Pending / Draft News', pendingNews, 'Editorial Queue'],
                ['Rejected News', rejectedNews, 'Returned to Reporter'],
                ['Total Advertisements', ads.length, 'Private Ad Submissions'],
                ['Pending Advertisements', pendingAds, 'Awaiting Approval'],
                ['Active Advertisements', activeAds, 'Live Placements'],
                ['LGD India Locations', `${states.length} States / ${districts.length} Dist`, `${mandals.length} Mandals / ${villages.length} Villages`],
              ].map(([title, val, sub]) => (
                <div key={String(title)} className="bg-white border border-stone-200 rounded-xl p-4">
                  <div className="text-xs text-stone-500 font-medium">{title}</div>
                  <div className="text-2xl font-bold text-stone-900 mt-1">{val}</div>
                  <div className="text-[11px] text-stone-500 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            {/* Quick Pending Approvals Queue */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
                Pending Reporter Approvals &amp; Document Verification Queue
              </h2>
              {reporters.filter((r) => r.account_status === 'PENDING').length === 0 ? (
                <p className="text-xs text-stone-500 py-4">All pending reporter registrations have been reviewed.</p>
              ) : (
                <div className="divide-y divide-stone-200">
                  {reporters
                    .filter((r) => r.account_status === 'PENDING')
                    .map((r) => (
                      <div key={r.id} className="py-3 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-stone-900">{r.full_name}</div>
                          <div className="text-xs text-stone-500 tabular-nums">
                            {r.designation} · {r.mandal_name_te || r.village_name}, {r.district_name_te} · Mobile: {r.mobile} · Doc: {r.document_type} ({r.masked_document_ref})
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReporter(r);
                              setSection('REPORTERS');
                            }}
                            className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-semibold rounded-md cursor-pointer"
                          >
                            Edit Full Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewEncryptedDocument(r)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-md cursor-pointer"
                          >
                            Inspect Private ID Doc
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReporterStatusAction(r.id, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md cursor-pointer"
                          >
                            Approve &amp; Issue 6M ID
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReporterStatusAction(r.id, 'REJECT')}
                            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-md cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: COMPLETE REPORTER MANAGEMENT */}
        {section === 'REPORTERS' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
                Reporter Management, Verification, 6-Month Renewal &amp; Total Profile Edit (పూర్తి రిపోర్టర్ ప్రొఫైల్ సవరణ)
              </h2>

              {editingReporter && (
                <form onSubmit={handleSaveEditedReporter} className="mb-6 p-5 bg-stone-50 border border-stone-300 rounded-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-[#1E3A8A]">
                        Total Reporter Profile Edit (పూర్తి ప్రొఫైల్ సవరణ): {editingReporter.full_name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Super Admin can modify all personal, contact, location, professional, photo, login, and ID card fields.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingReporter(null)}
                      className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* 1. Personal & Contact Details */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                      1. Personal, Contact &amp; Login Credentials (వ్యక్తిగత మరియు లాగిన్ వివరాలు)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Full Name (పూర్తి పేరు) *</label>
                        <input
                          type="text"
                          required
                          value={editingReporter.full_name || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, full_name: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Father Name (తండ్రి పేరు)</label>
                        <input
                          type="text"
                          value={editingReporter.father_name || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, father_name: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Date of Birth (పుట్టిన తేదీ)</label>
                        <input
                          type="date"
                          value={editingReporter.dob ? editingReporter.dob.slice(0, 10) : ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, dob: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Gender (లింగం)</label>
                        <select
                          value={editingReporter.gender || 'Male'}
                          onChange={(e) => setEditingReporter({ ...editingReporter, gender: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        >
                          <option value="Male">Male (పురుషుడు)</option>
                          <option value="Female">Female (స్త్రీ)</option>
                          <option value="Other">Other (ఇతర)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Mobile Number (మొబైల్ నంబర్) *</label>
                        <input
                          type="text"
                          required
                          value={editingReporter.mobile || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, mobile: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">WhatsApp Number (వాట్సాప్ నంబర్)</label>
                        <input
                          type="text"
                          value={editingReporter.whatsapp || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, whatsapp: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Email Address (ఈమెయిల్) *</label>
                        <input
                          type="email"
                          required
                          value={editingReporter.email || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Login Username (యూజర్ నేమ్) *</label>
                        <input
                          type="text"
                          required
                          value={editingReporter.username || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, username: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Location & Complete Residential Address */}
                  <div className="border-t border-stone-200 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                      2. Location &amp; Complete Residential Address (రాష్ట్రం, జిల్లా, మండలం మరియు పూర్తి చిరునామా)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">State (రాష్ట్రం)</label>
                        <select
                          value={editingReporter.state_id}
                          onChange={(e) => {
                            const sId = Number(e.target.value);
                            const firstDist = districts.find((d) => d.state_id === sId);
                            const firstMandal = firstDist ? mandals.find((m) => m.district_id === firstDist.id) : undefined;
                            setEditingReporter({
                              ...editingReporter,
                              state_id: sId,
                              district_id: firstDist ? firstDist.id : editingReporter.district_id,
                              mandal_id: firstMandal ? firstMandal.id : editingReporter.mandal_id,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        >
                          {states.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name_te} ({s.name_en})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">District (జిల్లా)</label>
                        <select
                          value={editingReporter.district_id}
                          onChange={(e) => {
                            const dId = Number(e.target.value);
                            const firstMandal = mandals.find((m) => m.district_id === dId);
                            setEditingReporter({
                              ...editingReporter,
                              district_id: dId,
                              mandal_id: firstMandal ? firstMandal.id : editingReporter.mandal_id,
                            });
                          }}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        >
                          {districts
                            .filter((d) => d.state_id === Number(editingReporter.state_id))
                            .map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name_te} ({d.name_en})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Mandal / Taluk (మండలం)</label>
                        <select
                          value={editingReporter.mandal_id}
                          onChange={(e) => setEditingReporter({ ...editingReporter, mandal_id: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        >
                          {mandals
                            .filter((m) => m.district_id === Number(editingReporter.district_id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name_te} ({m.name_en})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Village / Town (గ్రామం / పట్టణం)</label>
                        <input
                          type="text"
                          value={editingReporter.village_name || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, village_name: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">PIN Code (పిన్ కోడ్)</label>
                        <input
                          type="text"
                          value={editingReporter.pin_code || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, pin_code: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 md:col-span-5">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                          Complete Residential Address (పూర్తి నివాస చిరునామా)
                        </label>
                        <textarea
                          rows={2}
                          value={editingReporter.residential_address || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, residential_address: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Professional, ID Card, Account Status & Photograph */}
                  <div className="border-t border-stone-200 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                      3. Professional Details, Press ID, Validity &amp; Profile Photo (వృత్తిపరమైన మరియు ఐడి కార్డు వివరాలు)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Designation (హోదా)</label>
                        <input
                          type="text"
                          value={editingReporter.designation || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, designation: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Experience (అనుభవం)</label>
                        <input
                          type="text"
                          value={editingReporter.experience_years || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, experience_years: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Previous Media Organization</label>
                        <input
                          type="text"
                          value={editingReporter.previous_media_org || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, previous_media_org: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Unique Reporter ID (ఐడి నంబర్)</label>
                        <input
                          type="text"
                          value={editingReporter.unique_reporter_id || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, unique_reporter_id: e.target.value })}
                          placeholder="e.g. NB-TS-2025-1001"
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Registration Number</label>
                        <input
                          type="text"
                          value={editingReporter.registration_number || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, registration_number: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Account Status (ఖాతా స్థితి)</label>
                        <select
                          value={editingReporter.account_status}
                          onChange={(e) =>
                            setEditingReporter({
                              ...editingReporter,
                              account_status: e.target.value as ReporterProfile['account_status'],
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white font-semibold"
                        >
                          <option value="APPROVED">APPROVED (ఆమోదించబడింది)</option>
                          <option value="PENDING">PENDING (పెండింగ్)</option>
                          <option value="SUSPENDED">SUSPENDED (సస్పెండ్)</option>
                          <option value="EXPIRED">EXPIRED (గడువు ముగిసింది)</option>
                          <option value="REJECTED">REJECTED (తిరస్కరించబడింది)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Approval Date (ఆమోద తేదీ)</label>
                        <input
                          type="date"
                          value={editingReporter.approval_date ? editingReporter.approval_date.slice(0, 10) : ''}
                          onChange={(e) =>
                            setEditingReporter({
                              ...editingReporter,
                              approval_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Expiry Date (6-Month గడువు తేదీ)</label>
                        <input
                          type="date"
                          value={editingReporter.expiry_date ? editingReporter.expiry_date.slice(0, 10) : ''}
                          onChange={(e) =>
                            setEditingReporter({
                              ...editingReporter,
                              expiry_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Reset Password (కొత్త పాస్‌వర్డ్ - Optional)</label>
                        <input
                          type="password"
                          value={editRepPassword}
                          onChange={(e) => setEditRepPassword(e.target.value)}
                          placeholder="Leave blank to keep existing"
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">Rejection / Status Note</label>
                        <input
                          type="text"
                          value={editingReporter.rejection_reason || ''}
                          onChange={(e) => setEditingReporter({ ...editingReporter, rejection_reason: e.target.value })}
                          placeholder="Optional note or reason"
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-3 bg-white p-2 rounded border border-stone-200">
                        {editingReporter.profile_photo_path && (
                          <img
                            src={editingReporter.profile_photo_path}
                            alt={editingReporter.full_name}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-300 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                            Reporter Profile Photograph (ఫోటో మార్చండి)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingReporter.profile_photo_path || ''}
                              onChange={(e) =>
                                setEditingReporter({ ...editingReporter, profile_photo_path: e.target.value })
                              }
                              placeholder="Image URL or upload file"
                              className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded bg-white"
                            />
                            <label className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded cursor-pointer shrink-0">
                              Upload Photo
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setEditingReporter({
                                      ...editingReporter,
                                      profile_photo_path: String(reader.result || ''),
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingReporter.can_edit_published)}
                        onChange={(e) =>
                          setEditingReporter({ ...editingReporter, can_edit_published: e.target.checked ? 1 : 0 })
                        }
                      />
                      <span>Allow Reporter to Edit Published News (రిపోర్టర్ వార్తలను ఎప్పుడైనా సవరించుకునే అనుమతి)</span>
                    </label>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#991B1B] hover:bg-red-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Complete Reporter Profile (పూర్తి ప్రొఫైల్ సేవ్ చేయండి)
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500">
                      <th className="py-2.5 px-2">Reporter ID</th>
                      <th className="py-2.5 px-2">Name &amp; Designation</th>
                      <th className="py-2.5 px-2">Location</th>
                      <th className="py-2.5 px-2">Status &amp; Validity</th>
                      <th className="py-2.5 px-2">Private Doc</th>
                      <th className="py-2.5 px-2 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {reporters.map((r) => (
                      <tr key={r.id} className="hover:bg-stone-50">
                        <td className="py-3 px-2 font-mono font-bold text-stone-900">
                          {r.unique_reporter_id || r.registration_number}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-bold text-stone-900">{r.full_name}</div>
                          <div className="text-stone-500">
                            {r.designation} • {r.mobile}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {r.mandal_name_te || r.village_name}, {r.district_name_te} ({r.state_name_te})
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-bold text-stone-900">{r.account_status}</div>
                          {r.expiry_date && (
                            <div className="text-[11px] text-stone-500">
                              Expires: {new Date(r.expiry_date).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => handleViewEncryptedDocument(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{r.document_type || 'View ID'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-2 text-right space-x-1 whitespace-nowrap">
                          {r.account_status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleReporterStatusAction(r.id, 'APPROVE')}
                                className="px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReporterStatusAction(r.id, 'REJECT')}
                                className="px-2.5 py-1 bg-red-700 text-white rounded font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {r.account_status === 'APPROVED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedReporterForCard(r)}
                                className="px-2.5 py-1 bg-[#1E3A8A] text-white rounded font-semibold cursor-pointer"
                              >
                                ID Card
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReporterStatusAction(r.id, 'SUSPEND')}
                                className="px-2.5 py-1 bg-amber-600 text-white rounded font-semibold cursor-pointer"
                              >
                                Suspend
                              </button>
                            </>
                          )}
                          {(r.account_status === 'SUSPENDED' || r.account_status === 'REJECTED') && (
                            <button
                              type="button"
                              onClick={() => handleReporterStatusAction(r.id, 'ACTIVATE')}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReporterStatusAction(r.id, 'RENEW')}
                            title="Renew +6 Months Validity"
                            className="px-2.5 py-1 bg-slate-900 text-white rounded font-semibold cursor-pointer"
                          >
                            +6M Renew
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingReporter(r)}
                            className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded font-semibold cursor-pointer"
                          >
                            Edit Full Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: NEWS MANAGEMENT */}
        {section === 'NEWS' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                <h2 className="text-lg font-bold text-stone-900">Complete Editorial &amp; News Management</h2>
                <button
                  type="button"
                  onClick={() =>
                    setEditingArticle({
                      headline: '',
                      telugu_title: '',
                      short_description: '',
                      full_content: '<p></p>',
                      main_image: '/src/assets/images/news_telangana_secretariat_1794106864016.jpg',
                      category_id: 1,
                      state_id: 1,
                      district_id: 101,
                      mandal_id: 1001,
                      village_name: 'Hyderabad',
                      status: 'PUBLISHED',
                      is_breaking: 1,
                      is_featured: 1,
                      allow_reporter_edit: 1,
                    })
                  }
                  className="px-3.5 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  + Add New Article
                </button>
              </div>

              {editingArticle && (
                <form onSubmit={handleSaveArticleModal} className="mb-6 p-5 bg-stone-50 border border-stone-300 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                    <h3 className="text-sm font-bold text-[#991B1B]">
                      {editingArticle.id ? `Edit News Article #${editingArticle.id} (వార్త సవరణ)` : 'Create & Publish New Article'}
                    </h3>
                    <button type="button" onClick={() => setEditingArticle(null)} className="text-xs text-stone-500">
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Telugu Title (తెలుగు శీర్షిక) *</label>
                      <input
                        type="text"
                        required
                        value={editingArticle.telugu_title || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, telugu_title: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">English Headline *</label>
                      <input
                        type="text"
                        required
                        value={editingArticle.headline || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, headline: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Category (విభాగం)</label>
                      <select
                        value={editingArticle.category_id || 1}
                        onChange={(e) => setEditingArticle({ ...editingArticle, category_id: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name_te} ({c.name_en})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">State (రాష్ట్రం)</label>
                      <select
                        value={editingArticle.state_id || 1}
                        onChange={(e) => {
                          const sId = Number(e.target.value);
                          const firstDist = districts.find((d) => d.state_id === sId);
                          const firstMandal = firstDist ? mandals.find((m) => m.district_id === firstDist.id) : undefined;
                          setEditingArticle({
                            ...editingArticle,
                            state_id: sId,
                            district_id: firstDist ? firstDist.id : null,
                            mandal_id: firstMandal ? firstMandal.id : null,
                          });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name_te}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">District (జిల్లా)</label>
                      <select
                        value={editingArticle.district_id || ''}
                        onChange={(e) => {
                          const dId = Number(e.target.value) || null;
                          const firstMandal = dId ? mandals.find((m) => m.district_id === dId) : undefined;
                          setEditingArticle({
                            ...editingArticle,
                            district_id: dId,
                            mandal_id: firstMandal ? firstMandal.id : null,
                          });
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        <option value="">All / State Level</option>
                        {districts
                          .filter((d) => d.state_id === Number(editingArticle.state_id || 1))
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name_te} ({d.name_en})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Mandal (మండలం)</label>
                      <select
                        value={editingArticle.mandal_id || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, mandal_id: Number(e.target.value) || null })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        <option value="">All / District Level</option>
                        {mandals
                          .filter((m) => m.district_id === Number(editingArticle.district_id || 0))
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name_te} ({m.name_en})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Village / Location Name</label>
                      <input
                        type="text"
                        value={editingArticle.village_name || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, village_name: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Publication Status</label>
                      <select
                        value={editingArticle.status || 'PUBLISHED'}
                        onChange={(e) =>
                          setEditingArticle({
                            ...editingArticle,
                            status: e.target.value as NewsArticle['status'],
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white font-semibold"
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Main Featured Image (చిత్రం URL / అప్‌లోడ్)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingArticle.main_image || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, main_image: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                        />
                        <label className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded cursor-pointer shrink-0">
                          Upload Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                setEditingArticle({ ...editingArticle, main_image: String(reader.result || '') });
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Image Caption</label>
                      <input
                        type="text"
                        value={editingArticle.image_caption || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, image_caption: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold mb-1">Short Description (సంక్షిప్త వివరణ) *</label>
                      <textarea
                        rows={2}
                        required
                        value={editingArticle.short_description || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, short_description: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold mb-1">Full HTML / Telugu Content (పూర్తి వార్తా కథనం) *</label>
                      <textarea
                        rows={6}
                        required
                        value={editingArticle.full_content || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, full_content: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="checkbox"
                        checked={Boolean(editingArticle.is_breaking)}
                        onChange={(e) => setEditingArticle({ ...editingArticle, is_breaking: e.target.checked ? 1 : 0 })}
                      />
                      <span>Mark as Breaking News</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="checkbox"
                        checked={Boolean(editingArticle.is_featured)}
                        onChange={(e) => setEditingArticle({ ...editingArticle, is_featured: e.target.checked ? 1 : 0 })}
                      />
                      <span>Feature on Homepage Slider</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="checkbox"
                        checked={Boolean(editingArticle.allow_reporter_edit ?? 1)}
                        onChange={(e) =>
                          setEditingArticle({ ...editingArticle, allow_reporter_edit: e.target.checked ? 1 : 0 })
                        }
                      />
                      <span>Allow Reporter to Edit After Publish</span>
                    </label>
                  </div>
                  <button type="submit" className="px-5 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer">
                    Save &amp; Apply Changes
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500">
                      <th className="py-2.5 px-2">ID / Date</th>
                      <th className="py-2.5 px-2">Telugu Headline &amp; Reporter</th>
                      <th className="py-2.5 px-2">Category &amp; Location</th>
                      <th className="py-2.5 px-2">Flags</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {articles.map((art) => (
                      <tr key={art.id} className="hover:bg-stone-50">
                        <td className="py-3 px-2 whitespace-nowrap">
                          <div className="font-mono font-bold">#{art.id}</div>
                          <div className="text-stone-500">{new Date(art.news_date).toLocaleDateString('en-IN')}</div>
                        </td>
                        <td className="py-3 px-2 max-w-sm">
                          <div className="font-bold text-stone-900">{art.telugu_title}</div>
                          <div className="text-stone-500">
                            By {art.reporter_name} ({art.reporter_unique_id})
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-semibold">{art.category_name_te}</div>
                          <div className="text-stone-500">
                            {art.district_name_te || art.state_name_te}
                          </div>
                        </td>
                        <td className="py-3 px-2 space-y-1">
                          <button
                            type="button"
                            onClick={() => handleQuickUpdateArticle(art, { is_breaking: art.is_breaking ? 0 : 1 })}
                            className={`block px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              art.is_breaking ? 'bg-red-700 text-white' : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {art.is_breaking ? 'BREAKING: ON' : 'Breaking: Off'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickUpdateArticle(art, { is_featured: art.is_featured ? 0 : 1 })}
                            className={`block px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              art.is_featured ? 'bg-[#1E3A8A] text-white' : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {art.is_featured ? 'FEATURED: ON' : 'Featured: Off'}
                          </button>
                        </td>
                        <td className="py-3 px-2 font-bold">{art.status}</td>
                        <td className="py-3 px-2 text-right space-x-1 whitespace-nowrap">
                          {art.status !== 'PUBLISHED' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickUpdateArticle(art, { status: 'PUBLISHED' })}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold cursor-pointer"
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickUpdateArticle(art, { status: 'PENDING' })}
                              className="px-2.5 py-1 bg-amber-600 text-white rounded font-semibold cursor-pointer"
                            >
                              Unpublish
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingArticle(art)}
                            className="px-2.5 py-1 bg-stone-200 text-stone-800 rounded font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleControlledDeleteArticle(art.id)}
                            className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-semibold cursor-pointer"
                          >
                            Archive &amp; Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: PRIVATE ADVERTISEMENT MANAGEMENT */}
        {section === 'ADVERTISEMENTS' && (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
              Private Advertisement Approvals &amp; Placements (Max 2 Images Enforced)
            </h2>
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="p-4 border border-stone-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-stone-500 tabular-nums">
                      <span>Ad #{ad.id}</span>
                      <span className="mx-1.5">·</span>
                      <span>Placement: {ad.placement}</span>
                      <span className="mx-1.5">·</span>
                      <span>Valid: {ad.start_date} to {ad.end_date}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-bold text-stone-900">Status: {ad.status}</span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900">{ad.title}</h3>
                    <p className="text-xs text-stone-600">
                      Advertiser: <strong>{ad.advertiser_name}</strong> ({ad.contact_mobile}) • Location: {ad.district_name_te || ad.state_name_te}
                    </p>
                    <p className="text-xs text-stone-600">{ad.description}</p>
                    {ad.images && ad.images.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {ad.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-24 h-16 object-cover rounded border border-stone-300" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateAdStatus(ad.id, 'ACTIVE')}
                      className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Approve &amp; Activate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAdStatus(ad.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAdStatus(ad.id, 'EXPIRED')}
                      className="px-3 py-1.5 bg-stone-200 text-stone-800 text-xs font-semibold rounded-md cursor-pointer"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: INDIA LOCATION MANAGEMENT (LGD HIERARCHY) */}
        {section === 'LOCATIONS' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">
                    India Hierarchical Location Database (28 States + 8 UTs → District → Mandal/Tehsil/Taluk/Block → Village)
                  </h2>
                  <p className="text-xs text-stone-500">
                    Official LGD verified hierarchy with foreign-key dependency checks before deletion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportLocationsCsv}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Locations CSV</span>
                </button>
              </div>

              <form onSubmit={handleAddLocation} className="p-4 bg-stone-50 border border-stone-200 rounded-xl mb-6 space-y-3">
                <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">Add New Location Record</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Hierarchy Level</label>
                    <select
                      value={locType}
                      onChange={(e) => setLocType(e.target.value as 'state' | 'district' | 'mandal' | 'village')}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                    >
                      <option value="state">State / Union Territory</option>
                      <option value="district">District (జిల్లా)</option>
                      <option value="mandal">Mandal / Tehsil / Taluk / Block</option>
                      <option value="village">Village / Town (గ్రామం)</option>
                    </select>
                  </div>

                  {locType !== 'state' && (
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Parent State</label>
                      <select
                        value={locParentStateId}
                        onChange={(e) => setLocParentStateId(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name_te} ({s.name_en})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(locType === 'mandal' || locType === 'village') && (
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Parent District</label>
                      <select
                        value={locParentDistrictId}
                        onChange={(e) => setLocParentDistrictId(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        {districts
                          .filter((d) => d.state_id === Number(locParentStateId))
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name_te} ({d.name_en})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {locType === 'village' && (
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Parent Mandal</label>
                      <select
                        value={locParentMandalId}
                        onChange={(e) => setLocParentMandalId(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        {mandals
                          .filter((m) => m.district_id === Number(locParentDistrictId))
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name_te} ({m.name_en})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Name in Telugu *</label>
                    <input
                      type="text"
                      required
                      value={locNameTe}
                      onChange={(e) => setLocNameTe(e.target.value)}
                      placeholder="తెలుగు పేరు"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Name in English *</label>
                    <input
                      type="text"
                      required
                      value={locNameEn}
                      onChange={(e) => setLocNameEn(e.target.value)}
                      placeholder="English Name"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                    />
                  </div>
                  {(locType === 'state' || locType === 'mandal') && (
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Administrative Term</label>
                      <select
                        value={locAdminTerm}
                        onChange={(e) =>
                          setLocAdminTerm(e.target.value as 'Mandal' | 'Tehsil' | 'Taluk' | 'Block' | 'Subdistrict')
                        }
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      >
                        <option value="Mandal">Mandal</option>
                        <option value="Tehsil">Tehsil</option>
                        <option value="Taluk">Taluk</option>
                        <option value="Block">Block</option>
                        <option value="Subdistrict">Subdistrict</option>
                      </select>
                    </div>
                  )}
                  {locType === 'village' && (
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={locPinCode}
                        onChange={(e) => setLocPinCode(e.target.value)}
                        placeholder="500082"
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded bg-white"
                      />
                    </div>
                  )}
                </div>
                <button type="submit" className="px-4 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer">
                  + Save Location to LGD Hierarchy
                </button>
              </form>

              {/* Official Telangana (33/594) & Andhra Pradesh (28/688) Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 tabular-nums">
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                  <div className="text-xs font-bold text-[#991B1B] uppercase">తెలంగాణ (TELANGANA STATE - LGD 36)</div>
                  <div className="text-lg font-extrabold text-stone-900 mt-1">
                    జిల్లాలు: {districts.filter((d) => d.state_id === 1).length} • మండలాలు:{' '}
                    {mandals.filter((m) => districts.some((d) => d.id === m.district_id && d.state_id === 1)).length}
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    ఆదిలాబాద్ నుండి యాదాద్రి భువనగిరి వరకు మొత్తం 33 జిల్లాలు మరియు 594 మండలాలు పూర్తి స్థాయిలో అప్‌డేట్ చేయబడ్డాయి.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                  <div className="text-xs font-bold text-[#1E3A8A] uppercase">ఆంధ్ర ప్రదేశ్ (ANDHRA PRADESH - LGD 28)</div>
                  <div className="text-lg font-extrabold text-stone-900 mt-1">
                    జిల్లాలు: {districts.filter((d) => d.state_id === 2).length} • మండలాలు:{' '}
                    {mandals.filter((m) => districts.some((d) => d.id === m.district_id && d.state_id === 2)).length}
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    2025 డిసెంబరులో కొత్తగా ఏర్పాటైన <strong>పోలవరం (Polavaram)</strong> మరియు <strong>మార్కాపురం (Markapuram)</strong> జిల్లాలతో కలిపి 28 జిల్లాలు, 688 మండలాలు అప్‌డేట్ చేయబడ్డాయి.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-stone-700 uppercase mb-2">
                    All 28 States &amp; 8 Union Territories ({states.length})
                  </h3>
                  <div className="max-h-80 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 text-xs">
                    {states.map((s) => (
                      <div key={s.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900">{s.name_te}</span> ({s.name_en}) •{' '}
                          <span className="text-stone-500">Term: {s.subdistrict_term}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation('state', s.id)}
                          className="text-red-700 hover:underline text-[11px]"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-stone-700 uppercase mb-2">
                    Districts ({districts.length} Total: 33 TS + 28 AP + 13 Other)
                  </h3>
                  <div className="max-h-80 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 text-xs tabular-nums">
                    {districts.map((d) => {
                      const dMandalCount = mandals.filter((m) => m.district_id === d.id).length;
                      return (
                        <div key={d.id} className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-stone-900">{d.name_te}</span> ({d.name_en}) •{' '}
                            <span className="text-stone-500">{dMandalCount} మండలాలు</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteLocation('district', d.id)}
                            className="text-red-700 hover:underline text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-stone-700 uppercase mb-2">
                    Mandals / Tehsils / Taluks ({mandals.length} Total: 594 TS + 688 AP)
                  </h3>
                  <div className="max-h-80 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 text-xs">
                    {mandals.map((m) => (
                      <div key={m.id} className="p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900">{m.name_te}</span> ({m.name_en}) •{' '}
                          <span className="text-stone-500">{m.admin_term}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation('mandal', m.id)}
                          className="text-red-700 hover:underline text-[11px]"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: CATEGORY MANAGEMENT (32+ TELUGU CATEGORIES) */}
        {section === 'CATEGORIES' && (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 mb-4">
              Editable Telugu News Categories ({categories.length})
            </h2>

            <form onSubmit={handleAddCategory} className="flex flex-wrap gap-3 mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <input
                type="text"
                required
                value={newCatTe}
                onChange={(e) => setNewCatTe(e.target.value)}
                placeholder="Category Name in Telugu (ఉదా: క్రీడలు)"
                className="flex-1 min-w-[180px] px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              />
              <input
                type="text"
                required
                value={newCatEn}
                onChange={(e) => setNewCatEn(e.target.value)}
                placeholder="Category Name in English"
                className="flex-1 min-w-[180px] px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              />
              <input
                type="number"
                value={newCatOrder}
                onChange={(e) => setNewCatOrder(Number(e.target.value))}
                placeholder="Order"
                className="w-24 px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
              />
              <button type="submit" className="px-4 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer">
                + Add Category
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 tabular-nums">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 border border-stone-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs text-stone-400">Order #{cat.display_order}</div>
                    <div className="text-sm font-bold text-stone-900">{cat.name_te}</div>
                    <div className="text-xs text-stone-500">{cat.name_en}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/admin/categories/${cat.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-nb-session': sessionToken,
                          },
                          body: JSON.stringify({ is_active: cat.is_active ? 0 : 1 }),
                        });
                        onRefreshPublicData();
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                        cat.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: WEBSITE & BRANDING MANAGEMENT */}
        {section === 'WEBSITE_SETTINGS' && (
          <form onSubmit={handleSaveWebsiteSettings} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3">
              Website Title, Logo, Colors, Breaking Ticker, Contact &amp; Legal Pages Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Website Title</label>
                <input
                  type="text"
                  value={siteSettingsForm.site_title || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, site_title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Telugu Masthead Tagline</label>
                <input
                  type="text"
                  value={siteSettingsForm.site_tagline || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, site_tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={siteSettingsForm.contact_email || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contact_email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Official Location</label>
                <input
                  type="text"
                  value={siteSettingsForm.contact_location || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, contact_location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Top Breaking News Ticker Text</label>
                <textarea
                  rows={2}
                  value={siteSettingsForm.breaking_ticker_text || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, breaking_ticker_text: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">About Us Content</label>
                <textarea
                  rows={3}
                  value={siteSettingsForm.about_us_content || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, about_us_content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Privacy Policy Content</label>
                <textarea
                  rows={3}
                  value={siteSettingsForm.privacy_policy_content || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, privacy_policy_content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Terms &amp; Conditions Content</label>
                <textarea
                  rows={3}
                  value={siteSettingsForm.terms_conditions_content || ''}
                  onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, terms_conditions_content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
            </div>

            <button type="submit" className="px-6 py-2.5 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer">
              Save All Website &amp; Content Settings
            </button>
          </form>
        )}

        {/* SECTION 8: GOOGLE ADSENSE SETTINGS */}
        {section === 'ADSENSE' && (
          <form onSubmit={handleSaveAdSense} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5 max-w-3xl">
            <div className="border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-900">Admin-Only Google AdSense Configuration</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Stored securely on the backend. Supports Google AdSense publisher ID and granular placement slots.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm font-bold text-stone-900 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(adsense.enabled)}
                onChange={(e) => setAdsense({ ...adsense, enabled: e.target.checked ? 1 : 0 })}
              />
              <span>Enable Google AdSense Across Public News Pages</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Google AdSense Publisher ID</label>
                <input
                  type="text"
                  value={adsense.publisher_id}
                  onChange={(e) => setAdsense({ ...adsense, publisher_id: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Header Ad Slot ID</label>
                <input
                  type="text"
                  value={adsense.header_slot_id}
                  onChange={(e) => setAdsense({ ...adsense, header_slot_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">News Article Page Ad Slot ID</label>
                <input
                  type="text"
                  value={adsense.news_page_slot_id}
                  onChange={(e) => setAdsense({ ...adsense, news_page_slot_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Sidebar Ad Slot ID</label>
                <input
                  type="text"
                  value={adsense.sidebar_slot_id}
                  onChange={(e) => setAdsense({ ...adsense, sidebar_slot_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Between-Articles Ad Slot ID</label>
                <input
                  type="text"
                  value={adsense.between_articles_slot_id}
                  onChange={(e) => setAdsense({ ...adsense, between_articles_slot_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Footer Ad Slot ID</label>
                <input
                  type="text"
                  value={adsense.footer_slot_id}
                  onChange={(e) => setAdsense({ ...adsense, footer_slot_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-stone-700">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(adsense.header_enabled)}
                  onChange={(e) => setAdsense({ ...adsense, header_enabled: e.target.checked ? 1 : 0 })}
                />
                <span>Header Placement</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(adsense.sidebar_enabled)}
                  onChange={(e) => setAdsense({ ...adsense, sidebar_enabled: e.target.checked ? 1 : 0 })}
                />
                <span>Sidebar Placement</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(adsense.between_articles_enabled)}
                  onChange={(e) => setAdsense({ ...adsense, between_articles_enabled: e.target.checked ? 1 : 0 })}
                />
                <span>Between Articles</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={Boolean(adsense.mobile_ads_enabled)}
                  onChange={(e) => setAdsense({ ...adsense, mobile_ads_enabled: e.target.checked ? 1 : 0 })}
                />
                <span>Mobile Responsive Ads</span>
              </label>
            </div>

            <button type="submit" className="px-6 py-2.5 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer">
              Save Google AdSense Configuration
            </button>
          </form>
        )}

        {/* SECTION 9: SECURITY, AUDIT LOGS & BACKUP MANAGEMENT */}
        {section === 'SECURITY_BACKUPS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin Password Change */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/security/password', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-nb-session': sessionToken,
                    },
                    body: JSON.stringify({
                      current_password: adminCurrentPw,
                      new_password: adminNewPw,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setToast({ type: 'ok', text: 'Super Admin password updated successfully.' });
                    setAdminCurrentPw('');
                    setAdminNewPw('');
                  } else {
                    setToast({ type: 'err', text: data.error || 'Password update failed.' });
                  }
                }}
                className="bg-white border border-stone-200 rounded-xl p-6 space-y-4"
              >
                <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
                  Change Super Admin Password
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={adminCurrentPw}
                    onChange={(e) => setAdminCurrentPw(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">New Strong Password (Min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminNewPw}
                    onChange={(e) => setAdminNewPw(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
                  />
                </div>
                <button type="submit" className="px-5 py-2 bg-[#991B1B] text-white text-xs font-bold rounded-lg cursor-pointer">
                  Update Admin Password
                </button>
              </form>

              {/* Database Backup & BigRock Deployment Download */}
              <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
                  Database Backups &amp; BigRock Deployment Suite
                </h2>
                <p className="text-xs text-stone-600">
                  Backups are stored outside the public web root in <code>private/backups/</code> and never exposed publicly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCreateBackup}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate &amp; Download Database Backup</span>
                  </button>
                  <a
                    href="/api/download/deployment-package"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-lg"
                  >
                    <FolderGit2 className="w-4 h-4" />
                    <span>Download BigRock PHP + MySQL Package (.ZIP)</span>
                  </a>
                </div>
                <div className="pt-2">
                  <div className="text-xs font-bold text-stone-700 mb-2">Stored Private Backups ({backups.length})</div>
                  <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 text-xs tabular-nums">
                    {backups.map((b) => (
                      <div key={b.filename} className="py-1.5 flex justify-between">
                        <span className="font-mono truncate">{b.filename}</span>
                        <span className="text-stone-500">{Math.round(b.size_bytes / 1024)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Login History & Activity Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 tabular-nums">
              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2 mb-3">
                  Login &amp; Failed Attempt Security Logs
                </h3>
                <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 text-xs">
                  {loginLogs.map((l, idx) => (
                    <div key={idx} className="py-2 flex justify-between gap-2">
                      <div>
                        <span className="font-bold">{String(l.user_role)}</span>: {String(l.user_identifier)} ({String(l.ip_address)})
                      </div>
                      <span className={l.status === 'SUCCESS' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                        {String(l.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2 mb-3">
                  System &amp; Editorial Activity Audit Trail
                </h3>
                <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 text-xs">
                  {activityLogs.map((a, idx) => (
                    <div key={idx} className="py-2">
                      <div className="font-semibold text-stone-900">
                        [{String(a.actor_role)}] {String(a.action_type)}
                      </div>
                      <div className="text-stone-500">{String(a.details)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
