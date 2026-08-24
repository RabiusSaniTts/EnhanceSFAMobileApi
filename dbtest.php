<?php

ini_set('display_errors', '1');
error_reporting(E_ALL);

$tests = array(
    '127.0.0.1',
    'localhost'
);

foreach ($tests as $host) {
    echo '<h3>Testing: ' . htmlspecialchars($host) . '</h3>';

    $conn = @new mysqli(
        $host,
        'routepro',
        'Enhance@TTS',
        'sfa_migration',
        3306
    );

    if ($conn->connect_errno) {
        echo 'Failed: '
            . $conn->connect_errno
            . ' - '
            . htmlspecialchars($conn->connect_error)
            . '<br>';
    } else {
        echo 'Connection successful<br>';

        $result = $conn->query(
            "SELECT USER() AS login_user,
                    CURRENT_USER() AS matched_user,
                    @@version AS version"
        );

        if ($result) {
            $row = $result->fetch_assoc();

            echo 'Login user: '
                . htmlspecialchars($row['login_user'])
                . '<br>';

            echo 'Matched user: '
                . htmlspecialchars($row['matched_user'])
                . '<br>';

            echo 'MySQL version: '
                . htmlspecialchars($row['version'])
                . '<br>';
        }

        $conn->close();
    }
}