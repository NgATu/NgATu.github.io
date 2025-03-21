<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    if (isset($_GET['id'])) {
        // Search by ID
        $stmt = $pdo->prepare("SELECT * FROM materials WHERE id LIKE ? ORDER BY id");
        $stmt->execute(['%' . $_GET['id'] . '%']);
    } else {
        // Get all materials
        $stmt = $pdo->query("SELECT * FROM materials ORDER BY id");
    }
    $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($materials);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 