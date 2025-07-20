const questionEl = document.getElementById('question');
const inputEl = document.getElementById('input');

window.electron.onSetQuestion((question) => {
    questionEl.textContent = question;
});

function submit() {
    const text = inputEl.value.trim();
    if (text) {
        window.electron.submitPrompt(text);
    }
}

function cancel() {
    window.close();
}

// Handle Enter key
inputEl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        submit();
    }
});