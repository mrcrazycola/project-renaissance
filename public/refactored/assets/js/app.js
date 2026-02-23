/**
 * app.js — All frontend JavaScript logic
 * Extracted from monolith. Engine (variable names, logic) is IDENTICAL.
 * 
 * NOTE: This file expects these global variables to be set by index.php:
 *   - window.APP_SERVER_IP   (PHP: $server_ip)
 *   - window.APP_SESSION_ID  (PHP: $session_id)
 * 
 * Also expects verse-data.js to be loaded BEFORE this file.
 */

// ===================== TAB MANAGEMENT =====================
function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll(".tab-content");
    const tabLinks = document.querySelectorAll(".tab-link");
    const songDetailsArea = document.getElementById("song-details-area");

    tabContents.forEach(content => content.style.display = "none");
    tabLinks.forEach(link => link.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    document.getElementById(tabName).appendChild(songDetailsArea);

    if (tabName === 'schedule-tab') {
        updateDropdownOptions();
        document.getElementById('song-details-area').style.display = 'block';
    }
    if (tabName === 'images-tab') { document.getElementById('song-details-area').style.display = 'none'; }
    if (tabName === 'verse-tab') { document.getElementById('song-details-area').style.display = 'none'; }
    if (tabName === 'search-tab') { document.getElementById('song-details-area').style.display = 'block'; }
    if (tabName === 'versesch-tab') { document.getElementById('song-details-area').style.display = 'none'; }
    if (tabName === 'sthothira-baligal') { document.getElementById('song-details-area').style.display = 'none'; }
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-contents').forEach(c => c.style.display = 'none');
        this.classList.add('active');
        const targetId = this.getAttribute('data-tab');
        document.getElementById(targetId).style.display = 'block';
    });
});

document.querySelector('.tab')?.click();

document.getElementById("fetch-scheduled-button")?.addEventListener("click", function() {
    const songDetails = "Fetched Song Details";
    const lineResult = "";
    document.getElementById("song-details").innerText = songDetails;
    document.getElementById("line-result").innerText = lineResult;
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search-tab").style.display = "block";
});

// ===================== SCROLL HELPERS =====================
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('scrolltodiv')) {
        const targetDiv = document.getElementById('searchResults');
        if (targetDiv) {
            setTimeout(() => { targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
        }
    }
});
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('scrollButton')) {
        const targetDiv = document.getElementById('song-details-area');
        if (targetDiv) {
            setTimeout(() => { targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
        }
    }
});
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('scrollButton2')) {
        const targetDiv = document.getElementById('song-details-area');
        if (targetDiv) {
            setTimeout(() => { targetDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
        }
    }
});

// ===================== EDIT POPUP =====================
function openEditPopup(name) {
    document.getElementById('editSongOldName').value = name;
    document.getElementById('editSongName').value = name;
    document.getElementById('editPopup').style.display = 'block';
}
function closeEditPopup() {
    document.getElementById('editPopup').style.display = 'none';
}
function saveSongName(event) {
    if (event) event.preventDefault();
    let oldName = document.getElementById('editSongOldName').value;
    let newName = document.getElementById('editSongName').value;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        if (this.responseText.trim() === "success") {
            let buttons = document.querySelectorAll(".scrollButton");
            buttons.forEach(btn => {
                if (btn.innerText.trim() === oldName.trim()) { btn.innerText = newName; }
            });
            let icons = document.querySelectorAll(".edit-icon");
            icons.forEach(icon => {
                if (icon.getAttribute("onclick") === `openEditPopup('${oldName}')`) {
                    icon.setAttribute("onclick", `openEditPopup('${newName}')`);
                }
            });
            closeEditPopup();
        } else {
            showSnackbarnotify("Error updating song: " + this.responseText);
        }
    };
    xhr.send("old_name=" + encodeURIComponent(oldName) + "&name=" + encodeURIComponent(newName));
}

// ===================== SNACKBAR =====================
function showSnackbarnotify(message, duration = 3000) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = message;
    snackbar.className = "show";
    setTimeout(() => { snackbar.className = snackbar.className.replace("show", ""); }, duration);
}

// ===================== PRESENTING (SWIPE CONTENT) =====================
const titleDiv = document.getElementById("presenting-title");
const lineResultDiv = document.getElementById("presenting-content");
const dot0 = document.getElementById("dot-0");
const dot1 = document.getElementById("dot-1");

const contents = [
    { title: "Main View", body: `Main Page content will be shown here.` },
    { title: "Stage View", body: `Stage View content will be shown here.` }
];
let currentIndex = 0;

function updateContent() {
    titleDiv.innerHTML = contents[currentIndex].title;
    lineResultDiv.innerHTML = contents[currentIndex].body;
    updateDots();
}
function switchContent(direction) {
    if (direction === "next") { currentIndex = (currentIndex + 1) % contents.length; }
    else { currentIndex = (currentIndex - 1 + contents.length) % contents.length; }
    updateContent();
}
function updateDots() {
    dot0.classList.toggle("active", currentIndex === 0);
    dot1.classList.toggle("active", currentIndex === 1);
}
dot0.onclick = () => { currentIndex = 0; updateContent(); };
dot1.onclick = () => { currentIndex = 1; updateContent(); };

let startX = 0;
lineResultDiv.addEventListener("touchstart", function(e) { startX = e.touches[0].clientX; });
lineResultDiv.addEventListener("touchend", function(e) {
    let endX = e.changedTouches[0].clientX;
    let diffX = endX - startX;
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) { switchContent("prev"); } else { switchContent("next"); }
    }
});
updateContent();

// ===================== MOBILE VIEWPORT =====================
if (/Mobi|Android/i.test(navigator.userAgent)) {
    var meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.getElementsByTagName('head')[0].appendChild(meta);
}

// ===================== CHAPTER NAVIGATION (SWIPE) =====================
let NEXT_BOOK = null, NEXT_CH = null, PREV_BOOK = null, PREV_CH = null;
const swipeArea = document.getElementById("searchResults");
const TRANS_MS = 350;

function loadChapter(book, chapter) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "", method: "POST",
            data: { action: "searchChapter", bookNum: book, chNum: chapter },
            dataType: "json",
            success(response) {
                const cont = document.getElementById("searchResultsContent");
                if (cont) cont.innerHTML = response.chapterHTML;
                PREV_BOOK = Number(response.prevBook);
                PREV_CH = Number(response.prevChap);
                NEXT_BOOK = Number(response.nextBook);
                NEXT_CH = Number(response.nextChap);
                resolve();
            },
            error(xhr, status, err) { console.error("[AJAX ERROR]", status, err); reject(err); }
        });
    });
}

function slideToChapter(direction, book, chapter) {
    const cont = document.getElementById("searchResultsContent");
    if (!cont) return loadChapter(book, chapter);
    cont.className = "";
    if (direction === "next") { cont.classList.add("out-left"); }
    else { cont.classList.add("out-right"); }
    setTimeout(() => {
        cont.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
        cont.style.transition = 'none';
        cont.style.transform = 'translateX(0)';
        void cont.offsetHeight;
        loadChapter(book, chapter).then(() => {
            cont.className = "";
            cont.style.transition = 'none';
            if (direction === "next") { cont.style.transform = 'translateX(100%)'; }
            else { cont.style.transform = 'translateX(-100%)'; }
            void cont.offsetHeight;
            cont.style.transition = 'transform 0.35s ease';
            cont.style.transform = 'translateX(0)';
            setTimeout(() => { cont.style.transition = ''; cont.style.transform = ''; }, TRANS_MS + 20);
        });
    }, TRANS_MS);
}

let startX1 = 0, startY = 0, startTime = 0;
const threshold = 60, restraint = 100, allowedTime = 800;

function isValidSwipe(dx, dy, elapsed) {
    return elapsed <= allowedTime && Math.abs(dx) > threshold && Math.abs(dy) < restraint;
}

if (swipeArea) {
    if (window.PointerEvent) {
        swipeArea.addEventListener("pointerdown", (e) => {
            startX1 = e.clientX; startY = e.clientY; startTime = Date.now();
            try { swipeArea.setPointerCapture(e.pointerId); } catch(_) {}
        }, { passive: true });
        swipeArea.addEventListener("pointerup", (e) => {
            const dx = e.clientX - startX1, dy = e.clientY - startY, elapsed = Date.now() - startTime;
            if (isValidSwipe(dx, dy, elapsed)) {
                if (dx < 0) { if (NEXT_BOOK && NEXT_CH) slideToChapter("next", NEXT_BOOK, NEXT_CH); }
                else { if (PREV_BOOK && PREV_CH) slideToChapter("prev", PREV_BOOK, PREV_CH); }
            }
            try { swipeArea.releasePointerCapture(e.pointerId); } catch(_) {}
        }, { passive: true });
    } else {
        swipeArea.addEventListener("touchstart", (e) => {
            const t = e.touches[0]; startX1 = t.clientX; startY = t.clientY; startTime = Date.now();
        }, { passive: true });
        swipeArea.addEventListener("touchend", (e) => {
            const t = e.changedTouches[0];
            const dx = t.clientX - startX1, dy = t.clientY - startY, elapsed = Date.now() - startTime;
            if (isValidSwipe(dx, dy, elapsed)) {
                if (dx < 0) { if (NEXT_BOOK && NEXT_CH) slideToChapter("next", NEXT_BOOK, NEXT_CH); }
                else { if (PREV_BOOK && PREV_CH) slideToChapter("prev", PREV_BOOK, PREV_CH); }
            }
        }, { passive: true });
    }
}

// ===================== GOOGLE SEARCH =====================
document.getElementById("input-google-search")?.addEventListener("click", function() {
    const query = document.getElementById("search-term").value.trim();
    if (query !== "") { window.open("https://www.google.com/search?q=" + encodeURIComponent(query), "_blank"); }
    else { showSnackbarnotify("Please enter a search term first."); }
});
document.getElementById("morestanza")?.addEventListener("click", function() {
    const query = songName;
    if (query !== "") {
        const excludeSites = ["tamilchristiansongs.in"];
        const excludeQuery = query + " " + excludeSites.map(site => `-site:${site}`).join(' ');
        window.open("https://www.google.com/search?q=" + encodeURIComponent(excludeQuery), "_blank");
    } else { showSnackbarnotify("Please select a song first."); }
});

document.getElementById("verse")?.addEventListener("keydown", function(e) {
    if (e.key === "Enter") { document.getElementById("display").click(); }
});

// ===================== FILE BROWSER =====================
function requestFileList(directory) {
    if (typeof directory !== 'string') {}
    let message = { type: "file_list", directory: directory };
    socket.send(JSON.stringify(message));
}

function displayFileList(files, currentDirectory) {
    const serverIP = window.APP_SERVER_IP;
    const normalizedPath = currentDirectory.replace(/\\/g, '/');
    let listContainer, header;
    if (normalizedPath === 'C:/xampp/htdocs/bible/uploads') {
        listContainer = document.getElementById("upload-list");
    } else {
        listContainer = document.getElementById("file-list");
        if (listContainer) {
            header = document.createElement("h4");
            header.textContent = "Current Directory: " + (currentDirectory || "Unknown");
            listContainer.appendChild(header);
        }
    }
    if (!listContainer) return;
    listContainer.innerHTML = "";
    if (!Array.isArray(files)) return;

    files.forEach(file => {
        const filePath = currentDirectory + "/" + file.name;
        let itemDiv = document.createElement("div");
        itemDiv.className = "thumbnail-item";
        itemDiv.style.display = "inline-block";
        itemDiv.style.margin = "10px";
        itemDiv.style.textAlign = "center";

        if (file.type === 'folder') {
            let icon = document.createElement("img");
            icon.src = "folder_icon.png";
            icon.style.width = "80px"; icon.style.height = "80px";
            let label = document.createElement("div");
            label.textContent = file.name;
            itemDiv.appendChild(icon); itemDiv.appendChild(label);
            itemDiv.onclick = function() {
                const btn = document.getElementById("refresh-btn");
                btn.innerHTML = `<img src="spinner.gif" alt="Loading..." style="height: 11px; transform: scale(3.25);">`;
                socket.send(JSON.stringify({ type: 'file_list', directory: filePath }));
            };
        } else if (file.type === 'file') {
            const ext = file.name.split('.').pop().toLowerCase();
            const imageExts = ['jpg','jpeg','png','gif','bmp','webp'];
            const videoExts = ['mp4','webm','mkv','avi','mov'];
            const isImage = imageExts.includes(ext);
            const isVideo = videoExts.includes(ext);
            let cleanPath = filePath.replace(/^([a-zA-Z]:\\?)/, '').replace(/\\/g, '/');
            let encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');

            if (isImage || isVideo) {
                let img = document.createElement("img");
                if (file.thumbnail) { img.src = file.thumbnail; }
                else { img.src = isImage ? `http://${serverIP}:8000/${encodedPath}` : 'default_video_thumbnail.jpg'; }
                img.style.width = "100px"; img.style.height = "100px"; img.style.objectFit = "cover";
                let label = document.createElement("div");
                label.textContent = file.name;
                itemDiv.appendChild(img); itemDiv.appendChild(label);
                itemDiv.onclick = function() {
                    socket.send(JSON.stringify({ type: 'media_request', filename: filePath, image: img, session_id: window.APP_SESSION_ID }));
                };
            } else {
                let button = document.createElement("button");
                button.textContent = file.name;
                button.className = "btn btn-primary";
                button.onclick = function() {
                    socket.send(JSON.stringify({ type: 'media_request', filename: filePath, session_id: window.APP_SESSION_ID }));
                };
                itemDiv.appendChild(button);
            }
        }
        listContainer.appendChild(itemDiv);
    });
    document.getElementById("refresh-btn").innerHTML = '<i class="fa-solid fa-rotate"></i>';
    document.getElementById("refresh-btn2").innerHTML = '<i class="fa-solid fa-rotate"></i>';
}

// ===================== WEBSOCKET =====================
let socket;
document.addEventListener('DOMContentLoaded', function() {
    const floatingReactions = document.querySelector('.floating-reactions');

    window.onload = function() {
        const buttons = {
            "zoom-in": "zoomIn", "zoom-out": "zoomOut", "reset": "resetZoom",
            "up": "moveUp", "left": "moveLeft", "right": "moveRight", "down": "moveDown"
        };
        Object.keys(buttons).forEach(className => {
            const button = document.querySelector(`.text-but.${className}, .arrow.${className}`);
            if (button) { button.addEventListener("click", function() { imgFunction(buttons[className]); }); }
        });
    };

    let reconnectAttempts = 0;
    let reconnectTimeout = null;

    function connectWebSocket() {
        const serverIP = window.APP_SERVER_IP;
        const websocketURL = `ws://${serverIP}:8080`;
        const sessionId = window.APP_SESSION_ID;
        setWsConnecting();
        socket = new WebSocket(websocketURL);

        socket.onopen = () => {
            reconnectAttempts = 0;
            socket.send(JSON.stringify({ type: 'register', client: 'page1' }));
            setWsConnected();
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'verse') {
                contents[0].body = `<strong>${data.book} ${data.chapter}:${data.versenum} (${data.session_id})<br></strong>${data.verse}`;
                contents[1].body = `<strong>${data.book} ${data.chapter}:${data.versenum} (${data.session_id})<br></strong>${data.verse}`;
                updateContent();
                createFloatingReaction('like', '👍', data.session_id);
                fetchVerseHistory();
                uncheckMyCheckbox();
            } else if (data.type === 'song') {
                contents[0].body = `<strong>${data.name} (${data.session_id}) <i class="fa-solid fa-download scrollButton2" onclick="getcurrentsong('${data.name}')"></i> <br></strong>${data.song}`;
                contents[1].body = `<strong>${data.name} (${data.session_id}) <br></strong>${data.song}`;
                updateContent();
                createFloatingReaction('like', '👍', data.session_id);
                uncheckMyCheckbox();
            } else if (data.type === 'stanza_update') {
                contents[1].body = `<strong>${data.name} (${data.session_id}) <br></strong>${data.song}`;
                updateContent();
                createFloatingReaction('like', '❤️', data.session_id);
                uncheckMyCheckbox();
            } else if (data.type === 'image_received') {
                contents[0].body = `(${data.session_id}) <br> <img src="${data.image}" alt="Image" style="width: 100%; max-height:200px; object-fit: cover;">`;
                contents[1].body = `(${data.session_id}) <br> <img src="${data.image}" alt="Image" style="width: 100%; max-height:200px; object-fit: cover;">`;
                updateContent();
                createFloatingReaction('like', '👍', data.session_id);
                uncheckMyCheckbox();
            } else if (data.type === 'msg') {
                showSnackbar(data.session_id, data.message);
            } else if (data.type === 'cleared') {
                contents[0].body = data.message + " (" + data.session_id + ")";
                contents[1].body = data.message + " (" + data.session_id + ")";
                updateContent();
                createFloatingReaction('like', '👍', data.session_id);
                uncheckMyCheckbox();
            } else if (data.type === 'song_history_update') {
                fetchSongHistory();
            } else if (data.type === 'playing_video') {
                contents[0].body = `(${data.session_id}) <br> 
                    <img src="${data.image}" alt="Image" style="width: 100%; max-height:200px; object-fit: cover;">`;
                contents[0].body += `
                    <div class="media-container">
                        <div id="mediaControls">
                            <button class="video-play">▶</button>
                            <button class="video-pause">⏸</button>
                            <button class="video-backward">⏪</button>
                            <button class="video-forward">⏩</button>
                            <button class="video-up">🔊 +</button>
                            <button class="video-down">🔉 -</button>
                        </div>
                    </div>`;
                updateContent();
                createFloatingReaction('like', '👍', data.session_id);
                uncheckMyCheckbox();
                videoFunctionbuttons();
            }
            if (data.type === "file_list") {
                displayFileList(data.files, data.current_directory);
            }
        };
        socket.onclose = (event) => { setWsDisconnected(); scheduleReconnect(); };
        socket.onerror = (err) => { setWsDisconnected(); socket.close(); };
    }

    window.addEventListener('online', () => {
        if (!socket || socket.readyState === WebSocket.CLOSED) { connectWebSocket(); }
    });

    function scheduleReconnect() {
        if (reconnectTimeout) return;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeout = setTimeout(() => { reconnectAttempts++; reconnectTimeout = null; connectWebSocket(); }, delay);
    }

    function imgFunction(action) {
        const message = { type: "imgFunction", action: action, session_id: window.APP_SESSION_ID };
        if (socket && socket.readyState === WebSocket.OPEN) { socket.send(JSON.stringify(message)); }
    }

    window.getcurrentsong = function(name) {
        if (name === 'Not from DB') {
            $.post("", { action: "getCurrentSongreq" }, function(data) {
                if (data.status === "success") {
                    var songLines = data.song.split("\n\n");
                    var songDisplay = "<div style= 'display : flex'><label>End Stanza:</label><input type = 'checkbox' id= 'endline' style= 'margin-top: 2%;' onclick = 'if(this.checked) endstanza()'></div> <ul style='list-style: none; padding: 0;'>";
                    for (var i = 0; i < songLines.length; i++) {
                        songDisplay += `<li class='song-paragraph' style='position: relative; padding-top: 30px;' onclick='uncheckMyCheckbox()'>
                            <label class='toggle-switch'><input type='checkbox' class='toggle-input'><span class='slider'></span></label>
                            ${songLines[i]}
                        </li>`;
                    }
                    songDisplay += "</ul>";
                    $('#song-details').html(songDisplay);
                } else { showSnackbarnotify("Error fetching current song"); }
            }, "json");
        } else { getSong(name); }
    };

    const sessionId = window.APP_SESSION_ID;

    function videoFunctionbuttons() {
        const buttonsvideo = {
            "video-play": "video-play", "video-pause": "video-pause",
            "video-backward": "video-backward", "video-forward": "video-forward",
            "video-up": "video-up", "video-down": "video-down"
        };
        Object.keys(buttonsvideo).forEach(className => {
            const button = document.querySelector(`.${className}`);
            if (button) {
                button.addEventListener("click", function() { videoFunction(buttonsvideo[className]); });
            }
        });
        function videoFunction(action) {
            const message = { type: "videoFunction", action: action, session_id: sessionId };
            if (socket.readyState === WebSocket.OPEN) { socket.send(JSON.stringify(message)); }
        }
    }

    $(document).ready(connectWebSocket);

    document.getElementById("refresh-btn")?.addEventListener("click", function() {
        this.innerHTML = `<img src="spinner.gif" alt="Loading..." style="height: 11px; transform: scale(3.25);">`;
        requestFileList("C:\\");
    });
    document.getElementById("refresh-btn2")?.addEventListener("click", function() {
        this.innerHTML = `<img src="spinner.gif" alt="Loading..." style="height: 11px; transform: scale(3.25);">`;
        requestFileList("C:\\xampp\\htdocs\\bible\\uploads");
    });

    // ===================== MEDIA UPLOAD =====================
    const mediaUploader = document.getElementById("mediaUploader");
    const mediaList = document.getElementById("media-list");
    const uploadStatus = document.getElementById("uploadStatus");

    mediaUploader?.addEventListener("change", function() {
        const files = Array.from(this.files);
        if (files.length === 0) return;
        files.forEach(file => {
            const isVideo = file.type.startsWith("video/");
            const isImage = file.type.startsWith("image/");
            if (isImage) {
                const imgButton = document.createElement("button");
                imgButton.style.border = "none"; imgButton.style.background = "transparent";
                imgButton.style.cursor = "pointer"; imgButton.style.margin = "8px"; imgButton.style.padding = "0";
                const img = document.createElement("img");
                img.src = URL.createObjectURL(file);
                img.style.maxWidth = "120px"; img.style.borderRadius = "10px";
                img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
                img.style.transition = "transform 0.2s ease";
                imgButton.appendChild(img);
                imgButton.onmouseenter = () => img.style.transform = "scale(1.05)";
                imgButton.onmouseleave = () => img.style.transform = "scale(1)";
                imgButton.onclick = () => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        socket.send(JSON.stringify({ type: "image_send", filename: file.name, filetype: file.type, data: reader.result, session_id: window.APP_SESSION_ID }));
                        img.style.opacity = "0.6"; img.style.border = "3px solid #28a745";
                    };
                };
                mediaList.appendChild(imgButton);
            } else if (isVideo) {
                const MAX_SIZE_BYTES = 490 * 1024 * 1024;
                if (file.size > MAX_SIZE_BYTES) { alert(`File exceeds 450 MB limit.`); return; }
                uploadStatus.innerHTML = `<span style="color: blue;">Uploading <b>${file.name}</b>...</span> <img src="spinner.gif" style="width:30px;vertical-align:middle;">`;
                const formData = new FormData();
                formData.append("video", file);
                fetch("/bible/upload.php", { method: "POST", body: formData })
                    .then(res => res.text())
                    .then(response => {
                        socket.send(JSON.stringify({ type: "video_uploaded", filename: file.name, url: `/uploads/${file.name}`, session_id: window.APP_SESSION_ID }));
                        uploadStatus.innerHTML = `<span style="color: green;">Upload complete: <b>${file.name}</b></span>`;
                    })
                    .catch(err => { uploadStatus.innerHTML = `<span style="color: red;">Upload failed</span>`; });
            }
        });
        this.value = '';
    });

    // ===================== WS STATUS =====================
    function setWsStatus(statusClass, titleText) {
        document.querySelectorAll("#ws-status").forEach(dot => {
            dot.classList.remove("connected", "connecting", "disconnected");
            dot.classList.add(statusClass);
            dot.title = titleText;
        });
    }
    function setWsConnected() { setWsStatus("connected", "Connected"); }
    function setWsConnecting() { setWsStatus("connecting", "Connecting"); }
    function setWsDisconnected() { setWsStatus("disconnected", "Disconnected"); }

    function showSnackbar(line1, line2) {
        let snackbar = document.createElement("div");
        snackbar.innerHTML = `<div style="text-align: center;">${line1}<br><br>${line2}</div>`;
        snackbar.style.position = "fixed"; snackbar.style.bottom = "20px"; snackbar.style.left = "50%";
        snackbar.style.transform = "translateX(-50%)"; snackbar.style.backgroundColor = "#333";
        snackbar.style.color = "#fff"; snackbar.style.padding = "12px 24px"; snackbar.style.borderRadius = "5px";
        snackbar.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)"; snackbar.style.zIndex = "1000";
        snackbar.style.transition = "opacity 0.5s ease-in-out"; snackbar.style.opacity = "0";
        document.body.appendChild(snackbar);
        setTimeout(() => { snackbar.style.opacity = "1"; }, 100);
        let hideTimeout;
        function startHideTimeout() {
            hideTimeout = setTimeout(() => { snackbar.style.opacity = "0"; setTimeout(() => snackbar.remove(), 500); }, 5000);
        }
        function clearHideTimeout() { clearTimeout(hideTimeout); }
        startHideTimeout();
        snackbar.addEventListener("touchstart", clearHideTimeout);
        snackbar.addEventListener("mousedown", clearHideTimeout);
        snackbar.addEventListener("touchend", startHideTimeout);
        snackbar.addEventListener("mouseup", startHideTimeout);
    }

    function createFloatingReaction(reaction, emoji, sessionId) {
        if (!floatingReactions) return;
        const reactionWrapper = document.createElement('div');
        reactionWrapper.className = 'reaction-wrapper';
        const reactionElement = document.createElement('span');
        reactionElement.className = 'reaction'; reactionElement.textContent = emoji;
        const sessionIdElement = document.createElement('div');
        sessionIdElement.className = 'session-id'; sessionIdElement.textContent = sessionId || 'No ID';
        reactionWrapper.appendChild(reactionElement); reactionWrapper.appendChild(sessionIdElement);
        reactionWrapper.style.position = 'absolute'; reactionWrapper.style.bottom = '0'; reactionWrapper.style.left = '10px';
        reactionElement.style.color = randomColor();
        floatingReactions.appendChild(reactionWrapper);
        setTimeout(() => { reactionWrapper.style.transform = 'translateY(-200px)'; reactionWrapper.style.opacity = '0'; }, 100);
        setTimeout(() => reactionWrapper.remove(), 3000);
    }
    function randomColor() {
        const colors = ['#FF5A5F','#FFB400','#007A87','#8A2BE2','#FF4500','#228B22'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});

// ===================== MESSAGING =====================
var session_id = window.APP_SESSION_ID;
var inputField = document.getElementById("msg");

function sendMessage() {
    const msg = inputField.value.trim();
    if (!msg) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "msg", status: "msgsent", msg: msg, session_id: session_id }));
        inputField.value = "";
    }
}

inputField?.addEventListener("keydown", function(event) {
    if (event.key === "Enter") { event.preventDefault(); sendMessage(); }
});

// ===================== SONG MANAGEMENT =====================
$('#edit-button').click(function() {
    if ($(this).text() === "Edit") { $(this).text("Disable Editing"); }
    else { $(this).text("Edit"); }
});

$('#clear-schedule-button').click(function() {
    if (confirm("Are you sure you want to delete entire the song schedule?")) {
        $.post("", { action: 'clear-schedule' }, function(data) {
            showSnackbarnotify("Schedule Cleared!");
        }).fail(function() { showSnackbarnotify("Error clearing the schedule."); });
    }
});

function clearInput() { document.getElementById("input-text").value = ""; }
var isEditable = false;
var songName = "";

$('#search-form').submit(function(e) {
    e.preventDefault();
    var searchTerm = $('#search-term').val();
    var actionType = $('#search_song_word').is(':checked') ? 'search_song_word' : 'search';
    $('#result').html(`<div class="loader"><div class="spinner"></div><p>Searching...</p></div>`);
    $.post("", { action: actionType, search_term: searchTerm }, function(data) { $('#result').html(data); });
});

function endstanza(action) {
    const message = { type: "endstanza", session_id: session_id };
    if (socket && socket.readyState === WebSocket.OPEN) { socket.send(JSON.stringify(message)); }
}

function uncheckMyCheckbox() {
    const checkbox = document.getElementById("endline");
    if (checkbox) { checkbox.checked = false; }
}

function getSong(songName) {
    $.post("", { action: 'get_song', song_name: songName }, function(data) {
        var songLines = JSON.parse(data);
        var songDisplay = "<div style= 'display : flex'><label>End Stanza:</label><input type = 'checkbox' id= 'endline' style= 'margin-top: 2%;' onclick = 'if(this.checked) endstanza()'></div> <ul style='list-style: none; padding: 0;'>";
        for (var i = 0; i < songLines.length; i++) {
            songDisplay += `<li class='song-paragraph' style='position: relative; padding-top: 30px;' onclick='uncheckMyCheckbox()'>
                <label class='toggle-switch'><input type='checkbox' class='toggle-input'><span class='slider'></span></label>
                ${songLines[i]}
            </li>`;
        }
        songDisplay += "</ul>";
        $('#song-details').html(songDisplay);

        $('.song-paragraph').click(function() { sendLine(songName, $(this).text()); });
        $('.song-paragraph').click(function() {
            let text = $('#song-details .song-paragraph').map(function() {
                return $(this).clone().children('label').remove().end().text().trim();
            }).get().join("\n\n");
            if (songName === "") songName = "Not from DB";
            sendsong(songName, text);
        });
        $('.song-paragraph').on('focusout', function() {
            if (isEditable) { updateEditedLine($(this).text()); }
        });
        $('.toggle-input, .slider').on('click mousedown', function(event) { event.stopPropagation(); });
        $('.toggle-input').change(function(event) {
            event.stopPropagation();
            let stanzaText = $(this).closest('.song-paragraph').text().trim();
            if ($(this).prop("checked")) {
                $('.toggle-input').not(this).prop('checked', false);
                $('.song-paragraph').not($(this).closest('.song-paragraph')).removeClass('highlight');
                $.post("", { action: 'stanza', song_name: songName, clicked_line: stanzaText });
            }
            $(this).closest('.song-paragraph').toggleClass('highlight', $(this).prop("checked"));
        });
        window.songName = songName;
    });
}

$('#display-button').click(function() {
    var inputText = $('#input-text').val().trim();
    if (inputText) {
        var paragraphs = inputText.split(/\n\s*\n/);
        var displayHtml = "<ul>";
        displayHtml += "<div style= 'display : flex'><label>End Stanza:</label><input type = 'checkbox' id= 'endline' style= 'margin-top: 2%;' onclick = 'if(this.checked) endstanza()'></div> <ul style='list-style: none; padding: 0;'>";
        paragraphs.forEach(function(paragraph) { displayHtml += "<li class='song-paragraph'>" + paragraph.trim() + "</li>"; });
        displayHtml += "</ul>";
        $('#song-details').html(displayHtml);
        $('.song-paragraph').click(function() { sendLine("Not from DB", $(this).text()); });
        $('.song-paragraph').click(function() {
            let text = $('#song-details .song-paragraph').map(function() {
                return $(this).clone().children('label').remove().end().text().trim();
            }).get().join("\n\n");
            if (songName === "") songName = "Not from DB";
            sendsong(songName, text);
        });
        $('.song-paragraph').on('focusout', function() { if (isEditable) { updateEditedLine($(this).text()); } });
        window.songName = "";
    } else { showSnackbarnotify('Please enter some text.'); }
});

function sendLine(name, line) {
    if (isEditable) return;
    $('#line-result').html(line);
    $.post("", { action: 'click_line', name: name, clicked_line: line });
}

function sendsong(name, line) {
    if (isEditable) return;
    $.post("", { action: 'click_song', name: name, clicked_song: line });
}

function openSongPopup(editedSong) {
    $("#popup-overlay, #popup-box").fadeIn();
    $("#popup-new-save").off("click").on("click", function() {
        var newSongName = $("#popup-song-name").val();
        var songURL = $("#popup-song-url").val();
        var songEnglish = $("#popup-song-english").val();
        var songFormatted = editedSong.replace(/\n/g, "\n\n");
        var songEnglishFormatted = songEnglish.replace(/\n/g, "\n\n");
        if (newSongName) {
            $.post("", { action: 'save_new_song', new_song_URL: songURL, new_song_name: newSongName, new_song_content: songFormatted, new_song_english: songEnglishFormatted }, function(data) {
                showSnackbarnotify(data); $("#popup-overlay, #popup-box").fadeOut();
            });
        } else { showSnackbarnotify("Please enter a song name."); }
    });
    $("#popup-cancel").off("click").on("click", function() { $("#popup-overlay, #popup-box").fadeOut(); });
}

function openSongPopupnewsong() {
    $("#popup-overlay-newsong, #popup-box-newsong").fadeIn();
    $("#popup-new-song-save").off("click").on("click", function() {
        var newSongName = $("#popup-new-song-name").val();
        var songURL = $("#popup-new-song-url").val();
        var songTamil = $("#popup-new-song-tamil").val();
        var songEnglish = $("#popup-new-song-english").val();
        var songFormatted = songTamil.replace(/\n/g, "\n\n");
        var songEnglishFormatted = songEnglish.replace(/\n/g, "\n\n");
        if (newSongName) {
            $.post("", { action: 'save_new_song', new_song_URL: songURL, new_song_name: newSongName, new_song_content: songFormatted, new_song_english: songEnglishFormatted }, function(data) {
                showSnackbarnotify(data); $("#popup-overlay-newsong, #popup-box-newsong").fadeOut();
            });
        } else { showSnackbarnotify("Please enter a song name."); }
    });
    $("#popup-new-cancel").off("click").on("click", function() { $("#popup-overlay-newsong, #popup-box-newsong").fadeOut(); });
}

// ===================== SONG SAVE/DELETE/ADD/SCHEDULE =====================
$('#save-button').click(function() {
    var editedSong = $('#input-text').val();
    if (!editedSong) { showSnackbarnotify('Please enter the song text.'); return; }
    if (songName) {
        $.post("", { action: 'save_edited_song', song_name: songName, edited_song: editedSong }, function(data) { showSnackbarnotify(data); });
    } else { openSongPopup(editedSong); }
});

$('#delete-button').click(function() {
    if (songName) {
        var confirmDelete = confirm("Are you sure you want to delete the song: " + songName + "?");
        if (confirmDelete) {
            $.post("", { action: 'delete_song', song_name: songName }, function(data) {
                showSnackbarnotify(data); $('#song-details').html(''); songName = '';
            });
        }
    } else { showSnackbarnotify('No song is loaded to delete.'); }
});

$('#schedule-button').click(function() {
    if (songName) {
        $.post("", { action: 'schedule_song', song_name: songName }, function(data) { showSnackbarnotify(data); });
    } else { showSnackbarnotify('Please load a song first.'); }
});

$('#clear-button').click(function() {
    $.post("", { action: 'clear' }, function(data) { showSnackbarnotify("Cleared!"); });
});

$('#add-button').click(function() {
    var inputText = $('#input-text').val().trim();
    if (inputText) {
        const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=]*)?$/;
        if (urlRegex.test(inputText)) {
            $.post("", { action: 'add_new_song', new_song_name: inputText }, function(data) { showSnackbarnotify(data); });
        } else { openSongPopupnewsong(); }
    } else { openSongPopupnewsong(); }
});

// ===================== SCHEDULE TAB =====================
$('#fetch-scheduled-button').click(function() {
    var selectedOption = $('#options').val();
    if (selectedOption) {
        var songName = selectedOption;
        $.post("", { action: 'fetch_scheduled_song', song_name: songName }, function(data) {
            var songLines = JSON.parse(data);
            var songDisplay = "<div style= 'display : flex'><label>End Stanza:</label><input type = 'checkbox' id= 'endline' style= 'margin-top: 2%;' onclick = 'if(this.checked) endstanza()'></div> <ul style='list-style: none; padding: 0;'>";
            for (var i = 0; i < songLines.length; i++) {
                songDisplay += `<li class='song-paragraph' style='position: relative; padding-top: 30px;' onclick='uncheckMyCheckbox()'>
                    <label class='toggle-switch'><input type='checkbox' class='toggle-input'><span class='slider'></span></label>
                    ${songLines[i]}
                </li>`;
            }
            songDisplay += "</ul>";
            $('#song-details').html(songDisplay);
            $('.song-paragraph').click(function() { sendLine(songName, $(this).text()); });
            $('.song-paragraph').on('focusout', function() { if (isEditable) { updateEditedLine($(this).text()); } });
            window.songName = songName;
        });
    } else { showSnackbarnotify('Please select a song from the dropdown.'); }
});

$('#clear-scheduled-button').click(function() {
    var selectedOption = $('#options').val();
    if (selectedOption) {
        $.post("", { action: 'clear_scheduled_song', song_name: selectedOption }, function(data) {
            if (data.success) { showSnackbarnotify('Cleared.'); $('#song-details').html(''); updateDropdownOptions(); }
            else { showSnackbarnotify('Failed to clear.'); }
        }, 'json');
    } else { showSnackbarnotify('Please select a song.'); }
    updateDropdownOptions();
});

function updateDropdownOptions() {
    $.post("", { action: 'fetch_options' }, function(data) {
        try {
            const jsonString = data.replace(/^.*?(\[)/, '[');
            const options = JSON.parse(jsonString);
            const dropdown = $('#options');
            const selectedValue = dropdown.val();
            dropdown.empty();
            options.forEach(option => { dropdown.append(new Option(option.name, option.name)); });
            if (selectedValue && dropdown.find(`option[value="${selectedValue}"]`).length) { dropdown.val(selectedValue); }
        } catch (e) { console.error("Error parsing JSON:", e); }
    });
}

function openSongEditor(songName) {
    let currentSong = [];
    $('#song-details .song-paragraph').each(function() { currentSong.push($(this).text().trim()); });
    let fullText = currentSong.join("\n\n");
    $('#popup-textarea').val(fullText);
    $('#song-popup').fadeIn();
}
function closeSongEditor() { $('#song-popup').fadeOut(); }

$('#popup-ok').click(function() {
    let editedText = $('#popup-textarea').val();
    let lines = editedText.split(/\n\s*\n/);
    let songDisplay = "<ul style='list-style:none; padding:0;'>";
    for (let i = 0; i < lines.length; i++) {
        songDisplay += `<li class='song-paragraph' style='position: relative; padding-top: 30px;'>
            <label class='toggle-switch'><input type='checkbox' class='toggle-input'><span class='slider'></span></label>
            ${lines[i]}
        </li>`;
    }
    songDisplay += "</ul>";
    $('#song-details').html(songDisplay);
    closeSongEditor();
});
$('#popup-close, #popup-close-btn').click(function() { closeSongEditor(); });

// ===================== VERSE HISTORY =====================
function fetchVerseHistory() {
    const formData = new FormData();
    formData.append('fetchHistory', true);
    fetch('', { method: 'POST', body: formData })
        .then(response => response.text())
        .then(data => {
            try {
                const history = JSON.parse(data);
                const historyList = document.getElementById('historyList');
                historyList.innerHTML = '';
                if (history.length === 0 || history.message) { historyList.innerHTML = '<li>No history available for today.</li>'; return; }
                historyList.innerHTML = '<label for="history">History</label>';
                history.forEach(entry => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<strong>${entry.bookName} ${entry.chNum}:${entry.verseNum}</strong> <i class="fa-solid fa-book-open open-book"></i>`;
                    listItem.dataset.bookName = entry.bookName;
                    listItem.dataset.chNum = entry.chNum;
                    listItem.dataset.verseNum = entry.verseNum;
                    listItem.dataset.bookNum = entry.bookNum;
                    listItem.addEventListener('click', function() { displayVerseFromHistory(entry.bookNum, entry.chNum, entry.verseNum); });
                    listItem.querySelector('.open-book').addEventListener('click', function(e) { e.stopPropagation(); loadChapter(entry.bookNum, entry.chNum); });
                    historyList.appendChild(listItem);
                });
            } catch (error) { console.error('Error parsing JSON:', error); }
        })
        .catch(error => console.error('Error fetching history:', error));
}

function fetchSongHistory() {
    const formDatasong = new FormData();
    formDatasong.append('fetchSongHistorycall', true);
    fetch('', { method: 'POST', body: formDatasong })
        .then(response => response.text())
        .then(data => {
            try {
                const historysong = JSON.parse(data);
                const historysongList = document.getElementById('historyListsong');
                historysongList.innerHTML = '';
                if (historysong.length === 0 || historysong.message) { historysongList.innerHTML = '<li>No history available for today.</li>'; return; }
                historysongList.innerHTML = '<label for="history">History</label>';
                historysong.forEach(entry => {
                    const listItemsong = document.createElement('li');
                    listItemsong.innerHTML = `<strong>${entry.songName}</strong>`;
                    listItemsong.addEventListener('click', function() { getSong(entry.songName); });
                    historysongList.appendChild(listItemsong);
                });
            } catch (error) { console.error('Error parsing JSON:', error); }
        })
        .catch(error => console.error('Error fetching history:', error));
}

function displayVerseFromHistory(bookNum, chNum, verseNum) {
    const formData = new FormData();
    formData.append('action', 'history');
    formData.append('bookNum', bookNum);
    formData.append('chNum', chNum);
    formData.append('verseNum', verseNum);
    fetch('', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.book && data.chNum && data.verseNum && data.verse) {
                document.getElementById('book').value = data.bookNum;
                document.getElementById('chapter').value = data.chNum;
                document.getElementById('verse').value = data.verseNum;
                $("#verseDisplay").html(`<h4><strong>${data.book} ${data.chNum} : ${data.verseNum}:</strong></h4><p>${data.verse}</p>`);
                updateVerseLimits(); updateChapterLimits();
            } else { $("#verseDisplay").html("<p>Verse not found in history.</p>"); }
        })
        .catch(error => console.error('Error displaying verse from history:', error));
}

document.addEventListener('DOMContentLoaded', fetchVerseHistory);
document.addEventListener('DOMContentLoaded', fetchSongHistory);

document.addEventListener("DOMContentLoaded", function() {
    inputField?.addEventListener("keydown", function(event) {
        if (event.key === "Enter") { event.preventDefault(); sendMessage(); }
    });
});

// ===================== CHAPTER/VERSE LIMITS =====================
function updateChapterLimits() {
    const bookSelect = document.getElementById('book');
    const chapterInput = document.getElementById('chapter');
    const selectedBookNum = bookSelect.value;
    if (bookChapterLimits[selectedBookNum]) {
        const { min, max } = bookChapterLimits[selectedBookNum];
        chapterInput.min = min; chapterInput.max = max;
        chapterInput.placeholder = `Enter chapter (${min}-${max})`;
        let labelElement = document.getElementById("chapterLabel");
        labelElement.innerHTML = `Select Chapter: (${min}-${max})`;
        localStorage.setItem("chapterLabelText", labelElement.innerHTML);
        chapterInput.oninput = function() { const value = Number(this.value); if (this.value !== "" && (value < min || value > max)) { this.value = ""; } };
    } else {
        chapterInput.min = 1; chapterInput.max = 0; chapterInput.placeholder = 'Enter chapter';
        let labelElement = document.getElementById("chapterLabel");
        labelElement.innerHTML = `Select Chapter:`;
    }
}

window.addEventListener("load", () => {
    const savedLabel = localStorage.getItem("chapterLabelText");
    var card = document.getElementById("book").value;
    if (card !== "" && savedLabel) { document.getElementById("chapterLabel").innerHTML = savedLabel; }
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('book')?.addEventListener('change', updateChapterLimits);
});

function updateVerseLimits() {
    const bookSelect = document.getElementById('book');
    const chapterInput = document.getElementById('chapter');
    const verseInput = document.getElementById('verse');
    const selectedBook = bookSelect.value;
    const selectedChapterNum = parseInt(chapterInput.value, 10);
    if (selectedBook && selectedChapterNum > 0) {
        const versesInChapter = verseCountMapping[selectedBook]?.verses[selectedChapterNum] || 0;
        if (versesInChapter > 0) {
            verseInput.min = 1; verseInput.max = versesInChapter;
            verseInput.placeholder = `Enter verse (1-${versesInChapter})`;
            let labelElement = document.getElementById("verseLabel");
            labelElement.innerHTML = `Select Verse: (1-${versesInChapter})`;
            localStorage.setItem("verseLabelText", labelElement.innerHTML);
        } else { verseInput.min = 1; verseInput.max = 0; verseInput.placeholder = 'Enter verse'; }
    } else { verseInput.min = 1; verseInput.max = 0; verseInput.placeholder = 'Enter verse'; }
}

window.addEventListener("load", () => {
    const savedLabel = localStorage.getItem("verseLabelText");
    var card = document.getElementById("book").value;
    if (card !== "" && savedLabel) { document.getElementById("verseLabel").innerHTML = savedLabel; }
});

$(document).ready(function() {
    $('#book').change(updateVerseLimits);
    $('#chapter').on('input', function() {
        if (parseInt($(this).val(), 10) > 0) { updateVerseLimits(); }
        else { $('#verse').val('').attr('min', 1).attr('max', 0).attr('placeholder', 'Enter verse'); }
    });
    $('#verse').on('input', function() {
        const selectedBook = $('#book').val();
        const selectedChapter = parseInt($('#chapter').val(), 10);
        const selectedVerse = parseInt($(this).val(), 10);
        if (verseCountMapping[selectedBook] && selectedChapter && selectedVerse) {
            const verses = verseCountMapping[selectedBook].verses[selectedChapter];
            if (selectedVerse < 1 || selectedVerse > verses) { $(this).val(''); }
        }
    });
});

// ===================== VERSE FORM SUBMISSION =====================
$(document).ready(function() {
    let bookNum, chNum, verseNum;
    $(".actionButton").click(function(e) {
        e.preventDefault();
        let action = $(this).val();
        let searchWord = $("#searchWord").val();
        let higlitText = $("#higlit").val();
        if (action === "display") {
            if ($("#versesch-tab").is(":visible")) {
                let selectedValue = $("#optionsverse").val();
                let values = selectedValue ? selectedValue.split("-") : [0,0,0];
                bookNum = values[0]; chNum = values[1]; verseNum = values[2];
            } else {
                bookNum = $("#book").val(); chNum = $("#chapter").val(); verseNum = $("#verse").val();
                if (!bookNum || !chNum || !verseNum) { showSnackbarnotify("Please select all the three Book, Chapter, and Verse."); return; }
            }
        }
        if (action === "next" && ($("#versesch-tab").is(":visible"))) { verseNum = parseInt(verseNum); }
        else if (action === "previous" && ($("#versesch-tab").is(":visible"))) { verseNum = parseInt(verseNum); }
        else if (action === "next") { bookNum = $("#book").val(); verseNum = $("#verse").val(); chNum = $("#chapter").val(); }
        else if (action === "previous") { bookNum = $("#book").val(); verseNum = $("#verse").val(); chNum = $("#chapter").val(); }
        else if (action === "searchChapter") { bookNum = $("#book").val(); chNum = $("#chapter").val(); verseNum = $("#verse").val(); }
        else if (action === "higlitbut") { bookNum = $("#book").val(); verseNum = $("#verse").val(); chNum = $("#chapter").val(); }

        $.ajax({
            url: window.location.href, type: 'POST',
            data: { action, bookNum, chNum, verseNum, higlit: higlitText, searchWord: searchWord },
            dataType: 'json',
            success: function(response) {
                if (action === 'searchword') { $("#searchResultsContent").html(response.searchResults || "<p>No results found.</p>"); }
                else if (action === 'searchChapter') { loadChapter(bookNum, chNum); return; }
                else {
                    if (action === 'clearverse') return;
                    if (action !== "display" || "scheduleverse") { bookNum = response.bookNum; chNum = response.chNum; verseNum = response.verseNum; }
                    $("#book").val(response.bookNum).change();
                    $("#chapter").val(response.chNum);
                    $("#verse").val(response.verseNum);
                    let newDropdownValue = `${response.bookNum}-${response.chNum}-${response.verseNum}`;
                    $("#options").val(newDropdownValue);
                    $("#verseDisplay").html(`<h4><strong>${response.book} ${response.chNum} : ${response.verseNum}:</strong></h4><p>${response.verse}</p>`);
                    updateVerseLimits(); updateChapterLimits();
                }
            },
            error: function(xhr, status, error) { console.error("AJAX Error:", status, error); }
        });
    });
});

// ===================== STHOTHIRA BALIGAL =====================
$(document).ready(function() {
    $(".baligal").click(function(e) {
        e.preventDefault();
        let action = $(this).attr("id");
        let inputVal = $("#sthothira-chapter").val();
        if (!inputVal || parseInt(inputVal) < 1) { showSnackbarnotify("Please enter a valid number greater than '0'."); $("#sthothira-chapter").focus(); return; }
        $.ajax({
            url: window.location.href, type: 'POST',
            data: { action: action, value: inputVal }, dataType: 'json',
            success: function(response) { if (response.newValue !== undefined) { $("#sthothira-chapter").val(response.newValue); } },
            error: function(xhr, status, error) { console.error("AJAX Error:", status, error); }
        });
    });
});

// ===================== VERSE PREVIEW =====================
$(document).ready(function() {
    $("#verse").on("input", function() {
        let bookNum = $("#book").val(), chNum = $("#chapter").val(), verseNum = $(this).val();
        if (bookNum && chNum && verseNum) { fetchVersePreview(bookNum, chNum, verseNum); }
    });
});

function fetchVersePreview(bookNum, chNum, verseNum) {
    $.ajax({
        url: window.location.href, type: 'POST',
        data: { action: 'previewVerse', bookNum: bookNum, chNum: chNum, verseNum: verseNum },
        dataType: 'json',
        success: function(response) {
            if (response.preview) { $("#versePreview").html(`<p>${response.preview}</p>`); }
            else { $("#versePreview").html("<p>No preview available.</p>"); }
        },
        error: function(xhr, status, error) { console.error("Error fetching verse preview:", error); }
    });
}

function showVerse(bookNum, chNum, verseNum) {
    $.ajax({
        url: window.location.href, type: 'POST',
        data: { action: 'display', bookNum: bookNum, chNum: chNum, verseNum: verseNum },
        success: function(response) {
            $("#book").val(bookNum).change();
            $("#chapter").val(chNum); $("#verse").val(verseNum);
            $("#verseDisplay").html(`<h4><strong>${response.book} ${response.chNum} : ${response.verseNum}:</strong></h4><p>${response.verse}</p>`);
        },
        error: function() { showSnackbarnotify('Error fetching verse!'); }
    });
}
window.showVerse = showVerse;
