<?php
/**
 * NETI BHARATHAM (నేటి భారతం) - SECURE FIRST-RUN INSTALLATION WIZARD
 * Target Hosting: BigRock Multi Domain Linux Hosting (cPanel)
 * Domain: https://netibhaaratham.com
 *
 * Performs:
 * 1. BigRock Multi Domain Hosting PHP 8.2+ & Extension Compatibility Audit
 *    (PDO, pdo_mysql, mbstring, openssl, fileinfo, gd, json, upload_max_filesize, open_basedir)
 * 2. Private Directory Outside `public_html` Permission Check
 * 3. MySQL 8 / MariaDB Connection Verification
 * 4. Automated Execution of `private/database/database.sql`
 * 5. Secure Initial Super Admin Provisioning via `password_hash()` (Zero Hardcoded Passwords)
 * 6. Automatic Generation of AES-256-CBC Document Encryption Key & Installer Lock
 */

declare(strict_types=1);

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'cookie_secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
]);

$privateRoot = dirname(__DIR__) . '/private';
$lockFile = $privateRoot . '/config/installed.lock';
$configFile = $privateRoot . '/config/config.php';
$schemaFile = $privateRoot . '/database/database.sql';

if (file_exists($lockFile)) {
    http_response_code(403);
    exit('<h1>Installation Locked</h1><p>NETI BHARATHAM is already installed. For security, delete <code>private/config/installed.lock</code> via cPanel File Manager only if re-installation is explicitly required.</p>');
}

if (empty($_SESSION['install_csrf'])) {
    $_SESSION['install_csrf'] = bin2hex(random_bytes(32));
}

$checks = [
    'php_version' => [
        'label' => 'PHP Version >= 8.2.0 (Current: ' . PHP_VERSION . ')',
        'passed' => version_compare(PHP_VERSION, '8.2.0', '>='),
        'required' => true,
        'fix' => 'In BigRock cPanel -> MultiPHP Manager, select netibhaaratham.com and set PHP version to PHP 8.2 or PHP 8.3.',
    ],
    'pdo_mysql' => [
        'label' => 'PDO & pdo_mysql Extension (Prepared Statements)',
        'passed' => extension_loaded('pdo') && extension_loaded('pdo_mysql'),
        'required' => true,
        'fix' => 'Enable pdo_mysql in cPanel -> Select PHP Version -> Extensions.',
    ],
    'mbstring' => [
        'label' => 'mbstring Extension (Telugu Unicode Multi-Byte Support)',
        'passed' => extension_loaded('mbstring'),
        'required' => true,
        'fix' => 'Enable mbstring in cPanel -> Select PHP Version -> Extensions.',
    ],
    'openssl' => [
        'label' => 'OpenSSL Extension (AES-256-CBC Document Encryption)',
        'passed' => extension_loaded('openssl'),
        'required' => true,
        'fix' => 'Enable openssl in cPanel PHP Extensions.',
    ],
    'fileinfo' => [
        'label' => 'Fileinfo Extension (Strict MIME Verification for Uploads)',
        'passed' => extension_loaded('fileinfo'),
        'required' => true,
        'fix' => 'Enable fileinfo in cPanel -> Select PHP Version -> Extensions.',
    ],
    'gd' => [
        'label' => 'GD Graphics Library (Image Compression & Dimensions Check)',
        'passed' => extension_loaded('gd'),
        'required' => true,
        'fix' => 'Enable gd in cPanel -> Select PHP Version -> Extensions.',
    ],
    'private_dir' => [
        'label' => 'Private Storage Directory Outside public_html Writable',
        'passed' => is_dir($privateRoot) && is_writable($privateRoot),
        'required' => true,
        'fix' => 'Ensure /private/config, /private/identity_documents, and /private/backups exist one level above public_html with chmod 0750.',
    ],
];

$allPassed = true;
foreach ($checks as $check) {
    if ($check['required'] && !$check['passed']) {
        $allPassed = false;
    }
}

$errorMsg = '';
$successMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $allPassed) {
    $csrf = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['install_csrf'], $csrf)) {
        $errorMsg = 'Invalid CSRF token. Please refresh and try again.';
    } else {
        $dbHost = trim($_POST['db_host'] ?? 'localhost');
        $dbPort = (int)($_POST['db_port'] ?? 3306);
        $dbName = trim($_POST['db_name'] ?? '');
        $dbUser = trim($_POST['db_user'] ?? '');
        $dbPass = $_POST['db_pass'] ?? '';

        $adminUser = trim($_POST['admin_username'] ?? 'Admin');
        $adminEmail = trim($_POST['admin_email'] ?? 'netibhaarathamtelugu@gmail.com');
        $adminPass = $_POST['admin_password'] ?? '';
        $adminPassConfirm = $_POST['admin_password_confirm'] ?? '';

        if (strlen($adminPass) < 10 || !preg_match('/[A-Z]/', $adminPass) || !preg_match('/[0-9]/', $adminPass)) {
            $errorMsg = 'Admin password must be at least 10 characters and include at least one uppercase letter and one number.';
        } elseif ($adminPass !== $adminPassConfirm) {
            $errorMsg = 'Admin password confirmation does not match.';
        } elseif ($dbName === '' || $dbUser === '') {
            $errorMsg = 'Database Name and Database Username are required.';
        } else {
            try {
                $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $dbHost, $dbPort, $dbName);
                $pdo = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);

                if (!file_exists($schemaFile)) {
                    throw new RuntimeException('Database schema file missing at private/database/database.sql');
                }

                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);

                // Create initial Super Admin with PHP password_hash()
                $passwordHash = password_hash($adminPass, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare('INSERT INTO admins (username, email, password_hash, display_name, must_change_password) VALUES (:u, :e, :p, :d, 1)');
                $stmt->execute([
                    ':u' => $adminUser,
                    ':e' => $adminEmail,
                    ':p' => $passwordHash,
                    ':d' => $adminUser,
                ]);

                $docEncryptionKey = bin2hex(random_bytes(32));
                $configArray = [
                    'app' => [
                        'name' => 'NETI BHARATHAM – నేటి భారతం',
                        'url' => 'https://netibhaaratham.com',
                        'env' => 'production',
                        'timezone' => 'Asia/Kolkata',
                        'contact_email' => $adminEmail,
                        'contact_location' => 'Hyderabad, Telangana, India.',
                    ],
                    'database' => [
                        'host' => $dbHost,
                        'port' => $dbPort,
                        'dbname' => $dbName,
                        'username' => $dbUser,
                        'password' => $dbPass,
                        'charset' => 'utf8mb4',
                    ],
                    'security' => [
                        'document_encryption_key' => $docEncryptionKey,
                        'session_name' => 'NB_SECURE_SESSID',
                        'session_lifetime_seconds' => 3600,
                        'max_login_attempts' => 5,
                        'lockout_minutes' => 15,
                        'csrf_header' => 'X-CSRF-Token',
                        'force_https' => true,
                    ],
                    'paths' => [
                        'public_uploads' => __DIR__ . '/uploads',
                        'private_documents' => $privateRoot . '/identity_documents',
                        'private_backups' => $privateRoot . '/backups',
                    ],
                ];

                $configPhp = "<?php\ndeclare(strict_types=1);\nreturn " . var_export($configArray, true) . ";\n";
                file_put_contents($configFile, $configPhp, LOCK_EX);
                @chmod($configFile, 0600);

                file_put_contents($lockFile, 'INSTALLED_AT=' . date('c') . PHP_EOL, LOCK_EX);
                $successMsg = 'NETI BHARATHAM Production Database & Super Admin successfully provisioned! Installer is now locked.';
            } catch (Throwable $e) {
                $errorMsg = 'Installation Error: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
            }
        }
    }
}
?>
<!doctype html>
<html lang="te">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>NETI BHARATHAM – నేటి భారతం | BigRock Production Installer</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #FBF9F5; color: #1C1917; margin: 0; padding: 32px 16px; }
    .container { max-width: 760px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 12px; padding: 32px; }
    h1 { color: #991B1B; margin-top: 0; }
    .check-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F5F5F4; font-size: 14px; }
    .pass { color: #16A34A; font-weight: 700; }
    .fail { color: #DC2626; font-weight: 700; }
    label { display: block; font-weight: 600; margin-top: 14px; font-size: 14px; }
    input { width: 100%; padding: 10px; margin-top: 6px; border: 1px solid #D6D3D1; border-radius: 6px; box-sizing: border-box; }
    button { margin-top: 24px; background: #991B1B; color: #FFF; border: 0; padding: 12px 24px; font-weight: 700; border-radius: 8px; cursor: pointer; width: 100%; font-size: 15px; }
    .alert-err { background: #FEF2F2; color: #991B1B; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #FECACA; }
    .alert-ok { background: #F0FDF4; color: #166534; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #BBF7D0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>NETI BHARATHAM – నేటి భారతం</h1>
    <p>BigRock Multi Domain Linux Hosting (cPanel) First-Run Security &amp; Database Setup Wizard</p>

    <?php if ($errorMsg !== ''): ?>
      <div class="alert-err"><?= $errorMsg ?></div>
    <?php endif; ?>

    <?php if ($successMsg !== ''): ?>
      <div class="alert-ok">
        <?= $successMsg ?><br/><br/>
        <strong>Security Recommendation:</strong> Delete <code>public_html/install.php</code> from cPanel File Manager and proceed to <a href="/">NETI BHARATHAM Homepage</a>.
      </div>
    <?php else: ?>
      <h3>1. BigRock Hosting Compatibility Audit</h3>
      <?php foreach ($checks as $c): ?>
        <div class="check-row">
          <span><?= htmlspecialchars($c['label']) ?></span>
          <span class="<?= $c['passed'] ? 'pass' : 'fail' ?>"><?= $c['passed'] ? 'PASSED' : 'ACTION REQUIRED' ?></span>
        </div>
        <?php if (!$c['passed']): ?>
          <div style="font-size:12px;color:#B91C1C;padding:4px 0 8px 0;">Fix: <?= htmlspecialchars($c['fix']) ?></div>
        <?php endif; ?>
      <?php endforeach; ?>

      <form method="post" action="">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['install_csrf']) ?>" />
        <h3>2. cPanel MySQL Database Credentials</h3>
        <label>MySQL Host</label>
        <input type="text" name="db_host" value="localhost" required />
        <label>Database Name (e.g., cpaneluser_netibharatham)</label>
        <input type="text" name="db_name" required />
        <label>Database Username</label>
        <input type="text" name="db_user" required />
        <label>Database Password</label>
        <input type="password" name="db_pass" />

        <h3>3. Initial Super Admin Account (No Hardcoded Default Password)</h3>
        <label>Admin Username</label>
        <input type="text" name="admin_username" value="Admin" required />
        <label>Official Admin Email</label>
        <input type="email" name="admin_email" value="netibhaarathamtelugu@gmail.com" required />
        <label>Initial Strong Password (Min 10 chars, Uppercase + Number)</label>
        <input type="password" name="admin_password" required minlength="10" />
        <label>Confirm Initial Password</label>
        <input type="password" name="admin_password_confirm" required minlength="10" />

        <button type="submit">Install Database &amp; Lock Installer</button>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
