<?php
/**
 * All AJAX/POST action handlers — extracted from monolith.
 * Engine (variable names, DB columns, SQL) is IDENTICAL.
 */

use Ratchet\Client\Connector;
use Ratchet\Client\WebSocket;
use React\EventLoop\Factory;

// Handle Clear request
if (isset($_POST['action']) && $_POST['action'] === 'clear') {
    clearrow($conn, $websocketURL, $session_id);
    exit;
}

// Fetch schedule_song names for dropdown (used in HTML)
$sql1 = "SELECT name FROM schedule_song";
$options_result = $conn->query($sql1);
if ($options_result === FALSE) {
    die("Error: " . $conn->error);
}

// Handle AJAX requests for searching songs
if (isset($_POST['action']) && $_POST['action'] === 'search') {
    $search_term = $conn->real_escape_string($_POST['search_term']);

    $sql = "
    SELECT *,
        CASE
            WHEN SUBSTRING_INDEX(name, ' - ', 1) LIKE '$search_term%' THEN 5
            WHEN SUBSTRING_INDEX(name, ' - ', 1) LIKE '%$search_term%' THEN 4
            WHEN SOUNDEX(SUBSTRING_INDEX(name, ' - ', 1)) = SOUNDEX('$search_term') THEN 3
            WHEN MATCH(name) AGAINST ('$search_term' IN NATURAL LANGUAGE MODE) THEN 2
            ELSE 1
        END AS relevance
    FROM song
    WHERE 
        SUBSTRING_INDEX(name, ' - ', 1) LIKE '%$search_term%'
        OR SOUNDEX(SUBSTRING_INDEX(name, ' - ', 1)) = SOUNDEX('$search_term')
        OR MATCH(name) AGAINST ('$search_term' IN NATURAL LANGUAGE MODE)
    ORDER BY relevance DESC, name ASC
    ";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $songName = htmlspecialchars($row['name'], ENT_QUOTES);
            echo "
        <li style='position: relative; list-style: none; margin-bottom: 10px;'>
            <button class='scrollButton' onclick=\"getSong('$songName')\">$songName</button>
            <span class='edit-icon' onclick=\"openEditPopup('$songName')\">✎</span>
        </li>";
        }
    } else {
        echo "<p>No results found.</p>";
    }
    exit;
}

// Handle AJAX requests for searching song word
if (isset($_POST['action']) && $_POST['action'] === 'search_song_word') {
    $search_term = $conn->real_escape_string($_POST['search_term']);

    $sql = "SELECT * FROM song WHERE song_english LIKE '%$search_term%' ORDER BY name ASC";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $search_regex = '/' . preg_quote($search_term, '/') . '/i';

        while ($row = $result->fetch_assoc()) {
            $song_name = htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8');
            $song_english = $row['song_english'];

            $lines = preg_split("/\r\n|\n|\r/", $song_english);

            $matched_lines = '';
            for ($i = 0; $i < count($lines); $i++) {
                if (stripos($lines[$i], $search_term) !== false) {
                    $line = htmlspecialchars($lines[$i], ENT_QUOTES, 'UTF-8');
                    $line = preg_replace(
                        $search_regex,
                        '<span style="color:red; font-weight:bold;">$0</span>',
                        $line
                    );
                    $matched_lines = $line;
                    if (isset($lines[$i + 1])) {
                        $next_line = htmlspecialchars($lines[$i + 1], ENT_QUOTES, 'UTF-8');
                        $matched_lines .= "<br>" . $next_line;
                    }
                    break;
                }
            }

            echo "<li>
                <button class=\"scrollButton\" onclick=\"getSong('$song_name')\">$song_name</button><br>
                <div style=\"margin-left: 10px; font-size: 0.9em; color: #555;\">$matched_lines</div>
            </li>";
        }
    } else {
        echo "<p>No results found.</p>";
    }
    exit;
}

// Handle AJAX requests to fetch song details
if (isset($_POST['action']) && $_POST['action'] === 'get_song') {
    $song_name = $conn->real_escape_string($_POST['song_name']);
    $sql = "SELECT song_tamil FROM song WHERE name = '$song_name'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $song = $row['song_tamil'] ?? '';
        $song = str_replace("\\n", "\n", $song);
        $lines = preg_split("/\r?\n\s*\r?\n/", $song);
        echo json_encode($lines);
    } else {
        echo json_encode(["Song not found."]);
    }
    exit;
}

// Handle AJAX requests for clicking on a line
if (isset($_POST['action']) && $_POST['action'] === 'click_line') {
    $clicked_line = $_POST['clicked_line'];
    $songname = $_POST['name'];

    $loop = Factory::create();
    $connector = new Connector($loop);
    $connector($websocketURL)
        ->then(function (WebSocket $conn) use ($loop, $clicked_line, $songname, $session_id) {
            $conn->on('message', function ($msg) {
                echo "Received message: {$msg}\n";
            });
            $conn->send(json_encode([
                'type' => 'update_song',
                'song' => $clicked_line,
                'name' => $songname,
                'session_id' => $session_id
            ]));
            $conn->close();
        }, function ($e) {
            echo "Could not connect: {$e->getMessage()}\n";
        });
    $loop->run();
    echo "Presenting: " . $clicked_line;
    exit;
}

// Handle AJAX requests for clicking on a line and sending the song to worship lead page 4
if (isset($_POST['action']) && $_POST['action'] === 'click_song') {
    $clicked_line = $_POST['clicked_song'];
    $songname = $_POST['name'];
    if ($songname !== "Not from DB") {
        $sql = "
            INSERT INTO song_history (songname, timestamp)
            SELECT '$songname', NOW()
            FROM DUAL
            WHERE NOT EXISTS (
                SELECT 1 
                FROM song_history 
                WHERE songname = '$songname' 
                AND DATE(`timestamp`) = CURDATE()
            )";
        $conn->query($sql);
    }

    $loop = Factory::create();
    $connector = new Connector($loop);
    $connector($websocketURL)
        ->then(function (WebSocket $conn) use ($loop, $clicked_line, $songname, $session_id) {
            $conn->on('message', function ($msg) {
                echo "Received message: {$msg}\n";
            });
            $conn->send(json_encode([
                'type' => 'update_song_to_lead',
                'song' => $clicked_line,
                'name' => $songname,
                'session_id' => $session_id
            ]));
            $conn->close();
        }, function ($e) {
            echo "Could not connect: {$e->getMessage()}\n";
        });
    $loop->run();
    echo "Success";
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'stanza') {
    $clicked_line = $_POST['clicked_line'];
    $songname = $_POST['song_name'];

    $loop = Factory::create();
    $connector = new Connector($loop);
    $connector($websocketURL)
        ->then(function (WebSocket $conn) use ($loop, $clicked_line, $songname, $session_id) {
            $conn->on('message', function ($msg) {
                echo "Received message: {$msg}\n";
            });
            $conn->send(json_encode([
                'type' => 'update_stanza',
                'song' => $clicked_line,
                'name' => $songname,
                'session_id' => $session_id
            ]));
            $conn->close();
        }, function ($e) {
            echo "Could not connect: {$e->getMessage()}\n";
        });
    $loop->run();
    echo "Presenting: " . $clicked_line;
}

// Handle AJAX requests to save the edited song
if (isset($_POST['action']) && $_POST['action'] === 'save_edited_song') {
    $song_name = $conn->real_escape_string($_POST['song_name']);
    $edited_song = $conn->real_escape_string($_POST['edited_song']);

    $sqlUpdate = "UPDATE song SET song_tamil = '$edited_song' WHERE name = '$song_name'";
    if ($conn->query($sqlUpdate)) {
        echo "Song updated successfully!";
        exit;
    } else {
        echo "Error updating the song: " . $conn->error;
    }
    exit;
}

// Handle AJAX requests to save a new song to the database
if (isset($_POST['action']) && $_POST['action'] === 'save_new_song') {
    $new_song_name = $conn->real_escape_string($_POST['new_song_name']);
    $new_song_content = $conn->real_escape_string($_POST['new_song_content']);
    $song_english = $conn->real_escape_string($_POST['new_song_english']);
    $song_URL = $conn->real_escape_string($_POST['new_song_URL']);

    $sqlInsert = "INSERT INTO song (name, song_tamil, song_english, url) VALUES ('$new_song_name', '$new_song_content', '$song_english', '$song_URL')";
    if ($conn->query($sqlInsert)) {
        echo "New song added successfully!";
    } else {
        echo "Error adding the new song: " . $conn->error;
    }
    exit;
}

// Handle AJAX requests to schedule the current song
if (isset($_POST['action']) && $_POST['action'] === 'schedule_song') {
    $song_name = $conn->real_escape_string($_POST['song_name']);

    try {
        $sqlInsertSchedule = "INSERT INTO schedule_song (name) VALUES ('$song_name')";
        if ($conn->query($sqlInsertSchedule)) {
            echo "Song successfully scheduled!";

            $loop = Factory::create();
            $connector = new Connector($loop);
            $connector($websocketURL)
                ->then(function (WebSocket $conn) {
                    $conn->send(json_encode(['type' => 'schedule_update']));
                    $conn->close();
                }, function ($e) {
                    echo "Could not connect: {$e->getMessage()}\n";
                });
            $loop->run();
        }
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() == 1062) {
            echo "This song is already scheduled!";
        } else {
            echo "Database error: " . $e->getMessage();
        }
    }
    exit;
}

// Handle AJAX requests to fetch a song from the schedule_song table
if (isset($_POST['action']) && $_POST['action'] === 'fetch_scheduled_song') {
    $song_name = $conn->real_escape_string($_POST['song_name']);

    $sqlFetch = "SELECT song_tamil FROM song WHERE name = '$song_name'";
    $result = $conn->query($sqlFetch);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $song = $row['song_tamil'] ?? '';
        $song = str_replace("\\n", "\n", $song);
        $lines = preg_split("/\r?\n\s*\r?\n/", $song);
        echo json_encode($lines);
    } else {
        echo json_encode(["Song not found."]);
    }
    exit;
}

// Handle AJAX requests to clear the schedule
if (isset($_POST['action']) && $_POST['action'] === 'clear-schedule') {
    $sql = "DELETE FROM `schedule_song`";
    if ($conn->query($sql)) {
        echo "Schedule cleared!";
    } else {
        echo "Error clearing schedule: " . $conn->error;
    }
    exit;
}

if (isset($_POST['action']) && $_POST['action'] == 'clear_scheduled_song') {
    $song_name = $_POST['song_name'];
    $result = clearScheduledSong($song_name);
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
    exit;
}

// Handle AJAX request to delete a specific song
if (isset($_POST['action']) && $_POST['action'] === 'delete_song') {
    $song_name = $conn->real_escape_string($_POST['song_name']);
    $sql = "DELETE FROM song WHERE name = '$song_name'";
    if ($conn->query($sql) === TRUE) {
        echo "Song deleted successfully.";
    } else {
        echo "Error deleting song: " . $conn->error;
    }
    exit;
}

// Handle AJAX requests to fetch options for the dropdown
if (isset($_POST['action']) && $_POST['action'] === 'fetch_options') {
    $sql = $conn->prepare("SELECT name FROM schedule_song");
    $sql->execute();
    $result = $sql->get_result();
    $options = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $options[] = ['name' => $row['name']];
        }
    }
    echo json_encode($options);
    exit;
}

// Handle AJAX requests for sothothira_bali
if (
    isset($_POST['action']) &&
    ($_POST['action'] === 'display-sthothira-button' ||
        $_POST['action'] === 'previous-sthothira-button' ||
        $_POST['action'] === 'next-sthothira-button')
) {
    $bali_value = $_POST['value'];
    $action = $_POST['action'];

    if ($action === 'previous-sthothira-button') {
        $bali_value--;
    } elseif ($action === 'next-sthothira-button') {
        $bali_value++;
    }

    if ($bali_value >= 1001) {
        $bali_value = 1;
    } elseif ($bali_value <= 0) {
        $bali_value = 1;
    }

    $bali_select = "SELECT sthothira_baligal_list FROM sthothira_baligal WHERE id = $bali_value";
    $bali_result = mysqli_query($conn, $bali_select);
    $bali_row = mysqli_fetch_assoc($bali_result);
    $bali_sentence = isset($bali_row['sthothira_baligal_list']) ? $bali_row['sthothira_baligal_list'] : 'Value out of range';

    $loop = Factory::create();
    $connector = new Connector($loop);
    $connector($websocketURL)
        ->then(function (WebSocket $conn) use ($loop, $bali_sentence, $session_id) {
            $conn->on('message', function ($msg) {
                echo "Received message: {$msg}\n";
            });
            $conn->send(json_encode([
                'type' => 'update_song',
                'song' => $bali_sentence,
                'name' => "Sothothira Bali",
                'session_id' => $session_id
            ]));
            $conn->close();
        }, function ($e) {
            echo "Could not connect: {$e->getMessage()}\n";
        });
    $loop->run();
    echo json_encode(["newValue" => $bali_value]);
    exit;
}

// Verse page variables
$bookNum = isset($_POST['bookNum']) ? intval($_POST['bookNum']) : "";
$chNum = isset($_POST['chNum']) ? intval($_POST['chNum']) : "";
$verseNum = isset($_POST['verseNum']) ? intval($_POST['verseNum']) : "";
$higlit = isset($_POST['higlit']) ? $_POST['higlit'] : '';
$verseText = '';
$searchWord = isset($_POST['searchWord']) ? $_POST['searchWord'] : '';

// Handle verse-related POST actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $action = $_POST['action'];

    switch ($action) {
        case 'display':
            list($bookNum, $chNum, $verseNum) = verseupdate($conn, $bookNum, $chNum, $verseNum, $websocketURL, $session_id, false);
            if (!$bookNum || !$chNum || !$verseNum) {
                echo json_encode(['error' => 'Invalid verse data']);
            } else {
                echo json_encode([
                    'book' => $book,
                    'bookNum' => $bookNum,
                    'chNum' => $chNum,
                    'verseNum' => $verseNum,
                    'verse' => $verse
                ]);
            }
            history($conn, $book, $bookNum, $chNum, $verseNum);
            exit;

        case 'next':
            $verseNum++;
            list($bookNum, $chNum, $verseNum) = verseupdate($conn, $bookNum, $chNum, $verseNum, $websocketURL, $session_id, false);
            if (!$bookNum || !$chNum || !$verseNum) {
                echo json_encode(['error' => 'Invalid verse data']);
            } else {
                echo json_encode([
                    'book' => $book,
                    'bookNum' => $bookNum,
                    'chNum' => $chNum,
                    'verseNum' => $verseNum,
                    'verse' => $verse
                ]);
            }
            exit;

        case 'previous':
            $verseNum--;
            list($bookNum, $chNum, $verseNum) = verseupdate($conn, $bookNum, $chNum, $verseNum, $websocketURL, $session_id, true);
            if (!$bookNum || !$chNum || !$verseNum) {
                echo json_encode(['error' => 'Invalid verse data']);
            } else {
                echo json_encode([
                    'book' => $book,
                    'bookNum' => $bookNum,
                    'chNum' => $chNum,
                    'verseNum' => $verseNum,
                    'verse' => $verse
                ]);
            }
            exit;

        case 'higlitbut':
            versehigupdate($conn, $bookNum, $chNum, $verseNum, $_POST['higlit'], $websocketURL, $session_id);
            echo json_encode([
                'book' => $book,
                'bookNum' => $bookNum,
                'chNum' => $chNum,
                'verseNum' => $verseNum,
                'verse' => $verse
            ]);
            exit;

        case 'history':
            list($bookNum, $chNum, $verseNum) = verseupdate($conn, $bookNum, $chNum, $verseNum, $websocketURL, $session_id);
            if (!$bookNum || !$chNum || !$verseNum) {
                echo json_encode(['error' => 'Invalid verse data']);
            } else {
                echo json_encode([
                    'book' => $book,
                    'bookNum' => $bookNum,
                    'chNum' => $chNum,
                    'verseNum' => $verseNum,
                    'verse' => $verse
                ]);
            }
            exit;

        case 'scheduleverse':
            addtoschedule($conn, $bookNum, $chNum, $verseNum);
            if (!$bookNum || !$chNum || !$verseNum) {
                echo json_encode(['error' => 'Invalid verse data']);
            } else {
                echo json_encode([
                    'book' => $book,
                    'bookNum' => $bookNum,
                    'chNum' => $chNum,
                    'verseNum' => $verseNum,
                    'verse' => $verse
                ]);
            }
            exit;

        case 'searchChapter':
            displayChapter($conn, $bookNum, $chNum);
            exit;

        case 'clearverse':
            clearrow($conn, $websocketURL, $session_id);
            if (!$bookNum || !$chNum || !$verseNum) {
                echo json_encode(['error' => 'Invalid verse data']);
            } else {
                echo json_encode([
                    'book' => 'dummy',
                    'bookNum' => $bookNum,
                    'chNum' => $chNum,
                    'verseNum' => $verseNum,
                    'verse' => $verse
                ]);
            }
            exit;

        case 'searchword':
            searchVerse($conn, $searchWord);
            exit;

        case 'previewVerse':
            previewVerse($conn, $_POST['bookNum'], $_POST['chNum'], $_POST['verseNum']);
            exit;
    }
}

// Handle history fetching
if (isset($_POST['fetchHistory'])) {
    header('Content-Type: application/json');
    date_default_timezone_set('Asia/Kolkata');
    $todayDate = date('Y-m-d');

    $sql = "SELECT `bookname`, `booknum`, `chapnum`, `versenum`, `timestamp` 
            FROM `verse_history` 
            WHERE DATE(`timestamp`) = '$todayDate' 
            ORDER BY `timestamp` DESC";

    $result = $conn->query($sql);

    $history = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $history[] = [
                'bookName' => $row['bookname'],
                'bookNum' => $row['booknum'],
                'chNum' => $row['chapnum'],
                'verseNum' => $row['versenum'],
                'timestamp' => $row['timestamp']
            ];
        }
        echo json_encode($history);
    } else {
        echo json_encode(["message" => "No history found for today"]);
    }
    exit;
}

// Handle history fetching for song page
if (isset($_POST['fetchSongHistorycall'])) {
    header('Content-Type: application/json');
    date_default_timezone_set('Asia/Kolkata');
    $todayDate = date('Y-m-d');

    $sql = "SELECT `songname`, `timestamp` 
            FROM `song_history` 
            WHERE DATE(`timestamp`) = '$todayDate' 
            ORDER BY `timestamp` DESC";

    $result = $conn->query($sql);

    $history = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $history[] = [
                'songName' => $row['songname'],
                'timestamp' => $row['timestamp']
            ];
        }
        echo json_encode($history);
    } else {
        echo json_encode(["message" => "No history found for today"]);
    }
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'getCurrentSongreq') {

    $loop = Factory::create();
    $connector = new Connector($loop);

    $connector($websocketURL)->then(
        function (WebSocket $conn) use ($session_id) {
            $conn->on('message', function ($msg) use ($conn) {
                $data = json_decode($msg, true);
                if ($data['type'] === 'currentSongResponse') {
                    echo json_encode([
                        'status' => 'success',
                        'song' => $data['current_song'],
                        'session_id' => $data['session_id']
                    ]);
                    $conn->close();
                }
            });
            $conn->send(json_encode([
                'type' => 'getCurrentSong',
                'session_id' => $session_id
            ]));
        },
        function ($e) {
            echo json_encode([
                'status' => 'error',
                'message' => "Could not connect: {$e->getMessage()}"
            ]);
        }
    );

    $loop->run();
    exit;
}

// Handle AJAX POST request for adding a new song from a URL
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_new_song') {
    $url = trim($_POST['new_song_name']);
    $host = parse_url($url, PHP_URL_HOST);

    if ($host !== 'tamilchristiansongs.in') {
        echo "Unsupported website.";
        exit;
    }

    $html = fetchHTML($url);
    if (!$html) {
        echo "Failed to fetch HTML content.";
        exit;
    }

    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML($html);
    libxml_clear_errors();
    $xpath = new DOMXPath($doc);

    $name = getNodeText($xpath, "//h1 | //h2 | //div[@class='entry-title'] | //div[@id='entry-title']");
    $songTamil = extractPlainTextFromDiv($xpath, "//div[@id='tamiltext']");
    $songEnglish = extractPlainTextFromDiv($xpath, "//div[@id='roman_tamiltext']");

    if (empty($name) || empty($songTamil)) {
        echo "Required song data not found on page.";
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO song (url, name, song_tamil, song_english) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $url, $name, $songTamil, $songEnglish);
    if ($stmt->execute()) {
        echo "Song added successfully!";
        exit;
    } else {
        echo "Database error: " . $stmt->error;
        exit;
    }
}

// Handle AJAX request for song name editing
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['old_name'], $_POST['name'])) {
    $oldName = $_POST['old_name'];
    $newName = $_POST['name'];

    $stmt = $conn->prepare("UPDATE song SET name=? WHERE name=?");
    $stmt->bind_param("ss", $newName, $oldName);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }
    exit;
}
