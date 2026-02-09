// Game State
let currentMode = "1";
let wordHistory = []; // For Mode 6

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
    const el = document.createElement('div');
    el.className = 'word-row';
    el.textContent = text;
    display.appendChild(el);
}

function renderTwoLines(text1, text2) {
    wordHistory = [];
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
select.addEventListener('change', (e) => {
    currentMode = e.target.value;
    wordHistory = []; // Reset history on mode change
    display.innerHTML = '<div class="instruction" style="position:static; margin-top:20px;">Press Spacebar</div>';
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        generateContent();
    }
});

// Initial Render
// Optionally start empty or generate once
// generateContent();
