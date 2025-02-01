<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

$albums_dir = './metadata/albums';
$singles_dir = './metadata/singles';

// Handle OPTIONS request (for CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the request parameters
$type = $_GET['type'] ?? null;
$file = $_GET['file'] ?? null;

// List all JSON files in the specified directory
if ($type && !$file) {
    if ($type === 'albums') {
        $directory = $albums_dir;
    } elseif ($type === 'singles') {
        $directory = $singles_dir;
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid type"]);
        exit;
    }

    if (!is_dir($directory)) {
        http_response_code(404);
        echo json_encode(["error" => "Directory not found"]);
        exit;
    }

    $files = array_values(array_filter(scandir($directory), function ($f) {
        return pathinfo($f, PATHINFO_EXTENSION) === 'json';
    }));

    echo json_encode($files);
    exit;
}

// Fetch the contents of a specific JSON file
if ($type && $file) {
    if ($type === 'albums') {
        $directory = $albums_dir;
    } elseif ($type === 'singles') {
        $directory = $singles_dir;
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid type"]);
        exit;
    }

    $file_path = "$directory/$file";
    if (!file_exists($file_path)) {
        http_response_code(404);
        echo json_encode(["error" => "File not found"]);
        exit;
    }

    echo file_get_contents($file_path);
    exit;
}

// Invalid request
http_response_code(400);
echo json_encode(["error" => "Invalid request"]);
?>