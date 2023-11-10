<?php

class GameController
{
    public function index()
    {
        include __DIR__ . '/../../resources/views/game.php';
    }

    public function saveScore()
    {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);
        $score = isset($data['score']) ? (int)$data['score'] : 0;
        $player = isset($data['player']) ? htmlspecialchars($data['player']) : 'Player';

        $file = __DIR__ . '/../../storage/scores.json';
        $scores = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
        $scores[] = ['player' => $player, 'score' => $score, 'date' => date('Y-m-d H:i:s')];
        usort($scores, fn($a, $b) => $b['score'] - $a['score']);
        $scores = array_slice($scores, 0, 10);
        
        if (!is_dir(dirname($file))) mkdir(dirname($file), 0777, true);
        file_put_contents($file, json_encode($scores));
        echo json_encode(['success' => true, 'scores' => $scores]);
    }

    public function getScores()
    {
        header('Content-Type: application/json');
        $file = __DIR__ . '/../../storage/scores.json';
        $scores = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
        echo json_encode($scores);
    }
}
