<!--📌 6) *News Management API (news.php)*

```php
<?php
require "config.php";
require "helpers.php";
session_start();

method =_SERVER['REQUEST_METHOD'];
action =_GET['action'] ?? "";

// ---- GET ALL NEWS ----
if (method == "GET"action == "list") {
    stmt =pdo->prepare("
      SELECT n.*, c.name as category 
      FROM news n 
      LEFT JOIN categories c ON n.category_id=c.id
      WHERE n.approved=1
      ORDER BY n.created_at DESC
    ");
    stmt->execute();
    respond(stmt->fetchAll(PDO::FETCH_ASSOC));
}

news_id = intval(_POST['id']);
    pdo->prepare("UPDATE news SET approved=1 WHERE id=?")->execute([news_id]);
    respond(["message"=>"News approved"]);
}

// ---- DELETE NEWS ----
if (method == "DELETE"action == "delete") {
    if (!isset(_SESSION['user'])) respond(["error"=>"Unauthorized"],401);id = intval(_GET['id']);pdo->prepare("DELETE FROM news WHERE id=?")->execute([id]);
    respond(["message"=>"Deleted"]);

?>
