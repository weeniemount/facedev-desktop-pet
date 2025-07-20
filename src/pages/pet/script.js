async function loadMessages() {
  const res = await fetch("../../json/messages.json");
  const data = await res.json();
  return {
    greetings: data.greetings,
    regular: [...data.questions, ...data.amused],
    jokes: data.jokes
  };
}

let messages = {
  greetings: [],
  regular: [],
  jokes: []
};


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomMessage(category) {
    const list = messages[category] || messages.regular;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}

async function speakRandomMessages() {
    messages = await loadMessages();
    
    const greeting = getRandomMessage('greetings');
    await speak(greeting);
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    while (true) {
        const msg = getRandomMessage('regular');
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