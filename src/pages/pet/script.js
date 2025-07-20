async function loadMessages() {
  const res = await fetch("../../json/message.json");
  const messages = await res.json();
  return messages
}

const messages = loadMessages()

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

        await speak(msg);

        // Wait 2-10 second after speaking
        await new Promise(resolve => setTimeout(resolve, getRandomInt(2, 10) * 1000));
    }
}

async function speak(msg) {
    // Update UI
    const el = document.getElementById("message");
    el.style.display = "inline-block";
    if (el) el.innerText = msg;

    // Yield control to browser to repaint the UI
    await new Promise(requestAnimationFrame);

    // Now speak and wait for completion
    await window.electron.speak(msg);

    // hide the message
    el.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    speakRandomMessages();

    // Listen for custom speech events from the context menu
    window.electron.onCustomSpeech((text) => {
        speak(text);
    });
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electron.contextMenu();
});