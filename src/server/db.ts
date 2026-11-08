import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { LGD_DISTRICTS, LGD_MANDALS, LGD_STATES, LGD_VILLAGES } from './lgdLocations';

const PRIVATE_DIR = path.resolve(process.cwd(), 'private');
const DB_DIR = path.join(PRIVATE_DIR, 'database');
const DOCS_DIR = path.join(PRIVATE_DIR, 'identity_documents');
const BACKUPS_DIR = path.join(PRIVATE_DIR, 'backups');
const PUBLIC_UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

for (const dir of [PRIVATE_DIR, DB_DIR, DOCS_DIR, BACKUPS_DIR, PUBLIC_UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const DB_PATH = path.join(DB_DIR, 'neti_bharatham.sqlite');
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Secure password hashing (equivalent to PHP password_hash / password_verify)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `$scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith('$scrypt$')) return false;
  const parts = storedHash.split('$');
  const salt = parts[2];
  const hash = parts[3];
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

// Private document encryption key stored in private/config/encryption.key
const KEY_FILE = path.join(PRIVATE_DIR, 'encryption.key');
export function getDocumentEncryptionKey(): Buffer {
  if (!fs.existsSync(KEY_FILE)) {
    const keyHex = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(KEY_FILE, keyHex, { mode: 0o600 });
  }
  const hex = fs.readFileSync(KEY_FILE, 'utf-8').trim();
  return Buffer.from(hex.slice(0, 64), 'hex');
}

export function encryptPrivateDocument(plainTextDataUrl: string): { filename: string; iv: string; sha256: string; size: number } {
  const key = getDocumentEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainTextDataUrl, 'utf8'), cipher.final()]);
  const filename = `nb_id_doc_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.enc`;
  const filePath = path.join(DOCS_DIR, filename);
  fs.writeFileSync(filePath, encrypted, { mode: 0o600 });
  const sha256 = crypto.createHash('sha256').update(plainTextDataUrl).digest('hex');
  return {
    filename,
    iv: iv.toString('hex'),
    sha256,
    size: Buffer.byteLength(plainTextDataUrl, 'utf8'),
  };
}

export function decryptPrivateDocument(filename: string, ivHex: string): string | null {
  const safeName = path.basename(filename);
  const filePath = path.join(DOCS_DIR, safeName);
  if (!fs.existsSync(filePath) || !ivHex) return null;
  try {
    const key = getDocumentEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = fs.readFileSync(filePath);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'Admin',
      must_change_password INTEGER NOT NULL DEFAULT 0,
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      two_factor_secret TEXT DEFAULT NULL,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT DEFAULT NULL,
      last_login_at TEXT DEFAULT NULL,
      last_login_ip TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lgd_code TEXT NOT NULL UNIQUE,
      name_en TEXT NOT NULL,
      name_te TEXT NOT NULL,
      state_type TEXT NOT NULL DEFAULT 'STATE',
      subdistrict_term TEXT NOT NULL DEFAULT 'Mandal',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_id INTEGER NOT NULL,
      lgd_code TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_te TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS mandals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district_id INTEGER NOT NULL,
      lgd_code TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_te TEXT NOT NULL,
      admin_term TEXT NOT NULL DEFAULT 'Mandal',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mandal_id INTEGER NOT NULL,
      lgd_code TEXT DEFAULT NULL,
      name_en TEXT NOT NULL,
      name_te TEXT NOT NULL,
      locality_type TEXT NOT NULL DEFAULT 'Village',
      pin_code TEXT DEFAULT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (mandal_id) REFERENCES mandals(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS reporters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_reporter_id TEXT UNIQUE DEFAULT NULL,
      registration_number TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      father_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      mobile TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL,
      residential_address TEXT NOT NULL,
      state_id INTEGER NOT NULL,
      district_id INTEGER NOT NULL,
      mandal_id INTEGER NOT NULL,
      village_id INTEGER DEFAULT NULL,
      village_name TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      experience_years TEXT NOT NULL,
      previous_media_org TEXT DEFAULT '',
      designation TEXT NOT NULL DEFAULT 'Mandal Reporter',
      preferred_categories TEXT DEFAULT '[]',
      profile_photo_path TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT DEFAULT NULL,
      approval_date TEXT DEFAULT NULL,
      expiry_date TEXT DEFAULT NULL,
      renewal_date TEXT DEFAULT NULL,
      approved_by_admin_id INTEGER DEFAULT NULL,
      can_edit_published INTEGER NOT NULL DEFAULT 0,
      consent_accepted INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE RESTRICT,
      FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT,
      FOREIGN KEY (mandal_id) REFERENCES mandals(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS reporter_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      document_type TEXT NOT NULL,
      masked_document_ref TEXT NOT NULL,
      private_storage_filename TEXT NOT NULL,
      original_mime_type TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      sha256_checksum TEXT NOT NULL,
      encryption_iv TEXT DEFAULT NULL,
      consent_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      verified_by_admin_id INTEGER DEFAULT NULL,
      verified_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reporter_id_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      card_number TEXT NOT NULL UNIQUE,
      unique_reporter_id TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      verification_token TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reporter_renewals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      admin_id INTEGER DEFAULT NULL,
      previous_expiry_date TEXT DEFAULT NULL,
      new_expiry_date TEXT NOT NULL,
      renewal_date TEXT NOT NULL,
      validity_months INTEGER NOT NULL DEFAULT 6,
      remarks TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reporter_id) REFERENCES reporters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS news_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_te TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headline TEXT NOT NULL,
      telugu_title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL,
      full_content TEXT NOT NULL,
      main_image TEXT NOT NULL,
      image_caption TEXT DEFAULT '',
      image_alt_text TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      state_id INTEGER NOT NULL,
      district_id INTEGER DEFAULT NULL,
      mandal_id INTEGER DEFAULT NULL,
      village_id INTEGER DEFAULT NULL,
      village_name TEXT DEFAULT '',
      reporter_id INTEGER DEFAULT NULL,
      reporter_name TEXT NOT NULL,
      reporter_unique_id TEXT NOT NULL,
      news_date TEXT NOT NULL,
      seo_title TEXT DEFAULT '',
      seo_description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT DEFAULT NULL,
      is_breaking INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      allow_reporter_edit INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      published_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE RESTRICT,
      FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS news_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      caption TEXT DEFAULT '',
      alt_text TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS advertisements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      advertiser_name TEXT NOT NULL,
      contact_mobile TEXT NOT NULL,
      contact_email TEXT DEFAULT '',
      description TEXT NOT NULL,
      state_id INTEGER NOT NULL,
      district_id INTEGER DEFAULT NULL,
      mandal_id INTEGER DEFAULT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      placement TEXT NOT NULL DEFAULT 'SIDEBAR',
      reporter_id INTEGER DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT DEFAULT NULL,
      impressions_count INTEGER NOT NULL DEFAULT 0,
      clicks_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS advertisement_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      advertisement_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      image_slot INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (advertisement_id, image_slot),
      FOREIGN KEY (advertisement_id) REFERENCES advertisements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS website_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT DEFAULT '',
      setting_group TEXT NOT NULL DEFAULT 'general',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS adsense_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enabled INTEGER NOT NULL DEFAULT 0,
      publisher_id TEXT DEFAULT '',
      header_slot_id TEXT DEFAULT '',
      news_page_slot_id TEXT DEFAULT '',
      sidebar_slot_id TEXT DEFAULT '',
      between_articles_slot_id TEXT DEFAULT '',
      footer_slot_id TEXT DEFAULT '',
      header_enabled INTEGER NOT NULL DEFAULT 1,
      news_page_enabled INTEGER NOT NULL DEFAULT 1,
      sidebar_enabled INTEGER NOT NULL DEFAULT 1,
      between_articles_enabled INTEGER NOT NULL DEFAULT 1,
      footer_enabled INTEGER NOT NULL DEFAULT 1,
      mobile_ads_enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_location TEXT NOT NULL DEFAULT 'HEADER',
      label_te TEXT NOT NULL,
      label_en TEXT NOT NULL,
      target_route TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT DEFAULT '',
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'UNREAD',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient_role TEXT NOT NULL,
      recipient_id INTEGER DEFAULT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_role TEXT NOT NULL,
      user_identifier TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT DEFAULT '',
      status TEXT NOT NULL,
      failure_reason TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_role TEXT NOT NULL,
      actor_id INTEGER DEFAULT NULL,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT DEFAULT NULL,
      details TEXT DEFAULT '',
      ip_address TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_role TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed & Sync All Hierarchical States, 33 TS Districts (594 Mandals), 28 AP Districts including Polavaram & Markapuram (688 Mandals)
  const upsertState = db.prepare(`
    INSERT INTO states (id, lgd_code, name_en, name_te, state_type, subdistrict_term, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      lgd_code = excluded.lgd_code,
      name_en = excluded.name_en,
      name_te = excluded.name_te,
      state_type = excluded.state_type,
      subdistrict_term = excluded.subdistrict_term
  `);
  const upsertDist = db.prepare(`
    INSERT INTO districts (id, state_id, lgd_code, name_en, name_te, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      state_id = excluded.state_id,
      lgd_code = excluded.lgd_code,
      name_en = excluded.name_en,
      name_te = excluded.name_te
  `);
  const upsertMandal = db.prepare(`
    INSERT INTO mandals (id, district_id, lgd_code, name_en, name_te, admin_term, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      district_id = excluded.district_id,
      lgd_code = excluded.lgd_code,
      name_en = excluded.name_en,
      name_te = excluded.name_te,
      admin_term = excluded.admin_term
  `);
  const upsertVillage = db.prepare(`
    INSERT INTO villages (id, mandal_id, lgd_code, name_en, name_te, locality_type, pin_code, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      mandal_id = excluded.mandal_id,
      lgd_code = excluded.lgd_code,
      name_en = excluded.name_en,
      name_te = excluded.name_te,
      locality_type = excluded.locality_type,
      pin_code = excluded.pin_code
  `);

  const currentMandalsCount = (db.prepare('SELECT COUNT(*) as c FROM mandals').get() as { c: number }).c;
  if (currentMandalsCount < LGD_MANDALS.length) {
    const seedLocTx = db.transaction(() => {
      for (const s of LGD_STATES) {
        upsertState.run(s.id, s.lgd_code, s.name_en, s.name_te, s.state_type, s.subdistrict_term);
      }
      for (const d of LGD_DISTRICTS) {
        upsertDist.run(d.id, d.state_id, d.lgd_code, d.name_en, d.name_te);
      }
      for (const m of LGD_MANDALS) {
        upsertMandal.run(m.id, m.district_id, m.lgd_code, m.name_en, m.name_te, m.admin_term);
      }
      for (const v of LGD_VILLAGES) {
        upsertVillage.run(v.id, v.mandal_id, v.lgd_code, v.name_en, v.name_te, v.locality_type, v.pin_code);
      }
    });
    seedLocTx();
  }

  // Seed all 32 default Telugu News Categories
  const catCount = (db.prepare('SELECT COUNT(*) as c FROM news_categories').get() as { c: number }).c;
  if (catCount === 0) {
    const defaultCats = [
      [1, 'బ్రేకింగ్ న్యూస్', 'Breaking News', 'breaking-news'],
      [2, 'జాతీయ వార్తలు', 'National News', 'national-news'],
      [3, 'రాష్ట్ర వార్తలు', 'State News', 'state-news'],
      [4, 'రాజకీయాలు', 'Politics', 'politics'],
      [5, 'తెలంగాణ', 'Telangana', 'telangana'],
      [6, 'ఆంధ్రప్రదేశ్', 'Andhra Pradesh', 'andhra-pradesh'],
      [7, 'జిల్లా వార్తలు', 'District News', 'district-news'],
      [8, 'మండల వార్తలు', 'Mandal News', 'mandal-news'],
      [9, 'గ్రామీణ వార్తలు', 'Rural News', 'rural-news'],
      [10, 'విద్య', 'Education', 'education'],
      [11, 'ఉద్యోగాలు', 'Jobs & Employment', 'jobs'],
      [12, 'వ్యవసాయం', 'Agriculture', 'agriculture'],
      [13, 'రైతులు', 'Farmers', 'farmers'],
      [14, 'ఆరోగ్యం', 'Health', 'health'],
      [15, 'వైద్యం', 'Medicine', 'medicine'],
      [16, 'వ్యాపారం', 'Business', 'business'],
      [17, 'పరిశ్రమలు', 'Industries', 'industries'],
      [18, 'క్రైమ్', 'Crime', 'crime'],
      [19, 'న్యాయ వార్తలు', 'Legal & Courts', 'legal-news'],
      [20, 'పోలీస్', 'Police', 'police'],
      [21, 'రోడ్లు మరియు రవాణా', 'Roads & Transport', 'roads-transport'],
      [22, 'మహిళలు', 'Women', 'women'],
      [23, 'యువత', 'Youth', 'youth'],
      [24, 'క్రీడలు', 'Sports', 'sports'],
      [25, 'సినిమా', 'Cinema', 'cinema'],
      [26, 'వినోదం', 'Entertainment', 'entertainment'],
      [27, 'టెక్నాలజీ', 'Technology', 'technology'],
      [28, 'ఆధ్యాత్మికం', 'Spiritual', 'spiritual'],
      [29, 'ప్రభుత్వ పథకాలు', 'Government Schemes', 'government-schemes'],
      [30, 'స్థానిక కార్యక్రమాలు', 'Local Events', 'local-events'],
      [31, 'ప్రత్యేక కథనాలు', 'Special Stories', 'special-stories'],
      [32, 'ఇతర వార్తలు', 'Other News', 'other-news'],
    ] as const;

    const insCat = db.prepare(
      'INSERT INTO news_categories (id, name_te, name_en, slug, display_order, is_active) VALUES (?, ?, ?, ?, ?, 1)'
    );
    const tx = db.transaction(() => {
      for (const [id, te, en, slug] of defaultCats) {
        insCat.run(id, te, en, slug, id);
      }
    });
    tx();
  }

  // Seed Website Settings & AdSense Settings
  const setCount = (db.prepare('SELECT COUNT(*) as c FROM website_settings').get() as { c: number }).c;
  if (setCount === 0) {
    const defaultSettings: Array<[string, string, string]> = [
      ['site_title', 'NETI BHARATHAM – నేటి భారతం', 'general'],
      ['site_tagline', 'నిజం నిప్పులాంటిది – ప్రజా గొంతుక నేటి భారతం', 'general'],
      ['domain_url', 'https://netibhaaratham.com', 'general'],
      ['logo_text_te', 'నేటి భారతం', 'branding'],
      ['logo_text_en', 'NETI BHARATHAM', 'branding'],
      ['logo_image_url', '/icon.svg', 'branding'],
      ['primary_color', '#991B1B', 'appearance'],
      ['secondary_color', '#1E3A8A', 'appearance'],
      ['accent_color', '#0F172A', 'appearance'],
      ['contact_email', 'netibhaarathamtelugu@gmail.com', 'contact'],
      ['contact_location', 'Hyderabad, Telangana, India.', 'contact'],
      ['contact_phone', '+91 98480 24700', 'contact'],
      ['facebook_url', 'https://facebook.com/netibhaaratham', 'social'],
      ['youtube_url', 'https://youtube.com/@netibhaaratham', 'social'],
      ['twitter_url', 'https://x.com/netibhaaratham', 'social'],
      ['whatsapp_channel', 'https://whatsapp.com/channel/netibhaaratham', 'social'],
      [
        'breaking_ticker_text',
        'తెలంగాణ సచివాలయంలో కీలక మంత్రివర్గ సమావేశం: రైతు భరోసా మరియు సాగునీటి ప్రాజెక్టులపై సమీక్ష • అమరావతి రాజధాని మౌలిక సదుపాయాల పనుల్లో వేగం • నేటి భారతం మండల మరియు జిల్లా రిపోర్టర్ల ఆన్‌లైన్ నమోదు ప్రారంభం • అధికారిక ఆండ్రాయిడ్ యాప్ (APK) హోమ్‌పేజీ నుండి డౌన్‌లోడ్ చేసుకోండి',
        'editorial',
      ],
      [
        'about_us_content',
        'నేటి భారతం (NETI BHARATHAM - https://netibhaaratham.com) హైదరాబాద్ కేంద్రంగా పనిచేస్తున్న ప్రముఖ తెలుగు డిజిటల్ వార్తా వేదిక. తెలంగాణ, ఆంధ్రప్రదేశ్ సహా దేశవ్యాప్తంగా గ్రామ, మండల, జిల్లా మరియు రాష్ట్ర స్థాయి వార్తలను నిష్పక్షపాతంగా, వేగంగా ప్రజలకు అందించడమే మా లక్ష్యం.',
        'pages',
      ],
      [
        'privacy_policy_content',
        'నేటి భారతం పోర్టల్‌లో రిపోర్టర్లు మరియు పాఠకుల వ్యక్తిగత గోప్యతకు అత్యంత ప్రాధాన్యత ఇస్తాము. రిపోర్టర్ల గుర్తింపు ధృవీకరణ పత్రాలు AES-256 ఎన్‌క్రిప్షన్‌తో ప్రైవేట్ స్టోరేజ్‌లో భద్రపరచబడతాయి మరియు పబ్లిక్‌గా ఎప్పుడూ ప్రదర్శించబడవు.',
        'pages',
      ],
      [
        'terms_conditions_content',
        'నేటి భారతం డిజిటల్ న్యూస్ పోర్టల్‌లో ప్రచురితమయ్యే వార్తలు, చిత్రాలు మరియు ప్రకటనలు భారతీయ ప్రెస్ మరియు సైబర్ చట్టాలకు లోబడి ఉంటాయి. ఆమోదం పొందిన రిపోర్టర్లు మాత్రమే వార్తలను అప్‌లోడ్ చేయడానికి అర్హులు. రిపోర్టర్ గుర్తింపు కార్డు చెల్లుబాటు 6 నెలలు.',
        'pages',
      ],
      [
        'disclaimer_content',
        'ఈ పోర్టల్‌లో రిపోర్టర్లు సమర్పించే వార్తల యథార్థతను ఎడిటోరియల్ బృందం పరిశీలిస్తుంది. ప్రైవేట్ ప్రకటనలలోని వివరాలకు సంబంధిత ప్రకటనదారులదే పూర్తి బాధ్యత.',
        'pages',
      ],
      [
        'advertisement_info_content',
        'నేటి భారతం పోర్టల్‌లో మీ వ్యాపార, విద్యా, వాణిజ్య ప్రకటనలను రాష్ట్ర, జిల్లా మరియు మండల స్థాయిలో ప్రచురించడానికి మా ఆమోదిత రిపోర్టర్లను లేదా netibhaarathamtelugu@gmail.com ను సంప్రదించండి.',
        'pages',
      ],
      ['apk_version', '2.4.0', 'apk'],
      ['apk_file_size', '4.8 MB', 'apk'],
    ];

    const insSet = db.prepare('INSERT INTO website_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)');
    for (const [k, v, g] of defaultSettings) {
      insSet.run(k, v, g);
    }
  }

  const adsenseCount = (db.prepare('SELECT COUNT(*) as c FROM adsense_settings').get() as { c: number }).c;
  if (adsenseCount === 0) {
    db.prepare(`
      INSERT INTO adsense_settings (
        id, enabled, publisher_id, header_slot_id, news_page_slot_id, sidebar_slot_id,
        between_articles_slot_id, footer_slot_id, header_enabled, news_page_enabled,
        sidebar_enabled, between_articles_enabled, footer_enabled, mobile_ads_enabled
      ) VALUES (1, 0, 'ca-pub-7254419729710000', '101010101', '202020202', '303030303', '404040404', '505050505', 1, 1, 1, 1, 1, 1)
    `).run();
  }

  // Seed Initial Reporters & Published Telugu News Articles if empty
  const repCount = (db.prepare('SELECT COUNT(*) as c FROM reporters').get() as { c: number }).c;
  if (repCount === 0) {
    const nowIso = new Date().toISOString();
    const sixMonthsLaterIso = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

    const insRep = db.prepare(`
      INSERT INTO reporters (
        id, unique_reporter_id, registration_number, username, password_hash, full_name, father_name,
        dob, gender, mobile, whatsapp, email, residential_address, state_id, district_id, mandal_id,
        village_id, village_name, pin_code, experience_years, previous_media_org, designation,
        preferred_categories, profile_photo_path, account_status, approval_date, expiry_date, can_edit_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insRep.run(
      1,
      'NB-TS-2026-0001',
      'NB-REG-2026-10001',
      'ramesh_hyd',
      hashPassword('Reporter@123'),
      'కొప్పుల రమేష్ గౌడ్ (Koppula Ramesh Goud)',
      'కొప్పుల నరసింహ గౌడ్',
      '1988-05-14',
      'Male',
      '9848011223',
      '9848011223',
      'ramesh.reporter@netibhaaratham.com',
      'H.No. 6-3-112, Somajiguda, Khairatabad, Hyderabad, Telangana',
      1,
      101,
      1001,
      5001,
      'Somajiguda',
      '500082',
      '8 Years',
      'Telangana Patrika Daily',
      'Senior State Bureau Reporter',
      JSON.stringify([1, 3, 4, 5]),
      '/src/assets/images/reporter_avatar_telugu_1794106868191.jpg',
      'APPROVED',
      nowIso,
      sixMonthsLaterIso,
      0
    );

    insRep.run(
      2,
      null,
      'NB-REG-2026-10002',
      'srinivas_knr',
      hashPassword('Reporter@123'),
      'చింతల శ్రీనివాస్ రావు (Chintala Srinivas Rao)',
      'చింతల వెంకటేశ్వర రావు',
      '1993-08-22',
      'Male',
      '9440199887',
      '9440199887',
      'srinivas.knr@netibhaaratham.com',
      '4-2-89, Bommakal Road, Karimnagar Urban, Telangana',
      1,
      105,
      1011,
      5008,
      'Bommakal',
      '505001',
      '4 Years',
      'District Cable News',
      'Mandal Reporter',
      JSON.stringify([5, 7, 8, 12]),
      '/src/assets/images/reporter_avatar_telugu_1794106868191.jpg',
      'PENDING',
      null,
      null,
      0
    );

    // Store encrypted verification documents for both reporters
    const doc1 = encryptPrivateDocument('GOVT_VOTER_ID_VERIFIED::EPIC_NO_TS09112288::NAME_KOPPULA_RAMESH_GOUD');
    const doc2 = encryptPrivateDocument('DRIVING_LICENSE_VERIFIED::DL_NO_TS0220190044112::NAME_CHINTALA_SRINIVAS_RAO');

    const insDoc = db.prepare(`
      INSERT INTO reporter_documents (
        reporter_id, document_type, masked_document_ref, private_storage_filename,
        original_mime_type, file_size_bytes, sha256_checksum, encryption_iv
      ) VALUES (?, ?, ?, ?, 'text/plain', ?, ?, ?)
    `);
    insDoc.run(1, 'VOTER_ID', 'EPIC-XXXX-2288', doc1.filename, doc1.size, doc1.sha256, doc1.iv);
    insDoc.run(2, 'DRIVING_LICENSE', 'DL-TS02-XXXX-4112', doc2.filename, doc2.size, doc2.sha256, doc2.iv);

    // Issue ID card for Approved Reporter #1
    db.prepare(`
      INSERT INTO reporter_id_cards (
        reporter_id, card_number, unique_reporter_id, issue_date, expiry_date, verification_token, is_active
      ) VALUES (1, 'NB-ID-202611-0001', 'NB-TS-2026-0001', ?, ?, 'VERIFY-NB-TS-2026-0001', 1)
    `).run(nowIso, sixMonthsLaterIso);

    // Seed Published News Articles
    const insArt = db.prepare(`
      INSERT INTO news_articles (
        headline, telugu_title, slug, short_description, full_content, main_image, image_caption,
        image_alt_text, category_id, state_id, district_id, mandal_id, village_id, village_name,
        reporter_id, reporter_name, reporter_unique_id, news_date, seo_title, seo_description,
        status, is_breaking, is_featured, views_count, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, ?)
    `);

    insArt.run(
      'Telangana Cabinet Reviews Irrigation & Rythu Bharosa Implementation at Secretariat',
      'తెలంగాణ సచివాలయంలో కీలక సమీక్ష: సాగునీటి ప్రాజెక్టులు, రైతు భరోసా అమలుపై ప్రభుత్వ కార్యాచరణ',
      'telangana-secretariat-irrigation-rythu-bharosa-review-2026',
      'హైదరాబాద్‌లోని డాక్టర్ బి.ఆర్. అంబేద్కర్ తెలంగాణ రాష్ట్ర సచివాలయంలో సాగునీటి ప్రాజెక్టుల పురోగతి, ధాన్యం కొనుగోలు కేంద్రాలు మరియు రైతు సంక్షేమ పథకాలపై ఉన్నత స్థాయి సమీక్ష నిర్వహించారు.',
      `<p><strong>హైదరాబాద్, నేటి భారతం స్టేట్ బ్యూరో:</strong> డాక్టర్ బి.ఆర్. అంబేద్కర్ తెలంగాణ రాష్ట్ర సచివాలయంలో రాష్ట్ర ప్రభుత్వం కీలక సమీక్షా సమావేశం నిర్వహించింది. రాష్ట్రంలోని అన్ని జిల్లాల్లో ఖరీఫ్ మరియు యాసంగి సాగునీటి లభ్యత, రిజర్వాయర్లలో నీటి నిల్వలు మరియు రైతులకు సకాలంలో పెట్టుబడి సాయం అందించే అంశాలపై ఉన్నతాధికారులకు స్పష్టమైన ఆదేశాలు జారీ చేశారు.</p>
<h3>ధాన్యం కొనుగోలు కేంద్రాల్లో పారదర్శకత</h3>
<p>మండల స్థాయిలో ఏర్పాటు చేసిన ధాన్యం కొనుగోలు కేంద్రాల వద్ద రైతులకు ఎలాంటి ఇబ్బందులు కలగకుండా తక్షణమే తూకం వేసి, మద్దతు ధరను నేరుగా రైతుల బ్యాంకు ఖాతాల్లో జమ చేయాలని కలెక్టర్లను ఆదేశించారు. గ్రామీణ ప్రాంతాల్లో రవాణా సదుపాయాలను మెరుగుపరచడంతో పాటు వ్యవసాయ మార్కెట్ యార్డుల్లో ఆధునిక మౌలిక వసతులు కల్పించనున్నారు.</p>
<ul>
<li>రాష్ట్రవ్యాప్తంగా 33 జిల్లాల్లో ప్రత్యేక మానిటరింగ్ సెల్స్ ఏర్పాటు.</li>
<li>మండల స్థాయిలో వ్యవసాయ విస్తరణ అధికారుల ద్వారా పంటల నమోదు పరిశీలన.</li>
<li>సాగునీటి కాలువల మరమ్మతులు మరియు చెరువుల పునరుద్ధరణకు ప్రత్యేక నిధుల విడుదల.</li>
</ul>`,
      '/src/assets/images/news_telangana_secretariat_1794106864016.jpg',
      'హైదరాబాద్ హుస్సేన్ సాగర్ తీరాన డా. బి.ఆర్. అంబేద్కర్ తెలంగాణ రాష్ట్ర సచివాలయం',
      'Dr B.R. Ambedkar Telangana State Secretariat Hyderabad',
      5,
      1,
      101,
      1001,
      5001,
      'Somajiguda',
      1,
      'కొప్పుల రమేష్ గౌడ్ (Koppula Ramesh Goud)',
      'NB-TS-2026-0001',
      nowIso,
      'తెలంగాణ సచివాలయంలో కీలక సమీక్ష | NETI BHARATHAM',
      'తెలంగాణ సచివాలయంలో సాగునీటి ప్రాజెక్టులు మరియు రైతు సంక్షేమ పథకాలపై ప్రభుత్వ సమీక్ష.',
      1,
      1,
      1420,
      nowIso
    );

    insArt.run(
      'Amaravati Core Infrastructure & National Highway Connectivity Works Accelerated in AP',
      'ఆంధ్రప్రదేశ్ రాజధాని అమరావతి మౌలిక సదుపాయాలు మరియు జాతీయ రహదారుల నిర్మాణంలో వేగం',
      'andhra-pradesh-amaravati-highway-infrastructure-progress',
      'గుంటూరు మరియు ఎన్టీఆర్ జిల్లాల పరిధిలో అమరావతి అనుసంధాన రహదారులు, ఫ్లైఓవర్లు మరియు పరిపాలనా భవనాల నిర్మాణ పనులను ఇంజనీరింగ్ అధికారులు క్షేత్రస్థాయిలో పరిశీలించారు.',
      `<p><strong>అమరావతి / విజయవాడ, నేటి భారతం ప్రతినిధి:</strong> ఆంధ్రప్రదేశ్ రాజధాని అమరావతి పరిధిలోని తుళ్ళూరు, మంగళగిరి మరియు విజయవాడ అనుసంధాన జాతీయ రహదారుల విస్తరణ పనులు వేగవంతమయ్యాయి. అత్యాధునిక ఇంజనీరింగ్ ప్రమాణాలతో నిర్మిస్తున్న ఆరు వరుసల ఎలివేటెడ్ కారిడార్ మరియు వంతెనల పనులను ఉన్నతాధికారులు తనిఖీ చేశారు.</p>
<h3>నిర్ణీత గడువులోగా ప్రాజెక్టుల పూర్తి</h3>
<p>రాష్ట్రంలోని ప్రధాన ఓడరేవులు, పారిశ్రామిక కారిడార్లు మరియు జిల్లా కేంద్రాలను కలుపుతూ రవాణా వ్యవస్థను బలోపేతం చేస్తున్నారు. ప్రతి వారం ప్రగతి నివేదికలను సమీక్షిస్తూ నాణ్యతా ప్రమాణాల్లో రాజీ పడకుండా పనులు పూర్తి చేయాలని ఆదేశించారు.</p>`,
      '/src/assets/images/news_amaravati_development_1794106865134.jpg',
      'ఆంధ్రప్రదేశ్‌లో జాతీయ రహదారి ఫ్లైఓవర్ నిర్మాణ పనులను పరిశీలిస్తున్న ఇంజనీర్లు',
      'Andhra Pradesh highway flyover construction inspection',
      6,
      2,
      203,
      2005,
      5012,
      'Velagapudi',
      1,
      'కొప్పుల రమేష్ గౌడ్ (Koppula Ramesh Goud)',
      'NB-TS-2026-0001',
      nowIso,
      'అమరావతి మౌలిక సదుపాయాల నిర్మాణంలో వేగం | నేటి భారతం',
      'ఆంధ్రప్రదేశ్ రాజధాని అమరావతి రహదారులు మరియు ఫ్లైఓవర్ల నిర్మాణ పురోగతి.',
      1,
      1,
      980,
      nowIso
    );

    insArt.run(
      'Bumper Paddy Cultivation Across Karimnagar, Warangal and Godavari Delta Mandals',
      'తెలుగు రాష్ట్రాల్లో కళకళలాడుతున్న వరి పొలాలు: ఆధునిక సాగు పద్ధతులతో అధిక దిగుబడి',
      'telugu-states-paddy-cultivation-farmers-irrigation-report',
      'కరీంనగర్, వరంగల్, నల్లగొండ మరియు ఉభయ గోదావరి జిల్లాల్లోని మండలాల్లో కాలువల ద్వారా సాగునీరు సమృద్ధిగా అందడంతో వరి పంట ఏపుగా పెరిగి రైతుల్లో ఆనందం నింపింది.',
      `<p><strong>కరీంనగర్ / ఏలూరు, నేటి భారతం డెస్క్:</strong> తెలుగు రాష్ట్రాల్లోని గ్రామీణ మండలాల్లో ఈ సీజన్‌లో వరి సాగు విస్తీర్ణం గణనీయంగా పెరిగింది. ప్రధాన రిజర్వాయర్ల నుండి కాలువల ద్వారా చివరి ఆయకట్టు వరకు సాగునీరు చేరడంతో పంటలు పచ్చదనంతో కళకళలాడుతున్నాయి.</p>
<p>వ్యవసాయ శాస్త్రవేత్తల సూచనల మేరకు రైతులు సమగ్ర సస్యరక్షణ చర్యలు చేపట్టడం వల్ల చీడపీడల బెడద తగ్గి ఎకరాకు దిగుబడి పెరిగే అవకాశం ఉందని అధికారులు తెలిపారు.</p>`,
      '/src/assets/images/news_telugu_agriculture_1794106866412.jpg',
      'సాగునీటి కాలువ పక్కన వరి పైరును పరిశీలిస్తున్న రైతులు',
      'Farmers inspecting green paddy fields in South India',
      12,
      1,
      105,
      1011,
      5008,
      'Bommakal',
      1,
      'కొప్పుల రమేష్ గౌడ్ (Koppula Ramesh Goud)',
      'NB-TS-2026-0001',
      nowIso,
      'తెలుగు రాష్ట్రాల్లో వరి సాగు మరియు రైతుల ప్రగతి | నేటి భారతం',
      'గ్రామీణ మండలాల్లో సాగునీటి లభ్యత మరియు వరి సాగు విస్తీర్ణంపై ప్రత్యేక కథనం.',
      0,
      1,
      765,
      nowIso
    );

    insArt.run(
      'Hyderabad HITEC City & Madhapur IT Corridor Records New Software Export Milestone',
      'హైదరాబాద్ ఐటీ కారిడార్‌లో కొత్త ఉద్యోగాల వెల్లువ: గ్లోబల్ టెక్నాలజీ కేంద్రంగా మాదాపూర్, గచ్చిబౌలి',
      'hyderabad-hitec-city-it-corridor-jobs-technology-growth',
      'రంగారెడ్డి జిల్లా శేరిలింగంపల్లి మండలం మాదాపూర్ మరియు గచ్చిబౌలి ఐటీ కారిడార్లలో నూతన ఏఐ మరియు సాఫ్ట్‌వేర్ డెవలప్‌మెంట్ సెంటర్ల విస్తరణతో యువతకు భారీగా ఉద్యోగ అవకాశాలు లభిస్తున్నాయి.',
      `<p><strong>మాదాపూర్ (హైదరాబాద్), నేటి భారతం టెక్నాలజీ డెస్క్:</strong> హైదరాబాద్ ఐటీ కారిడార్ పరిధిలోని సైబర్ టవర్స్, మాదాపూర్ మరియు ఫైనాన్షియల్ డిస్ట్రిక్ట్ ప్రాంతాల్లో జాతీయ, అంతర్జాతీయ సాఫ్ట్‌వేర్ సంస్థలు తమ కార్యకలాపాలను విస్తరించాయి. ఇంజనీరింగ్ పూర్తి చేసిన గ్రామీణ మరియు పట్టణ యువతకు నైపుణ్య శిక్షణతో కూడిన ఉపాధి అవకాశాలు పెరుగుతున్నాయి.</p>`,
      '/src/assets/images/news_hyderabad_it_corridor_1794106867173.jpg',
      'హైదరాబాద్ హైటెక్ సిటీ సైబర్ టవర్స్ మరియు ఐటీ కారిడార్ దృశ్యం',
      'Hyderabad HITEC City Cyber Towers IT corridor',
      27,
      1,
      102,
      1005,
      5004,
      'Madhapur',
      1,
      'కొప్పుల రమేష్ గౌడ్ (Koppula Ramesh Goud)',
      'NB-TS-2026-0001',
      nowIso,
      'హైదరాబాద్ ఐటీ కారిడార్‌లో ఉద్యోగాల వెల్లువ | నేటి భారతం',
      'మాదాపూర్ మరియు గచ్చిబౌలి ఐటీ కారిడార్లలో సాఫ్ట్‌వేర్ రంగ పురోగతి.',
      1,
      0,
      890,
      nowIso
    );

    // Seed 1 Active Approved Private Advertisement + 1 Pending Private Advertisement
    const insAd = db.prepare(`
      INSERT INTO advertisements (
        id, title, advertiser_name, contact_mobile, contact_email, description,
        state_id, district_id, mandal_id, start_date, end_date, placement, reporter_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insAd.run(
      1,
      'కాకతీయ అకాడమీ – గ్రూప్స్ & పోలీస్ ఉద్యోగాల ప్రత్యేక కోచింగ్ బ్యాచ్‌లు',
      'కాకతీయ ఎడ్యుకేషనల్ ఇన్‌స్టిట్యూట్, హైదరాబాద్ & వరంగల్',
      '9848055667',
      'admissions@kakatiyaacademy.in',
      'TSPSC & APPSC గ్రూప్-1, గ్రూప్-2, ఎస్ఐ మరియు కానిస్టేబుల్ పరీక్షలకు నిపుణులైన అధ్యాపకులచే తెలుగు మరియు ఇంగ్లీష్ మీడియంలో శిక్షణ.',
      1,
      101,
      1001,
      '2026-01-01',
      '2027-12-31',
      'SIDEBAR',
      1,
      'ACTIVE'
    );
    db.prepare('INSERT INTO advertisement_images (advertisement_id, image_path, image_slot) VALUES (1, ?, 1)').run(
      '/src/assets/images/news_hyderabad_it_corridor_1794106867173.jpg'
    );

    insAd.run(
      2,
      'రైతు మిత్ర ఆగ్రో సీడ్స్ & ట్రాక్టర్ షోరూమ్ – దసరా/సంక్రాంతి ప్రత్యేక తగ్గింపు',
      'రైతు మిత్ర ఆగ్రో ఏజెన్సీస్, కరీంనగర్',
      '9440188776',
      'info@rythumitra.in',
      'అధిక దిగుబడినిచ్చే వరి, పత్తి విత్తనాలు మరియు ఆధునిక వ్యవసాయ పనిముట్లు సరసమైన ధరలకు లభించును.',
      1,
      105,
      1011,
      '2026-01-01',
      '2027-12-31',
      'BETWEEN_ARTICLES',
      1,
      'PENDING'
    );
    db.prepare('INSERT INTO advertisement_images (advertisement_id, image_path, image_slot) VALUES (2, ?, 1)').run(
      '/src/assets/images/news_telugu_agriculture_1794106866412.jpg'
    );
  }
}
