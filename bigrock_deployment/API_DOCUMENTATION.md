# NETI BHARATHAM (నేటి భారతం) – REST API & DATABASE DOCUMENTATION

## 1. Normalized MySQL 8 / SQLite Relational Schema (22 Tables)

| # | Table Name | Purpose | Key Constraints & Indexes |
|---|---|---|---|
| 1 | `admins` | Super Admin credentials, 2FA, lockout counters, `must_change_password` flag | `uk_admins_username`, `uk_admins_email` |
| 2 | `states` | All 28 Indian States + 8 Union Territories (LGD verified) with `subdistrict_term` | `uk_states_lgd`, `idx_states_active` |
| 3 | `districts` | Districts mapped to States with LGD codes & Telugu names | `fk_districts_state` (`ON DELETE RESTRICT`) |
| 4 | `mandals` | Mandal / Tehsil / Taluk / Block / Subdistrict hierarchy | `fk_mandals_district` (`ON DELETE RESTRICT`) |
| 5 | `villages` | Villages / Towns / Wards mapped to Mandals with PIN codes | `fk_villages_mandal` (`ON DELETE RESTRICT`) |
| 6 | `reporters` | Reporter registration, location, status (`PENDING`/`APPROVED`/`REJECTED`/`SUSPENDED`/`EXPIRED`), 6-month `expiry_date` | `uk_reporters_unique_id`, `uk_reporters_reg_no` |
| 7 | `reporter_documents` | Private identity document metadata, masked reference, SHA-256 checksum, AES-256 IV | `fk_rep_docs_reporter` (`ON DELETE CASCADE`) |
| 8 | `reporter_id_cards` | Issued Reporter Press ID cards, issue/expiry dates, QR verification token | `uk_id_cards_number`, `fk_id_cards_reporter` |
| 9 | `reporter_renewals` | Audit trail of 6-month membership renewals by Super Admin | `fk_renewals_reporter` |
| 10 | `news_categories` | 32 default Telugu news categories with `display_order` and active toggle | `uk_categories_slug` |
| 11 | `news_articles` | Unlimited news articles with Telugu headline, SEO fields, location, status workflow | `uk_news_slug`, `idx_news_status_date` |
| 12 | `news_images` | Multiple supporting gallery images & captions per news article | `fk_news_images_article` (`ON DELETE CASCADE`) |
| 13 | `advertisements` | Private advertisements submitted by reporters or admin | `idx_ads_status_dates`, `idx_ads_placement` |
| 14 | `advertisement_images` | Strictly enforces max 2 images (`image_slot` 1 or 2) per advertisement | `uk_ad_image_slot` |
| 15 | `website_settings` | Editable branding, colors, logo, ticker, contact details, legal pages | `uk_website_settings_key` |
| 16 | `adsense_settings` | Admin-only Google AdSense publisher ID and placement toggles | Primary Key `id=1` |
| 17 | `menus` | Editable header, footer, and mobile menu items | `idx_menus_location_order` |
| 18 | `contact_messages` | Public Contact Us submissions | Primary Key `id` |
| 19 | `notifications` | Admin & Reporter alerts (pending registrations, expiry reminders, approvals) | `idx_notifications_recipient` |
| 20 | `login_logs` | Security audit of successful, failed, and rate-limited login attempts | `idx_login_logs_role_time` |
| 21 | `activity_logs` | Complete CRUD & approval audit trail | `idx_activity_logs_time` |
| 22 | `password_resets` | Time-limited SHA-256 hashed password reset tokens | `idx_pw_resets_token` |

---

## 2. REST API Endpoints (`/api/*`)

### Public Endpoints
- `GET /api/bootstrap` — Returns public website settings, active categories, LGD location hierarchy, published articles, active approved advertisements, and CSRF token.
- `GET /api/articles` — Supports filtering by `category_id`, `state_id`, `district_id`, `mandal_id`, `search`, `is_breaking`, `is_featured`, and pagination.
- `GET /api/articles/:slug` — Fetches single published article, increments view counter, and returns supporting gallery images + related news.
- `POST /api/contact` — Saves visitor message to `contact_messages` and creates Admin notification.
- `GET /api/download/apk` — Downloads the official Android APK (`neti-bharatham-v2.4.apk`) directly from the homepage.
- `GET /api/download/deployment-package` — Downloads the BigRock PHP + MySQL deployment bundle.

### Authentication & First-Run Setup Endpoints
- `GET /api/auth/session` — Returns current authenticated session (`SUPER_ADMIN`, `REPORTER`, or `PUBLIC`) and checks if initial Super Admin setup is required.
- `POST /api/auth/setup-admin` — First-run wizard endpoint to create or update the initial Super Admin password using `password_hash` rules (no hardcoded default password required).
- `POST /api/auth/login` — Rate-limited login for Super Admin or Reporter; records attempt in `login_logs`.
- `POST /api/auth/logout` — Destroys session securely.

### Reporter Endpoints (Requires `REPORTER` Role)
- `POST /api/reporters/register` — Public registration endpoint; validates fields & file uploads, stores identity document in private encrypted storage, sets status to `PENDING`.
- `GET /api/reporter/dashboard` — Returns reporter profile, ID card, 6-month expiry status, own news articles, and own advertisements.
- `POST /api/reporter/profile/update` — **Strict RBAC**: Allows editing **ONLY** `password` and `residential_address`. Rejects any payload attempting to edit `full_name`, `mobile`, `email`, `dob`, `state_id`, `district_id`, `mandal_id`, `designation`, or `unique_reporter_id` with HTTP `403 Forbidden`.
- `POST /api/reporter/articles` — Unlimited news submission (`DRAFT` or `PENDING`) with main featured image and multiple supporting images. Blocked automatically if account status is `PENDING`, `SUSPENDED`, `REJECTED`, or `EXPIRED` (> 6 months).
- `PUT /api/reporter/articles/:id` — Edit own unpublished news (`DRAFT`/`PENDING`) or published news if `allow_reporter_edit = 1`.
- `POST /api/reporter/advertisements` — Submit private advertisement with up to **2 images maximum**; status defaults to `PENDING`.

### Super Admin Endpoints (Requires `SUPER_ADMIN` Role)
- `GET /api/admin/overview` — Full dashboard metrics, reporters list, articles, advertisements, AdSense settings, login logs, activity logs, notifications, and backups.
- `POST /api/admin/reporters/:id/status` — Approve (auto-generates `unique_reporter_id`, `reporter_id_cards` record, `approval_date`, and +6 months `expiry_date`), Reject (with reason), Suspend, Reactivate, or Renew (+6 months recorded in `reporter_renewals`).
- `PUT /api/admin/reporters/:id` — Full edit of all reporter details including name, mobile, email, location, designation, photo, and password reset.
- `GET /api/admin/reporters/:id/document` — Streams private identity verification document exclusively to authenticated Super Admin.
- `POST /api/admin/articles` / `PUT /api/admin/articles/:id` / `DELETE /api/admin/articles/:id` — Complete News CRUD, category/location reassignment, breaking/featured flags, publish/unpublish, and controlled deletion with backup log.
- `POST /api/admin/categories` / `PUT /api/admin/categories/:id` / `DELETE /api/admin/categories/:id` — Category CRUD, reordering, and activation toggle.
- `POST /api/admin/locations/:type` / `PUT /api/admin/locations/:type/:id` / `DELETE /api/admin/locations/:type/:id` — Full CRUD for States, Districts, Mandals/Tehsils/Taluks/Blocks, and Villages with foreign-key dependency checks + CSV import/export.
- `PUT /api/admin/advertisements/:id` / `DELETE /api/admin/advertisements/:id` — Approve, reject, activate, deactivate, edit, or delete private advertisements.
- `PUT /api/admin/adsense` — Update Admin-only Google AdSense configuration.
- `PUT /api/admin/settings` — Update website title, logo, colors, ticker, contact details, social links, and legal pages.
- `POST /api/admin/backups/create` / `POST /api/admin/backups/restore` — Create downloadable SQL & JSON database backup in `private/backups/` and restore safely.
