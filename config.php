/*Database Connection (config.php)*/

<?php
define("DB_HOST", "localhost");
define("DB_NAME", "news_portal");
define("DB_USER", "root");
define("DB_PASS", "");

// PDO connection
try {
    pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME,
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
 catch (PDOExceptione) {
    exit(json_encode(["error" => "DB Connection Failed: " . e->getMessage()]));


// General headers for JSON API
header("Content-Type: application/json; charset=UTF-8");
“`

