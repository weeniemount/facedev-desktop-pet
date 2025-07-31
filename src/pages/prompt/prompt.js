const questionEl = document.querySelector("#question");
const inputEl = document.querySelector("#input");

let isQuestionMode = false;

window.electron.onSetQuestion((question) => {
  questionEl.textContent = question;

  isQuestionMode = question === "What will you ask me?";

  if (isQuestionMode) {
    inputEl.placeholder = "Ask me something...";
  } else {
    inputEl.placeholder = "Type your message...";
  }
});

function submit() {
  const text = inputEl.value.trim();
  if (text) {
    if (isQuestionMode) {
      window.electron.askQuestion(text);
    } else {
      window.electron.submitPrompt(text);
    }
  }
}

// Handle Enter key
inputEl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    submit();
  }
});
