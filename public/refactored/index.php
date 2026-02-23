<?php
/**
 * index.php — Skeleton HTML
 * All PHP logic is in /api/. All JS is in /assets/js/. All CSS is in /assets/css/.
 * Engine (variable names, DB columns) is IDENTICAL to the original monolith.
 */

// Load backend
require_once __DIR__ . '/api/db.php';
require_once __DIR__ . '/api/functions.php';
require_once __DIR__ . '/api/actions.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Song Search</title>
    <script src="jquery-3.6.0.min.js"></script>
    <link href="example.css" rel="stylesheet">
    <link href="./css/all.min.css" rel="stylesheet">
    <link href="assets/css/styles.css" rel="stylesheet">
</head>

<body>
    <div id="ws-status" title="WebSocket status"></div>
    <div id="presenting">
        <div id="presenting-title"></div>
        <div id="presenting-content"></div>
        <div id="presenting-dots">
            <span class="dot" id="dot-0"></span>
            <span class="dot" id="dot-1"></span>
        </div>
    </div>

    <div class="tab-container">
        <div class="tab-buttons">
            <button class="tab-link active" onclick="openTab(event, 'search-tab')">Songs</button>
            <button class="tab-link" onclick="openTab(event, 'schedule-tab')">Song Schedule</button>
            <button class="tab-link" onclick="openTab(event, 'images-tab')">Media</button>
            <button class="tab-link" onclick="openTab(event, 'verse-tab')">Verse</button>
            <button class="tab-link" onclick="openTab(event, 'versesch-tab')">Verse Schedule</button>
            <button class="tab-link" onclick="openTab(event, 'sthothira-baligal')">Sthothira Baligal</button>
        </div>
        <input type="text" id="msg" class="msg" placeholder="Enter the msg to send ...">
        <button id="sendBtn" class="text-but" onclick="sendMessage()">Send <i class="fa-solid fa-paper-plane"></i></button>

        <!-- Search Tab -->
        <div id="search-tab" class="tab-content">
            <div id="search-area">
                <form id="search-form" method="post">
                    <input type="search" id="search-term" name="search_term" placeholder="Enter song name" required>
                    <div id="in-between" style="display: flex;">
                        <label for="myCheckbox">In between</label>
                        <input type="checkbox" id="search_song_word" name="search_song_word" style="margin-top: 2%;">
                    </div>
                    <button type="submit" name="search" id="but">Search <i class="fa-solid fa-magnifying-glass"></i></button>
                    <button type="button" id="clear-button" class="atag">Clear <i class="fa-solid fa-broom"></i></button>
                    <button type="button" id="input-google-search" class="atag">Google it <i class="fa-brands fa-google"></i></button>
                    <button type="button" id="schedule-button" class="atag">Schedule Song <i class="fa-solid fa-calendar-plus"></i></button>
                    <button type="button" id="clear-schedule-button" class="atag">Clear Schedule <i class="fa-solid fa-calendar-xmark"></i></button>
                </form>
            </div>
            <br>
            <div id="results-area">
                <ul id="result" style="padding-left: 20px;"></ul>
            </div>
            <div id="song-input-area">
                <textarea id="input-text" placeholder="Enter the full song here..." rows="5" cols="40" class="text-area"></textarea>
                <br>
                <button id="display-button" class="text-but scrollButton2">Display <i class="fa-solid fa-display"></i></button>
                <button id="clear-textarea" class="text-but" onclick="clearInput()">Clear Text Area <i class="fa-solid fa-broom"></i></button>
                <button id="delete-button" class="text-but">Delete Song <i class="fa-solid fa-trash"></i></button>
                <button onclick="openSongEditor(window.songName)" class="text-but">Edit Song <i class="fa-solid fa-pen"></i></button>
                <button id="add-button" class="text-but">Add New Song <i class="fa-solid fa-plus"></i></button>
                <button id="morestanza" class="text-but">More Stanza<i class="fa-solid fa-magnifying-glass"></i></button>
                <br>
            </div>
            <div id="historyListsong"></div>

            <div id="song-popup">
                <div id="popup-content">
                    <button id="popup-close">×</button>
                    <h3>Edit Song</h3>
                    <textarea id="popup-textarea"></textarea>
                    <div id="popup-buttons">
                        <button id="popup-ok">OK</button>
                        <button id="popup-save">Save</button>
                        <button id="popup-close-btn">Close</button>
                    </div>
                </div>
            </div>

            <div id="editPopup" class="popup">
                <div class="popup-content">
                    <span class="close" onclick="closeEditPopup()">&times;</span>
                    <h3>Edit Song Name</h3>
                    <input type="hidden" id="editSongOldName">
                    <input type="text" id="editSongName" style="width:100%; padding:8px;">
                    <br><br>
                    <button type="button" onclick="saveSongName(event)" class="text-but">Save</button>
                    <button type="button" onclick="closeEditPopup()" class="text-but">Cancel</button>
                </div>
            </div>

            <div id="popup-overlay"></div>
            <div id="popup-box">
                <h3>Save New Song</h3>
                <label>Song Name:</label>
                <input type="text" id="popup-song-name">
                <label>Song URL:</label>
                <input type="text" id="popup-song-url">
                <label>English Version:</label>
                <textarea id="popup-song-english" rows="10"></textarea>
                <button id="popup-new-save">Save</button>
                <button id="popup-cancel">Cancel</button>
            </div>

            <div id="popup-overlay-newsong"></div>
            <div id="popup-box-newsong">
                <h3>Save New Song</h3>
                <label>Song Name:</label>
                <input type="text" id="popup-new-song-name">
                <label>Song URL:</label>
                <input type="text" id="popup-new-song-url">
                <label>Song Tamil Version:</label>
                <textarea id="popup-new-song-tamil" rows="10"></textarea>
                <label>English Version:</label>
                <textarea id="popup-new-song-english" rows="10"></textarea>
                <button id="popup-new-song-save">Save</button>
                <button id="popup-new-cancel">Cancel</button>
            </div>
        </div>

        <!-- Schedule Tab -->
        <div id="schedule-tab" class="tab-content" style="display: none;">
            <form id="schedule-form">
                <br>
                <label for="options">Select an option:</label><br>
                <select name="options" id="options" class="custom-select">
                    <?php
                    if ($options_result->num_rows > 0) {
                        while ($row = $options_result->fetch_assoc()) {
                            $value = htmlspecialchars($row['name']);
                            $selected = ($value === $selectedValue) ? 'selected' : '';
                            echo '<option value="' . $value . '" ' . $selected . '>' . htmlspecialchars($row['name']) . '</option>';
                        }
                    }
                    ?>
                </select><br><br>
                <button type="button" id="fetch-scheduled-button" class="actionButton2">Fetch Selected Song <i class="fa-solid fa-download"></i></button>
                <button type="button" id="clear-scheduled-button" class="actionButton2">Clear Selected Song <i class="fa-solid fa-xmark"></i></button>
            </form>
        </div>
    </div>

    <!-- Shared Song Details Area -->
    <div id="song-details-area">
        <div id="song-details"></div>
        <div id="line-result"></div>
    </div>

    <!-- Media Tab -->
    <div id="images-tab" class="tab-content" style="display: none;">
        <label for="mediaUploader" class="upload-btn">
            <i class="fa-solid fa-upload"></i> Upload Images/Videos
        </label>
        <input type="file" id="mediaUploader" accept="image/*,video/*" multiple style="display:none;">
        <div id="uploadStatus" style="margin-top: 10px;"></div>
        <br><br>
        <ul class="tabs" role="tablist">
            <li class="tab" data-tab="browse">Browse Files</li>
            <li class="tab" data-tab="upload">Uploaded Files</li>
        </ul>
        <div class="tab-contents" id="browse">
            <button id="refresh-btn" onclick="requestFileList()"><i class="fa-solid fa-rotate"></i></button>
            <div id="file-list"></div>
        </div>
        <div class="tab-contents" id="upload" style="display: none;">
            <button id="refresh-btn2"><i class="fa-solid fa-rotate"></i></button>
            <div id="upload-list"></div>
        </div>
        <br>
        <button class="text-but zoom-in">Zoom In <i class="fa-solid fa-magnifying-glass-plus"></i></button>
        <button class="text-but zoom-out">Zoom Out <i class="fa-solid fa-magnifying-glass-minus"></i></button>
        <button class="text-but reset">Reset <i class="fa-solid fa-rotate-left"></i></button>
        <div class="button-container">
            <div class="arrow-container"><div class="arrow left"></div><div class="text">Left</div></div>
            <div class="arrow-container">
                <div class="arrow up"></div><div class="text">Up</div>
                <div class="arrow down"></div><div class="text">Down</div>
            </div>
            <div class="arrow-container"><div class="arrow right"></div><div class="text">Right</div></div>
        </div>
        <div id="media-list"></div>
    </div>

    <!-- Verse Tab -->
    <div id="verse-tab" class="tab-content" style="display: none;">
        <div id="verseDisplay"></div>
        <form id="bibleform" method="post" action="">
            <label for="book">Select Book:</label>
            <select name="bookNum" id="book" onchange="updateChapterLimits()">
                <option value="">-- Select a Book --</option>
                <?php
                $books = [
                    1 => "ஆதியாகமம்", 2 => "யாத்திராகமம்", 3 => "லேவியராகமம்", 4 => "எண்ணாகமம்",
                    5 => "உபாகமம்", 6 => "யோசுவா", 7 => "நியாயாதிபதிகள்", 8 => "ரூத்",
                    9 => "1 சாமுவேல்", 10 => "2 சாமுவேல்", 11 => "1 இராஜாக்கள்", 12 => "2 இராஜாக்கள்",
                    13 => "1 நாளாகமம்", 14 => "2 நாளாகமம்", 15 => "எஸ்றா", 16 => "நெகேமியா",
                    17 => "எஸ்தர்", 18 => "யோபு", 19 => "சங்கீதம்", 20 => "நீதிமொழிகள்",
                    21 => "பிரசங்கி", 22 => "உன்னதப்பாட்டு", 23 => "ஏசாயா", 24 => "எரேமியா",
                    25 => "புலம்பல்", 26 => "எசேக்கியேல்", 27 => "தானியேல்", 28 => "ஓசியா",
                    29 => "யோவேல்", 30 => "ஆமோஸ்", 31 => "ஒபதியா", 32 => "யோனா",
                    33 => "மீகா", 34 => "நாகூம்", 35 => "ஆபகூக்", 36 => "செப்பனியா",
                    37 => "ஆகாய்", 38 => "சகரியா", 39 => "மல்கியா", 40 => "மத்தேயு",
                    41 => "மாற்கு", 42 => "லூக்கா", 43 => "யோவான்", 44 => "அப்போஸ்தலருடைய நடபடிகள்",
                    45 => "ரோமர்", 46 => "1 கொரிந்தியர்", 47 => "2 கொரிந்தியர்", 48 => "கலாத்தியர்",
                    49 => "எபேசியர்", 50 => "பிலிப்பியர்", 51 => "கொலோசெயர்", 52 => "1 தெசலோனிக்கேயர்",
                    53 => "2 தெசலோனிக்கேயர்", 54 => "1 தீமோத்தேயு", 55 => "2 தீமோத்தேயு", 56 => "தீத்து",
                    57 => "பிலேமோன்", 58 => "எபிரெயர்", 59 => "யாக்கோபு", 60 => "1 பேதுரு",
                    61 => "2 பேதுரு", 62 => "1 யோவான்", 63 => "2 யோவான்", 64 => "3 யோவான்",
                    65 => "யூதா", 66 => "வெளிப்படுத்தின விசேஷம்"
                ];
                foreach ($books as $num => $name) {
                    $selected = ($num == $bookNum) ? 'selected' : '';
                    echo "<option value='$num' $selected>$name</option>";
                }
                ?>
            </select>
            <label id="chapterLabel" for="chapter">Select Chapter:</label>
            <input type="number" name="chNum" id="chapter" value="<?php echo isset($chNum) ? htmlspecialchars($chNum) : ''; ?>" required min="1" onfocus="this.value=''">
            <label id="verseLabel" for="verse">Select Verse:</label>
            <input type="text" inputmode="numeric" pattern="[0-9]*" name="verseNum" id="verse" value="<?php echo isset($verseNum) ? htmlspecialchars($verseNum) : ''; ?>" required min="1" onfocus="this.value=''" enterkeyhint="go">
            <br><br>
            <div id="versePreview"><p>Verse preview will appear here...</p></div>
            <br><br>
            <button type="button" value="display" name="display" id="display" class="actionButtondis actionButton">Display Verse <i class="fa-solid fa-tv"></i></button><br>
            <button type="button" value="previous" name="previous" id="previous" class="actionButton2 actionButton"><i class="fa-solid fa-circle-chevron-left"></i> Previous</button>
            <button type="button" value="next" name="next" id="next" class="actionButton2 actionButton">Next <i class="fa-solid fa-circle-chevron-right"></i></button>
            <button type="button" value="clearverse" name="clearverse" id="clearverse" class="actionButton2 actionButton">Clear <i class="fa-solid fa-broom"></i></button>
            <button type="button" value="scheduleverse" name="scheduleverse" id="scheduleverse" class="actionButton2 actionButton">Schedule <i class="fa-solid fa-calendar-plus"></i></button>
            <button type="button" value="searchChapter" name="searchChapter" id="searchChapter" class="actionButtondis actionButton scrolltodiv">Show Chapter <i class="fa-solid fa-book-open"></i></button><br><br>
            <input type="text" name="higlit" id="higlit" placeholder="Enter the highlight text" value="<?php echo $higlit; ?>"><br><br>
            <button type="button" value="higlitbut" name="higlitbut" id="higlitbut" class="actionButtonall actionButton">Highlight <i class="fa-solid fa-highlighter"></i></button>
        </form>
        <div id="historyList"></div>
        <br>
        <form id="verseForm" method="post">
            <label for="searchWord">Search for a word:</label>
            <input type="text" name="searchWord" id="searchWord" placeholder="Enter a word" required>
            <br><br>
            <button type="button" id="searchButton" value="searchword" class="actionButtonall actionButton">Search Word <i class="fa-solid fa-magnifying-glass"></i></button>
        </form>
        <div id="searchResults" style="touch-action: pan-y;">
            <div id="searchResultsContent"></div>
        </div>
    </div>

    <!-- Verse Schedule Tab -->
    <div id="versesch-tab" class="tab-content">
        <form method="post" action="">
            <label for="options">Select an option:</label>
            <select name="optionsverse" id="optionsverse">
                <?php
                $sql = "SELECT booknum, bookname, chapternumber, versenumber FROM schedule";
                $options_result2 = $conn->query($sql);
                if ($options_result2 && $options_result2->num_rows > 0) {
                    while ($row = $options_result2->fetch_assoc()) {
                        $value = htmlspecialchars($row['booknum']) . '-' . htmlspecialchars($row['chapternumber']) . '-' . htmlspecialchars($row['versenumber']);
                        echo '<option value="' . $value . '">'
                            . htmlspecialchars($row['bookname']) . ' '
                            . htmlspecialchars($row['chapternumber']) . ' : '
                            . htmlspecialchars($row['versenumber']) . '</option>';
                    }
                }
                ?>
            </select>
            <button type="button" name="display" value="display" id="display" class="actionButtondis actionButton">Display Verse <i class="fa-solid fa-tv"></i></button>
            <button type="button" name="pervious" id="previous" value="previous" class="actionButton2 actionButton"><i class="fa-solid fa-circle-chevron-left"></i> Previous</button>
            <button type="button" name="next" id="next" value="next" class="actionButton2 actionButton">Next <i class="fa-solid fa-circle-chevron-right"></i></button>
            <button type="button" name="clear" id="clear" value="clear" class="actionButtonall actionButton sec_verse">Clear <i class="fa-solid fa-broom"></i></button>
            <button type="button" name="clear_sec" class="actionButtonall actionButton sec_verse">Clear Schedule <i class="fa-solid fa-calendar-xmark"></i></button>
        </form>
    </div>

    <!-- Sthothira Baligal Tab -->
    <div id="sthothira-baligal" class="tab-content" style="display: none;">
        <label for="sthothira-chapter">Enter the number:</label>
        <div id="sthothiraDisplay">
            <input type="number" id="sthothira-chapter" min="1" onfocus="this.value=''">
            <button id="display-sthothira-button" class="actionButtondis baligal">Display <i class="fa-solid fa-tv"></i></button>
        </div>
        <button id="previous-sthothira-button" class="actionButton2 baligal"><i class="fa-solid fa-circle-chevron-left"></i> Previous</button>
        <button id="next-sthothira-button" class="actionButton2 baligal">Next <i class="fa-solid fa-circle-chevron-right"></i></button>
    </div>

    <div class="floating-reactions"></div>
    <div id="snackbar"></div>

    <!-- PHP-injected globals for JS -->
    <script>
        window.APP_SERVER_IP = '<?php echo $server_ip; ?>';
        window.APP_SESSION_ID = <?php echo json_encode($session_id); ?>;
    </script>

    <!-- External JS files -->
    <script src="assets/js/verse-data.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>
<?php
$blockedWords = ['human', 'man', 'admin', 'test', 'dancer', 'Dancer', 'singer', 'rapper', 'artist', 'producer', 'dj', 'lyricist', 'composer', 'vocalist', 'musician', 'performer', 'songwriter', 'band', 'group', 'ensemble', 'orchestra', 'choir', 'duo', 'trio', 'quartet', 'quintet'];
$name = $_GET['name'] ?? null;

if ($session_id === null || !$name || isInvalidName($name, $blockedWords)):
?>
<script>
let userName;
const blockedWords = ['human', 'man', 'admin', 'test'];
function isInvalidName(name) {
    name = name.trim();
    if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9.,!@#$%^&*()_+\-=\[\]{};:"'<>\?\/|]{4,}$/.test(name)) return true;
    if (/^(.)\1{3,}$/.test(name)) return true;
    if (/^\d+$/.test(name)) return true;
    for (const word of blockedWords) { if (new RegExp(`\\b${word}\\b`, 'i').test(name)) return true; }
    return false;
}
while (!userName || isInvalidName(userName)) {
    userName = prompt("Enter your name (min 4 chars, letters required, no repeated characters, no numbers-only, no reserved words):");
    if (userName === null) { alert("You must enter a valid name to continue."); }
    else if (isInvalidName(userName)) { alert("Invalid name. Please enter a real name."); }
}
if (userName) { window.location.href = "?name=" + encodeURIComponent(userName.trim()); }
</script>
<?php endif; ?>
