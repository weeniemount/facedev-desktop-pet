async function loadMessages() {
  const res = await fetch("../../json/messages.json");
  const data = await res.json();
  return {
    greetings: data.greetings,
    regular: [...data.questions, ...data.amused],
    jokes: data.jokes,
    responses: data.responses || [],
    moods: {
      happy: data.happy || [],
      sleepy: data.sleepy || [],
      excited: data.excited || []
    }
  };
}

let messages = {
  greetings: [],
  regular: [],
  jokes: [],
  responses: [],
  moods: {
    happy: [],
    sleepy: [],
    excited: []
  }
};

let isDragging = false;
let movementEnabled = true;
let speechEnabled = true;
let currentMood = 'happy';
let lastInteractionTime = Date.now();

// Add message queue system
let messageQueue = [];
let isProcessingQueue = false;

async function processMessageQueue() {
    if (isProcessingQueue || messageQueue.length === 0) return;
    
    isProcessingQueue = true;
    while (messageQueue.length > 0) {
        const msg = messageQueue[0];
        await speak(msg);
        messageQueue.shift();
    }
    isProcessingQueue = false;
}

function queueMessage(msg) {
    messageQueue.push(msg);
    processMessageQueue();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomMessage(category) {
    if (category === 'mood') {
        const moodMessages = messages.moods[currentMood];
        return moodMessages && moodMessages.length > 0 
            ? moodMessages[Math.floor(Math.random() * moodMessages.length)]
            : getRandomMessage('regular');
    }
    const list = messages[category] || messages.regular;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}

async function speakRandomMessages() {
    messages = await loadMessages();
    
    const greeting = getRandomMessage('greetings');
    queueMessage(greeting);
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    while (true) {
        if (!speechEnabled) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }

        // Check if we should say a mood-specific message
        const timeSinceLastInteraction = Date.now() - lastInteractionTime;
        const shouldSayMoodMessage = Math.random() < 0.3 || timeSinceLastInteraction > 30000;
        
        const msg = shouldSayMoodMessage ? getRandomMessage('mood') : getRandomMessage('regular');
        queueMessage(msg);
        
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
    
    // Adjust movement speed based on mood
    let baseSteps = 100;
    if (currentMood === 'excited') baseSteps = 70;
    if (currentMood === 'sleepy') baseSteps = 130;
    
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
        await new Promise(resolve => setTimeout(resolve, 25));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    speakRandomMessages();

    // Initialize mood
    window.electron.getMood().then(mood => {
        currentMood = mood;
        updateAppearance();
    });

    // Listen for mood updates
    window.electron.onMoodUpdate((mood) => {
        currentMood = mood;
        updateAppearance();
        // Say something about the mood change
        const moodMessage = getRandomMessage('mood');
        if (moodMessage) queueMessage(moodMessage);
    });

    window.electron.onSetMoodRequest((mood) => {
        window.electron.setMood(mood);
    });

    // Start random movement timer with mood-based intervals
    let isMoving = false;
    setInterval(async () => {
        if (!isMoving && !isDragging && movementEnabled) {
            isMoving = true;
            await moveToRandomPosition();
            isMoving = false;
        }
    }, getRandomInt(5, 10) * 1000);

    // Listen for state updates
    window.electron.onStateUpdate(({ movement, speech }) => {
        movementEnabled = movement;
        speechEnabled = speech;
    });

    // Listen for toggle requests
    window.electron.onToggleMovement(() => {
        window.electron.toggleMovement();
    });

    window.electron.onToggleSpeech(() => {
        window.electron.toggleSpeech();
    });

    // Listen for custom speech and joke events
    window.electron.onCustomSpeech((text) => {
        if (text === 'tell-joke') {
            if (speechEnabled) {
                const joke = getRandomMessage('jokes');
                queueMessage(joke);
            }
        } else {
            if (speechEnabled) {
                queueMessage(text);
            }
        }
    });

    window.electron.onAnswerQuestion((question) => {
        if (speechEnabled && messages.responses && messages.responses.length > 0) {
            const response = getRandomMessage('responses');
            queueMessage(response);
        }
    });

    // Initialize states
    Promise.all([
        window.electron.getMovementState(),
        window.electron.getSpeechState()
    ]).then(([movement, speech]) => {
        movementEnabled = movement;
        speechEnabled = speech;
    });

    const img = document.querySelector('img');
    let currentX, currentY;
    let clickTimeout = null;
    let clickCount = 0;

    // Handle double and triple clicks
    img.addEventListener('click', (e) => {
        clickCount++;
        lastInteractionTime = Date.now();
        
        if (clickTimeout) clearTimeout(clickTimeout);
        
        clickTimeout = setTimeout(() => {
            if (clickCount === 2) {
                // Double click: Random mood
                const moods = ['happy', 'sleepy', 'excited'];
                const newMood = moods[Math.floor(Math.random() * moods.length)];
                window.electron.setMood(newMood);
            } else if (clickCount === 3) {
                // Triple click: Tell a joke
                const joke = getRandomMessage('jokes');
                queueMessage(joke);
            }
            clickCount = 0;
        }, 300);
    });

    img.addEventListener('mousedown', (e) => {
        isDragging = true;
        currentX = e.screenX;
        currentY = e.screenY;
        img.style.cursor = 'grabbing';
        lastInteractionTime = Date.now();
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

    // Update appearance based on mood
    function updateAppearance() {
        const img = document.querySelector('img');
        img.style.transition = 'filter 0.3s ease';
        
        // Reset filters
        img.style.filter = '';
        
        // Apply mood-specific effects
        switch(currentMood) {
            case 'sleepy':
                img.style.filter = 'brightness(0.8) contrast(0.9)';
                break;
            case 'excited':
                img.style.filter = 'brightness(1.2) contrast(1.1) saturate(1.2)';
                break;
            case 'happy':
                img.style.filter = 'brightness(1.1) saturate(1.1)';
                break;
        }
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.electron.contextMenu();
});