<?php

$controller = new GameController();
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($uri === '/' || $uri === '/index.php') {
    $controller->index();
} elseif ($uri === '/save-score' && $method === 'POST') {
    $controller->saveScore();
} elseif ($uri === '/scores' && $method === 'GET') {
    $controller->getScores();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}
