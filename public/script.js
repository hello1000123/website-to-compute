const chatBox = document.getElementById("chatBox");

loadSavedChat();

function sendMessage() {
  const input = document.getElementById("userInput");
  const userText = input.value.trim();
  if (!userText) return;

  addMessage("user", userText);
  saveToHistory("user", userText);

  input.value = "";
  getBotResponse(userText);
}

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  text = replaceBullets(text);
  text = replaceBold(text);

  if (sender === "bot" && text.includes("```")) {
    msg.innerHTML = parseCode(text);
  } else {
    msg.innerHTML = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function replaceBullets(text) {
  return text.replace(/^(\s*)\*\s/gm, "$1• ");
}

function replaceBold(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
}

function parseCode(text) {
  return text.replace(/```(\w+)?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

/* =================== GỌI CHATGPT =================== */
async function getBotResponse(prompt) {
  const thinking = document.createElement("div");
  thinking.className = "message bot";
  thinking.innerText = "Đang hỏi chatGPT…";
  chatBox.appendChild(thinking);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
const res = await fetch("http://localhost:5000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    thinking.remove();

    addMessage("bot", data.answer);
    saveToHistory("bot", data.answer);
  } catch (err) {
    thinking.remove();
    addMessage("bot", "⚠️ Không thể kết nối chatGPT.");
  }
}

/* =================== LƯU + LOAD CHAT =================== */
function saveToHistory(sender, text) {
  let history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.push({ sender, text });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function loadSavedChat() {
  let history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.forEach(msg => addMessage(msg.sender, msg.text));
}

/* =================== VOICE INPUT =================== */
function startVoice() {
  const recognition =
    new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "vi-VN";
  recognition.start();

  recognition.onresult = (event) => {
    document.getElementById("userInput").value =
      event.results[0][0].transcript;
  };
} 