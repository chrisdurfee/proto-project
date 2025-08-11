<?php
// Minimal health endpoint (no secrets). Returns JSON with basic component checks.
header('Content-Type: application/json');
$result = [
    'status' => 'ok',
    'checks' => [],
    'timestamp' => gmdate('c')
];

try {
    require_once __DIR__ . '/../vendor/autoload.php';
    $result['checks']['autoload'] = 'ok';
} catch (Throwable $e) {
    $result['checks']['autoload'] = 'fail';
    $result['status'] = 'degraded';
}

$dbHost = getenv('DB_HOST');
$dbUser = getenv('DB_USERNAME');
$dbPass = getenv('DB_PASSWORD');
$dbName = getenv('DB_DATABASE');
if ($dbHost && $dbUser && $dbName) {
    $mysqli = @mysqli_init();
    @mysqli_options($mysqli, MYSQLI_OPT_CONNECT_TIMEOUT, 2);
    if (@$mysqli->real_connect($dbHost, $dbUser, $dbPass, $dbName)) {
        $result['checks']['database'] = 'ok';
        $mysqli->close();
    } else {
        $result['checks']['database'] = 'fail';
        $result['status'] = 'degraded';
    }
}

$redisHost = getenv('REDIS_HOST');
if ($redisHost) {
    try {
        /**
         * @suppresswarnings PHP0413
         */
        $redis = new Redis();
        @$redis->connect($redisHost, (int)getenv('REDIS_PORT') ?: 6379, 1.5);
        $redisPass = getenv('REDIS_PASSWORD');
        if ($redisPass) { @$redis->auth($redisPass); }
        $pong = @$redis->ping();
        $result['checks']['redis'] = ($pong === '+PONG' || $pong === 'PONG' || $pong === 1 || $pong === true) ? 'ok' : 'fail';
        if ($result['checks']['redis'] !== 'ok') { $result['status'] = 'degraded'; }
        @$redis->close();
    } catch (Throwable $e) {
        $result['checks']['redis'] = 'fail';
        $result['status'] = 'degraded';
    }
}

http_response_code($result['status'] === 'ok' ? 200 : 503);
echo json_encode($result);
