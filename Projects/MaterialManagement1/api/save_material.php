<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    $id = $_POST['id'];
    $name = $_POST['name'];
    $unit = $_POST['unit'];

    // Check if material exists
    $stmt = $pdo->prepare("SELECT id FROM materials WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();

    if ($exists) {
        // Update
        $stmt = $pdo->prepare("
            UPDATE materials 
            SET name = ?, unit = ? 
            WHERE id = ?
        ");
        $stmt->execute([$name, $unit, $id]);
    } else {
        // Insert
        $stmt = $pdo->prepare("
            INSERT INTO materials (id, name, unit) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$id, $name, $unit]);
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 