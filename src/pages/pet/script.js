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

let isDragging = false;

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

async function moveToRandomPosition() {
    const bounds = await window.electron.getScreenBounds();
    const [currentX, currentY] = await window.electron.getWindowPosition();
    
    const maxX = bounds.width - 200;
    const maxY = bounds.height - 200;
    
    const targetX = getRandomInt(0, maxX);
    const targetY = getRandomInt(0, maxY);
    
    // Calculate the total distance to move
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const baseSteps = 100; // Increased for slower movement
    const steps = Math.max(baseSteps, Math.floor(distance / 5));
    
    // Calculate step size
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    let currentStepX = 0;
    let currentStepY = 0;
    
    for (let i = 0; i < steps; i++) {
        const exactX = currentX + (dx * (i / steps));
        const exactY = currentY + (dy * (i / steps));
        
        const [nowX, nowY] = await window.electron.getWindowPosition();
        
        const moveX = Math.round(exactX - nowX);
        const moveY = Math.round(exactY - nowY);
        
        window.electron.moveWindow(moveX, moveY);
        await new Promise(resolve => setTimeout(resolve, 25)); // Slower ~40fps
    }
}

document.addEventListener("DOMContentLoaded", () => {
    speakRandomMessages();

    // Start random movement timer
    let isMoving = false;
    setInterval(async () => {
        if (!isMoving && !isDragging) {
            isMoving = true;
            await moveToRandomPosition();
            isMoving = false;
        }
    }, getRandomInt(5, 10) * 1000);

    // Listen for custom speech and joke events from the context menu
    window.electron.onCustomSpeech((text) => {
        if (text === 'tell-joke') {
            const joke = getRandomMessage('jokes');
            speak(joke);
        } else {
            speak(text);
        }
    });

    const img = document.querySelector('img');
    let currentX, currentY;

    img.addEventListener('mousedown', (e) => {
        isDragging = true;
        currentX = e.screenX;
        currentY = e.screenY;
        img.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const moveX = e.screenX - currentX;
        const moveY = e.screenY - currentY;
        
        window.electron.moveWindow(moveX, moveY);
        
        currentX = e.screenX;
        currentY = e.screenY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        img.style.cursor = 'grab';
    });
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electron.contextMenu();
});