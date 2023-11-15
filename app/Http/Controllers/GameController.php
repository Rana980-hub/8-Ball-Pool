<?php

namespace App\Http\Controllers;

use App\Models\Score;

class GameController
{
    public function index()
    {
        // Define the content view to load inside the layout
        $viewPath = __DIR__ . '/../../../resources/views/game.php';
        
        // Require the main layout which will include the $viewPath
        require __DIR__ . '/../../../resources/views/layouts/app.php';
    }

    public function saveScore()
    {
        header('Content-Type: application/json');
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $score = isset($data['score']) ? (int)$data['score'] : 0;
        $player = isset($data['player']) ? htmlspecialchars($data['player']) : 'Player';

        try {
            if (Score::create($player, $score)) {
                $topScores = Score::getTopScores(10);
                echo json_encode(['success' => true, 'scores' => $topScores]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to insert score']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function getScores()
    {
        header('Content-Type: application/json');
        
        try {
            $scores = Score::getTopScores(10);
            echo json_encode($scores);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
