'use strict';

/* ============================================
   NeuralMinds - Secure AI Version
   ============================================ */

const STORAGE_KEY = 'neuralminds_chat';
const MOOD_KEY    = 'neuralminds_mood';
const RISK_KEY    = 'neuralminds_risk';

// Backup keyword safety override
const RISK_KEYWORDS = {
  high: ['suicide','kill myself','end my life','want to die','self harm','hurt myself'],
  medium: ['depressed','anxiety','panic','overwhelmed','hopeless','alone','worthless'],
  low: ['tired','stressed','sad','frustrated']
};

function getRiskLevel(text) {
  const lower = text.toLowerCase();
  for (const kw of RISK_KEYWORDS.high) if (lower.includes(kw)) return 'high';
  for (const kw of RISK_KEYWORDS.medium) if (lower.includes(kw)) return 'medium';
  for (const kw of RISK_KEYWORDS.low) if (lower.includes(kw)) return 'low';
  return null;
}

// Call backend API (SECURE)
async function getAIResponse(userMessage) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  });

  return await response.json();
}

function loadChatHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveChatHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function buildBubble(text, sender) {
  const div = document.createElement("div");
  div.className = sender === "user" ? "user-msg" : "ai-msg";
  div.innerText = text;
  return div;
}

function updateRiskBadge(level) {
  const badge = document.getElementById("risk-badge");
  if (!badge) return;

  badge.innerText = level ? level.toUpperCase() : "Monitoring";

  if (level === "low") badge.style.background = "green";
  else if (level === "medium") badge.style.background = "orange";
  else if (level === "high") badge.style.background = "red";
  else badge.style.background = "purple";

  localStorage.setItem(RISK_KEY, level || "none");
}

function showTyping(container) {
  const div = document.createElement("div");
  div.id = "typing";
  div.innerText = "NeuralMinds is typing...";
  container.appendChild(div);
}

function removeTyping() {
  const el = document.getElementById("typing");
  if (el) el.remove();
}

let chatHistory = loadChatHistory();

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const container = document.getElementById("chat-messages");

  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  chatHistory.push({ sender: "user", text });
  saveChatHistory(chatHistory);

  container.appendChild(buildBubble(text, "user"));
  showTyping(container);

  try {
    const aiData = await getAIResponse(text);
    removeTyping();

    const keywordRisk = getRiskLevel(text);
    const finalRisk = keywordRisk || aiData.risk_level;

    updateRiskBadge(finalRisk);
    localStorage.setItem(MOOD_KEY, aiData.emotion);

    chatHistory.push({ sender: "ai", text: aiData.response });
    saveChatHistory(chatHistory);

    container.appendChild(buildBubble(aiData.response, "ai"));
    container.scrollTop = container.scrollHeight;

  } catch (error) {
    removeTyping();
    container.appendChild(buildBubble("AI error. Please try again.", "ai"));
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-btn");
  const input = document.getElementById("chat-input");
  const container = document.getElementById("chat-messages");

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  chatHistory.forEach(msg => {
    container.appendChild(buildBubble(msg.text, msg.sender));
  });

  container.scrollTop = container.scrollHeight;
});
