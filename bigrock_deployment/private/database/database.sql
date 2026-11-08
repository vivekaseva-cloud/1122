-- =============================================================================
-- NETI BHARATHAM (నేటి భారతం) - OFFICIAL MYSQL 8.0 / MARIADB PRODUCTION SCHEMA
-- Domain: https://netibhaaratham.com
-- Contact: netibhaarathamtelugu@gmail.com | Location: Hyderabad, Telangana, India
-- Target Hosting: BigRock Multi Domain Linux Hosting (cPanel)
-- Character Set: utf8mb4 (Full Telugu Unicode Support)
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+05:30';
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

START TRANSACTION;

-- -----------------------------------------------------------------------------
-- 1. TABLE: admins
-- Note: No hardcoded administrator passwords exist in this schema.
-- The initial Super Admin account is provisioned exclusively via the secure
-- first-run installation wizard (install.php) using PHP password_hash().
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(120) NOT NULL DEFAULT 'Admin',
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `two_factor_secret` VARCHAR(128) DEFAULT NULL,
  `failed_login_attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_username` (`username`),
  UNIQUE KEY `uk_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLE: states (All 28 Indian States + 8 Union Territories - LGD Verified)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `states` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lgd_code` VARCHAR(10) NOT NULL,
  `name_en` VARCHAR(120) NOT NULL,
  `name_te` VARCHAR(160) NOT NULL,
  `state_type` ENUM('STATE','UT') NOT NULL DEFAULT 'STATE',
  `subdistrict_term` ENUM('Mandal','Tehsil','Taluk','Block','Subdistrict') NOT NULL DEFAULT 'Mandal',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_states_lgd` (`lgd_code`),
  KEY `idx_states_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABLE: districts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `districts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_id` INT UNSIGNED NOT NULL,
  `lgd_code` VARCHAR(16) NOT NULL,
  `name_en` VARCHAR(120) NOT NULL,
  `name_te` VARCHAR(160) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_districts_state_name` (`state_id`, `name_en`),
  KEY `idx_districts_state` (`state_id`),
  CONSTRAINT `fk_districts_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLE: mandals (Mandal / Tehsil / Taluk / Block / Subdistrict)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mandals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `district_id` INT UNSIGNED NOT NULL,
  `lgd_code` VARCHAR(20) NOT NULL,
  `name_en` VARCHAR(120) NOT NULL,
  `name_te` VARCHAR(160) NOT NULL,
  `admin_term` ENUM('Mandal','Tehsil','Taluk','Block','Subdistrict') NOT NULL DEFAULT 'Mandal',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mandals_district_name` (`district_id`, `name_en`),
  KEY `idx_mandals_district` (`district_id`),
  CONSTRAINT `fk_mandals_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLE: villages (Village / Town / Ward)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `villages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mandal_id` INT UNSIGNED NOT NULL,
  `lgd_code` VARCHAR(24) DEFAULT NULL,
  `name_en` VARCHAR(140) NOT NULL,
  `name_te` VARCHAR(180) NOT NULL,
  `locality_type` ENUM('Village','Town','Municipality','Ward') NOT NULL DEFAULT 'Village',
  `pin_code` VARCHAR(10) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_villages_mandal` (`mandal_id`),
  CONSTRAINT `fk_villages_mandal` FOREIGN KEY (`mandal_id`) REFERENCES `mandals` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABLE: reporters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reporters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `unique_reporter_id` VARCHAR(32) DEFAULT NULL,
  `registration_number` VARCHAR(40) NOT NULL,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150) NOT NULL,
  `dob` DATE NOT NULL,
  `gender` ENUM('Male','Female','Other') NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `residential_address` TEXT NOT NULL,
  `state_id` INT UNSIGNED NOT NULL,
  `district_id` INT UNSIGNED NOT NULL,
  `mandal_id` INT UNSIGNED NOT NULL,
  `village_id` INT UNSIGNED DEFAULT NULL,
  `village_name` VARCHAR(150) NOT NULL,
  `pin_code` VARCHAR(10) NOT NULL,
  `experience_years` VARCHAR(60) NOT NULL,
  `previous_media_org` VARCHAR(180) DEFAULT NULL,
  `designation` VARCHAR(120) NOT NULL DEFAULT 'Mandal Reporter',
  `preferred_categories` JSON DEFAULT NULL,
  `profile_photo_path` VARCHAR(255) NOT NULL,
  `account_status` ENUM('PENDING','APPROVED','REJECTED','SUSPENDED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `rejection_reason` TEXT DEFAULT NULL,
  `approval_date` DATETIME DEFAULT NULL,
  `expiry_date` DATETIME DEFAULT NULL,
  `renewal_date` DATETIME DEFAULT NULL,
  `approved_by_admin_id` INT UNSIGNED DEFAULT NULL,
  `can_edit_published` TINYINT(1) NOT NULL DEFAULT 0,
  `consent_accepted` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reporters_username` (`username`),
  UNIQUE KEY `uk_reporters_email` (`email`),
  UNIQUE KEY `uk_reporters_mobile` (`mobile`),
  UNIQUE KEY `uk_reporters_reg_no` (`registration_number`),
  UNIQUE KEY `uk_reporters_unique_id` (`unique_reporter_id`),
  KEY `idx_reporters_status` (`account_status`),
  KEY `idx_reporters_location` (`state_id`, `district_id`, `mandal_id`),
  KEY `idx_reporters_expiry` (`expiry_date`),
  CONSTRAINT `fk_reporters_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reporters_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reporters_mandal` FOREIGN KEY (`mandal_id`) REFERENCES `mandals` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TABLE: reporter_documents (Private Encrypted Identity Verification)
-- Never exposed publicly. Stored outside public_html in private/identity_documents/
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reporter_documents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reporter_id` INT UNSIGNED NOT NULL,
  `document_type` ENUM('VOTER_ID','DRIVING_LICENSE','PASSPORT','PAN_CARD','PRESS_ACCREDITATION','MASKED_GOVT_ID') NOT NULL,
  `masked_document_ref` VARCHAR(64) NOT NULL,
  `private_storage_filename` VARCHAR(255) NOT NULL,
  `original_mime_type` VARCHAR(80) NOT NULL,
  `file_size_bytes` INT UNSIGNED NOT NULL,
  `sha256_checksum` CHAR(64) NOT NULL,
  `encryption_iv` VARCHAR(64) DEFAULT NULL,
  `consent_timestamp` DATETIME NOT NULL,
  `verified_by_admin_id` INT UNSIGNED DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rep_docs_reporter` (`reporter_id`),
  CONSTRAINT `fk_rep_docs_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `reporters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABLE: reporter_id_cards
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reporter_id_cards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reporter_id` INT UNSIGNED NOT NULL,
  `card_number` VARCHAR(40) NOT NULL,
  `unique_reporter_id` VARCHAR(32) NOT NULL,
  `issue_date` DATETIME NOT NULL,
  `expiry_date` DATETIME NOT NULL,
  `verification_token` VARCHAR(64) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_id_cards_number` (`card_number`),
  KEY `idx_id_cards_reporter` (`reporter_id`),
  CONSTRAINT `fk_id_cards_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `reporters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABLE: reporter_renewals
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reporter_renewals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reporter_id` INT UNSIGNED NOT NULL,
  `admin_id` INT UNSIGNED DEFAULT NULL,
  `previous_expiry_date` DATETIME DEFAULT NULL,
  `new_expiry_date` DATETIME NOT NULL,
  `renewal_date` DATETIME NOT NULL,
  `validity_months` INT UNSIGNED NOT NULL DEFAULT 6,
  `remarks` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_renewals_reporter` (`reporter_id`),
  CONSTRAINT `fk_renewals_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `reporters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TABLE: news_categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_te` VARCHAR(140) NOT NULL,
  `name_en` VARCHAR(140) NOT NULL,
  `slug` VARCHAR(140) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  KEY `idx_categories_order` (`display_order`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. TABLE: news_articles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `headline` VARCHAR(255) NOT NULL,
  `telugu_title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `short_description` TEXT NOT NULL,
  `full_content` LONGTEXT NOT NULL,
  `main_image` VARCHAR(255) NOT NULL,
  `image_caption` VARCHAR(255) DEFAULT NULL,
  `image_alt_text` VARCHAR(255) NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `state_id` INT UNSIGNED NOT NULL,
  `district_id` INT UNSIGNED DEFAULT NULL,
  `mandal_id` INT UNSIGNED DEFAULT NULL,
  `village_id` INT UNSIGNED DEFAULT NULL,
  `village_name` VARCHAR(150) DEFAULT NULL,
  `reporter_id` INT UNSIGNED DEFAULT NULL,
  `reporter_name` VARCHAR(150) NOT NULL,
  `reporter_unique_id` VARCHAR(40) NOT NULL,
  `news_date` DATETIME NOT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` VARCHAR(320) DEFAULT NULL,
  `status` ENUM('DRAFT','PENDING','APPROVED','PUBLISHED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejection_reason` TEXT DEFAULT NULL,
  `is_breaking` TINYINT(1) NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `allow_reporter_edit` TINYINT(1) NOT NULL DEFAULT 0,
  `views_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_news_slug` (`slug`),
  KEY `idx_news_status_date` (`status`, `news_date`),
  KEY `idx_news_category` (`category_id`, `status`),
  KEY `idx_news_location` (`state_id`, `district_id`, `mandal_id`),
  KEY `idx_news_reporter` (`reporter_id`),
  KEY `idx_news_flags` (`is_breaking`, `is_featured`),
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `news_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_news_state` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. TABLE: news_images (Multiple supporting images per news article)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` INT UNSIGNED NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_news_images_article` (`article_id`),
  CONSTRAINT `fk_news_images_article` FOREIGN KEY (`article_id`) REFERENCES `news_articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. TABLE: advertisements
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `advertiser_name` VARCHAR(160) NOT NULL,
  `contact_mobile` VARCHAR(20) NOT NULL,
  `contact_email` VARCHAR(191) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `state_id` INT UNSIGNED NOT NULL,
  `district_id` INT UNSIGNED DEFAULT NULL,
  `mandal_id` INT UNSIGNED DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `placement` ENUM('HEADER','SIDEBAR','BETWEEN_ARTICLES','ARTICLE_PAGE','FOOTER') NOT NULL DEFAULT 'SIDEBAR',
  `reporter_id` INT UNSIGNED DEFAULT NULL,
  `status` ENUM('PENDING','APPROVED','REJECTED','ACTIVE','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `rejection_reason` TEXT DEFAULT NULL,
  `impressions_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `clicks_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ads_status_dates` (`status`, `start_date`, `end_date`),
  KEY `idx_ads_placement` (`placement`, `status`),
  KEY `idx_ads_reporter` (`reporter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. TABLE: advertisement_images (Max 2 images per advertisement enforced)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `advertisement_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `advertisement_id` INT UNSIGNED NOT NULL,
  `image_path` VARCHAR(255) NOT NULL,
  `image_slot` TINYINT UNSIGNED NOT NULL COMMENT '1 or 2 (Maximum 2 images)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ad_image_slot` (`advertisement_id`, `image_slot`),
  CONSTRAINT `fk_ad_images_ad` FOREIGN KEY (`advertisement_id`) REFERENCES `advertisements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. TABLE: website_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` LONGTEXT DEFAULT NULL,
  `setting_group` VARCHAR(60) NOT NULL DEFAULT 'general',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_website_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. TABLE: adsense_settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `adsense_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `publisher_id` VARCHAR(64) DEFAULT '',
  `header_slot_id` VARCHAR(64) DEFAULT '',
  `news_page_slot_id` VARCHAR(64) DEFAULT '',
  `sidebar_slot_id` VARCHAR(64) DEFAULT '',
  `between_articles_slot_id` VARCHAR(64) DEFAULT '',
  `footer_slot_id` VARCHAR(64) DEFAULT '',
  `header_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `news_page_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `sidebar_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `between_articles_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `footer_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `mobile_ads_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. TABLE: menus
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `menu_location` ENUM('HEADER','FOOTER','MOBILE') NOT NULL DEFAULT 'HEADER',
  `label_te` VARCHAR(120) NOT NULL,
  `label_en` VARCHAR(120) NOT NULL,
  `target_route` VARCHAR(200) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_menus_location_order` (`menu_location`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 18. TABLE: contact_messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(140) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobile` VARCHAR(20) DEFAULT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('UNREAD','READ','REPLIED') NOT NULL DEFAULT 'UNREAD',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 19. TABLE: notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipient_role` ENUM('ADMIN','REPORTER') NOT NULL,
  `recipient_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_recipient` (`recipient_role`, `recipient_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 20. TABLE: login_logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_role` ENUM('ADMIN','REPORTER') NOT NULL,
  `user_identifier` VARCHAR(191) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('SUCCESS','FAILED','LOCKED') NOT NULL,
  `failure_reason` VARCHAR(191) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_logs_role_time` (`user_role`, `created_at`),
  KEY `idx_login_logs_ip` (`ip_address`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 21. TABLE: activity_logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_role` ENUM('ADMIN','REPORTER','SYSTEM') NOT NULL,
  `actor_id` INT UNSIGNED DEFAULT NULL,
  `action_type` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(80) NOT NULL,
  `entity_id` VARCHAR(80) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_logs_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 22. TABLE: password_resets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_role` ENUM('ADMIN','REPORTER') NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pw_resets_token` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DEFAULT SEED DATA: 32 TELUGU NEWS CATEGORIES
-- =============================================================================
INSERT INTO `news_categories` (`id`, `name_te`, `name_en`, `slug`, `display_order`, `is_active`) VALUES
(1, 'బ్రేకింగ్ న్యూస్', 'Breaking News', 'breaking-news', 1, 1),
(2, 'జాతీయ వార్తలు', 'National News', 'national-news', 2, 1),
(3, 'రాష్ట్ర వార్తలు', 'State News', 'state-news', 3, 1),
(4, 'రాజకీయాలు', 'Politics', 'politics', 4, 1),
(5, 'తెలంగాణ', 'Telangana', 'telangana', 5, 1),
(6, 'ఆంధ్రప్రదేశ్', 'Andhra Pradesh', 'andhra-pradesh', 6, 1),
(7, 'జిల్లా వార్తలు', 'District News', 'district-news', 7, 1),
(8, 'మండల వార్తలు', 'Mandal News', 'mandal-news', 8, 1),
(9, 'గ్రామీణ వార్తలు', 'Rural News', 'rural-news', 9, 1),
(10, 'విద్య', 'Education', 'education', 10, 1),
(11, 'ఉద్యోగాలు', 'Jobs & Employment', 'jobs', 11, 1),
(12, 'వ్యవసాయం', 'Agriculture', 'agriculture', 12, 1),
(13, 'రైతులు', 'Farmers', 'farmers', 13, 1),
(14, 'ఆరోగ్యం', 'Health', 'health', 14, 1),
(15, 'వైద్యం', 'Medicine', 'medicine', 15, 1),
(16, 'వ్యాపారం', 'Business', 'business', 16, 1),
(17, 'పరిశ్రమలు', 'Industries', 'industries', 17, 1),
(18, 'క్రైమ్', 'Crime', 'crime', 18, 1),
(19, 'న్యాయ వార్తలు', 'Legal & Courts', 'legal-news', 19, 1),
(20, 'పోలీస్', 'Police', 'police', 20, 1),
(21, 'రోడ్లు మరియు రవాణా', 'Roads & Transport', 'roads-transport', 21, 1),
(22, 'మహిళలు', 'Women', 'women', 22, 1),
(23, 'యువత', 'Youth', 'youth', 23, 1),
(24, 'క్రీడలు', 'Sports', 'sports', 24, 1),
(25, 'సినిమా', 'Cinema', 'cinema', 25, 1),
(26, 'వినోదం', 'Entertainment', 'entertainment', 26, 1),
(27, 'టెక్నాలజీ', 'Technology', 'technology', 27, 1),
(28, 'ఆధ్యాత్మికం', 'Spiritual', 'spiritual', 28, 1),
(29, 'ప్రభుత్వ పథకాలు', 'Government Schemes', 'government-schemes', 29, 1),
(30, 'స్థానిక కార్యక్రమాలు', 'Local Events', 'local-events', 30, 1),
(31, 'ప్రత్యేక కథనాలు', 'Special Stories', 'special-stories', 31, 1),
(32, 'ఇతర వార్తలు', 'Other News', 'other-news', 32, 1)
ON DUPLICATE KEY UPDATE `name_te` = VALUES(`name_te`);

-- =============================================================================
-- OFFICIAL LGD VERIFIED ALL 28 INDIAN STATES & 8 UNION TERRITORIES
-- =============================================================================
INSERT INTO `states` (`id`, `lgd_code`, `name_en`, `name_te`, `state_type`, `subdistrict_term`, `is_active`) VALUES
(1, '36', 'Telangana', 'తెలంగాణ', 'STATE', 'Mandal', 1),
(2, '28', 'Andhra Pradesh', 'ఆంధ్రప్రదేశ్', 'STATE', 'Mandal', 1),
(3, '29', 'Karnataka', 'కర్ణాటక', 'STATE', 'Taluk', 1),
(4, '33', 'Tamil Nadu', 'తమిళనాడు', 'STATE', 'Taluk', 1),
(5, '27', 'Maharashtra', 'మహారాష్ట్ర', 'STATE', 'Tehsil', 1),
(6, '21', 'Odisha', 'ఒడిశా', 'STATE', 'Tehsil', 1),
(7, '22', 'Chhattisgarh', 'ఛత్తీస్‌గఢ్', 'STATE', 'Tehsil', 1),
(8, '32', 'Kerala', 'కేరళ', 'STATE', 'Taluk', 1),
(9, '24', 'Gujarat', 'గుజరాత్', 'STATE', 'Taluk', 1),
(10, '23', 'Madhya Pradesh', 'మధ్యప్రదేశ్', 'STATE', 'Tehsil', 1),
(11, '08', 'Rajasthan', 'రాజస్థాన్', 'STATE', 'Tehsil', 1),
(12, '09', 'Uttar Pradesh', 'ఉత్తరప్రదేశ్', 'STATE', 'Tehsil', 1),
(13, '10', 'Bihar', 'బీహార్', 'STATE', 'Block', 1),
(14, '19', 'West Bengal', 'పశ్చిమ బెంగాల్', 'STATE', 'Block', 1),
(15, '20', 'Jharkhand', 'జార్ఖండ్', 'STATE', 'Block', 1),
(16, '03', 'Punjab', 'పంజాబ్', 'STATE', 'Tehsil', 1),
(17, '06', 'Haryana', 'హర్యానా', 'STATE', 'Tehsil', 1),
(18, '02', 'Himachal Pradesh', 'హిమాచల్ ప్రదేశ్', 'STATE', 'Tehsil', 1),
(19, '05', 'Uttarakhand', 'ఉత్తరాఖండ్', 'STATE', 'Tehsil', 1),
(20, '30', 'Goa', 'గోవా', 'STATE', 'Taluk', 1),
(21, '18', 'Assam', 'అస్సాం', 'STATE', 'Subdistrict', 1),
(22, '12', 'Arunachal Pradesh', 'అరుణాచల్ ప్రదేశ్', 'STATE', 'Subdistrict', 1),
(23, '14', 'Manipur', 'మణిపూర్', 'STATE', 'Subdistrict', 1),
(24, '17', 'Meghalaya', 'మేఘాలయ', 'STATE', 'Block', 1),
(25, '15', 'Mizoram', 'మిజోరం', 'STATE', 'Block', 1),
(26, '13', 'Nagaland', 'నాగాలాండ్', 'STATE', 'Subdistrict', 1),
(27, '11', 'Sikkim', 'సిక్కిం', 'STATE', 'Subdistrict', 1),
(28, '16', 'Tripura', 'త్రిపుర', 'STATE', 'Block', 1),
(29, '07', 'Delhi (NCT)', 'ఢిల్లీ (NCT)', 'UT', 'Tehsil', 1),
(30, '01', 'Jammu and Kashmir', 'జమ్మూ కాశ్మీర్', 'UT', 'Tehsil', 1),
(31, '37', 'Ladakh', 'లడఖ్', 'UT', 'Tehsil', 1),
(32, '04', 'Chandigarh', 'చండీగఢ్', 'UT', 'Tehsil', 1),
(33, '34', 'Puducherry', 'పుదుచ్చేరి', 'UT', 'Taluk', 1),
(34, '35', 'Andaman and Nicobar Islands', 'అండమాన్ నికోబార్ దీవులు', 'UT', 'Tehsil', 1),
(35, '38', 'Dadra and Nagar Haveli and Daman and Diu', 'దాద్రా నగర్ హవేలీ మరియు డామన్ డయ్యూ', 'UT', 'Taluk', 1),
(36, '31', 'Lakshadweep', 'లక్షద్వీప్', 'UT', 'Subdistrict', 1)
ON DUPLICATE KEY UPDATE `name_te` = VALUES(`name_te`);

-- =============================================================================
-- OFFICIAL 33 TELANGANA DISTRICTS (594 MANDALS) &
-- 28 ANDHRA PRADESH DISTRICTS INCLUDING POLAVARAM & MARKAPURAM (688 MANDALS)
-- =============================================================================
INSERT INTO `districts` (`id`, `state_id`, `lgd_code`, `name_en`, `name_te`, `is_active`) VALUES
-- Telangana: 33 Districts (state_id = 1)
(101, 1, '502', 'Hyderabad', 'హైదరాబాద్', 1),
(102, 1, '509', 'Ranga Reddy', 'రంగారెడ్డి', 1),
(103, 1, '689', 'Medchal-Malkajgiri', 'మేడ్చల్-మల్కాజిగిరి', 1),
(104, 1, '696', 'Sangareddy', 'సంగారెడ్డి', 1),
(105, 1, '503', 'Karimnagar', 'కరీంనగర్', 1),
(106, 1, '510', 'Warangal', 'వరంగల్', 1),
(107, 1, '681', 'Hanumakonda', 'హనుమకొండ', 1),
(108, 1, '504', 'Khammam', 'ఖమ్మం', 1),
(109, 1, '508', 'Nizamabad', 'నిజామాబాద్', 1),
(110, 1, '507', 'Nalgonda', 'నల్లగొండ', 1),
(111, 1, '505', 'Mahabubnagar', 'మహబూబ్‌నగర్', 1),
(112, 1, '501', 'Adilabad', 'ఆదిలాబాద్', 1),
(113, 1, '506', 'Medak', 'మెదక్', 1),
(114, 1, '697', 'Siddipet', 'సిద్దిపేట', 1),
(115, 1, '698', 'Suryapet', 'సూర్యాపేట', 1),
(116, 1, '679', 'Bhadradri Kothagudem', 'భద్రాద్రి కొత్తగూడెం', 1),
(117, 1, '682', 'Jagtial', 'జగిత్యాల', 1),
(118, 1, '683', 'Jangaon', 'జనగామ', 1),
(119, 1, '684', 'Jayashankar Bhupalpally', 'జయశంకర్ భూపాలపల్లి', 1),
(120, 1, '685', 'Jogulamba Gadwal', 'జోగులాంబ గద్వాల', 1),
(121, 1, '686', 'Kamareddy', 'కామారెడ్డి', 1),
(122, 1, '687', 'Kumuram Bheem Asifabad', 'కుమురం భీమ్ ఆసిఫాబాద్', 1),
(123, 1, '688', 'Mahabubabad', 'మహబూబాబాద్', 1),
(124, 1, '690', 'Mancherial', 'మంచిర్యాల', 1),
(125, 1, '719', 'Mulugu', 'ములుగు', 1),
(126, 1, '691', 'Nagarkurnool', 'నాగర్‌కర్నూల్', 1),
(127, 1, '720', 'Narayanpet', 'నారాయణపేట', 1),
(128, 1, '692', 'Nirmal', 'నిర్మల్', 1),
(129, 1, '693', 'Peddapalli', 'పెద్దపల్లి', 1),
(130, 1, '694', 'Rajanna Sircilla', 'రాజన్న సిరిసిల్ల', 1),
(131, 1, '699', 'Vikarabad', 'వికారాబాద్', 1),
(132, 1, '700', 'Wanaparthy', 'వనపర్తి', 1),
(133, 1, '701', 'Yadadri Bhuvanagiri', 'యాదాద్రి భువనగిరి', 1),
-- Andhra Pradesh: 28 Districts including Polavaram & Markapuram formed in Dec 2025 (state_id = 2)
(201, 2, '520', 'Visakhapatnam', 'విశాఖపట్నం', 1),
(202, 2, '749', 'NTR (Vijayawada)', 'ఎన్టీఆర్ (విజయవాడ)', 1),
(203, 2, '506_AP', 'Guntur', 'గుంటూరు', 1),
(204, 2, '752', 'Tirupati', 'తిరుపతి', 1),
(205, 2, '505_AP', 'East Godavari', 'తూర్పు గోదావరి', 1),
(206, 2, '746', 'Kakinada', 'కాకినాడ', 1),
(207, 2, '747', 'Dr. B.R. Ambedkar Konaseema', 'డా. బి.ఆర్. అంబేద్కర్ కోనసీమ', 1),
(208, 2, '523', 'West Godavari', 'పశ్చిమ గోదావరి', 1),
(209, 2, '748', 'Eluru', 'ఏలూరు', 1),
(210, 2, '510_AP', 'Krishna', 'కృష్ణా', 1),
(211, 2, '750', 'Palnadu', 'పల్నాడు', 1),
(212, 2, '751', 'Bapatla', 'బాపట్ల', 1),
(213, 2, '517', 'Prakasam', 'ప్రకాశం', 1),
(214, 2, '515', 'SPSR Nellore', 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు', 1),
(215, 2, '511', 'Kurnool', 'కర్నూలు', 1),
(216, 2, '755', 'Nandyal', 'నంద్యాల', 1),
(217, 2, '502_AP', 'Anantapuramu', 'అనంతపురం', 1),
(218, 2, '754', 'Sri Sathya Sai', 'శ్రీ సత్యసాయి', 1),
(219, 2, '504_AP', 'YSR Kadapa', 'వైఎస్ఆర్ కడప', 1),
(220, 2, '753', 'Annamayya', 'అన్నమయ్య', 1),
(221, 2, '503_AP', 'Chittoor', 'చిత్తూరు', 1),
(222, 2, '519', 'Srikakulam', 'శ్రీకాకుళం', 1),
(223, 2, '521', 'Vizianagaram', 'విజయనగరం', 1),
(224, 2, '743', 'Parvathipuram Manyam', 'పార్వతీపురం మన్యం', 1),
(225, 2, '744', 'Alluri Sitharama Raju', 'అల్లూరి సీతారామరాజు', 1),
(226, 2, '745', 'Anakapalli', 'అనకాపల్లి', 1),
(227, 2, '756', 'Polavaram', 'పోలవరం', 1),
(228, 2, '757', 'Markapuram', 'మార్కాపురం', 1)
ON DUPLICATE KEY UPDATE `name_te` = VALUES(`name_te`), `name_en` = VALUES(`name_en`);

-- =============================================================================
-- DEFAULT WEBSITE SETTINGS & ADSENSE SETTINGS
-- =============================================================================
INSERT INTO `website_settings` (`setting_key`, `setting_value`, `setting_group`) VALUES
('site_title', 'NETI BHARATHAM – నేటి భారతం', 'general'),
('site_tagline', 'నిజం నిప్పులాంటిది – ప్రజా గొంతుక నేటి భారతం', 'general'),
('domain_url', 'https://netibhaaratham.com', 'general'),
('contact_email', 'netibhaarathamtelugu@gmail.com', 'contact'),
('contact_location', 'Hyderabad, Telangana, India.', 'contact'),
('contact_phone', '+91 98480 00000', 'contact'),
('primary_color', '#991B1B', 'appearance'),
('secondary_color', '#1E3A8A', 'appearance'),
('accent_color', '#0F172A', 'appearance'),
('breaking_ticker_text', 'నేటి భారతం అధికారిక డిజిటల్ న్యూస్ పోర్టల్‌కు స్వాగతం • తెలంగాణ (33 జిల్లాలు, 594 మండలాలు) మరియు ఆంధ్రప్రదేశ్ (పోలవరం, మార్కాపురం సహా 28 జిల్లాలు, 688 మండలాలు) నుండి 24/7 తాజా వార్తలు', 'editorial'),
('apk_version', '2.4.0', 'apk'),
('apk_download_enabled', '1', 'apk')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `adsense_settings` (`id`, `enabled`, `publisher_id`, `header_slot_id`, `news_page_slot_id`, `sidebar_slot_id`, `between_articles_slot_id`, `footer_slot_id`, `mobile_ads_enabled`) VALUES
(1, 0, 'ca-pub-0000000000000000', '1000000001', '1000000002', '1000000003', '1000000004', '1000000005', 1)
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

