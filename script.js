/* ============================================
   NeuralMinds - Main JavaScript
   Chat Engine | Risk Detection | Animations
   ============================================ */

'use strict';

// ── Constants ──────────────────────────────────────────
const STORAGE_KEY   = 'neuralminds_chat';
const ANON_KEY      = 'neuralminds_anon';
const MOOD_KEY      = 'neuralminds_mood';
const RISK_KEY      = 'neuralminds_risk';
const SESSION_KEY   = 'neuralminds_session';

// ── Risk keyword map ───────────────────────────────────
const RISK_KEYWORDS = {
  high: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'no reason to live',
    'self harm', 'hurt myself', 'cutting', 'overdose', 'don\'t want to be here',
    'not worth it', 'hopeless', 'can\'t go on'
  ],
  medium: [
    'depressed', 'depression', 'anxiety', 'panic', 'overwhelmed', 'can\'t cope',
    'breaking down', 'falling apart', 'no hope', 'exhausted', 'burned out',
    'scared', 'worried', 'stressed', 'alone', 'lonely', 'crying', 'sad',
    'helpless', 'worthless', 'failure', 'hate myself'
  ],
  low: [
    'tired', 'okay', 'fine', 'not great', 'difficult', 'hard day',
    'frustrated', 'annoyed', 'bored', 'unmotivated', 'meh'
  ]
};

// ── AI Response Bank ────────────────────────────────────
const AI_RESPONSES = {
  high: [
    "I'm really glad you reached out. What you're sharing sounds very serious, and I want you to know you're not alone. If you're in immediate danger, please contact a crisis line right now — in the US, call or text 988 (Suicide & Crisis Lifeline). I'm here with you.",
    "Thank you for trusting me with this. Your safety is the most important thing right now. Please consider reaching out to a mental health professional or calling 988. I'm here to listen — tell me more about what you're feeling.",
    "I hear you, and I'm not going to minimize what you're going through. These feelings are real, and they deserve real support. Please reach out to a crisis counselor at 988. You matter, and people want to help."
  ],
  medium: [
    "It sounds like you've been carrying a lot lately. That kind of weight can be exhausting. Would you like to talk more about what's been happening? I'm here to listen without judgment.",
    "I can hear how much you're struggling, and I want you to know that's completely valid. Many people go through periods like this, and support is available. What part of this feels hardest right now?",
    "Thank you for sharing that with me. Feelings of overwhelm and sadness are important signals that you need more care and support. Can you tell me more about when these feelings started?",
    "You're showing real courage by talking about this. Depression and anxiety can feel all-consuming, but they're treatable. Have you been able to speak with a counselor or therapist about what you're experiencing?",
    "What you're describing sounds genuinely difficult. Let's slow down together — can you tell me what a typical day looks like for you right now?"
  ],
  low: [
    "I'm here for you. Even on tough days, reaching out is a powerful first step. What's been weighing on your mind?",
    "Thanks for checking in. It's completely normal to have difficult days. Want to talk through what's happening?",
    "I appreciate you sharing that. Sometimes just putting feelings into words can help. What would feel most helpful to explore right now?",
    "It sounds like things haven't been easy. That's okay — you don't have to have everything figured out. How long have you been feeling this way?"
  ],
  default: [
    "I'm NeuralMinds, your mental health support companion. I'm here to listen and help you work through what you're feeling. How are you doing today?",
    "Thank you for sharing. Mental health is incredibly important, and it takes courage to talk about it. Can you tell me a bit more?",
    "I'm listening carefully. Your feelings are valid, and I want to make sure I understand what you're going through. Please share as much or as little as you feel comfortable with.",
    "That's really meaningful to share. I'm here without judgment. Would you like to explore what's been on your mind lately?",
    "I hear you. Sometimes it helps just to have a safe space to express what's inside. I'm here — keep talking, at your own pace.",
    "Every experience is unique, and yours matters. Let's work through this together. What feels most important to address right now?"
  ]
};

// ── Greeting messages ──────────────────────────────────
const GREETINGS = [
  "Hello! I'm NeuralMinds, your confidential mental health companion. 💙 I'm here to listen, support, and help you navigate your emotional well-being. How are you feeling today?",
  "Welcome back. I'm here whenever you're ready to talk. Your mental health matters, and so does every feeling you're experiencing. What's on your mind?"
];

// ── Determine Risk Level ───────────────────────────────
function getRiskLevel(text) {
  const lower = text.toLowerCase();

  for (const kw of RISK_KEYWORDS.high) {
    if (lower.includes(kw)) return 'high';
  }
  for (const kw of RISK_KEYWORDS.medium) {
    if (lower.includes(kw)) return 'medium';
  }
  for (const kw of RISK_KEYWORDS.low) {
    if (lower.includes(kw)) return 'low';
  }
  return null;
}

// ── Pick AI Response ───────────────────────────────────
function pickResponse(riskLevel) {
  const pool = AI_RESPONSES[riskLevel] || AI_RESPONSES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Update Risk Badge ──────────────────────────────────
function updateRiskBadge(level) {
  const badge = document.getElementById('risk-badge');
  if (!badge) return;

  const configs = {
    low:    { cls: 'badge-green',  icon: '🟢', label: 'Low Risk' },
    medium: { cls: 'badge-yellow', icon: '🟡', label: 'Medium Risk' },
    high:   { cls: 'badge-red',    icon: '🔴', label: 'High Risk' },
    none:   { cls: 'badge-purple', icon: '⚪', label: 'Monitoring' }
  };

  const cfg = configs[level] || configs.none;
  badge.className = `badge ${cfg.cls}`;
  badge.innerHTML = `<span class="badge-dot"></span>${cfg.label}`;

  // Save to storage
  localStorage.setItem(RISK_KEY, level || 'none');
}

// ── Chat History ───────────────────────────────────────
function loadChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveChatHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    console.warn('NeuralMinds: localStorage quota exceeded');
  }
}

function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(RISK_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ── Build Message Bubble ───────────────────────────────
function buildBubble(text, sender, timestamp) {
  const isUser = sender === 'user';
  const time   = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const wrapper = document.createElement('div');
  wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} msg-fadein`;
  wrapper.style.marginBottom = '16px';

  if (isUser) {
    wrapper.innerHTML = `
      <div style="max-width:75%; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
        <div style="
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          color: #fff;
          padding: 12px 18px;
          border-radius: 18px 18px 4px 18px;
          font-size: 0.92rem;
          line-height: 1.55;
          box-shadow: 0 4px 16px rgba(108,99,255,0.3);
          word-break: break-word;
        ">${escapeHtml(text)}</div>
        <span style="font-size:0.72rem; color:rgba(240,240,255,0.4); padding-right:4px;">${time}</span>
      </div>`;
  } else {
    wrapper.innerHTML = `
      <div style="max-width:78%; display:flex; gap:10px; align-items:flex-start;">
        <div style="
          width:34px; height:34px; border-radius:10px; flex-shrink:0;
          background: linear-gradient(135deg,#6c63ff,#a78bfa);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; box-shadow:0 0 14px rgba(108,99,255,0.4);
        ">🧠</div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div style="
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            backdrop-filter: blur(10px);
            color: rgba(240,240,255,0.9);
            padding: 12px 18px;
            border-radius: 4px 18px 18px 18px;
            font-size: 0.92rem;
            line-height: 1.6;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            word-break: break-word;
          ">${text}</div>
          <span style="font-size:0.72rem; color:rgba(240,240,255,0.4); padding-left:4px;">NeuralMinds · ${time}</span>
        </div>
      </div>`;
  }

  return wrapper;
}

// ── Escape HTML ────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Typing Indicator ───────────────────────────────────
function showTypingIndicator(container) {
  const wrap = document.createElement('div');
  wrap.id = 'typing-wrap';
  wrap.className = 'flex justify-start msg-fadein';
  wrap.style.marginBottom = '16px';
  wrap.innerHTML = `
    <div style="display:flex; gap:10px; align-items:flex-start;">
      <div style="
        width:34px; height:34px; border-radius:10px; flex-shrink:0;
        background: linear-gradient(135deg,#6c63ff,#a78bfa);
        display:flex; align-items:center; justify-content:center;
        font-size:16px;
      ">🧠</div>
      <div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
        <div style="font-size:0.72rem; color:rgba(240,240,255,0.35); margin-top:5px; padding-left:4px;">NeuralMinds is typing…</div>
      </div>
    </div>`;
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
  return wrap;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-wrap');
  if (el) el.remove();
}

// ── Send Message ───────────────────────────────────────
let currentRisk = null;
let sessionHistory = loadChatHistory();

function sendMessage(inputEl, containerEl) {
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';
  inputEl.style.height = 'auto';
  inputEl.focus();

  // Detect anonymous mode
  const anonToggle = document.getElementById('anon-toggle');
  const isAnon = anonToggle ? anonToggle.checked : false;

  // Build user message
  const userMsg = { sender: 'user', text, timestamp: Date.now(), anon: isAnon };
  sessionHistory.push(userMsg);
  saveChatHistory(sessionHistory);

  // Render user bubble
  const bubble = buildBubble(text, 'user', userMsg.timestamp);
  containerEl.appendChild(bubble);
  containerEl.scrollTop = containerEl.scrollHeight;

  // Detect risk
  const detectedRisk = getRiskLevel(text);
  if (detectedRisk) {
    currentRisk = detectedRisk;
    updateRiskBadge(detectedRisk);
  }

  // Show typing
  const typingEl = showTypingIndicator(containerEl);

  // Simulate AI delay
  const delay = 1200 + Math.random() * 1000;
  setTimeout(() => {
    removeTypingIndicator();

    const response  = pickResponse(detectedRisk);
    const aiMsg     = { sender: 'ai', text: response, timestamp: Date.now() };
    sessionHistory.push(aiMsg);
    saveChatHistory(sessionHistory);

    const aiBubble = buildBubble(response, 'ai', aiMsg.timestamp);
    containerEl.appendChild(aiBubble);
    containerEl.scrollTop = containerEl.scrollHeight;
  }, delay);
}

// ── Init Chat Page ─────────────────────────────────────
function initChat() {
  const input     = document.getElementById('chat-input');
  const sendBtn   = document.getElementById('send-btn');
  const container = document.getElementById('chat-messages');
  const clearBtn  = document.getElementById('clear-chat');
  const anonToggle = document.getElementById('anon-toggle');

  if (!input || !sendBtn || !container) return;

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Load stored risk
  const savedRisk = localStorage.getItem(RISK_KEY);
  if (savedRisk) updateRiskBadge(savedRisk);

  // Load anon mode
  if (anonToggle) {
    const savedAnon = localStorage.getItem(ANON_KEY) === 'true';
    anonToggle.checked = savedAnon;
    anonToggle.addEventListener('change', () => {
      localStorage.setItem(ANON_KEY, anonToggle.checked);
      const banner = document.getElementById('anon-banner');
      if (banner) {
        banner.style.display = anonToggle.checked ? 'flex' : 'none';
      }
    });
    // Set banner
    const banner = document.getElementById('anon-banner');
    if (banner) banner.style.display = savedAnon ? 'flex' : 'none';
  }

  // Render history or greeting
  if (sessionHistory.length > 0) {
    sessionHistory.forEach(msg => {
      const b = buildBubble(msg.text, msg.sender, msg.timestamp);
      container.appendChild(b);
    });
    container.scrollTop = container.scrollHeight;
  } else {
    // Show greeting after short delay
    setTimeout(() => {
      const greeting = GREETINGS[0];
      const aiMsg    = { sender: 'ai', text: greeting, timestamp: Date.now() };
      sessionHistory.push(aiMsg);
      saveChatHistory(sessionHistory);

      const typingEl = showTypingIndicator(container);
      setTimeout(() => {
        removeTypingIndicator();
        const b = buildBubble(greeting, 'ai', aiMsg.timestamp);
        container.appendChild(b);
        container.scrollTop = container.scrollHeight;
      }, 1400);
    }, 500);
  }

  // Send on button click
  sendBtn.addEventListener('click', () => sendMessage(input, container));

  // Send on Enter (Shift+Enter = new line)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, container);
    }
  });

  // Clear chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all chat history? This cannot be undone.')) {
        clearChatHistory();
        sessionHistory = [];
        container.innerHTML = '';
        updateRiskBadge('none');
        // Re-show greeting
        const typingEl = showTypingIndicator(container);
        setTimeout(() => {
          removeTypingIndicator();
          const greeting = GREETINGS[0];
          const aiMsg    = { sender: 'ai', text: greeting, timestamp: Date.now() };
          sessionHistory.push(aiMsg);
          saveChatHistory(sessionHistory);
          const b = buildBubble(greeting, 'ai', aiMsg.timestamp);
          container.appendChild(b);
          container.scrollTop = container.scrollHeight;
        }, 1200);
      }
    });
  }
}

// ── Scroll Reveal ──────────────────────────────────────
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ── Nav Toggle (Mobile) ────────────────────────────────
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = links.classList.contains('open') ? 'rotate(45deg) translate(5px,5px)' : '';
    spans[1].style.opacity   = links.classList.contains('open') ? '0' : '1';
    spans[2].style.transform = links.classList.contains('open') ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ── Dashboard: Draw Mood Chart ─────────────────────────
function drawMoodChart() {
  const canvas = document.getElementById('mood-canvas');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const W    = canvas.width  = canvas.offsetWidth;
  const H    = canvas.height = canvas.offsetHeight;

  // Mock weekly data: 0–10 mood score
  const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data  = [5, 4, 6, 3, 7, 8, 6];
  const max   = 10;
  const pad   = { top: 24, right: 20, bottom: 36, left: 36 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top  - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + (innerH * (1 - i / 5));
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font      = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(i * 2, pad.left - 6, y + 4);
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
  grad.addColorStop(0, 'rgba(108,99,255,0.4)');
  grad.addColorStop(1, 'rgba(108,99,255,0.02)');

  // Build path
  const pts = data.map((v, i) => ({
    x: pad.left + (i / (days.length - 1)) * innerW,
    y: pad.top  + innerH * (1 - v / max)
  }));

  // Fill area
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp1x = (pts[i-1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(cp1x, pts[i-1].y, cp1x, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[pts.length-1].x, H - pad.bottom);
  ctx.lineTo(pts[0].x, H - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cp1x = (pts[i-1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(cp1x, pts[i-1].y, cp1x, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = 'rgba(108,99,255,0.9)';
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Dots + labels
  pts.forEach((pt, i) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle   = '#6c63ff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Day label
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font      = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(days[i], pt.x, H - 8);
  });
}

// ── Dashboard: Mood Picker ─────────────────────────────
function initMoodPicker() {
  const btns = document.querySelectorAll('.mood-btn');
  if (!btns.length) return;

  const savedMood = localStorage.getItem(MOOD_KEY);
  if (savedMood) {
    btns.forEach(b => {
      if (b.dataset.mood === savedMood) b.classList.add('selected');
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      localStorage.setItem(MOOD_KEY, btn.dataset.mood);

      // Show toast
      showToast(`Mood logged: ${btn.dataset.label}`);
    });
  });
}

// ── Toast Notification ─────────────────────────────────
function showToast(msg, type = 'success') {
  const existing = document.getElementById('nm-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'nm-toast';
  toast.style.cssText = `
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: rgba(108,99,255,0.95); color:#fff; padding:12px 24px; border-radius:50px;
    font-size:0.88rem; font-weight:500; z-index:9999; backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.2); box-shadow:0 8px 24px rgba(0,0,0,0.4);
    transition: opacity 0.4s ease, transform 0.4s ease; opacity:0;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}

// ── Dashboard: Animate Stats ───────────────────────────
function animateStats() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start    = performance.now();
    const suffix   = el.dataset.suffix || '';

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

// ── Dashboard: Progress Bars ───────────────────────────
function animateProgressBars() {
  document.querySelectorAll('.progress-bar-fill').forEach(bar => {
    const target = bar.dataset.width || '0%';
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 300);
  });
}

// ── Dashboard: Risk Score Display ─────────────────────
function initDashboard() {
  const savedRisk = localStorage.getItem(RISK_KEY) || 'none';
  const riskMap   = { none: 0, low: 22, medium: 55, high: 88 };
  const score     = riskMap[savedRisk] || 0;

  const scoreEl = document.getElementById('risk-score-val');
  if (scoreEl) {
    scoreEl.dataset.count = score;
  }

  const riskLabelEl = document.getElementById('risk-label');
  if (riskLabelEl) {
    const labels = { none:'No Data', low:'Low Risk', medium:'Moderate Risk', high:'High Risk' };
    riskLabelEl.textContent = labels[savedRisk] || 'No Data';
    riskLabelEl.className   = `badge badge-${savedRisk === 'none' ? 'purple' : savedRisk === 'low' ? 'green' : savedRisk === 'medium' ? 'yellow' : 'red'}`;
  }

  const riskBar = document.getElementById('risk-progress');
  if (riskBar) riskBar.dataset.width = score + '%';

  drawMoodChart();
  initMoodPicker();
  animateStats();
  animateProgressBars();

  // Redraw chart on resize
  window.addEventListener('resize', debounce(drawMoodChart, 200));
}

// ── Debounce ───────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Active Nav Link ────────────────────────────────────
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ── DOM Ready ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavToggle();
  setActiveNav();

  const page = window.location.pathname.split('/').pop();

  if (page === 'chat.html') {
    initChat();
  } else if (page === 'dashboard.html') {
    initDashboard();
  }
});
