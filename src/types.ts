export type UserRole = 'PUBLIC' | 'REPORTER' | 'SUPER_ADMIN';

export type PublicPageView =
  | 'HOME'
  | 'LATEST_NEWS'
  | 'BREAKING_NEWS'
  | 'NATIONAL_NEWS'
  | 'STATE_NEWS'
  | 'TELANGANA_NEWS'
  | 'ANDHRA_PRADESH_NEWS'
  | 'DISTRICT_NEWS'
  | 'MANDAL_NEWS'
  | 'CATEGORY_PAGE'
  | 'ARTICLE_DETAIL'
  | 'SEARCH_RESULTS'
  | 'REPORTER_REGISTER'
  | 'REPORTER_LOGIN'
  | 'REPORTER_PUBLIC_PROFILE'
  | 'ABOUT_US'
  | 'CONTACT_US'
  | 'PRIVACY_POLICY'
  | 'TERMS_CONDITIONS'
  | 'ADVERTISEMENT_INFO'
  | 'REPORTER_DASHBOARD'
  | 'ADMIN_DASHBOARD'
  | 'BIGROCK_AUDIT_CENTER';

export interface StateItem {
  id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
  state_type: 'STATE' | 'UT';
  subdistrict_term: 'Mandal' | 'Tehsil' | 'Taluk' | 'Block' | 'Subdistrict';
  is_active: number;
}

export interface DistrictItem {
  id: number;
  state_id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
  is_active: number;
}

export interface MandalItem {
  id: number;
  district_id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
  admin_term: 'Mandal' | 'Tehsil' | 'Taluk' | 'Block' | 'Subdistrict';
  is_active: number;
}

export interface VillageItem {
  id: number;
  mandal_id: number;
  lgd_code?: string;
  name_en: string;
  name_te: string;
  locality_type: 'Village' | 'Town' | 'Municipality' | 'Ward';
  pin_code: string;
  is_active: number;
}

export interface NewsCategory {
  id: number;
  name_te: string;
  name_en: string;
  slug: string;
  display_order: number;
  is_active: number;
}

export interface SupportingImage {
  id?: number;
  image_path: string;
  caption: string;
  alt_text: string;
}

export interface NewsArticle {
  id: number;
  headline: string;
  telugu_title: string;
  slug: string;
  short_description: string;
  full_content: string;
  main_image: string;
  image_caption: string;
  image_alt_text: string;
  category_id: number;
  category_name_te?: string;
  category_name_en?: string;
  category_slug?: string;
  state_id: number;
  state_name_te?: string;
  state_name_en?: string;
  district_id?: number | null;
  district_name_te?: string;
  district_name_en?: string;
  mandal_id?: number | null;
  mandal_name_te?: string;
  mandal_name_en?: string;
  village_id?: number | null;
  village_name?: string;
  reporter_id?: number | null;
  reporter_name: string;
  reporter_unique_id: string;
  news_date: string;
  seo_title: string;
  seo_description: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  rejection_reason?: string | null;
  is_breaking: number;
  is_featured: number;
  allow_reporter_edit: number;
  views_count: number;
  published_at?: string | null;
  supporting_images?: SupportingImage[];
}

export interface AdvertisementItem {
  id: number;
  title: string;
  advertiser_name: string;
  contact_mobile: string;
  contact_email?: string;
  description: string;
  state_id: number;
  state_name_te?: string;
  district_id?: number | null;
  district_name_te?: string;
  mandal_id?: number | null;
  mandal_name_te?: string;
  start_date: string;
  end_date: string;
  placement: 'HEADER' | 'SIDEBAR' | 'BETWEEN_ARTICLES' | 'ARTICLE_PAGE' | 'FOOTER';
  reporter_id?: number | null;
  reporter_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'EXPIRED';
  rejection_reason?: string | null;
  images: string[];
  created_at: string;
}

export interface ReporterProfile {
  id: number;
  unique_reporter_id: string | null;
  registration_number: string;
  username: string;
  full_name: string;
  father_name: string;
  dob: string;
  gender: string;
  mobile: string;
  whatsapp: string;
  email: string;
  residential_address: string;
  state_id: number;
  state_name_te?: string;
  state_name_en?: string;
  district_id: number;
  district_name_te?: string;
  district_name_en?: string;
  mandal_id: number;
  mandal_name_te?: string;
  mandal_name_en?: string;
  village_id?: number | null;
  village_name: string;
  pin_code: string;
  experience_years: string;
  previous_media_org?: string;
  designation: string;
  preferred_categories?: string;
  profile_photo_path: string;
  account_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'EXPIRED';
  rejection_reason?: string | null;
  approval_date?: string | null;
  expiry_date?: string | null;
  renewal_date?: string | null;
  can_edit_published: number;
  document_type?: string;
  masked_document_ref?: string;
  sha256_checksum?: string;
  created_at: string;
}

export interface AdSenseSettings {
  enabled: number;
  publisher_id: string;
  header_slot_id: string;
  news_page_slot_id: string;
  sidebar_slot_id: string;
  between_articles_slot_id: string;
  footer_slot_id: string;
  header_enabled: number;
  news_page_enabled: number;
  sidebar_enabled: number;
  between_articles_enabled: number;
  footer_enabled: number;
  mobile_ads_enabled: number;
}
