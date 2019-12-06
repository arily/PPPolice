<?php
$json = file_get_contents("./json/export.json");
$decoded = json_encode(json_decode($json), JSON_NUMERIC_CHECK);
file_put_contents("./json/export.convert.json", $decoded);