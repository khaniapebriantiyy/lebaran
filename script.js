/* ============================================
   EID MUBARAK WEBSITE - script.js
   ============================================ */

'use strict';

// ── DOM REFS ──
const envelopeOverlay = document.getElementById('envelope-overlay');
const envelopeEl      = document.getElementById('envelope');
const mainContent     = document.getElementById('main-content');
const typedTextEl     = document.getElementById('typed-text');
const questionBox     = document.getElementById('question-box');
const thrSection      = document.getElementById('thr-section');
const btnYes          = document.getElementById('btn-yes');
const btnNo           = document.getElementById('btn-no');
const themeToggle     = document.getElementById('theme-toggle');
const themeIcon       = document.getElementById('theme-icon');
const themeLabel      = document.getElementById('theme-label');
const commentForm     = document.getElementById('comment-form');
const commentsListEl  = document.getElementById('comments-list');
const nameInput       = document.getElementById('name-input');
const messageInput    = document.getElementById('message-input');
const toast           = document.getElementById('toast');

// ── THEME ──
let currentTheme = localStorage.getItem('eid-theme') || autoDetectTheme();

function autoDetectTheme() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? 'day' : 'night';
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme === 'night' ? 'night' : '');
  if (theme === 'night') {
    themeIcon.textContent = '🌙';
    themeLabel.textContent = 'Malam';
  } else {
    themeIcon.textContent = '☀️';
    themeLabel.textContent = 'Siang';
  }
  localStorage.setItem('eid-theme', theme);
  updateStars();
}

function toggleTheme() {
  applyTheme(currentTheme === 'night' ? 'day' : 'night');
}

themeToggle.addEventListener('click', toggleTheme);

// Initial
applyTheme(currentTheme);

// ── STARS GENERATION ──
function updateStars() {
  const starsLayer = document.getElementById('stars-layer');
  starsLayer.innerHTML = '';
  if (currentTheme !== 'night') return;

  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 3 + 1;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 60}%;
      --dur: ${Math.random() * 3 + 2}s;
      --delay: ${Math.random() * 4}s;
    `;
    starsLayer.appendChild(star);
  }
}

// ── ENVELOPE OPEN ──
let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  envelopeEl.classList.add('open');

  setTimeout(() => {
    envelopeEl.classList.add('opening');

    setTimeout(() => {
      envelopeOverlay.classList.add('hidden');
      mainContent.classList.add('visible');
      startTyping();
    }, 700);
  }, 400);
}

document.getElementById('envelope-wrapper').addEventListener('click', openEnvelope);

// Touch support
document.getElementById('envelope-wrapper').addEventListener('touchstart', (e) => {
  e.preventDefault();
  openEnvelope();
}, { passive: false });

// ── TYPING EFFECT ──
const greetingText = "Di antara langkah yang mungkin pernah salah arah, dan lisan yang tak sengaja menoreh luka, mari kembali menyatukan rasa. Selamat Hari Raya Idul Fitri. Mohon maaf lahir dan batin untuk segala khilaf yang ada.";

function startTyping() {
  let i = 0;
  const cursorEl = document.getElementById('cursor');

  function type() {
    if (i < greetingText.length) {
      typedTextEl.textContent += greetingText[i];
      i++;
      const speed = greetingText[i - 1] === '.' ? 60 : 28;
      setTimeout(type, speed);
    } else {
      // Hide cursor after done
      setTimeout(() => {
        cursorEl.style.display = 'none';
        questionBox.classList.add('show');
      }, 500);
    }
  }

  setTimeout(type, 600);
}

// ── MOVING "TIDAK" BUTTON ──
function moveNoBtn() {
  const maxX = 80, maxY = 60;
  const x = (Math.random() - 0.5) * maxX * 2;
  const y = (Math.random() - 0.5) * maxY * 2;
  btnNo.style.transform = `translate(${x}px, ${y}px)`;
}

btnNo.addEventListener('mouseover', moveNoBtn);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoBtn();
}, { passive: false });

// ── YES BUTTON ──
btnYes.addEventListener('click', () => {
  questionBox.classList.remove('show');
  questionBox.classList.add('hide');

  setTimeout(() => {
    thrSection.classList.add('show');
    fireConfetti();

    setTimeout(() => {
      thrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, 500);
});

// ── CONFETTI ──
function fireConfetti() {
  if (typeof confetti !== 'function') return;

  const colors = currentTheme === 'night'
    ? ['#e2c073', '#f0d490', '#ffffff', '#c9a96e']
    : ['#b8860b', '#d4a853', '#8B6914', '#f5e6c0'];

  const end = Date.now() + 3000;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

  const interval = setInterval(() => {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const count = 50 * (timeLeft / 3000);
    confetti({ ...defaults, particleCount: count, origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 }, colors });
    confetti({ ...defaults, particleCount: count, origin: { x: 0.7 + Math.random() * 0.3, y: Math.random() - 0.2 }, colors });
  }, 250);
}

// ── COMMENTS SYSTEM ──
const STORAGE_KEY = 'eid-messages-1447';

function loadComments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComments(comments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  } catch {
    console.warn('Storage unavailable');
  }
}

function formatTime(isoStr) {
  const date = new Date(isoStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase();
}

function buildCommentCard(comment) {
  const card = document.createElement('div');
  card.classList.add('card', 'comment-card');

  card.innerHTML = `
    <div class="comment-header">
      <div class="comment-avatar">${getInitial(comment.name)}</div>
      <div class="comment-meta">
        <div class="comment-name">${escapeHtml(comment.name)}</div>
        <div class="comment-time">${formatTime(comment.time)}</div>
      </div>
    </div>
    <div class="comment-body">${escapeHtml(comment.message)}</div>
  `;

  return card;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function renderComments() {
  const comments = loadComments();
  commentsListEl.innerHTML = '';

  if (comments.length === 0) {
    commentsListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌙</div>
        <p>Jadilah yang pertama memberikan ucapan.<br>Tulis pesanmu di atas.</p>
      </div>
    `;
    return;
  }

  // Show newest first
  [...comments].reverse().forEach((c, idx) => {
    const card = buildCommentCard(c);
    card.style.animationDelay = `${idx * 0.07}s`;
    commentsListEl.appendChild(card);
  });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) return;
  if (name.length > 60 || message.length > 500) {
    showToast('⚠️ Teks terlalu panjang.');
    return;
  }

  const comments = loadComments();
  comments.push({ name, message, time: new Date().toISOString() });
  saveComments(comments);

  nameInput.value = '';
  messageInput.value = '';

  renderComments();
  showToast('✨ Pesanmu terkirim! Selamat Idul Fitri~');

  commentsListEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Init comments on load
renderComments();

// Refresh timestamps every minute
setInterval(() => {
  renderComments();
}, 60000);