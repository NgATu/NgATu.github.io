<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];

    // Check if material is being used in transactions
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE material_id = ?");
    $stmt->execute([$id]);
    $count = $stmt->fetchColumn();

    if ($count > 0) {
        throw new Exception('Cannot delete material that has transactions');
    }

    // Delete material
    $stmt = $pdo->prepare("DELETE FROM materials WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 