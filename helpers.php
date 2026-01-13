📌 3) *Helper Functions (helpers.php)*

“`php
<?php

function respond(data, status = 200) 
    http_response_code(status);
    echo json_encode(data);
    exit;


function validate_input(data) {
    return htmlspecialchars(stripslashes(trim(data)));
“`

