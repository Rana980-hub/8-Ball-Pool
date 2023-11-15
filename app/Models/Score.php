<?php

namespace App\Models;

use App\Core\Database;

class Score
{
    public static function create($player, $score)
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO scores (player, score, created_at) VALUES (:player, :score, :created_at)");
        
        return $stmt->execute([
            ':player' => $player,
            ':score' => $score,
            ':created_at' => date('Y-m-d H:i:s')
        ]);
    }

    public static function getTopScores($limit = 10)
    {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM scores ORDER BY score DESC LIMIT :limit");
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}
