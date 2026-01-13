<!--📌 4) *User Authentication (auth.php)-->
<?php
require "config.php";
require "helpers.php";method = _SERVER['REQUEST_METHOD'];uri = _GET['action'] ?? ”;

if (method === 'POST' && uri === 'register')name = validate_input(_POST['name']);email = validate_input(_POST['email']);password = password_hash(_POST['password'], PASSWORD_DEFAULT);stmt = pdo->prepare("INSERT INTO users(name,email,password) VALUES(?,?,?)");
    if (stmt->execute([name,email, password])) 
        respond(["message" => "User registered"]);
    
    respond(["error" => "Registration failed"], 400);

if (method === 'POST' && uri === 'login')email = validate_input(_POST['email']);pass = _POST['password'];stmt = pdo->prepare("SELECT * FROM users WHERE email=?");stmt->execute([email]);user = stmt->fetch(PDO::FETCH_ASSOC);

    if (user && password_verify(pass,user['password'])) {
        session_start();
        _SESSION['user'] =user['id'];
        respond(["message" => "Login successful", "user" => user]);
    
    respond(["error" => "Invalid credentials"], 401);
?>
