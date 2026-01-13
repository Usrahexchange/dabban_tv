<!--📌 5) *News API Fetch Cron Script (fetch_api.php )*

“`php
<?php
require "config.php";
require "helpers.php";apiKey = "f94fee94fc0f48b6aa2df2cc5dd25cc2";
countries = ["ng","us"]; // local + intl

foreach (countries as c)fetch = file_get_contents("https://newsapi.org/v2/top-headlines?country=capiKey=apiKey");
    json = json_decode(fetch, true);

    foreach (json['articles'] asa) {
title = validate_input(a['title']);
        content = validate_input(a['description'] ?? '');
        img = validate_input(a['urlToImage'] ?? '');
        source = validate_input(a['source']['name']);

        // find category id
        cat =pdo->prepare("SELECT id FROM categories WHERE name='General'");
        cat->execute();catId = cat->fetchColumn();

        // prevent duplicatescheck = pdo->prepare("SELECT id FROM news WHERE title=?");check->execute([title]);
        if (check->rowCount() == 0) {
            stmt =pdo->prepare("INSERT INTO news(title,content,image,category_id,source,approved) VALUES(?,?,?,?,?,1)");
            stmt->execute([title, content,img, catId,source]);
        }
    }
}
respond(["message"=>"API news updated"]);


