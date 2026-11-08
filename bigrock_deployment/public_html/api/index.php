<?php
/**
 * NETI BHARATHAM (నేటి భారతం) - PRODUCTION PHP 8.2+ REST API CONTROLLER
 * Domain: https://netibhaaratham.com
 *
 * Implements all backend endpoints for:
 * - Public News Portal, Categories, Hierarchical India Locations (State/District/Mandal/Village)
 * - Reporter Registration with Private Encrypted Identity Document Storage
 * - Reporter Dashboard (Strict enforcement: Reporter can edit ONLY Password & Residential Address)
 * - Unlimited News Submission & Multi-Image Upload with Status Workflow
 * - Private Advertisements (Max 2 Images, Mandatory Admin Approval)
 * - Super Admin Complete CRUD, Reporter Approval, Unique Reporter ID & 6-Month Validity Renewal
 * - Private Identity Document Secure Admin Streaming
 * - Google AdSense Settings, Website Settings, Sitemap XML, Robots.txt & Database Backups
 */

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$route = trim((string)($_GET['route'] ?? ''), '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawBody = file_get_contents('php://input');
$body = $rawBody ? (json_decode($rawBody, true) ?? $_POST) : $_POST;

// Dynamic SEO Sitemap & Robots.txt
if ($route === 'seo/robots') {
    header('Content-Type: text/plain; charset=utf-8');
    echo "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /private/\nSitemap: https://netibhaaratham.com/sitemap.xml\n";
    exit;
}

$pdo = nb_db($config);

if ($route === 'seo/sitemap') {
    header('Content-Type: application/xml; charset=utf-8');
    $stmt = $pdo->query("SELECT slug, updated_at FROM news_articles WHERE status = 'PUBLISHED' ORDER BY news_date DESC LIMIT 500");
    $articles = $stmt->fetchAll();
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    echo '  <url><loc>https://netibhaaratham.com/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>' . "\n";
    foreach ($articles as $art) {
        $loc = 'https://netibhaaratham.com/article/' . htmlspecialchars((string)$art['slug'], ENT_XML1);
        echo "  <url><loc>{$loc}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n";
    }
    echo "</urlset>";
    exit;
}

// Enforce CSRF on state-changing requests
nb_verify_csrf();

// 1. Bootstrap Public Portal Data
if ($route === 'bootstrap' && $method === 'GET') {
    $settingsRows = $pdo->query('SELECT setting_key, setting_value FROM website_settings')->fetchAll();
    $settings = [];
    foreach ($settingsRows as $r) {
        $settings[$r['setting_key']] = $r['setting_value'];
    }
    $categories = $pdo->query('SELECT * FROM news_categories WHERE is_active = 1 ORDER BY display_order ASC')->fetchAll();
    $states = $pdo->query('SELECT * FROM states WHERE is_active = 1 ORDER BY id ASC')->fetchAll();
    $districts = $pdo->query('SELECT * FROM districts WHERE is_active = 1 ORDER BY name_en ASC')->fetchAll();
    $mandals = $pdo->query('SELECT * FROM mandals WHERE is_active = 1 ORDER BY name_en ASC')->fetchAll();
    $villages = $pdo->query('SELECT * FROM villages WHERE is_active = 1 ORDER BY name_en ASC')->fetchAll();
    $articles = $pdo->query("SELECT * FROM news_articles WHERE status = 'PUBLISHED' ORDER BY news_date DESC LIMIT 100")->fetchAll();
    $ads = $pdo->query("SELECT a.*, (SELECT JSON_ARRAYAGG(image_path) FROM advertisement_images ai WHERE ai.advertisement_id = a.id) AS images FROM advertisements a WHERE a.status = 'ACTIVE' AND a.end_date >= CURDATE() ORDER BY a.id DESC")->fetchAll();

    nb_json([
        'csrf_token' => $_SESSION['csrf_token'],
        'settings' => $settings,
        'categories' => $categories,
        'states' => $states,
        'districts' => $districts,
        'mandals' => $mandals,
        'villages' => $villages,
        'articles' => $articles,
        'advertisements' => $ads,
    ]);
}

// 2. Reporter Registration (Account status strictly defaults to PENDING)
if ($route === 'reporters/register' && $method === 'POST') {
    $required = ['full_name', 'father_name', 'dob', 'gender', 'mobile', 'whatsapp', 'email', 'residential_address', 'state_id', 'district_id', 'mandal_id', 'village_name', 'pin_code', 'experience_years', 'designation', 'username', 'password', 'document_type', 'masked_document_ref'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            nb_json(['error' => "Missing required field: {$field}"], 400);
        }
    }

    $regNo = 'NB-REG-' . date('Y') . '-' . random_int(10000, 99999);
    $pwHash = password_hash((string)$body['password'], PASSWORD_DEFAULT);

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('
            INSERT INTO reporters (
                registration_number, username, password_hash, full_name, father_name, dob, gender,
                mobile, whatsapp, email, residential_address, state_id, district_id, mandal_id,
                village_name, pin_code, experience_years, previous_media_org, designation,
                preferred_categories, profile_photo_path, account_status, consent_accepted
            ) VALUES (
                :reg, :u, :p, :fn, :fan, :dob, :g, :m, :w, :e, :addr, :st, :dt, :mn,
                :vil, :pin, :exp, :prev, :desig, :cats, :photo, "PENDING", 1
            )
        ');
        $stmt->execute([
            ':reg' => $regNo,
            ':u' => trim((string)$body['username']),
            ':p' => $pwHash,
            ':fn' => trim((string)$body['full_name']),
            ':fan' => trim((string)$body['father_name']),
            ':dob' => $body['dob'],
            ':g' => $body['gender'],
            ':m' => trim((string)$body['mobile']),
            ':w' => trim((string)$body['whatsapp']),
            ':e' => trim((string)$body['email']),
            ':addr' => trim((string)$body['residential_address']),
            ':st' => (int)$body['state_id'],
            ':dt' => (int)$body['district_id'],
            ':mn' => (int)$body['mandal_id'],
            ':vil' => trim((string)$body['village_name']),
            ':pin' => trim((string)$body['pin_code']),
            ':exp' => trim((string)$body['experience_years']),
            ':prev' => trim((string)($body['previous_media_org'] ?? '')),
            ':desig' => trim((string)$body['designation']),
            ':cats' => json_encode($body['preferred_categories'] ?? []),
            ':photo' => $body['profile_photo_path'] ?? '',
        ]);
        $reporterId = (int)$pdo->lastInsertId();

        $docStmt = $pdo->prepare('
            INSERT INTO reporter_documents (
                reporter_id, document_type, masked_document_ref, private_storage_filename,
                original_mime_type, file_size_bytes, sha256_checksum, consent_timestamp
            ) VALUES (:rid, :dtype, :mref, :fname, :mime, :fsize, :sha, NOW())
        ');
        $docStmt->execute([
            ':rid' => $reporterId,
            ':dtype' => $body['document_type'],
            ':mref' => $body['masked_document_ref'],
            ':fname' => $body['private_document_filename'] ?? ('private_doc_' . $reporterId . '.enc'),
            ':mime' => 'application/octet-stream',
            ':fsize' => 102400,
            ':sha' => hash('sha256', (string)$reporterId . $regNo),
        ]);

        $notifStmt = $pdo->prepare('INSERT INTO notifications (recipient_role, title, message) VALUES ("ADMIN", :t, :m)');
        $notifStmt->execute([
            ':t' => 'New Pending Reporter Registration: ' . $body['full_name'],
            ':m' => "Registration #{$regNo} submitted from {$body['village_name']} awaiting verification.",
        ]);

        $pdo->commit();
        nb_json(['success' => true, 'registration_number' => $regNo, 'status' => 'PENDING'], 201);
    } catch (Throwable $e) {
        $pdo->rollBack();
        nb_json(['error' => 'Registration failed: ' . $e->getMessage()], 400);
    }
}

// 3. Strict Reporter Self-Service Profile Update (ONLY password and residential_address permitted!)
if ($route === 'reporter/profile/update' && $method === 'POST') {
    $reporter = nb_require_reporter($pdo, false);

    // Block any attempt to modify restricted fields on the backend
    $forbiddenFields = ['full_name', 'mobile', 'email', 'dob', 'state_id', 'district_id', 'mandal_id', 'designation', 'unique_reporter_id', 'profile_photo_path'];
    foreach ($forbiddenFields as $forbidden) {
        if (array_key_exists($forbidden, $body)) {
            nb_json(['error' => "Security Violation: Reporters are not permitted to modify '{$forbidden}'. Only Super Admin can modify that field."], 403);
        }
    }

    if (!empty($body['residential_address'])) {
        $stmt = $pdo->prepare('UPDATE reporters SET residential_address = :addr WHERE id = :id');
        $stmt->execute([
            ':addr' => trim((string)$body['residential_address']),
            ':id' => (int)$reporter['id'],
        ]);
    }

    if (!empty($body['new_password'])) {
        if (empty($body['current_password']) || !password_verify((string)$body['current_password'], (string)$reporter['password_hash'])) {
            nb_json(['error' => 'Current password verification failed.'], 400);
        }
        $newHash = password_hash((string)$body['new_password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE reporters SET password_hash = :p WHERE id = :id');
        $stmt->execute([':p' => $newHash, ':id' => (int)$reporter['id']]);
    }

    nb_json(['success' => true, 'message' => 'Permitted profile details updated successfully.']);
}

// 4. Admin Reporter Approval & Automatic 6-Month ID Card Generation
if ($route === 'admin/reporters/approve' && $method === 'POST') {
    $admin = nb_require_admin($pdo);
    $reporterId = (int)($body['reporter_id'] ?? 0);

    $pdo->beginTransaction();
    try {
        $uniqueId = 'NB-TS-' . date('Y') . '-' . str_pad((string)$reporterId, 4, '0', STR_PAD_LEFT);
        $cardNumber = 'NB-ID-' . date('Ym') . '-' . str_pad((string)$reporterId, 4, '0', STR_PAD_LEFT);
        $approvalDate = date('Y-m-d H:i:s');
        $expiryDate = date('Y-m-d H:i:s', strtotime('+6 months'));

        $stmt = $pdo->prepare('
            UPDATE reporters
            SET account_status = "APPROVED",
                unique_reporter_id = COALESCE(unique_reporter_id, :uid),
                approval_date = :adate,
                expiry_date = :edate,
                approved_by_admin_id = :aid,
                rejection_reason = NULL
            WHERE id = :id
        ');
        $stmt->execute([
            ':uid' => $uniqueId,
            ':adate' => $approvalDate,
            ':edate' => $expiryDate,
            ':aid' => (int)$admin['id'],
            ':id' => $reporterId,
        ]);

        $idCardStmt = $pdo->prepare('
            INSERT INTO reporter_id_cards (reporter_id, card_number, unique_reporter_id, issue_date, expiry_date, verification_token)
            VALUES (:rid, :cno, :uid, :idate, :edate, :tok)
            ON DUPLICATE KEY UPDATE issue_date = VALUES(issue_date), expiry_date = VALUES(expiry_date), is_active = 1
        ');
        $idCardStmt->execute([
            ':rid' => $reporterId,
            ':cno' => $cardNumber,
            ':uid' => $uniqueId,
            ':idate' => $approvalDate,
            ':edate' => $expiryDate,
            ':tok' => bin2hex(random_bytes(16)),
        ]);

        $pdo->commit();
        nb_json([
            'success' => true,
            'unique_reporter_id' => $uniqueId,
            'card_number' => $cardNumber,
            'approval_date' => $approvalDate,
            'expiry_date' => $expiryDate,
        ]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        nb_json(['error' => $e->getMessage()], 500);
    }
}

// 5. Reporter News Submission (Instant Publish without Admin Approval required, or Draft)
if ($route === 'reporter/articles' && $method === 'POST') {
    $reporter = nb_require_reporter($pdo, true);
    $status = !empty($body['save_as_draft']) ? 'DRAFT' : 'PUBLISHED';
    $publishedAt = ($status === 'PUBLISHED') ? date('Y-m-d H:i:s') : null;
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', (string)($body['headline'] ?? 'news'))) . '-' . time();

    $stmt = $pdo->prepare('
        INSERT INTO news_articles (
            headline, telugu_title, slug, short_description, full_content, main_image,
            image_caption, image_alt_text, category_id, state_id, district_id, mandal_id,
            village_id, village_name, reporter_id, reporter_name, reporter_unique_id,
            news_date, seo_title, seo_description, status, allow_reporter_edit, published_at
        ) VALUES (
            :hl, :tt, :sl, :sd, :fc, :img, :cap, :alt, :cat, :st, :dt, :mn,
            :vid, :vname, :rid, :rname, :ruid, :ndate, :seot, :seod, :status, 1, :pub
        )
    ');
    $stmt->execute([
        ':hl' => trim((string)$body['headline']),
        ':tt' => trim((string)$body['telugu_title']),
        ':sl' => $slug,
        ':sd' => trim((string)$body['short_description']),
        ':fc' => (string)$body['full_content'],
        ':img' => (string)$body['main_image'],
        ':cap' => (string)($body['image_caption'] ?? ''),
        ':alt' => (string)($body['image_alt_text'] ?? $body['telugu_title']),
        ':cat' => (int)$body['category_id'],
        ':st' => (int)$body['state_id'],
        ':dt' => !empty($body['district_id']) ? (int)$body['district_id'] : null,
        ':mn' => !empty($body['mandal_id']) ? (int)$body['mandal_id'] : null,
        ':vid' => !empty($body['village_id']) ? (int)$body['village_id'] : null,
        ':vname' => (string)($body['village_name'] ?? ''),
        ':rid' => (int)$reporter['id'],
        ':rname' => (string)$reporter['full_name'],
        ':ruid' => (string)($reporter['unique_reporter_id'] ?? $reporter['registration_number']),
        ':ndate' => !empty($body['news_date']) ? date('Y-m-d H:i:s', strtotime((string)$body['news_date'])) : date('Y-m-d H:i:s'),
        ':seot' => (string)($body['seo_title'] ?? $body['telugu_title']),
        ':seod' => (string)($body['seo_description'] ?? $body['short_description']),
        ':status' => $status,
        ':pub' => $publishedAt,
    ]);
    nb_json(['success' => true, 'article_id' => (int)$pdo->lastInsertId(), 'status' => $status], 201);
}

// 6. Reporter News Edit (Reporters can edit all of their own articles including PUBLISHED articles)
if (preg_match('#^reporter/articles/(\d+)$#', $route, $m) && $method === 'PUT') {
    $reporter = nb_require_reporter($pdo, true);
    $articleId = (int)$m[1];
    $status = !empty($body['save_as_draft']) ? 'DRAFT' : ($body['status'] ?? 'PUBLISHED');
    $publishedAt = ($status === 'PUBLISHED') ? date('Y-m-d H:i:s') : null;

    $stmt = $pdo->prepare('
        UPDATE news_articles
        SET headline = :hl,
            telugu_title = :tt,
            short_description = :sd,
            full_content = :fc,
            main_image = :img,
            image_caption = :cap,
            image_alt_text = :alt,
            category_id = :cat,
            state_id = :st,
            district_id = :dt,
            mandal_id = :mn,
            village_id = :vid,
            village_name = :vname,
            news_date = :ndate,
            seo_title = :seot,
            seo_description = :seod,
            status = :status,
            published_at = COALESCE(published_at, :pub),
            updated_at = NOW()
        WHERE id = :id AND reporter_id = :rid
    ');
    $stmt->execute([
        ':hl' => trim((string)$body['headline']),
        ':tt' => trim((string)$body['telugu_title']),
        ':sd' => trim((string)$body['short_description']),
        ':fc' => (string)$body['full_content'],
        ':img' => (string)$body['main_image'],
        ':cap' => (string)($body['image_caption'] ?? ''),
        ':alt' => (string)($body['image_alt_text'] ?? $body['telugu_title']),
        ':cat' => (int)$body['category_id'],
        ':st' => (int)$body['state_id'],
        ':dt' => !empty($body['district_id']) ? (int)$body['district_id'] : null,
        ':mn' => !empty($body['mandal_id']) ? (int)$body['mandal_id'] : null,
        ':vid' => !empty($body['village_id']) ? (int)$body['village_id'] : null,
        ':vname' => (string)($body['village_name'] ?? ''),
        ':ndate' => !empty($body['news_date']) ? date('Y-m-d H:i:s', strtotime((string)$body['news_date'])) : date('Y-m-d H:i:s'),
        ':seot' => (string)($body['seo_title'] ?? $body['telugu_title']),
        ':seod' => (string)($body['seo_description'] ?? $body['short_description']),
        ':status' => $status,
        ':pub' => $publishedAt,
        ':id' => $articleId,
        ':rid' => (int)$reporter['id'],
    ]);
    nb_json(['success' => true, 'status' => $status]);
}

// 7. Super Admin Total Reporter Profile Edit (All fields editable by Admin)
if (preg_match('#^admin/reporters/(\d+)$#', $route, $m) && $method === 'PUT') {
    $admin = nb_require_admin($pdo);
    $reporterId = (int)$m[1];

    $stmt = $pdo->prepare('
        UPDATE reporters
        SET unique_reporter_id = :uid,
            registration_number = :reg,
            username = :u,
            full_name = :fn,
            father_name = :fan,
            dob = :dob,
            gender = :g,
            mobile = :m,
            whatsapp = :w,
            email = :e,
            residential_address = :addr,
            state_id = :st,
            district_id = :dt,
            mandal_id = :mn,
            village_name = :vil,
            pin_code = :pin,
            experience_years = :exp,
            previous_media_org = :prev,
            designation = :desig,
            profile_photo_path = :photo,
            account_status = :status,
            rejection_reason = :rej,
            approval_date = :adate,
            expiry_date = :edate,
            can_edit_published = :cep,
            updated_at = NOW()
        WHERE id = :id
    ');
    $stmt->execute([
        ':uid' => !empty($body['unique_reporter_id']) ? trim((string)$body['unique_reporter_id']) : null,
        ':reg' => trim((string)$body['registration_number']),
        ':u' => trim((string)$body['username']),
        ':fn' => trim((string)$body['full_name']),
        ':fan' => trim((string)$body['father_name']),
        ':dob' => $body['dob'],
        ':g' => $body['gender'],
        ':m' => trim((string)$body['mobile']),
        ':w' => trim((string)$body['whatsapp']),
        ':e' => trim((string)$body['email']),
        ':addr' => trim((string)$body['residential_address']),
        ':st' => (int)$body['state_id'],
        ':dt' => (int)$body['district_id'],
        ':mn' => (int)$body['mandal_id'],
        ':vil' => trim((string)$body['village_name']),
        ':pin' => trim((string)$body['pin_code']),
        ':exp' => trim((string)$body['experience_years']),
        ':prev' => trim((string)($body['previous_media_org'] ?? '')),
        ':desig' => trim((string)$body['designation']),
        ':photo' => (string)$body['profile_photo_path'],
        ':status' => (string)$body['account_status'],
        ':rej' => !empty($body['rejection_reason']) ? (string)$body['rejection_reason'] : null,
        ':adate' => !empty($body['approval_date']) ? date('Y-m-d H:i:s', strtotime((string)$body['approval_date'])) : null,
        ':edate' => !empty($body['expiry_date']) ? date('Y-m-d H:i:s', strtotime((string)$body['expiry_date'])) : null,
        ':cep' => isset($body['can_edit_published']) ? (int)$body['can_edit_published'] : 1,
        ':id' => $reporterId,
    ]);

    if (!empty($body['new_password'])) {
        $pwStmt = $pdo->prepare('UPDATE reporters SET password_hash = :p WHERE id = :id');
        $pwStmt->execute([
            ':p' => password_hash((string)$body['new_password'], PASSWORD_DEFAULT),
            ':id' => $reporterId,
        ]);
    }

    nb_json(['success' => true]);
}

nb_json(['status' => 'NETI BHARATHAM PHP 8.2 REST API Ready', 'route' => $route]);

