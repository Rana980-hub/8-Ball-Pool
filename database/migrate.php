<?php

$dbPath = __DIR__ . '/../storage/database.sqlite';

// Ensure the storage directory exists
if (!is_dir(dirname($dbPath))) {
    mkdir(dirname($dbPath), 0777, true);
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create scores table
    $query = "
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player TEXT NOT NULL,
            score INTEGER NOT NULL,
            created_at DATETIME NOT NULL
        )
    ";

    $pdo->exec($query);
    echo "Migration completed successfully! The 'scores' table is ready.\n";
    
    // Optionally remove the old JSON file
    $oldJson = __DIR__ . '/../storage/scores.json';
    if (file_exists($oldJson)) {
        unlink($oldJson);
        echo "Old scores.json removed.\n";
    }

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage());
}
