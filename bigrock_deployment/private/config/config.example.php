<?php
/**
 * NETI BHARATHAM (నేటి భారతం) - PRODUCTION CONFIGURATION EXAMPLE
 * Domain: https://netibhaaratham.com
 * Hosting: BigRock Multi Domain Linux Hosting (cPanel)
 *
 * SECURITY INSTRUCTION:
 * Place this file as `config.php` inside `/home/<cpanel_user>/private/config/config.php`
 * (OUTSIDE `public_html/`) so it is never directly reachable via HTTP.
 * The installer (`install.php`) automatically generates `config.php` during first-run setup.
 */

declare(strict_types=1);

return [
    'app' => [
        'name' => 'NETI BHARATHAM – నేటి భారతం',
        'url' => 'https://netibhaaratham.com',
        'env' => 'production',
        'timezone' => 'Asia/Kolkata',
        'contact_email' => 'netibhaarathamtelugu@gmail.com',
        'contact_location' => 'Hyderabad, Telangana, India.',
    ],
    'database' => [
        'host' => 'localhost',
        'port' => 3306,
        'dbname' => 'cpaneluser_netibharatham',
        'username' => 'cpaneluser_nbadmin',
        'password' => 'REPLACE_WITH_STRONG_CPANEL_DB_PASSWORD',
        'charset' => 'utf8mb4',
    ],
    'security' => [
        // 32-byte hex key generated automatically by install.php for AES-256-CBC document encryption
        'document_encryption_key' => 'REPLACE_WITH_64_CHAR_HEX_RANDOM_KEY_FROM_INSTALLER',
        'session_name' => 'NB_SECURE_SESSID',
        'session_lifetime_seconds' => 3600,
        'max_login_attempts' => 5,
        'lockout_minutes' => 15,
        'csrf_header' => 'X-CSRF-Token',
        'force_https' => true,
    ],
    'paths' => [
        'public_uploads' => dirname(__DIR__, 2) . '/public_html/uploads',
        'private_documents' => dirname(__DIR__) . '/identity_documents',
        'private_backups' => dirname(__DIR__) . '/backups',
    ],
];
