// Game State
let currentMode = "1";
let wordHistory = []; // For Mode 6
let generationHistory = []; // Stack for Undo functionality

// DOM Elements
const display = document.getElementById('game-display');
const select = document.getElementById('gamemode-select');

// Helper: Get Random Element
function getRandom(arr) {
    if (!arr || arr.length === 0) return "???";
    return arr[Math.floor(Math.random() * arr.length)];
}

// Logic for each Gamemode
function generateContent() {
    // Snapshot current state for Undo
    if (currentContent) {
        generationHistory.push({
            mode: currentContent.mode || currentMode, // Fallback to currentMode if not in content (shouldn't happen with new logic)
            content: JSON.parse(JSON.stringify(currentContent)) // Deep copy to avoid reference issues
        });
        if (generationHistory.length > 50) generationHistory.shift(); // Limit history size
    }

    display.innerHTML = ''; // Clear current content

    switch (currentMode) {
        case "1": // Character & Situation
            renderTwoLines(getRandom(CHARACTERS), getRandom(SITUATIONS));
            break;
        case "2": // Adjective & Character
            renderTwoLines(getRandom(ADJECTIVES), getRandom(CHARACTERS));
            break;
        case "3": // Random Word
            renderSingleLine(getRandom(ALL_WORDS));
            break;
        case "4": // Random Topic
            renderSingleLine(getRandom(TOPICS));
            break;
        case "5": // Two Random Topics
            renderTwoLines(getRandom(TOPICS), getRandom(TOPICS));
            break;
        case "6": // Word Stream (History)
            updateHistory();
            renderHistory();
            break;
        case "7": // Saying & Topic
            renderTwoLines(getRandom(SAYINGS), getRandom(TOPICS));
            break;
    }
}

// Render Helpers
function renderSingleLine(text) {
    wordHistory = []; // Reset history if switching away from Mode 6
    currentContent = { type: 'single', text: text, mode: currentMode }; // Capture content with mode
    const el = document.createElement('div');
    el.className = 'word-row';
    el.textContent = text;
    display.appendChild(el);
}

function renderTwoLines(text1, text2) {
    wordHistory = [];
    currentContent = { type: 'double', text1: text1, text2: text2, mode: currentMode }; // Capture content with mode
    const el1 = document.createElement('div');
    el1.className = 'word-row';
    el1.textContent = text1;

    const el2 = document.createElement('div');
    el2.className = 'word-row';
    el2.style.animationDelay = '0.1s'; // Stagger animations
    el2.textContent = text2;

    display.appendChild(el1);
    display.appendChild(el2);
}

// Mode 6 Logic
function updateHistory() {
    const newWord = getRandom(ALL_WORDS);
    wordHistory.unshift(newWord); // Add to beginning
    if (wordHistory.length > 5) wordHistory.pop(); // Keep max 5
    currentContent = { type: 'stream', history: [...wordHistory], mode: currentMode }; // Capture snapshot with mode
}

function renderHistory() {
    const historyContainer = document.createElement('div');
    historyContainer.className = 'history-container'; // We'll add this CSS class

    wordHistory.forEach((word, index) => {
        const el = document.createElement('div');
        el.className = 'history-item';

        if (index === 0) {
            el.classList.add('current'); // Newest word
            el.textContent = word;
        } else {
            el.classList.add('past'); // Older words
            // Make older words progressively smaller/more transparent
            el.style.opacity = 0.6 - (index * 0.1);
            el.style.fontSize = `${2.5 - (index * 0.3)}rem`;
            el.textContent = word;
        }
        historyContainer.appendChild(el);
    });

    display.appendChild(historyContainer);
}

// Event Listeners
// Handle Sidebar Clicks
// Instructions Data
const INSTRUCTIONS = {
    "1": { title: "CHARACTER & SITUATION", desc: "Act out the character in this situation." },
    "2": { title: "ADJECTIVE & CHARACTER", desc: "Roleplay this character with this specific trait." },
    "3": { title: "WORD -> CONTEXTS", desc: "List as many contexts/associations for this word as possible." },
    "4": { title: "TOPIC -> SYNONYMS", desc: "Give synonyms or examples related to this topic." },
    "5": { title: "TOPIC CONNECTION", desc: "Find two elements that rhyme, two elements that alliterate, and a context/word that could fit either." },
    "6": { title: "WORD STREAM STORY", desc: "Incorporate the new word into a continuous story." },
    "7": { title: "SAYING & TOPIC", desc: "Use this saying in a conversation about the topic." }
};

// DOM Elements
const instructionsContainer = document.getElementById('mode-instructions');

// Event Listeners
// Handle Sidebar Clicks
const sidebarList = document.getElementById('gamemode-list');
const listItems = sidebarList.querySelectorAll('li');

listItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update Active State
        listItems.forEach(li => li.classList.remove('active'));
        item.classList.add('active');

        // Update Mode
        currentMode = item.dataset.mode;
        wordHistory = []; // Reset history on mode change

        // Update Instructions
        const data = INSTRUCTIONS[currentMode];
        if (data) {
            instructionsContainer.innerHTML = `<h1>${data.title}</h1><p>${data.desc}</p>`;
        }

        // Auto-Generate Content
        generateContent();
    });
});



document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        generateContent();
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoGeneration();
    }
});

function undoGeneration() {
    if (generationHistory.length === 0) return;

    const previousState = generationHistory.pop();
    currentMode = previousState.mode;
    currentContent = previousState.content;

    // Restore UI state for mode
    // Update Sidebar Active Class
    listItems.forEach(li => {
        if (li.dataset.mode === currentMode) li.classList.add('active');
        else li.classList.remove('active');
    });

    // Update Instructions
    const data = INSTRUCTIONS[currentMode];
    if (data) {
        instructionsContainer.innerHTML = `<h1>${data.title}</h1><p>${data.desc}</p>`;
    }

    // Restore Content
    display.innerHTML = '';

    if (currentContent.type === 'single') {
        // Re-use render logic manually to avoid clearing history
        wordHistory = [];
        const el = document.createElement('div');
        el.className = 'word-row';
        el.textContent = currentContent.text;
        display.appendChild(el);
    } else if (currentContent.type === 'double') {
        wordHistory = [];
        const el1 = document.createElement('div');
        el1.className = 'word-row';
        el1.textContent = currentContent.text1;

        const el2 = document.createElement('div');
        el2.className = 'word-row';
        el2.style.animationDelay = '0.1s';
        el2.textContent = currentContent.text2;

        display.appendChild(el1);
        display.appendChild(el2);
    } else if (currentContent.type === 'stream') {
        wordHistory = currentContent.history;
        renderHistory();
    }
}

// Flagging System
let currentContent = null; // Store current generated content
let flaggedItems = [];
// Removed: let flaggedItems = JSON.parse(localStorage.getItem('flaggedItems') || '[]');

const flagBtn = document.getElementById('flag-btn');
const flagCountSpan = document.getElementById('flag-count');
const exportBtn = document.getElementById('export-btn');

function updateFlagCount() {
    flagCountSpan.textContent = flaggedItems.length;
}

// Fetch flags from server on load
async function loadFlags() {
    try {
        const res = await fetch('/api/flags');
        if (res.ok) {
            flaggedItems = await res.json();
            updateFlagCount();
        }
    } catch (e) {
        console.error("Failed to load flags from server", e);
        // Optional: Fallback to localStorage if server fails?
        // For now, we assume server is primary as requested.
    }
}

// Initialize count
loadFlags();

flagBtn.addEventListener('click', async () => {
    if (!currentContent) return;

    // Check if already locally known to be flagged (optimistic check)
    const exists = flaggedItems.some(item => JSON.stringify(item.content) === JSON.stringify(currentContent));

    if (!exists) {
        const newFlag = {
            timestamp: new Date().toISOString(),
            mode: currentMode,
            content: currentContent
        };

        // Optimistic UI update
        flaggedItems.push(newFlag);
        updateFlagCount();
        flagBtn.classList.add('flagged');
        setTimeout(() => flagBtn.classList.remove('flagged'), 500);

        try {
            const res = await fetch('/api/flags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFlag)
            });

            if (!res.ok) {
                console.error("Failed to save flag to server");
                // Revert optimistic update?
                // flaggedItems.pop(); updateFlagCount();
            } else {
                // Server might return updated list or count, but we are good.
            }
        } catch (e) {
            console.error("Error saving flag", e);
        }
    }
});

exportBtn.addEventListener('click', () => {
    if (flaggedItems.length === 0) {
        alert("No flagged items to export.");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flaggedItems, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "word_game_flags.json");
    document.body.appendChild(downloadAnchorNode); // Required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

// Update generateContent to store current state
// We need to modify the render functions to update `currentContent`

// Initial Render
// Optionally start empty or generate once
// generateContent();
