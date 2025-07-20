const messages = [
    "wow, this is pretty cool i guess?",
    "uhh, hi?",
    "whats this"
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomMessage() {
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
}

async function speakRandomMessages() {
    while (true) {
        const msg = getRandomMessage();

        // Update UI
        const el = document.getElementById("message");
        if (el) el.innerText = msg;

        // Yield control to browser to repaint the UI
        await new Promise(requestAnimationFrame);

        // Now speak and wait for completion
        await window.electron.speak(msg);

        // Wait 1 second after speaking
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}


document.addEventListener("DOMContentLoaded", () => {
    speakRandomMessages();
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electron.contextMenu();
});