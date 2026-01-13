📌 7) *Live TV Stream API (stream.php)*

“`php
<?php
require "config.php";
require "helpers.php";method = _SERVER['REQUEST_METHOD'];action = _GET['action'] ?? "";

// GET STREAM
if (method == "GET" && action == "get")stmt = pdo->prepare("SELECT * FROM stream_links ORDER BY created_at DESC LIMIT 1");stmt->execute();
    respond(stmt->fetch(PDO::FETCH_ASSOC));


// SAVE/UPDATE STREAM (Admin)
if (method == "POST" && action == "set")title = validate_input(_POST['title']);url = validate_input(_POST['url']);pdo->prepare("INSERT INTO stream_links(title,url) VALUES(?,?)")->execute([title,url]);
    respond(["message"=>"Live stream link saved"]);
}
