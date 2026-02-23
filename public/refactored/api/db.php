<?php
/**
 * Database Connection & Common Setup
 * Engine unchanged — only extracted from monolith.
 */

$ua = $_SERVER['HTTP_USER_AGENT'];
$ip = $_SERVER['REMOTE_ADDR'];

// Allow your desktop LAN IP
$allowedDesktopIPs = [
    "192.168.29.170",
    "192.168.29.100",
    "192.168.29.2"
];

// If NOT from WebView AND NOT in allowed IP list → block
if (strpos($ua, "wv") === false && !in_array($ip, $allowedDesktopIPs, true)) {
    die("Access allowed only through the official app for the connection stability.");
}

header('Content-Type: text/html; charset=utf-8');
mb_internal_encoding("UTF-8");

// Database connection settings
$host = "localhost";
$username = "root";
$password = "";
$dbname = "tamilbible";

// Create a connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

require_once __DIR__ . '/../vendor/autoload.php';

use Ratchet\Client\Connector;
use Ratchet\Client\WebSocket;
use React\EventLoop\Factory;

$server_ip = $_SERVER['SERVER_ADDR'];
$websocketURL = "ws://{$server_ip}:8080";

if (isset($_GET['name'])) {
    $session_id = $_GET['name'];
} else {
    $session_id = null;
}
