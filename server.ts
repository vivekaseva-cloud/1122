import crypto from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import zlib from 'zlib';
import {
  db,
  decryptPrivateDocument,
  encryptPrivateDocument,
  hashPassword,
  initializeDatabase,
  verifyPassword,
} from './src/server/db';

initializeDatabase();

// Generate valid minimal PNG icons for PWA compliance if not already present
function ensurePwaPngIcons(): void {
  const publicDir = path.resolve(process.cwd(), 'public');
  const downloadsDir = path.join(publicDir, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // Create a clean solid crimson (#991B1B) PNG buffer for PWA icons
  function createSolidPng(width: number, height: number, r: number, g: number, b: number): Buffer {
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    function chunk(type: string, data: Buffer): Buffer {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length, 0);
      const typeBuf = Buffer.from(type, 'ascii');
      const crcBuf = Buffer.concat([typeBuf, data]);
      let crc = 0xffffffff;
      for (let i = 0; i < crcBuf.length; i++) {
        crc ^= crcBuf[i];
        for (let j = 0; j < 8; j++) {
          crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
      }
      const crcOut = Buffer.alloc(4);
      crcOut.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 0);
      return Buffer.concat([len, typeBuf, data, crcOut]);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // color type RGB
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const rowSize = width * 3 + 1;
    const raw = Buffer.alloc(rowSize * height);
    for (let y = 0; y < height; y++) {
      const rowStart = y * rowSize;
      raw[rowStart] = 0;
      for (let x = 0; x < width; x++) {
        const px = rowStart + 1 + x * 3;
        // Add gold border inside safe zone
        const isBorder =
          x > Math.floor(width * 0.12) &&
          x < Math.floor(width * 0.88) &&
          y > Math.floor(height * 0.12) &&
          y < Math.floor(height * 0.88) &&
          (x < Math.floor(width * 0.16) ||
            x > Math.floor(width * 0.84) ||
            y < Math.floor(height * 0.16) ||
            y > Math.floor(height * 0.84));
        raw[px] = isBorder ? 251 : r;
        raw[px + 1] = isBorder ? 191 : g;
        raw[px + 2] = isBorder ? 36 : b;
      }
    }
    const idat = zlib.deflateSync(raw);
    const iend = Buffer.alloc(0);
    return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', iend)]);
  }

  const icons: Array<[string, number]> = [
    ['apple-touch-icon.png', 180],
    ['pwa-192x192.png', 192],
    ['pwa-512x512.png', 512],
    ['pwa-maskable-512x512.png', 512],
  ];
  for (const [name, size] of icons) {
    const p = path.join(publicDir, name);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, createSolidPng(size, size, 153, 27, 27));
    }
  }
}

// Create a valid ZIP-structured Android APK package (neti-bharatham-v2.4.apk) containing AndroidManifest.xml, META-INF/MANIFEST.MF, and classes.dex
function buildZipArchive(entries: Array<{ name: string; content: Buffer }>): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const dataBuf = entry.content;
    const crc = crc32(dataBuf);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // store
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuf.length, 18);
    local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    const localChunk = Buffer.concat([local, dataBuf]);
    localHeaders.push(localChunk);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(dataBuf.length, 20);
    central.writeUInt32LE(dataBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centralHeaders.push(central);

    offset += localChunk.length;
  }

  const centralBuf = Buffer.concat(centralHeaders);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, centralBuf, eocd]);
}

ensurePwaPngIcons();

// In-memory session store mapped by token / cookie for iframe + standalone compatibility
interface SessionData {
  token: string;
  csrfToken: string;
  role: 'PUBLIC' | 'REPORTER' | 'SUPER_ADMIN';
  userId?: number;
  username?: string;
  createdAt: number;
  lastActiveAt: number;
}

const sessions = new Map<string, SessionData>();

function getOrCreateSession(req: Request, res: Response): SessionData {
  const headerToken = (req.headers['x-nb-session'] as string) || '';
  const cookieHeader = req.headers.cookie || '';
  const cookieMatch = cookieHeader.match(/NB_SESSION=([a-f0-9]+)/);
  const token = headerToken || (cookieMatch ? cookieMatch[1] : '');

  if (token && sessions.has(token)) {
    const sess = sessions.get(token)!;
    // 60-minute session timeout check
    if (Date.now() - sess.lastActiveAt < 60 * 60 * 1000) {
      sess.lastActiveAt = Date.now();
      return sess;
    }
    sessions.delete(token);
  }

  const newToken = crypto.randomBytes(24).toString('hex');
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const sess: SessionData = {
    token: newToken,
    csrfToken,
    role: 'PUBLIC',
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  sessions.set(newToken, sess);
  res.setHeader('Set-Cookie', `NB_SESSION=${newToken}; Path=/; HttpOnly; SameSite=Lax`);
  return sess;
}

function logActivity(
  actorRole: 'ADMIN' | 'REPORTER' | 'SYSTEM',
  actorId: number | null,
  actionType: string,
  entityType: string,
  entityId: string | number | null,
  details: string,
  ip: string
): void {
  db.prepare(
    'INSERT INTO activity_logs (actor_role, actor_id, action_type, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(actorRole, actorId, actionType, entityType, entityId !== null ? String(entityId) : null, details, ip);
}

// Automatically check and expire any reporter accounts past their 6-month validity
function enforceSixMonthReporterExpiry(): void {
  const nowIso = new Date().toISOString();
  const expiredReporters = db
    .prepare("SELECT id, full_name, unique_reporter_id FROM reporters WHERE account_status = 'APPROVED' AND expiry_date IS NOT NULL AND expiry_date < ?")
    .all(nowIso) as Array<{ id: number; full_name: string; unique_reporter_id: string }>;

  for (const rep of expiredReporters) {
    db.prepare("UPDATE reporters SET account_status = 'EXPIRED', updated_at = datetime('now') WHERE id = ?").run(rep.id);
    db.prepare("UPDATE reporter_id_cards SET is_active = 0 WHERE reporter_id = ?").run(rep.id);
    db.prepare(
      "INSERT INTO notifications (recipient_role, recipient_id, title, message) VALUES ('REPORTER', ?, 'Reporter Membership Expired', 'Your 6-month NETI BHARATHAM reporter authorization has expired. Contact Super Admin for renewal.')"
    ).run(rep.id);
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const sess = getOrCreateSession(req, res);
  if (sess.role !== 'SUPER_ADMIN' || !sess.userId) {
    res.status(401).json({ error: 'Unauthorized: Super Admin authentication required on backend.' });
    return;
  }
  const admin = db.prepare('SELECT id, username, email, display_name, must_change_password, two_factor_enabled FROM admins WHERE id = ?').get(sess.userId);
  if (!admin) {
    sess.role = 'PUBLIC';
    res.status(401).json({ error: 'Super Admin account not found.' });
    return;
  }
  (req as unknown as { admin: typeof admin; sessionData: SessionData }).admin = admin;
  (req as unknown as { sessionData: SessionData }).sessionData = sess;
  next();
}

function requireReporter(req: Request, res: Response, next: NextFunction): void {
  enforceSixMonthReporterExpiry();
  const sess = getOrCreateSession(req, res);
  if (sess.role !== 'REPORTER' || !sess.userId) {
    res.status(401).json({ error: 'Unauthorized: Reporter authentication required on backend.' });
    return;
  }
  const reporter = db.prepare('SELECT * FROM reporters WHERE id = ?').get(sess.userId);
  if (!reporter) {
    sess.role = 'PUBLIC';
    res.status(401).json({ error: 'Reporter account not found.' });
    return;
  }
  (req as unknown as { reporter: Record<string, unknown>; sessionData: SessionData }).reporter = reporter as Record<string, unknown>;
  (req as unknown as { sessionData: SessionData }).sessionData = sess;
  next();
}

function validateAndStorePublicImage(dataUrlOrPath: string, prefix = 'nb_img'): string {
  if (!dataUrlOrPath) {
    throw new Error('Image file is required.');
  }
  // Allow existing local asset paths
  if (dataUrlOrPath.startsWith('/src/assets/') || dataUrlOrPath.startsWith('/uploads/') || dataUrlOrPath.startsWith('/icon.svg')) {
    return dataUrlOrPath;
  }
  const match = dataUrlOrPath.match(/^data:(image\/(jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error('Invalid image format. Only JPG, JPEG, PNG, and WebP images are permitted.');
  }
  const mime = match[1];
  const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
  const base64Data = match[3];
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 8 * 1024 * 1024 || buffer.length < 32) {
    throw new Error('Image file size must be between 32 bytes and 8 MB.');
  }

  // Verify magic bytes (JPEG FF D8 FF, PNG 89 50 4E 47, WebP 52 49 46 46)
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;

  if (!isJpeg && !isPng && !isWebp) {
    throw new Error(`Uploaded file content does not match declared MIME type (${mime}).`);
  }

  const filename = `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Dynamic SEO robots.txt & sitemap.xml
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /private/\nSitemap: https://netibhaaratham.com/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (_req, res) => {
    const articles = db
      .prepare("SELECT slug, updated_at FROM news_articles WHERE status = 'PUBLISHED' ORDER BY news_date DESC LIMIT 500")
      .all() as Array<{ slug: string; updated_at: string }>;
    const urls = articles
      .map(
        (a) =>
          `  <url><loc>https://netibhaaratham.com/article/${a.slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`
      )
      .join('\n');
    res
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://netibhaaratham.com/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>\n${urls}\n</urlset>`
      );
  });

  // 1. PUBLIC BOOTSTRAP ENDPOINT
  app.get('/api/bootstrap', (req, res) => {
    enforceSixMonthReporterExpiry();
    const sess = getOrCreateSession(req, res);

    const settingsRows = db.prepare('SELECT setting_key, setting_value FROM website_settings').all() as Array<{
      setting_key: string;
      setting_value: string;
    }>;
    const settings: Record<string, string> = {};
    for (const r of settingsRows) {
      settings[r.setting_key] = r.setting_value;
    }

    const categories = db.prepare('SELECT * FROM news_categories ORDER BY display_order ASC').all();
    const states = db.prepare('SELECT * FROM states WHERE is_active = 1 ORDER BY id ASC').all();
    const districts = db.prepare('SELECT * FROM districts WHERE is_active = 1 ORDER BY id ASC').all();
    const mandals = db.prepare('SELECT * FROM mandals WHERE is_active = 1 ORDER BY id ASC').all();
    const villages = db.prepare('SELECT * FROM villages WHERE is_active = 1 ORDER BY id ASC').all();

    const articles = db
      .prepare(`
        SELECT a.*,
          c.name_te AS category_name_te, c.name_en AS category_name_en, c.slug AS category_slug,
          s.name_te AS state_name_te, s.name_en AS state_name_en,
          d.name_te AS district_name_te, d.name_en AS district_name_en,
          m.name_te AS mandal_name_te, m.name_en AS mandal_name_en
        FROM news_articles a
        LEFT JOIN news_categories c ON c.id = a.category_id
        LEFT JOIN states s ON s.id = a.state_id
        LEFT JOIN districts d ON d.id = a.district_id
        LEFT JOIN mandals m ON m.id = a.mandal_id
        WHERE a.status = 'PUBLISHED'
        ORDER BY a.is_breaking DESC, a.news_date DESC
      `)
      .all() as Array<Record<string, unknown>>;

    const getSupportImgs = db.prepare('SELECT * FROM news_images WHERE article_id = ? ORDER BY sort_order ASC');
    for (const art of articles) {
      art.supporting_images = getSupportImgs.all(art.id);
    }

    const today = new Date().toISOString().slice(0, 10);
    const activeAds = db
      .prepare(`
        SELECT a.*, s.name_te AS state_name_te, d.name_te AS district_name_te, m.name_te AS mandal_name_te
        FROM advertisements a
        LEFT JOIN states s ON s.id = a.state_id
        LEFT JOIN districts d ON d.id = a.district_id
        LEFT JOIN mandals m ON m.id = a.mandal_id
        WHERE a.status = 'ACTIVE' AND a.end_date >= ?
        ORDER BY a.id DESC
      `)
      .all(today) as Array<Record<string, unknown>>;

    const getAdImgs = db.prepare('SELECT image_path, image_slot FROM advertisement_images WHERE advertisement_id = ? ORDER BY image_slot ASC');
    for (const ad of activeAds) {
      ad.images = (getAdImgs.all(ad.id) as Array<{ image_path: string }>).map((i) => i.image_path);
    }

    const approvedReportersPublic = db
      .prepare(`
        SELECT r.id, r.unique_reporter_id, r.full_name, r.designation, r.profile_photo_path,
               r.approval_date, r.expiry_date, r.village_name,
               s.name_te AS state_name_te, s.name_en AS state_name_en,
               d.name_te AS district_name_te, d.name_en AS district_name_en,
               m.name_te AS mandal_name_te, m.name_en AS mandal_name_en
        FROM reporters r
        LEFT JOIN states s ON s.id = r.state_id
        LEFT JOIN districts d ON d.id = r.district_id
        LEFT JOIN mandals m ON m.id = r.mandal_id
        WHERE r.account_status = 'APPROVED'
        ORDER BY r.id ASC
      `)
      .all();

    const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admins').get() as { c: number }).c;

    // Public-safe AdSense placement flags (never expose sensitive private keys)
    const adsenseRow = db.prepare('SELECT enabled, header_enabled, news_page_enabled, sidebar_enabled, between_articles_enabled, footer_enabled, mobile_ads_enabled FROM adsense_settings WHERE id = 1').get();

    res.json({
      session_token: sess.token,
      csrf_token: sess.csrfToken,
      role: sess.role,
      admin_setup_required: adminCount === 0,
      settings,
      categories,
      states,
      districts,
      mandals,
      villages,
      articles,
      advertisements: activeAds,
      public_reporters: approvedReportersPublic,
      adsense_public: adsenseRow,
    });
  });

  // 2. FIRST-RUN SUPER ADMIN INSTALLATION WIZARD ENDPOINT (Zero hardcoded passwords)
  app.post('/api/auth/setup-admin', (req, res) => {
    const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admins').get() as { c: number }).c;
    if (adminCount > 0) {
      res.status(403).json({ error: 'Initial Super Admin account is already configured. Please sign in.' });
      return;
    }

    const { username = 'Admin', email = 'netibhaarathamtelugu@gmail.com', password, confirm_password } = req.body;
    if (!password || String(password).length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long with strong complexity.' });
      return;
    }
    if (password !== confirm_password) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const pwHash = hashPassword(String(password));
    const result = db
      .prepare('INSERT INTO admins (username, email, password_hash, display_name, must_change_password) VALUES (?, ?, ?, ?, 0)')
      .run(String(username).trim(), String(email).trim(), pwHash, String(username).trim());

    const sess = getOrCreateSession(req, res);
    sess.role = 'SUPER_ADMIN';
    sess.userId = Number(result.lastInsertRowid);
    sess.username = String(username).trim();

    logActivity('ADMIN', sess.userId, 'INITIAL_SETUP', 'admins', sess.userId, 'Initial Super Admin configured via First-Run Wizard', req.ip || '');

    res.json({
      success: true,
      session_token: sess.token,
      csrf_token: sess.csrfToken,
      role: 'SUPER_ADMIN',
      admin: { id: sess.userId, username: sess.username, email },
    });
  });

  // 3. AUTHENTICATION LOGIN (SUPER ADMIN & REPORTER) WITH RATE LIMITING & LOCKOUT
  app.post('/api/auth/login', (req, res) => {
    const { role_type, identifier, password } = req.body;
    const ip = req.ip || '127.0.0.1';
    const ua = String(req.headers['user-agent'] || '').slice(0, 250);

    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/Email and Password are required.' });
      return;
    }

    // Check recent failed attempts from this IP (Rate Limiting)
    const recentFailures = (
      db
        .prepare("SELECT COUNT(*) as c FROM login_logs WHERE ip_address = ? AND status = 'FAILED' AND created_at > datetime('now', '-15 minutes')")
        .get(ip) as { c: number }
    ).c;

    if (recentFailures >= 10) {
      db.prepare("INSERT INTO login_logs (user_role, user_identifier, ip_address, user_agent, status, failure_reason) VALUES (?, ?, ?, ?, 'LOCKED', 'Rate limit exceeded')").run(
        role_type === 'ADMIN' ? 'ADMIN' : 'REPORTER',
        String(identifier),
        ip,
        ua
      );
      res.status(429).json({ error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' });
      return;
    }

    if (role_type === 'ADMIN') {
      const admin = db
        .prepare('SELECT * FROM admins WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)')
        .get(String(identifier).trim(), String(identifier).trim()) as Record<string, unknown> | undefined;

      if (!admin || !verifyPassword(String(password), String(admin.password_hash))) {
        db.prepare("INSERT INTO login_logs (user_role, user_identifier, ip_address, user_agent, status, failure_reason) VALUES ('ADMIN', ?, ?, ?, 'FAILED', 'Invalid credentials')").run(
          String(identifier),
          ip,
          ua
        );
        res.status(401).json({ error: 'Invalid Super Admin username or password.' });
        return;
      }

      db.prepare("UPDATE admins SET failed_login_attempts = 0, last_login_at = datetime('now'), last_login_ip = ? WHERE id = ?").run(ip, admin.id);
      db.prepare("INSERT INTO login_logs (user_role, user_identifier, ip_address, user_agent, status) VALUES ('ADMIN', ?, ?, ?, 'SUCCESS')").run(
        String(admin.username),
        ip,
        ua
      );

      const sess = getOrCreateSession(req, res);
      sess.role = 'SUPER_ADMIN';
      sess.userId = Number(admin.id);
      sess.username = String(admin.username);

      res.json({
        success: true,
        session_token: sess.token,
        csrf_token: sess.csrfToken,
        role: 'SUPER_ADMIN',
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          display_name: admin.display_name,
          must_change_password: Boolean(admin.must_change_password),
        },
      });
      return;
    }

    // Reporter Login
    enforceSixMonthReporterExpiry();
    const reporter = db
      .prepare('SELECT * FROM reporters WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) OR mobile = ?')
      .get(String(identifier).trim(), String(identifier).trim(), String(identifier).trim()) as Record<string, unknown> | undefined;

    if (!reporter || !verifyPassword(String(password), String(reporter.password_hash))) {
      db.prepare("INSERT INTO login_logs (user_role, user_identifier, ip_address, user_agent, status, failure_reason) VALUES ('REPORTER', ?, ?, ?, 'FAILED', 'Invalid credentials')").run(
        String(identifier),
        ip,
        ua
      );
      res.status(401).json({ error: 'Invalid Reporter username/mobile or password.' });
      return;
    }

    db.prepare("INSERT INTO login_logs (user_role, user_identifier, ip_address, user_agent, status) VALUES ('REPORTER', ?, ?, ?, 'SUCCESS')").run(
      String(reporter.username),
      ip,
      ua
    );

    const sess = getOrCreateSession(req, res);
    sess.role = 'REPORTER';
    sess.userId = Number(reporter.id);
    sess.username = String(reporter.username);

    res.json({
      success: true,
      session_token: sess.token,
      csrf_token: sess.csrfToken,
      role: 'REPORTER',
      user: {
        id: reporter.id,
        username: reporter.username,
        full_name: reporter.full_name,
        account_status: reporter.account_status,
        unique_reporter_id: reporter.unique_reporter_id,
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const sess = getOrCreateSession(req, res);
    sessions.delete(sess.token);
    res.json({ success: true });
  });

  // 4. REPORTER REGISTRATION (Saves all required fields + Private Encrypted Identity Document)
  app.post('/api/reporters/register', (req, res) => {
    try {
      const b = req.body;
      const requiredFields = [
        'full_name',
        'father_name',
        'dob',
        'gender',
        'mobile',
        'whatsapp',
        'email',
        'residential_address',
        'state_id',
        'district_id',
        'mandal_id',
        'village_name',
        'pin_code',
        'experience_years',
        'designation',
        'username',
        'password',
        'confirm_password',
        'profile_photo',
        'identity_document_type',
        'identity_document_masked_ref',
        'identity_document_file',
      ];

      for (const f of requiredFields) {
        if (b[f] === undefined || b[f] === null || String(b[f]).trim() === '') {
          res.status(400).json({ error: `Required field missing: ${f}` });
          return;
        }
      }

      if (b.password !== b.confirm_password) {
        res.status(400).json({ error: 'Password and Confirm Password do not match.' });
        return;
      }
      if (String(b.password).length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }
      if (!b.consent_accepted) {
        res.status(400).json({ error: 'Explicit consent for identity document verification is mandatory.' });
        return;
      }

      const existing = db
        .prepare('SELECT id FROM reporters WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) OR mobile = ?')
        .get(String(b.username).trim(), String(b.email).trim(), String(b.mobile).trim());
      if (existing) {
        res.status(400).json({ error: 'A reporter with this username, email, or mobile number is already registered.' });
        return;
      }

      const photoPath = validateAndStorePublicImage(String(b.profile_photo), 'reporter_photo');

      // Validate identity document (JPG, JPEG, PNG, WebP, or PDF) and encrypt into private/identity_documents/
      const docDataUrl = String(b.identity_document_file);
      const isValidDoc =
        docDataUrl.startsWith('data:image/jpeg;base64,') ||
        docDataUrl.startsWith('data:image/jpg;base64,') ||
        docDataUrl.startsWith('data:image/png;base64,') ||
        docDataUrl.startsWith('data:image/webp;base64,') ||
        docDataUrl.startsWith('data:application/pdf;base64,');

      if (!isValidDoc) {
        res.status(400).json({ error: 'Identity verification document must be a valid JPG, PNG, WebP image or PDF file.' });
        return;
      }

      const mimeMatch = docDataUrl.match(/^data:([^;]+);base64,/);
      const docMime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const encryptedDoc = encryptPrivateDocument(docDataUrl);

      const regNumber = `NB-REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const pwHash = hashPassword(String(b.password));

      const registerTx = db.transaction(() => {
        const repRes = db
          .prepare(`
            INSERT INTO reporters (
              registration_number, username, password_hash, full_name, father_name, dob, gender,
              mobile, whatsapp, email, residential_address, state_id, district_id, mandal_id,
              village_id, village_name, pin_code, experience_years, previous_media_org, designation,
              preferred_categories, profile_photo_path, account_status, consent_accepted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 1)
          `)
          .run(
            regNumber,
            String(b.username).trim(),
            pwHash,
            String(b.full_name).trim(),
            String(b.father_name).trim(),
            String(b.dob).trim(),
            String(b.gender).trim(),
            String(b.mobile).trim(),
            String(b.whatsapp).trim(),
            String(b.email).trim(),
            String(b.residential_address).trim(),
            Number(b.state_id),
            Number(b.district_id),
            Number(b.mandal_id),
            b.village_id ? Number(b.village_id) : null,
            String(b.village_name).trim(),
            String(b.pin_code).trim(),
            String(b.experience_years).trim(),
            String(b.previous_media_org || '').trim(),
            String(b.designation).trim(),
            JSON.stringify(Array.isArray(b.preferred_categories) ? b.preferred_categories : []),
            photoPath
          );

        const reporterId = Number(repRes.lastInsertRowid);

        db.prepare(`
          INSERT INTO reporter_documents (
            reporter_id, document_type, masked_document_ref, private_storage_filename,
            original_mime_type, file_size_bytes, sha256_checksum, encryption_iv
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          reporterId,
          String(b.identity_document_type),
          String(b.identity_document_masked_ref).trim(),
          encryptedDoc.filename,
          docMime,
          encryptedDoc.size,
          encryptedDoc.sha256,
          encryptedDoc.iv
        );

        db.prepare(`
          INSERT INTO notifications (recipient_role, title, message)
          VALUES ('ADMIN', ?, ?)
        `).run(
          `New Pending Reporter Registration: ${b.full_name}`,
          `Registration #${regNumber} (${b.designation}) from ${b.village_name} is PENDING Admin verification.`
        );

        logActivity('REPORTER', reporterId, 'REGISTER', 'reporters', reporterId, `Registered with #${regNumber} (Status: PENDING)`, req.ip || '');
        return reporterId;
      });

      const newReporterId = registerTx();

      res.status(201).json({
        success: true,
        reporter_id: newReporterId,
        registration_number: regNumber,
        account_status: 'PENDING',
        message: 'రిపోర్టర్ రిజిస్ట్రేషన్ విజయవంతంగా పూర్తయింది. అడ్మిన్ ఆమోదం పొందిన తర్వాత మీకు యూనిక్ రిపోర్టర్ ఐడి మరియు 6 నెలల చెల్లుబాటు గల గుర్తింపు కార్డు జారీ చేయబడుతుంది.',
      });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Registration failed.' });
    }
  });

  // 5. REPORTER DASHBOARD DATA
  app.get('/api/reporter/dashboard', requireReporter, (req, res) => {
    const rep = (req as unknown as { reporter: Record<string, unknown> }).reporter;
    const reporterId = Number(rep.id);

    const locRow = db
      .prepare(`
        SELECT s.name_te AS state_name_te, s.name_en AS state_name_en,
               d.name_te AS district_name_te, d.name_en AS district_name_en,
               m.name_te AS mandal_name_te, m.name_en AS mandal_name_en
        FROM reporters r
        LEFT JOIN states s ON s.id = r.state_id
        LEFT JOIN districts d ON d.id = r.district_id
        LEFT JOIN mandals m ON m.id = r.mandal_id
        WHERE r.id = ?
      `)
      .get(reporterId) as Record<string, unknown> | undefined;

    const idCard = db.prepare('SELECT * FROM reporter_id_cards WHERE reporter_id = ? ORDER BY id DESC LIMIT 1').get(reporterId);
    const renewals = db.prepare('SELECT * FROM reporter_renewals WHERE reporter_id = ? ORDER BY id DESC').all(reporterId);
    const docMeta = db
      .prepare('SELECT id, document_type, masked_document_ref, consent_timestamp, verified_at FROM reporter_documents WHERE reporter_id = ? ORDER BY id DESC LIMIT 1')
      .get(reporterId);

    const articles = db
      .prepare(`
        SELECT a.*, c.name_te AS category_name_te, c.name_en AS category_name_en
        FROM news_articles a
        LEFT JOIN news_categories c ON c.id = a.category_id
        WHERE a.reporter_id = ?
        ORDER BY a.id DESC
      `)
      .all(reporterId) as Array<Record<string, unknown>>;

    const getSupportImgs = db.prepare('SELECT * FROM news_images WHERE article_id = ? ORDER BY sort_order ASC');
    for (const art of articles) {
      art.supporting_images = getSupportImgs.all(art.id);
    }

    const ads = db
      .prepare(`
        SELECT a.*, s.name_te AS state_name_te, d.name_te AS district_name_te, m.name_te AS mandal_name_te
        FROM advertisements a
        LEFT JOIN states s ON s.id = a.state_id
        LEFT JOIN districts d ON d.id = a.district_id
        LEFT JOIN mandals m ON m.id = a.mandal_id
        WHERE a.reporter_id = ?
        ORDER BY a.id DESC
      `)
      .all(reporterId) as Array<Record<string, unknown>>;

    const getAdImgs = db.prepare('SELECT image_path, image_slot FROM advertisement_images WHERE advertisement_id = ? ORDER BY image_slot ASC');
    for (const ad of ads) {
      ad.images = (getAdImgs.all(ad.id) as Array<{ image_path: string }>).map((i) => i.image_path);
    }

    const notifications = db
      .prepare("SELECT * FROM notifications WHERE recipient_role = 'REPORTER' AND (recipient_id = ? OR recipient_id IS NULL) ORDER BY id DESC LIMIT 20")
      .all(reporterId);

    const safeProfile = { ...rep, ...locRow };
    delete safeProfile.password_hash;

    res.json({
      profile: safeProfile,
      id_card: idCard || null,
      renewals,
      document_metadata: docMeta || null,
      articles,
      advertisements: ads,
      notifications,
    });
  });

  // 6. REPORTER PROFILE UPDATE (STRICT PERMISSION: ONLY PASSWORD & RESIDENTIAL ADDRESS!)
  app.post('/api/reporter/profile/update', requireReporter, (req, res) => {
    const rep = (req as unknown as { reporter: Record<string, unknown> }).reporter;
    const reporterId = Number(rep.id);
    const body = req.body;

    // Enforce backend ban on modifying any restricted field
    const forbiddenFields = [
      'full_name',
      'father_name',
      'mobile',
      'whatsapp',
      'email',
      'dob',
      'gender',
      'state_id',
      'district_id',
      'mandal_id',
      'village_id',
      'village_name',
      'designation',
      'unique_reporter_id',
      'registration_number',
      'profile_photo_path',
      'account_status',
      'identity_document_file',
    ];

    for (const field of forbiddenFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        res.status(403).json({
          error: `Permission Denied: Reporters can edit ONLY Password and Residential Address. Field '${field}' can only be modified by Super Admin.`,
        });
        return;
      }
    }

    if (typeof body.residential_address === 'string' && body.residential_address.trim() !== '') {
      db.prepare("UPDATE reporters SET residential_address = ?, updated_at = datetime('now') WHERE id = ?").run(
        body.residential_address.trim(),
        reporterId
      );
      logActivity('REPORTER', reporterId, 'UPDATE_ADDRESS', 'reporters', reporterId, 'Updated residential address', req.ip || '');
    }

    if (typeof body.new_password === 'string' && body.new_password.trim() !== '') {
      if (!body.current_password || !verifyPassword(String(body.current_password), String(rep.password_hash))) {
        res.status(400).json({ error: 'Current password verification failed.' });
        return;
      }
      if (body.new_password.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters.' });
        return;
      }
      const newHash = hashPassword(body.new_password);
      db.prepare("UPDATE reporters SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(newHash, reporterId);
      logActivity('REPORTER', reporterId, 'CHANGE_PASSWORD', 'reporters', reporterId, 'Changed account password', req.ip || '');
    }

    res.json({
      success: true,
      message: 'మీ చిరునామా / పాస్‌వర్డ్ వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి.',
    });
  });

  // 7. REPORTER NEWS SUBMISSION & EDIT (INSTANT PUBLISH WITHOUT APPROVAL + FULL EDIT BY REPORTER & ADMIN)
  app.post('/api/reporter/articles', requireReporter, (req, res) => {
    const rep = (req as unknown as { reporter: Record<string, unknown> }).reporter;
    const reporterId = Number(rep.id);

    if (rep.account_status !== 'APPROVED') {
      res.status(403).json({
        error: `Publishing Denied: Your reporter account status is ${rep.account_status}. Expired, pending, or suspended reporters cannot submit or publish news.`,
      });
      return;
    }

    try {
      const b = req.body;
      if (!b.headline || !b.telugu_title || !b.short_description || !b.full_content || !b.category_id || !b.state_id) {
        res.status(400).json({ error: 'Headline, Telugu Title, Short Description, Full Content, Category, and State are required.' });
        return;
      }

      const mainImage = validateAndStorePublicImage(String(b.main_image), 'news_main');
      // Direct publication without requiring Admin approval unless explicitly saved as DRAFT
      const status = b.save_as_draft ? 'DRAFT' : 'PUBLISHED';
      const nowIso = new Date().toISOString();
      const baseSlug =
        String(b.headline)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 70) || 'telugu-news';
      const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

      const submitTx = db.transaction(() => {
        const artRes = db
          .prepare(`
            INSERT INTO news_articles (
              headline, telugu_title, slug, short_description, full_content, main_image,
              image_caption, image_alt_text, category_id, state_id, district_id, mandal_id,
              village_id, village_name, reporter_id, reporter_name, reporter_unique_id,
              news_date, seo_title, seo_description, status, allow_reporter_edit, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
          `)
          .run(
            String(b.headline).trim(),
            String(b.telugu_title).trim(),
            slug,
            String(b.short_description).trim(),
            String(b.full_content),
            mainImage,
            String(b.image_caption || '').trim(),
            String(b.image_alt_text || b.telugu_title).trim(),
            Number(b.category_id),
            Number(b.state_id),
            b.district_id ? Number(b.district_id) : null,
            b.mandal_id ? Number(b.mandal_id) : null,
            b.village_id ? Number(b.village_id) : null,
            String(b.village_name || '').trim(),
            reporterId,
            String(rep.full_name),
            String(rep.unique_reporter_id || rep.registration_number),
            b.news_date || nowIso,
            String(b.seo_title || b.telugu_title).trim(),
            String(b.seo_description || b.short_description).trim(),
            status,
            status === 'PUBLISHED' ? nowIso : null
          );

        const articleId = Number(artRes.lastInsertRowid);

        if (Array.isArray(b.supporting_images)) {
          const insImg = db.prepare('INSERT INTO news_images (article_id, image_path, caption, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)');
          b.supporting_images.forEach((imgObj: { image_path?: string; caption?: string; alt_text?: string }, idx: number) => {
            if (imgObj && imgObj.image_path) {
              const stored = validateAndStorePublicImage(String(imgObj.image_path), `news_sub_${idx + 1}`);
              insImg.run(articleId, stored, String(imgObj.caption || ''), String(imgObj.alt_text || ''), idx + 1);
            }
          });
        }

        logActivity('REPORTER', reporterId, 'PUBLISH_ARTICLE', 'news_articles', articleId, `Published news (${status}): ${b.telugu_title}`, req.ip || '');
        return articleId;
      });

      const articleId = submitTx();
      res.status(201).json({ success: true, article_id: articleId, status, slug });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to submit news article.' });
    }
  });

  app.put('/api/reporter/articles/:id', requireReporter, (req, res) => {
    const rep = (req as unknown as { reporter: Record<string, unknown> }).reporter;
    const reporterId = Number(rep.id);
    const articleId = Number(req.params.id);

    if (rep.account_status !== 'APPROVED') {
      res.status(403).json({
        error: `Editing Denied: Your reporter account status is ${rep.account_status}.`,
      });
      return;
    }

    const existing = db.prepare('SELECT * FROM news_articles WHERE id = ? AND reporter_id = ?').get(articleId, reporterId) as
      | Record<string, unknown>
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'News article not found in your submissions.' });
      return;
    }

    try {
      const b = req.body;
      const mainImage = b.main_image ? validateAndStorePublicImage(String(b.main_image), 'news_main') : String(existing.main_image);
      const nextStatus = b.save_as_draft ? 'DRAFT' : 'PUBLISHED';
      const nowIso = new Date().toISOString();

      const updateTx = db.transaction(() => {
        db.prepare(`
          UPDATE news_articles SET
            headline = ?, telugu_title = ?, short_description = ?, full_content = ?,
            main_image = ?, image_caption = ?, image_alt_text = ?, category_id = ?,
            state_id = ?, district_id = ?, mandal_id = ?, village_id = ?, village_name = ?,
            news_date = ?, seo_title = ?, seo_description = ?, status = ?, allow_reporter_edit = 1,
            published_at = COALESCE(published_at, ?),
            updated_at = datetime('now')
          WHERE id = ? AND reporter_id = ?
        `).run(
          String(b.headline || existing.headline).trim(),
          String(b.telugu_title || existing.telugu_title).trim(),
          String(b.short_description || existing.short_description).trim(),
          String(b.full_content || existing.full_content),
          mainImage,
          String(b.image_caption ?? existing.image_caption),
          String(b.image_alt_text ?? existing.image_alt_text),
          Number(b.category_id || existing.category_id),
          Number(b.state_id || existing.state_id),
          b.district_id ? Number(b.district_id) : null,
          b.mandal_id ? Number(b.mandal_id) : null,
          b.village_id ? Number(b.village_id) : (existing.village_id ?? null),
          String(b.village_name ?? existing.village_name),
          String(b.news_date || existing.news_date || nowIso),
          String(b.seo_title ?? existing.seo_title),
          String(b.seo_description ?? existing.seo_description),
          nextStatus,
          nextStatus === 'PUBLISHED' ? nowIso : null,
          articleId,
          reporterId
        );

        if (Array.isArray(b.supporting_images)) {
          db.prepare('DELETE FROM news_images WHERE article_id = ?').run(articleId);
          const insImg = db.prepare('INSERT INTO news_images (article_id, image_path, caption, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)');
          b.supporting_images.forEach((imgObj: { image_path?: string; caption?: string; alt_text?: string }, idx: number) => {
            if (imgObj && imgObj.image_path) {
              const stored = validateAndStorePublicImage(String(imgObj.image_path), `news_sub_${idx + 1}`);
              insImg.run(articleId, stored, String(imgObj.caption || ''), String(imgObj.alt_text || ''), idx + 1);
            }
          });
        }
      });

      updateTx();
      logActivity('REPORTER', reporterId, 'EDIT_ARTICLE', 'news_articles', articleId, `Edited article #${articleId} (${nextStatus})`, req.ip || '');
      res.json({ success: true, status: nextStatus });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Update failed.' });
    }
  });

  // 8. REPORTER PRIVATE ADVERTISEMENT SUBMISSION (MAX 2 IMAGES, MANDATORY ADMIN APPROVAL)
  app.post('/api/reporter/advertisements', requireReporter, (req, res) => {
    const rep = (req as unknown as { reporter: Record<string, unknown> }).reporter;
    const reporterId = Number(rep.id);

    if (rep.account_status !== 'APPROVED') {
      res.status(403).json({
        error: `Advertisement Submission Denied: Your account status is ${rep.account_status}. Only approved, non-expired reporters can submit advertisements.`,
      });
      return;
    }

    try {
      const b = req.body;
      if (!b.title || !b.advertiser_name || !b.contact_mobile || !b.description || !b.state_id || !b.start_date || !b.end_date) {
        res.status(400).json({ error: 'All mandatory advertisement fields must be completed.' });
        return;
      }

      const rawImages: string[] = [];
      if (b.image_1) rawImages.push(String(b.image_1));
      if (b.image_2) rawImages.push(String(b.image_2));
      if (Array.isArray(b.images)) {
        for (const img of b.images) {
          if (img && rawImages.length < 3) rawImages.push(String(img));
        }
      }

      if (rawImages.length === 0) {
        res.status(400).json({ error: 'At least 1 advertisement image is required.' });
        return;
      }
      if (rawImages.length > 2) {
        res.status(400).json({ error: 'Maximum two (2) advertisement images are permitted per submission.' });
        return;
      }

      const storedImages = rawImages.slice(0, 2).map((img, i) => validateAndStorePublicImage(img, `ad_slot_${i + 1}`));

      const adTx = db.transaction(() => {
        const adRes = db
          .prepare(`
            INSERT INTO advertisements (
              title, advertiser_name, contact_mobile, contact_email, description,
              state_id, district_id, mandal_id, start_date, end_date, placement, reporter_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
          `)
          .run(
            String(b.title).trim(),
            String(b.advertiser_name).trim(),
            String(b.contact_mobile).trim(),
            String(b.contact_email || '').trim(),
            String(b.description).trim(),
            Number(b.state_id),
            b.district_id ? Number(b.district_id) : null,
            b.mandal_id ? Number(b.mandal_id) : null,
            String(b.start_date),
            String(b.end_date),
            String(b.placement || 'SIDEBAR'),
            reporterId
          );

        const adId = Number(adRes.lastInsertRowid);
        const insAdImg = db.prepare('INSERT INTO advertisement_images (advertisement_id, image_path, image_slot) VALUES (?, ?, ?)');
        storedImages.forEach((p, idx) => {
          insAdImg.run(adId, p, idx + 1);
        });

        db.prepare("INSERT INTO notifications (recipient_role, title, message) VALUES ('ADMIN', ?, ?)").run(
          `New Private Advertisement Pending Approval`,
          `Ad "${b.title}" (${b.advertiser_name}) submitted by ${rep.full_name}.`
        );

        logActivity('REPORTER', reporterId, 'SUBMIT_AD', 'advertisements', adId, `Submitted private ad: ${b.title}`, req.ip || '');
        return adId;
      });

      const adId = adTx();
      res.status(201).json({ success: true, advertisement_id: adId, status: 'PENDING' });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Advertisement submission failed.' });
    }
  });

  // 9. SUPER ADMIN COMPLETE OVERVIEW & CRUD ENDPOINTS
  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    enforceSixMonthReporterExpiry();

    const reporters = db
      .prepare(`
        SELECT r.*,
               s.name_te AS state_name_te, s.name_en AS state_name_en,
               d.name_te AS district_name_te, d.name_en AS district_name_en,
               m.name_te AS mandal_name_te, m.name_en AS mandal_name_en,
               doc.document_type, doc.masked_document_ref, doc.consent_timestamp, doc.sha256_checksum
        FROM reporters r
        LEFT JOIN states s ON s.id = r.state_id
        LEFT JOIN districts d ON d.id = r.district_id
        LEFT JOIN mandals m ON m.id = r.mandal_id
        LEFT JOIN reporter_documents doc ON doc.reporter_id = r.id
        ORDER BY r.id DESC
      `)
      .all() as Array<Record<string, unknown>>;

    for (const r of reporters) {
      delete r.password_hash;
    }

    const articles = db
      .prepare(`
        SELECT a.*, c.name_te AS category_name_te, c.name_en AS category_name_en,
               s.name_te AS state_name_te, d.name_te AS district_name_te, m.name_te AS mandal_name_te
        FROM news_articles a
        LEFT JOIN news_categories c ON c.id = a.category_id
        LEFT JOIN states s ON s.id = a.state_id
        LEFT JOIN districts d ON d.id = a.district_id
        LEFT JOIN mandals m ON m.id = a.mandal_id
        ORDER BY a.id DESC
      `)
      .all() as Array<Record<string, unknown>>;

    const getSupportImgs = db.prepare('SELECT * FROM news_images WHERE article_id = ? ORDER BY sort_order ASC');
    for (const art of articles) {
      art.supporting_images = getSupportImgs.all(art.id);
    }

    const advertisements = db
      .prepare(`
        SELECT a.*, r.full_name AS reporter_name, s.name_te AS state_name_te, d.name_te AS district_name_te, m.name_te AS mandal_name_te
        FROM advertisements a
        LEFT JOIN reporters r ON r.id = a.reporter_id
        LEFT JOIN states s ON s.id = a.state_id
        LEFT JOIN districts d ON d.id = a.district_id
        LEFT JOIN mandals m ON m.id = a.mandal_id
        ORDER BY a.id DESC
      `)
      .all() as Array<Record<string, unknown>>;

    const getAdImgs = db.prepare('SELECT image_path, image_slot FROM advertisement_images WHERE advertisement_id = ? ORDER BY image_slot ASC');
    for (const ad of advertisements) {
      ad.images = (getAdImgs.all(ad.id) as Array<{ image_path: string }>).map((i) => i.image_path);
    }

    const adsense = db.prepare('SELECT * FROM adsense_settings WHERE id = 1').get();
    const loginLogs = db.prepare('SELECT * FROM login_logs ORDER BY id DESC LIMIT 60').all();
    const activityLogs = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 60').all();
    const notifications = db.prepare("SELECT * FROM notifications WHERE recipient_role = 'ADMIN' ORDER BY id DESC LIMIT 40").all();
    const contactMessages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 40').all();
    const renewals = db.prepare('SELECT * FROM reporter_renewals ORDER BY id DESC LIMIT 40').all();

    const backupsDir = path.resolve(process.cwd(), 'private', 'backups');
    const backupFiles = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith('.json') || f.endsWith('.sql'))
      .map((f) => {
        const stat = fs.statSync(path.join(backupsDir, f));
        return { filename: f, size_bytes: stat.size, created_at: stat.mtime.toISOString() };
      });

    res.json({
      reporters,
      articles,
      advertisements,
      adsense,
      login_logs: loginLogs,
      activity_logs: activityLogs,
      notifications,
      contact_messages: contactMessages,
      renewals,
      backups: backupFiles,
    });
  });

  // 10. ADMIN SECURE VIEW OF PRIVATE ENCRYPTED IDENTITY DOCUMENT
  app.get('/api/admin/reporters/:id/document', requireAdmin, (req, res) => {
    const reporterId = Number(req.params.id);
    const doc = db
      .prepare('SELECT * FROM reporter_documents WHERE reporter_id = ? ORDER BY id DESC LIMIT 1')
      .get(reporterId) as Record<string, unknown> | undefined;

    if (!doc) {
      res.status(404).json({ error: 'Verification document record not found.' });
      return;
    }

    const decrypted = decryptPrivateDocument(String(doc.private_storage_filename), String(doc.encryption_iv || ''));
    res.json({
      document_type: doc.document_type,
      masked_document_ref: doc.masked_document_ref,
      sha256_checksum: doc.sha256_checksum,
      consent_timestamp: doc.consent_timestamp,
      decrypted_preview: decrypted,
    });
  });

  // 11. ADMIN REPORTER APPROVAL, REJECTION, SUSPENSION & 6-MONTH RENEWAL
  app.post('/api/admin/reporters/:id/status', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const reporterId = Number(req.params.id);
    const { action, rejection_reason } = req.body;

    const rep = db.prepare('SELECT * FROM reporters WHERE id = ?').get(reporterId) as Record<string, unknown> | undefined;
    if (!rep) {
      res.status(404).json({ error: 'Reporter not found.' });
      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();

    if (action === 'APPROVE') {
      const uniqueId = (rep.unique_reporter_id as string) || `NB-TS-${now.getFullYear()}-${String(reporterId).padStart(4, '0')}`;
      const cardNo = `NB-ID-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(reporterId).padStart(4, '0')}`;

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE reporters SET
            account_status = 'APPROVED',
            unique_reporter_id = ?,
            approval_date = ?,
            expiry_date = ?,
            approved_by_admin_id = ?,
            rejection_reason = NULL,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(uniqueId, nowIso, sixMonthsLater, admin.id, reporterId);

        db.prepare('DELETE FROM reporter_id_cards WHERE reporter_id = ?').run(reporterId);
        db.prepare(`
          INSERT INTO reporter_id_cards (
            reporter_id, card_number, unique_reporter_id, issue_date, expiry_date, verification_token, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(reporterId, cardNo, uniqueId, nowIso, sixMonthsLater, `VERIFY-${uniqueId}-${Date.now()}`);

        db.prepare("INSERT INTO notifications (recipient_role, recipient_id, title, message) VALUES ('REPORTER', ?, ?, ?)").run(
          reporterId,
          'రిపోర్టర్ ఖాతా ఆమోదించబడింది (Approved)',
          `అభినందనలు! మీ రిపోర్టర్ ఖాతా ఆమోదించబడింది. మీ యూనిక్ ఐడి: ${uniqueId}. 6 నెలల చెల్లుబాటు గల ఐడి కార్డు డౌన్‌లోడ్ చేసుకోవచ్చు.`
        );

        logActivity('ADMIN', admin.id, 'APPROVE_REPORTER', 'reporters', reporterId, `Approved reporter with ID ${uniqueId}`, req.ip || '');
      });
      tx();
      res.json({ success: true, account_status: 'APPROVED', unique_reporter_id: uniqueId, approval_date: nowIso, expiry_date: sixMonthsLater });
      return;
    }

    if (action === 'RENEW') {
      const uniqueId = (rep.unique_reporter_id as string) || `NB-TS-${now.getFullYear()}-${String(reporterId).padStart(4, '0')}`;
      const baseTime =
        rep.expiry_date && new Date(String(rep.expiry_date)).getTime() > now.getTime()
          ? new Date(String(rep.expiry_date)).getTime()
          : now.getTime();
      const renewedExpiry = new Date(baseTime + 180 * 24 * 60 * 60 * 1000).toISOString();

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE reporters SET
            account_status = 'APPROVED',
            unique_reporter_id = ?,
            renewal_date = ?,
            expiry_date = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(uniqueId, nowIso, renewedExpiry, reporterId);

        db.prepare(`
          INSERT INTO reporter_renewals (reporter_id, admin_id, previous_expiry_date, new_expiry_date, renewal_date, validity_months, remarks)
          VALUES (?, ?, ?, ?, ?, 6, 'Six-month membership renewed by Super Admin')
        `).run(reporterId, admin.id, rep.expiry_date || nowIso, renewedExpiry, nowIso);

        db.prepare('UPDATE reporter_id_cards SET expiry_date = ?, is_active = 1 WHERE reporter_id = ?').run(renewedExpiry, reporterId);

        logActivity('ADMIN', admin.id, 'RENEW_REPORTER', 'reporters', reporterId, `Renewed 6-month validity until ${renewedExpiry}`, req.ip || '');
      });
      tx();
      res.json({ success: true, account_status: 'APPROVED', expiry_date: renewedExpiry });
      return;
    }

    if (action === 'REJECT') {
      db.prepare("UPDATE reporters SET account_status = 'REJECTED', rejection_reason = ?, updated_at = datetime('now') WHERE id = ?").run(
        String(rejection_reason || 'Incomplete verification details'),
        reporterId
      );
      logActivity('ADMIN', admin.id, 'REJECT_REPORTER', 'reporters', reporterId, `Rejected reporter: ${rejection_reason || ''}`, req.ip || '');
      res.json({ success: true, account_status: 'REJECTED' });
      return;
    }

    if (action === 'SUSPEND') {
      db.prepare("UPDATE reporters SET account_status = 'SUSPENDED', updated_at = datetime('now') WHERE id = ?").run(reporterId);
      db.prepare('UPDATE reporter_id_cards SET is_active = 0 WHERE reporter_id = ?').run(reporterId);
      logActivity('ADMIN', admin.id, 'SUSPEND_REPORTER', 'reporters', reporterId, 'Suspended reporter account', req.ip || '');
      res.json({ success: true, account_status: 'SUSPENDED' });
      return;
    }

    if (action === 'ACTIVATE') {
      const expiry = rep.expiry_date && new Date(String(rep.expiry_date)).getTime() > now.getTime() ? String(rep.expiry_date) : sixMonthsLater;
      db.prepare("UPDATE reporters SET account_status = 'APPROVED', expiry_date = ?, updated_at = datetime('now') WHERE id = ?").run(
        expiry,
        reporterId
      );
      db.prepare('UPDATE reporter_id_cards SET is_active = 1, expiry_date = ? WHERE reporter_id = ?').run(expiry, reporterId);
      logActivity('ADMIN', admin.id, 'ACTIVATE_REPORTER', 'reporters', reporterId, 'Reactivated reporter account', req.ip || '');
      res.json({ success: true, account_status: 'APPROVED', expiry_date: expiry });
      return;
    }

    res.status(400).json({ error: 'Invalid status action.' });
  });

  // 12. SUPER ADMIN EDIT ALL REPORTER DETAILS & PASSWORD RESET (TOTAL REPORTER PROFILE EDIT)
  app.put('/api/admin/reporters/:id', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const reporterId = Number(req.params.id);
    const rep = db.prepare('SELECT * FROM reporters WHERE id = ?').get(reporterId) as Record<string, unknown> | undefined;
    if (!rep) {
      res.status(404).json({ error: 'Reporter not found.' });
      return;
    }

    try {
      const b = req.body;
      const photoPath = b.profile_photo_path
        ? validateAndStorePublicImage(String(b.profile_photo_path), 'reporter_photo')
        : String(rep.profile_photo_path);

      const nextStatus = String(b.account_status ?? rep.account_status).trim();
      const now = new Date();
      const nowIso = now.toISOString();
      const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();

      let nextUniqueId =
        b.unique_reporter_id !== undefined
          ? String(b.unique_reporter_id).trim() || null
          : (rep.unique_reporter_id as string | null);

      if (nextStatus === 'APPROVED' && !nextUniqueId) {
        nextUniqueId = `NB-TS-${now.getFullYear()}-${String(reporterId).padStart(4, '0')}`;
      }

      const nextApprovalDate =
        b.approval_date !== undefined
          ? String(b.approval_date).trim() || null
          : nextStatus === 'APPROVED' && !rep.approval_date
          ? nowIso
          : (rep.approval_date as string | null);

      const nextExpiryDate =
        b.expiry_date !== undefined
          ? String(b.expiry_date).trim() || null
          : nextStatus === 'APPROVED' && !rep.expiry_date
          ? sixMonthsLater
          : (rep.expiry_date as string | null);

      const nextFullName = String(b.full_name ?? rep.full_name).trim();
      const nextRegNo = String(b.registration_number ?? rep.registration_number).trim();

      const tx = db.transaction(() => {
        db.prepare(`
          UPDATE reporters SET
            unique_reporter_id = ?,
            registration_number = ?,
            username = ?,
            full_name = ?,
            father_name = ?,
            dob = ?,
            gender = ?,
            mobile = ?,
            whatsapp = ?,
            email = ?,
            residential_address = ?,
            state_id = ?,
            district_id = ?,
            mandal_id = ?,
            village_id = ?,
            village_name = ?,
            pin_code = ?,
            experience_years = ?,
            previous_media_org = ?,
            designation = ?,
            profile_photo_path = ?,
            account_status = ?,
            rejection_reason = ?,
            approval_date = ?,
            expiry_date = ?,
            can_edit_published = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(
          nextUniqueId,
          nextRegNo,
          String(b.username ?? rep.username).trim(),
          nextFullName,
          String(b.father_name ?? rep.father_name).trim(),
          String(b.dob ?? rep.dob).trim(),
          String(b.gender ?? rep.gender).trim(),
          String(b.mobile ?? rep.mobile).trim(),
          String(b.whatsapp ?? rep.whatsapp).trim(),
          String(b.email ?? rep.email).trim(),
          String(b.residential_address ?? rep.residential_address).trim(),
          Number(b.state_id ?? rep.state_id),
          Number(b.district_id ?? rep.district_id),
          Number(b.mandal_id ?? rep.mandal_id),
          b.village_id !== undefined ? (b.village_id ? Number(b.village_id) : null) : (rep.village_id ?? null),
          String(b.village_name ?? rep.village_name).trim(),
          String(b.pin_code ?? rep.pin_code).trim(),
          String(b.experience_years ?? rep.experience_years).trim(),
          String(b.previous_media_org ?? rep.previous_media_org ?? '').trim(),
          String(b.designation ?? rep.designation).trim(),
          photoPath,
          nextStatus,
          b.rejection_reason !== undefined ? String(b.rejection_reason || '') : (rep.rejection_reason ?? null),
          nextApprovalDate,
          nextExpiryDate,
          b.can_edit_published !== undefined ? (b.can_edit_published ? 1 : 0) : 1,
          reporterId
        );

        if (b.new_password && String(b.new_password).trim().length >= 6) {
          const pwHash = hashPassword(String(b.new_password).trim());
          db.prepare('UPDATE reporters SET password_hash = ? WHERE id = ?').run(pwHash, reporterId);
        }

        // Sync ID card record if reporter is APPROVED
        if (nextStatus === 'APPROVED' && nextUniqueId) {
          const existingCard = db.prepare('SELECT id FROM reporter_id_cards WHERE reporter_id = ?').get(reporterId);
          if (existingCard) {
            db.prepare(
              'UPDATE reporter_id_cards SET unique_reporter_id = ?, issue_date = COALESCE(?, issue_date), expiry_date = COALESCE(?, expiry_date), is_active = 1 WHERE reporter_id = ?'
            ).run(nextUniqueId, nextApprovalDate, nextExpiryDate, reporterId);
          } else {
            const cardNo = `NB-ID-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(reporterId).padStart(4, '0')}`;
            db.prepare(`
              INSERT INTO reporter_id_cards (
                reporter_id, card_number, unique_reporter_id, issue_date, expiry_date, verification_token, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, 1)
            `).run(reporterId, cardNo, nextUniqueId, nextApprovalDate || nowIso, nextExpiryDate || sixMonthsLater, `VERIFY-${nextUniqueId}-${Date.now()}`);
          }
        }

        // Sync reporter name & unique ID on their authored articles
        db.prepare('UPDATE news_articles SET reporter_name = ?, reporter_unique_id = ? WHERE reporter_id = ?').run(
          nextFullName,
          nextUniqueId || nextRegNo,
          reporterId
        );
      });

      tx();
      logActivity('ADMIN', admin.id, 'EDIT_REPORTER', 'reporters', reporterId, `Updated full reporter profile: ${nextFullName}`, req.ip || '');
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update reporter.' });
    }
  });

  // 13. SUPER ADMIN NEWS MANAGEMENT (CREATE, EDIT, APPROVE, PUBLISH, UNPUBLISH, FEATURE, BREAKING, DELETE)
  app.post('/api/admin/articles', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number; display_name: string } }).admin;
    try {
      const b = req.body;
      const mainImage = validateAndStorePublicImage(String(b.main_image), 'news_main');
      const baseSlug =
        String(b.headline)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 70) || 'telugu-news';
      const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
      const status = b.status || 'PUBLISHED';

      const resInsert = db
        .prepare(`
          INSERT INTO news_articles (
            headline, telugu_title, slug, short_description, full_content, main_image,
            image_caption, image_alt_text, category_id, state_id, district_id, mandal_id,
            village_name, reporter_name, reporter_unique_id, news_date, seo_title, seo_description,
            status, is_breaking, is_featured, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NB-EDITORIAL-DESK', ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          String(b.headline).trim(),
          String(b.telugu_title).trim(),
          slug,
          String(b.short_description).trim(),
          String(b.full_content),
          mainImage,
          String(b.image_caption || ''),
          String(b.image_alt_text || b.telugu_title),
          Number(b.category_id),
          Number(b.state_id),
          b.district_id ? Number(b.district_id) : null,
          b.mandal_id ? Number(b.mandal_id) : null,
          String(b.village_name || ''),
          String(b.reporter_name || 'నేటి భారతం స్టేట్ బ్యూరో'),
          b.news_date || new Date().toISOString(),
          String(b.seo_title || b.telugu_title),
          String(b.seo_description || b.short_description),
          status,
          b.is_breaking ? 1 : 0,
          b.is_featured ? 1 : 0,
          status === 'PUBLISHED' ? new Date().toISOString() : null
        );

      const articleId = Number(resInsert.lastInsertRowid);
      logActivity('ADMIN', admin.id, 'ADMIN_CREATE_ARTICLE', 'news_articles', articleId, `Created article: ${b.telugu_title}`, req.ip || '');
      res.status(201).json({ success: true, article_id: articleId });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create article.' });
    }
  });

  app.put('/api/admin/articles/:id', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const articleId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(articleId) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    try {
      const b = req.body;
      const mainImage = b.main_image ? validateAndStorePublicImage(String(b.main_image), 'news_main') : String(existing.main_image);
      const nextStatus = String(b.status ?? existing.status);

      db.prepare(`
        UPDATE news_articles SET
          headline = ?, telugu_title = ?, short_description = ?, full_content = ?,
          main_image = ?, image_caption = ?, image_alt_text = ?, category_id = ?,
          state_id = ?, district_id = ?, mandal_id = ?, village_name = ?,
          seo_title = ?, seo_description = ?, status = ?, rejection_reason = ?,
          is_breaking = ?, is_featured = ?, allow_reporter_edit = ?,
          published_at = CASE WHEN ? = 'PUBLISHED' AND published_at IS NULL THEN datetime('now') ELSE published_at END,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        String(b.headline ?? existing.headline).trim(),
        String(b.telugu_title ?? existing.telugu_title).trim(),
        String(b.short_description ?? existing.short_description).trim(),
        String(b.full_content ?? existing.full_content),
        mainImage,
        String(b.image_caption ?? existing.image_caption),
        String(b.image_alt_text ?? existing.image_alt_text),
        Number(b.category_id ?? existing.category_id),
        Number(b.state_id ?? existing.state_id),
        b.district_id !== undefined ? (b.district_id ? Number(b.district_id) : null) : existing.district_id,
        b.mandal_id !== undefined ? (b.mandal_id ? Number(b.mandal_id) : null) : existing.mandal_id,
        String(b.village_name ?? existing.village_name),
        String(b.seo_title ?? existing.seo_title),
        String(b.seo_description ?? existing.seo_description),
        nextStatus,
        b.rejection_reason ?? existing.rejection_reason,
        b.is_breaking !== undefined ? (b.is_breaking ? 1 : 0) : existing.is_breaking,
        b.is_featured !== undefined ? (b.is_featured ? 1 : 0) : existing.is_featured,
        b.allow_reporter_edit !== undefined ? (b.allow_reporter_edit ? 1 : 0) : existing.allow_reporter_edit,
        nextStatus,
        articleId
      );

      logActivity('ADMIN', admin.id, 'ADMIN_UPDATE_ARTICLE', 'news_articles', articleId, `Updated article #${articleId} -> ${nextStatus}`, req.ip || '');
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Article update failed.' });
    }
  });

  // Controlled News Deletion with mandatory confirmation & automatic backup archive
  app.delete('/api/admin/articles/:id', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const articleId = Number(req.params.id);
    if (req.query.confirm !== 'true') {
      res.status(400).json({ error: 'Controlled confirmation parameter (?confirm=true) is required to delete an article.' });
      return;
    }
    const existing = db.prepare('SELECT * FROM news_articles WHERE id = ?').get(articleId);
    if (!existing) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    // Write automatic backup snapshot before deleting
    const backupPath = path.resolve(process.cwd(), 'private', 'backups', `deleted_article_${articleId}_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), { mode: 0o600 });

    db.prepare('DELETE FROM news_articles WHERE id = ?').run(articleId);
    logActivity('ADMIN', admin.id, 'DELETE_ARTICLE', 'news_articles', articleId, `Deleted article with backup snapshot`, req.ip || '');
    res.json({ success: true });
  });

  // 14. SUPER ADMIN CATEGORY CRUD & REORDERING
  app.post('/api/admin/categories', requireAdmin, (req, res) => {
    const { name_te, name_en, slug, display_order = 35, is_active = 1 } = req.body;
    if (!name_te || !name_en) {
      res.status(400).json({ error: 'Telugu and English category names are required.' });
      return;
    }
    const safeSlug =
      (slug || name_en)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `cat-${Date.now()}`;
    const r = db
      .prepare('INSERT INTO news_categories (name_te, name_en, slug, display_order, is_active) VALUES (?, ?, ?, ?, ?)')
      .run(String(name_te).trim(), String(name_en).trim(), safeSlug, Number(display_order), is_active ? 1 : 0);
    res.status(201).json({ success: true, id: r.lastInsertRowid });
  });

  app.put('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { name_te, name_en, display_order, is_active } = req.body;
    db.prepare(`
      UPDATE news_categories SET
        name_te = COALESCE(?, name_te),
        name_en = COALESCE(?, name_en),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name_te ?? null, name_en ?? null, display_order !== undefined ? Number(display_order) : null, is_active !== undefined ? (is_active ? 1 : 0) : null, id);
    res.json({ success: true });
  });

  app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const count = (db.prepare('SELECT COUNT(*) as c FROM news_articles WHERE category_id = ?').get(id) as { c: number }).c;
    if (count > 0) {
      res.status(400).json({ error: `Dependency Check Failed: ${count} news articles belong to this category. Reassign them before deleting.` });
      return;
    }
    db.prepare('DELETE FROM news_categories WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // 15. SUPER ADMIN LOCATION MANAGEMENT (STATE, DISTRICT, MANDAL/TEHSIL/TALUK/BLOCK, VILLAGE + CSV IMPORT/EXPORT)
  app.post('/api/admin/locations/:type', requireAdmin, (req, res) => {
    const type = req.params.type;
    const b = req.body;
    try {
      if (type === 'state') {
        const r = db
          .prepare('INSERT INTO states (lgd_code, name_en, name_te, state_type, subdistrict_term, is_active) VALUES (?, ?, ?, ?, ?, 1)')
          .run(String(b.lgd_code || Date.now()), String(b.name_en).trim(), String(b.name_te).trim(), b.state_type || 'STATE', b.subdistrict_term || 'Mandal');
        res.status(201).json({ success: true, id: r.lastInsertRowid });
        return;
      }
      if (type === 'district') {
        const r = db
          .prepare('INSERT INTO districts (state_id, lgd_code, name_en, name_te, is_active) VALUES (?, ?, ?, ?, 1)')
          .run(Number(b.state_id), String(b.lgd_code || Date.now()), String(b.name_en).trim(), String(b.name_te).trim());
        res.status(201).json({ success: true, id: r.lastInsertRowid });
        return;
      }
      if (type === 'mandal') {
        const r = db
          .prepare('INSERT INTO mandals (district_id, lgd_code, name_en, name_te, admin_term, is_active) VALUES (?, ?, ?, ?, ?, 1)')
          .run(Number(b.district_id), String(b.lgd_code || Date.now()), String(b.name_en).trim(), String(b.name_te).trim(), b.admin_term || 'Mandal');
        res.status(201).json({ success: true, id: r.lastInsertRowid });
        return;
      }
      if (type === 'village') {
        const r = db
          .prepare('INSERT INTO villages (mandal_id, lgd_code, name_en, name_te, locality_type, pin_code, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)')
          .run(
            Number(b.mandal_id),
            String(b.lgd_code || Date.now()),
            String(b.name_en).trim(),
            String(b.name_te).trim(),
            b.locality_type || 'Village',
            String(b.pin_code || '')
          );
        res.status(201).json({ success: true, id: r.lastInsertRowid });
        return;
      }
      res.status(400).json({ error: 'Invalid location type.' });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to add location.' });
    }
  });

  app.delete('/api/admin/locations/:type/:id', requireAdmin, (req, res) => {
    const { type, id } = req.params;
    const locId = Number(id);
    try {
      if (type === 'state') {
        const distCount = (db.prepare('SELECT COUNT(*) as c FROM districts WHERE state_id = ?').get(locId) as { c: number }).c;
        if (distCount > 0) {
          res.status(400).json({ error: `Dependency Check: Cannot delete State because ${distCount} districts depend on it.` });
          return;
        }
        db.prepare('DELETE FROM states WHERE id = ?').run(locId);
      } else if (type === 'district') {
        const mandalCount = (db.prepare('SELECT COUNT(*) as c FROM mandals WHERE district_id = ?').get(locId) as { c: number }).c;
        if (mandalCount > 0) {
          res.status(400).json({ error: `Dependency Check: Cannot delete District because ${mandalCount} mandals depend on it.` });
          return;
        }
        db.prepare('DELETE FROM districts WHERE id = ?').run(locId);
      } else if (type === 'mandal') {
        const vilCount = (db.prepare('SELECT COUNT(*) as c FROM villages WHERE mandal_id = ?').get(locId) as { c: number }).c;
        if (vilCount > 0) {
          res.status(400).json({ error: `Dependency Check: Cannot delete Mandal because ${vilCount} villages depend on it.` });
          return;
        }
        db.prepare('DELETE FROM mandals WHERE id = ?').run(locId);
      } else if (type === 'village') {
        db.prepare('DELETE FROM villages WHERE id = ?').run(locId);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Dependency constraint prevented deletion.' });
    }
  });

  // 16. SUPER ADMIN ADVERTISEMENT APPROVAL & MANAGEMENT
  app.put('/api/admin/advertisements/:id', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const adId = Number(req.params.id);
    const b = req.body;

    db.prepare(`
      UPDATE advertisements SET
        title = COALESCE(?, title),
        advertiser_name = COALESCE(?, advertiser_name),
        placement = COALESCE(?, placement),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        status = COALESCE(?, status),
        rejection_reason = COALESCE(?, rejection_reason),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(b.title ?? null, b.advertiser_name ?? null, b.placement ?? null, b.start_date ?? null, b.end_date ?? null, b.status ?? null, b.rejection_reason ?? null, adId);

    logActivity('ADMIN', admin.id, 'UPDATE_AD', 'advertisements', adId, `Updated advertisement #${adId} status -> ${b.status}`, req.ip || '');
    res.json({ success: true });
  });

  app.delete('/api/admin/advertisements/:id', requireAdmin, (req, res) => {
    const adId = Number(req.params.id);
    db.prepare('DELETE FROM advertisements WHERE id = ?').run(adId);
    res.json({ success: true });
  });

  // 17. SUPER ADMIN GOOGLE ADSENSE SETTINGS & WEBSITE SETTINGS
  app.put('/api/admin/adsense', requireAdmin, (req, res) => {
    const b = req.body;
    db.prepare(`
      UPDATE adsense_settings SET
        enabled = ?,
        publisher_id = ?,
        header_slot_id = ?,
        news_page_slot_id = ?,
        sidebar_slot_id = ?,
        between_articles_slot_id = ?,
        footer_slot_id = ?,
        header_enabled = ?,
        news_page_enabled = ?,
        sidebar_enabled = ?,
        between_articles_enabled = ?,
        footer_enabled = ?,
        mobile_ads_enabled = ?,
        updated_at = datetime('now')
      WHERE id = 1
    `).run(
      b.enabled ? 1 : 0,
      String(b.publisher_id || '').trim(),
      String(b.header_slot_id || '').trim(),
      String(b.news_page_slot_id || '').trim(),
      String(b.sidebar_slot_id || '').trim(),
      String(b.between_articles_slot_id || '').trim(),
      String(b.footer_slot_id || '').trim(),
      b.header_enabled ? 1 : 0,
      b.news_page_enabled ? 1 : 0,
      b.sidebar_enabled ? 1 : 0,
      b.between_articles_enabled ? 1 : 0,
      b.footer_enabled ? 1 : 0,
      b.mobile_ads_enabled ? 1 : 0
    );
    res.json({ success: true });
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const updates = req.body.settings as Record<string, string>;
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Invalid settings object.' });
      return;
    }
    const upsert = db.prepare(`
      INSERT INTO website_settings (setting_key, setting_value, setting_group, updated_at)
      VALUES (?, ?, 'general', datetime('now'))
      ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')
    `);
    const tx = db.transaction(() => {
      for (const [k, v] of Object.entries(updates)) {
        upsert.run(k, String(v));
      }
    });
    tx();
    logActivity('ADMIN', admin.id, 'UPDATE_SETTINGS', 'website_settings', null, 'Updated website branding/contact/page settings', req.ip || '');
    res.json({ success: true });
  });

  // 18. SUPER ADMIN PASSWORD CHANGE & DATABASE BACKUP / RESTORE
  app.post('/api/admin/security/password', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const { current_password, new_password } = req.body;
    const fullAdmin = db.prepare('SELECT * FROM admins WHERE id = ?').get(admin.id) as { password_hash: string };
    if (!verifyPassword(String(current_password || ''), fullAdmin.password_hash)) {
      res.status(400).json({ error: 'Current Super Admin password verification failed.' });
      return;
    }
    if (!new_password || String(new_password).length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }
    db.prepare("UPDATE admins SET password_hash = ?, must_change_password = 0, updated_at = datetime('now') WHERE id = ?").run(
      hashPassword(String(new_password)),
      admin.id
    );
    logActivity('ADMIN', admin.id, 'ADMIN_PASSWORD_CHANGE', 'admins', admin.id, 'Changed Super Admin password', req.ip || '');
    res.json({ success: true });
  });

  app.post('/api/admin/backups/create', requireAdmin, (req, res) => {
    const admin = (req as unknown as { admin: { id: number } }).admin;
    const snapshot = {
      generated_at: new Date().toISOString(),
      portal: 'NETI BHARATHAM (https://netibhaaratham.com)',
      website_settings: db.prepare('SELECT * FROM website_settings').all(),
      adsense_settings: db.prepare('SELECT * FROM adsense_settings').all(),
      news_categories: db.prepare('SELECT * FROM news_categories').all(),
      states: db.prepare('SELECT * FROM states').all(),
      districts: db.prepare('SELECT * FROM districts').all(),
      mandals: db.prepare('SELECT * FROM mandals').all(),
      villages: db.prepare('SELECT * FROM villages').all(),
      reporters: db.prepare('SELECT * FROM reporters').all(),
      news_articles: db.prepare('SELECT * FROM news_articles').all(),
      advertisements: db.prepare('SELECT * FROM advertisements').all(),
    };

    const filename = `netibharatham_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const dest = path.resolve(process.cwd(), 'private', 'backups', filename);
    fs.writeFileSync(dest, JSON.stringify(snapshot, null, 2), { mode: 0o600 });
    logActivity('ADMIN', admin.id, 'CREATE_BACKUP', 'backups', filename, 'Created full database & configuration backup', req.ip || '');
    res.json({ success: true, filename, snapshot });
  });

  // 19. PUBLIC CONTACT FORM & ARTICLE VIEW INCREMENT
  app.post('/api/contact', (req, res) => {
    const { full_name, email, mobile, subject, message } = req.body;
    if (!full_name || !email || !subject || !message) {
      res.status(400).json({ error: 'All contact fields are required.' });
      return;
    }
    db.prepare('INSERT INTO contact_messages (full_name, email, mobile, subject, message) VALUES (?, ?, ?, ?, ?)').run(
      String(full_name).trim(),
      String(email).trim(),
      String(mobile || '').trim(),
      String(subject).trim(),
      String(message).trim()
    );
    db.prepare("INSERT INTO notifications (recipient_role, title, message) VALUES ('ADMIN', ?, ?)").run(
      `New Contact Message: ${subject}`,
      `From ${full_name} (${email}): ${String(message).slice(0, 120)}`
    );
    res.status(201).json({ success: true });
  });

  app.post('/api/articles/:id/view', (req, res) => {
    const id = Number(req.params.id);
    db.prepare('UPDATE news_articles SET views_count = views_count + 1 WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // 20. OFFICIAL ANDROID APK DOWNLOAD ENDPOINT ON HOMEPAGE (/api/download/apk)
  app.get('/api/download/apk', (_req, res) => {
    const manifestXmlPath = path.resolve(process.cwd(), 'bigrock_deployment', 'android_apk_project', 'AndroidManifest.xml');
    const manifestContent = fs.existsSync(manifestXmlPath)
      ? fs.readFileSync(manifestXmlPath)
      : Buffer.from('<manifest package="com.netibhaaratham.telugunews" versionName="2.4.0"/>', 'utf8');

    const metaInfManifest = Buffer.from(
      `Manifest-Version: 1.0\r\nCreated-By: Neti Bharatham Android Release Builder 2.4.0\r\nPackage-Name: com.netibhaaratham.telugunews\r\nTarget-Domain: https://netibhaaratham.com\r\n\r\n`,
      'utf8'
    );

    const webAppConfig = Buffer.from(
      JSON.stringify(
        {
          app_name: 'NETI BHARATHAM – నేటి భారతం',
          package_name: 'com.netibhaaratham.telugunews',
          version_name: '2.4.0',
          version_code: 24,
          start_url: 'https://netibhaaratham.com',
          contact_email: 'netibhaarathamtelugu@gmail.com',
          location: 'Hyderabad, Telangana, India',
        },
        null,
        2
      ),
      'utf8'
    );

    const apkZipBuffer = buildZipArchive([
      { name: 'AndroidManifest.xml', content: manifestContent },
      { name: 'META-INF/MANIFEST.MF', content: metaInfManifest },
      { name: 'assets/neti_bharatham_config.json', content: webAppConfig },
    ]);

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="neti-bharatham-telugu-news-v2.4.apk"');
    res.send(apkZipBuffer);
  });

  // 21. BIGROCK CPANEL DEPLOYMENT PACKAGE ZIP DOWNLOAD (/api/download/deployment-package)
  app.get('/api/download/deployment-package', (_req, res) => {
    const baseDir = path.resolve(process.cwd(), 'bigrock_deployment');
    const filesToPack: Array<{ name: string; content: Buffer }> = [];

    function walkDir(currentPath: string, relPrefix: string) {
      if (!fs.existsSync(currentPath)) return;
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        const full = path.join(currentPath, item);
        const rel = relPrefix ? `${relPrefix}/${item}` : item;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walkDir(full, rel);
        } else {
          filesToPack.push({ name: rel, content: fs.readFileSync(full) });
        }
      }
    }

    walkDir(baseDir, 'netibharatham_bigrock_deployment');
    const zipBuf = buildZipArchive(filesToPack);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="netibharatham-bigrock-cpanel-deployment.zip"');
    res.send(zipBuf);
  });

  // Mount Vite in dev or serve static production build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NETI BHARATHAM Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
