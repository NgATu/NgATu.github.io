<?php
header('Content-Type: application/vnd.ms-word');
header('Content-Disposition: attachment; filename="warehouse_report.doc"');

require_once 'db_connect.php';

try {
    // Get material names from database
    $stmt = $pdo->prepare("SELECT id, name FROM materials");
    $stmt->execute();
    $materials = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    // Get report data from POST
    $data = [];
    if (isset($_POST['data'])) {
        $data = json_decode($_POST['data'], true);
    }
    
    $transactions = $data['transactions'] ?? [];
    $dateRange = $data['dateRange'] ?? [];
    
    $html = '
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 8px; }
            th { background-color: #f2f2f2; }
            .title { text-align: center; font-size: 24px; margin-bottom: 20px; }
            .date { text-align: right; margin-bottom: 20px; }
            .import { color: green; }
            .export { color: red; }
            .filter-info { 
                margin-bottom: 20px; 
                font-style: italic; 
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="title">Warehouse Transaction Report</div>
        <div class="date">Generated on: ' . date('Y-m-d H:i:s') . '</div>
        
        <div class="filter-info">';

    if (!empty($dateRange['fromDate']) || !empty($dateRange['toDate'])) {
        $html .= 'Filtered by date: ';
        if (!empty($dateRange['fromDate'])) {
            $html .= 'From ' . $dateRange['fromDate'];
        }
        if (!empty($dateRange['toDate'])) {
            $html .= (!empty($dateRange['fromDate']) ? ' to ' : 'Until ') . $dateRange['toDate'];
        }
    } else {
        $html .= 'Showing all transactions';
    }

    $html .= '</div>
        
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Previous Quantity</th>
                    <th>New Quantity</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>';

    foreach ($transactions as $tx) {
        $materialName = isset($materials[$tx['materialId']]) ? $materials[$tx['materialId']] : $tx['materialId'];
        $isImport = $tx['isImport'];
        $type = $isImport ? 'IMPORT' : 'EXPORT';
        $typeClass = $isImport ? 'import' : 'export';
        $date = date('Y-m-d H:i:s', $tx['timestamp']);
        
        $html .= "
            <tr>
                <td>{$date}</td>
                <td>{$materialName}</td>
                <td class='{$typeClass}'>{$type}</td>
                <td>" . number_format($tx['quantity']) . "</td>
                <td>" . number_format($tx['previousQuantity']) . "</td>
                <td>" . number_format($tx['newQuantity']) . "</td>
                <td>" . htmlspecialchars($tx['details']) . "</td>
            </tr>";
    }

    $html .= '
            </tbody>
        </table>
    </body>
    </html>';
    
    echo $html;
    
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
