let totalCount = 0;
let beepPlayed = false;

const capsBeep = document.getElementById('capsBeep');

const keyMap = {
    "/": "Seg",
    ".": "Band",
    ",": "Lymph",
    "m": "Mono", "M": "Mono",
    "n": "Eos", "N": "Eos",
    "b": "Baso", "B": "Baso",
    ";": "Meta",
    "l": "Myelo", "L": "Myelo",
    "k": "Pro", "K": "Pro",
    "j": "Blast", "J": "Blast"
};

const spokenNames = {
    Seg: "Seg",
    Band: "Band",
    Lymph: "Lymph",
    Mono: "Mono",
    Eos: "Eo",
    Baso: "Baso",
    Meta: "Meta",
    Myelo: "Myelo",
    Pro: "Pro",
    Blast: "Blast"
};

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    setupCellClicks();
});

function handleKeyDown(event) {
    const cellType = keyMap[event.key];

    if (cellType) {
        incrementCount(cellType);
        updateTotalCount();
        tryToSpeak(cellType);
    }
}

function handleKeyUp(event) {
    const capsWarning = document.getElementById('capsLockWarning');

    if (event.getModifierState && event.getModifierState('CapsLock')) {
        capsWarning.style.display = 'none';
    } else {
        capsWarning.style.display = 'block';

        if (capsBeep) {
            capsBeep.currentTime = 0;
            capsBeep.play().catch(error => {
                console.error("Caps Lock beep failed:", error);
            });
        }
    }
}

function incrementCount(cellType) {
    const countElement = document.getElementById(cellType);
    const currentCount = parseInt(countElement.innerText) || 0;
    countElement.innerText = currentCount + 1;
}

function updateTotalCount() {
    totalCount = 0;

    const cellCounts = document.querySelectorAll(".cellCount");

    cellCounts.forEach(countElement => {
        totalCount += parseInt(countElement.innerText) || 0;
    });

    document.getElementById("totalCount").innerText = totalCount;

    if (totalCount === 100 && !beepPlayed) {
        playCountTone();
        beepPlayed = true;
    }
}

function playCountTone() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 1000;

    gainNode.gain.setValueAtTime(0.35, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);

    oscillator.onended = () => {
        audioContext.close();
    };
}

function resetCounts() {
    const cellCounts = document.querySelectorAll(".cellCount");

    cellCounts.forEach(countElement => {
        countElement.innerText = '0';
    });

    document.getElementById("totalCount").innerText = '0';

    totalCount = 0;
    beepPlayed = false;
}

function tryToSpeak(cellType) {
    const mute = document.getElementById('muteToggle');

    if (!mute?.checked && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(spokenNames[cellType] || cellType);
        utterance.rate = 2.0;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
}

function setupCellClicks() {
    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        const cellType = cell.querySelector('.cellType').innerText.split(' ')[0];

        cell.addEventListener('click', () => {
            incrementCount(cellType);
            updateTotalCount();
            tryToSpeak(cellType);
        });
    });
}
