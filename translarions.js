import { translations, detectLang } from "./translations.js";

let lang = localStorage.getItem('lang') || detectLang();
let t = translations[lang];
let page = 'home';

function saveHistory(key, history) { localStorage.setItem('dpm-history-' + key, JSON.stringify(history)); }
function loadHistory(key) { return JSON.parse(localStorage.getItem('dpm-history-' + key) || '[]'); }
function setTheme(theme) { if (theme === 'night') document.body.classList.add('night'); else document.body.classList.remove('night'); localStorage.setItem('theme', theme);}
function loadTheme() { const theme = localStorage.getItem('theme'); if (theme) setTheme(theme);}
const emojiList = ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😍","😘","😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕","🙃","🤑","😲","☹️","🙁","😖","😞","😟","😤","😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱","🥵","🥶","😳","🤪","😵","😡","😠","🤬","😷","🤒","🤕","🤢","🤮","🤧","😇","🥳"];
function showEmojiPicker(targetInput) {
  let picker = document.createElement('div');
  picker.className = 'emoji-picker';
  emojiList.forEach(e => {
    let span = document.createElement('span');
    span.textContent = e;
    span.onclick = () => { targetInput.value += e; picker.remove(); targetInput.focus(); };
    picker.appendChild(span);
  });
  document.body.appendChild(picker);
  let rect = targetInput.getBoundingClientRect();
  picker.style.left = rect.left + "px";
  picker.style.top = (rect.bottom + window.scrollY) + "px";
  setTimeout(()=>document.onclick = e => { if (!picker.contains(e.target)) picker.remove(); }, 100);
}

function showRegisterModal() {
  const a = Math.floor(Math.random() * 10 + 1), b = Math.floor(Math.random() * 10 + 1), captchaAnswer = a + b;
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-profile">
      <h5 class="mb-3 text-center">${t.registration}</h5>
      <input type="text" id="register-nick" placeholder="${t.nickname}" class="form-control mb-2" />
      <input type="password" id="register-pass" placeholder="${t.password}" class="form-control mb-2" />
      <div class="mb-2">${t.captcha}: <b>${a} + ${b}</b>?</div>
      <input type="text" id="register-captcha" placeholder="${t.captcha}" class="form-control mb-2" />
      <button class="btn btn-primary w-100" id="register-btn">${t.register}</button>
      <div id="register-err" class="text-danger mt-2"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#register-btn').onclick = () => {
    const nick = modal.querySelector('#register-nick').value.trim();
    const pass = modal.querySelector('#register-pass').value.trim();
    const captcha = modal.querySelector('#register-captcha').value.trim();
    const err = modal.querySelector('#register-err');
    if (!nick || !pass) { err.textContent = t.enter_nick_pass; return; }
    if (+captcha !== captchaAnswer) { err.textContent = t.wrong_captcha; return; }
    localStorage.setItem('dpm-user', JSON.stringify({nick, pass}));
    document.body.removeChild(modal);
    page = 'profile'; render();
  };
  modal.querySelector('.modal-backdrop').onclick = () => {};
}
function showLoginModal() {
  const saved = JSON.parse(localStorage.getItem('dpm-user') || '{}');
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-profile">
      <h5 class="mb-3 text-center">${t.login}</h5>
      <input type="text" id="login-nick" placeholder="${t.nickname}" class="form-control mb-2" value="${saved.nick || ''}" />
      <input type="password" id="login-pass" placeholder="${t.password}" class="form-control mb-2" />
      <button class="btn btn-primary w-100" id="login-btn">${t.login}</button>
      <div id="login-err" class="text-danger mt-2"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#login-btn').onclick = () => {
    const nick = modal.querySelector('#login-nick').value.trim();
    const pass = modal.querySelector('#login-pass').value.trim();
    const err = modal.querySelector('#login-err');
    if (!nick || !pass) { err.textContent = t.enter_nick_pass; return; }
    if (!saved.nick || !saved.pass || nick !== saved.nick || pass !== saved.pass) {
      err.textContent = t.wrong_login; return;
    }
    document.body.removeChild(modal);
    page = 'profile'; render();
  };
  modal.querySelector('.modal-backdrop').onclick = () => {};
}
function showEditProfileModal(oldNick, oldPass) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-profile">
      <h5 class="mb-3 text-center">${t.edit_profile}</h5>
      <input type="text" id="edit-nick" placeholder="${t.nickname}" class="form-control mb-2" value="${oldNick}" />
      <input type="password" id="edit-pass" placeholder="${t.password}" class="form-control mb-2" value="${oldPass}" />
      <button class="btn btn-primary w-100" id="save-edit-profile">${t.save}</button>
      <div id="edit-err" class="text-danger mt-2"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#save-edit-profile').onclick = () => {
    const newNick = modal.querySelector('#edit-nick').value.trim();
    const newPass = modal.querySelector('#edit-pass').value.trim();
    const err = modal.querySelector('#edit-err');
    if (!newNick || !newPass) { err.textContent = t.enter_nick_pass; return; }
    localStorage.setItem('dpm-user', JSON.stringify({nick: newNick, pass: newPass}));
    document.body.removeChild(modal);
    render();
  };
  modal.querySelector('.modal-backdrop').onclick = () => { document.body.removeChild(modal); };
}

function renderHeader() {
  document.getElementById('header').innerHTML = `
    <div class="container-fluid py-2 px-3 d-flex align-items-center justify-content-between flex-wrap">
      <div class="d-flex align-items-center flex-grow-1 justify-content-center justify-content-md-start">
        <span class="dpm-logo d-flex align-items-center">
          <span class="d-inline-block rounded-circle bg-primary text-white fw-bold me-2"
            style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:1.3em;box-shadow:0 2px 8px #3390ec44;">
            <i class="fas fa-shield-alt"></i>
          </span>
          <span class="fs-4 fw-bold" style="letter-spacing:0.05em;">DPM</span>
        </span>
      </div>
      <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
        <button id="lang-btn" class="btn btn-light btn-circle" title="Change language" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
          🌐
        </button>
        <button id="theme-btn" class="btn btn-light btn-circle" title="Change theme" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
          <i id="theme-icon" class="fas fa-sun"></i>
        </button>
        ${page!=='home'?`
        <button id="profile-btn" class="btn btn-light btn-circle" title="${t.profile}" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-user"></i>
        </button>
        `:''}
      </div>
    </div>
  `;
  document.getElementById('lang-btn').onclick = () => {
    lang = (lang === 'en') ? 'ua' : 'en';
    localStorage.setItem('lang', lang);
    t = translations[lang];
    render();
  };
  document.getElementById('theme-btn').onclick = () => {
    const night = !document.body.classList.contains('night');
    setTheme(night ? 'night' : 'day');
  };
  if(document.getElementById('profile-btn')) document.getElementById('profile-btn').onclick = () => {
    page = 'profile'; render();
  };
}

function render() {
  renderHeader();
  if (page === 'profile' || page === 'chat' || page === 'channels') {
    document.getElementById('nav').innerHTML = `
      <ul class="nav nav-pills justify-content-center">
        <li class="nav-item">
          <a class="nav-link${page === 'profile' ? ' active' : ''}" href="#" id="nav-profile"><i class="fas fa-user"></i> ${t.nav_profile}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link${page === 'chat' ? ' active' : ''}" href="#" id="nav-chat"><i class="fas fa-comment-dots"></i> ${t.nav_chat}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link${page === 'channels' ? ' active' : ''}" href="#" id="nav-channels"><i class="fas fa-users"></i> ${t.nav_channels}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" id="nav-logout"><i class="fas fa-sign-out-alt"></i> ${t.logout}</a>
        </li>
      </ul>
    `;
  } else { document.getElementById('nav').innerHTML = ""; }
  document.getElementById('footer').innerHTML = `
    <div>
      <span>© 2025 DPM | ${t.footer_made}</span><br>
      <span>
        <a href="https://peerjs.com/" target="_blank"><i class="fas fa-link"></i> PeerJS</a> |
        <a href="https://getbootstrap.com/" target="_blank"><i class="fab fa-bootstrap"></i> Bootstrap</a> |
        <a href="https://fontawesome.com/" target="_blank"><i class="fab fa-font-awesome"></i> Font Awesome</a>
      </span>
    </div>
  `;
  if (page === 'home') renderHome();
  if (page === 'profile') renderProfile();
  if (page === 'chat') renderChat();
  if (page === 'channels') renderChannels();
  if (document.getElementById('nav-profile')) document.getElementById('nav-profile').onclick = e => { e.preventDefault(); page = 'profile'; render(); };
  if (document.getElementById('nav-chat')) document.getElementById('nav-chat').onclick = e => { e.preventDefault(); page = 'chat'; render(); };
  if (document.getElementById('nav-channels')) document.getElementById('nav-channels').onclick = e => { e.preventDefault(); page = 'channels'; render(); };
  if (document.getElementById('nav-logout')) document.getElementById('nav-logout').onclick = e => {
    e.preventDefault(); localStorage.removeItem('dpm-user'); page = 'home'; render();
  };
}

function renderHome() {
  document.getElementById('app').innerHTML = `
    <section class="page-home">
      <h2 class="mb-4 text-center"><i class="fas fa-comments"></i> ${t.title}</h2>
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title">${t.about_title}</h5>
          <p>${t.about_desc}</p>
          <ul>
            <li>${t.adv1}</li>
            <li>${t.adv2}</li>
            <li>${t.adv3}</li>
            <li>${t.adv4}</li>
          </ul>
          <ol>
            <li>${t.how1}</li>
            <li>${t.how2}</li>
            <li>${t.how3}</li>
          </ol>
          <div class="text-center mt-4">
            <button id="go-profile" class="btn btn-primary btn-lg">
              <i class="fas fa-user"></i> ${t.go_profile}
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
  document.getElementById('go-profile').onclick = () => {
    if (!localStorage.getItem('dpm-user')) showRegisterModal();
    else showLoginModal();
  };
}

function renderProfile() {
  const user = JSON.parse(localStorage.getItem('dpm-user') || '{}');
  let peerId = localStorage.getItem('dpm-peerid');
  if (!peerId) { peerId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36); localStorage.setItem('dpm-peerid', peerId);}
  document.getElementById('app').innerHTML = `
    <section class="page-profile">
      <h2 class="mb-4 text-center"><i class="fas fa-user"></i> ${t.profile}</h2>
      <div class="card mx-auto" style="max-width: 400px;">
        <div class="card-body text-center">
          <div class="mb-3"><i class="fas fa-user-circle fa-4x"></i></div>
          <div class="mb-2"><b>${t.nickname}:</b> <span id="profile-nick">${user.nick || ""}</span></div>
          <div class="mb-2"><b>${t.password}:</b> ********</div>
          <div class="mb-3">
            <b>Peer ID:</b>
            <span id="profile-peerid" style="font-family:monospace">${peerId}</span>
            <button class="btn btn-outline-secondary btn-sm ms-2" id="copy-peerid" title="${t.copy}"><i class="fas fa-copy"></i></button>
          </div>
          <button class="btn btn-outline-primary w-100 mb-2" id="edit-profile"><i class="fas fa-edit"></i> ${t.edit_profile}</button>
          <button class="btn btn-outline-warning w-100 mb-2" id="clear-history"><i class="fas fa-broom"></i> ${t.clear_history}</button>
          <button class="btn btn-primary w-100 mb-2" id="to-chat"><i class="fas fa-comment-dots"></i> ${t.nav_chat}</button>
          <button class="btn btn-success w-100 mb-2" id="to-channels"><i class="fas fa-users"></i> ${t.nav_channels}</button>
          <button class="btn btn-secondary w-100" id="logout-btn2"><i class="fas fa-sign-out-alt"></i> ${t.logout}</button>
        </div>
      </div>
    </section>
  `;
  document.getElementById('copy-peerid').onclick = () => {
    navigator.clipboard.writeText(peerId);
    document.getElementById('copy-peerid').innerHTML = `<i class="fas fa-check"></i>`;
    setTimeout(()=>document.getElementById('copy-peerid').innerHTML = `<i class="fas fa-copy"></i>`, 1200);
  };
  document.getElementById('edit-profile').onclick = () => { showEditProfileModal(user.nick || "", user.pass || ""); };
  document.getElementById('clear-history').onclick = () => {
    if (confirm(t.clear_history + "?")) {
      Object.keys(localStorage).forEach(k => { if (k.startsWith('dpm-history-')) localStorage.removeItem(k); });
      alert(t.history_cleared);
    }
  };
  document.getElementById('to-chat').onclick = () => { page = 'chat'; render(); };
  document.getElementById('to-channels').onclick = () => { page = 'channels'; render(); };
  document.getElementById('logout-btn2').onclick = () => { localStorage.removeItem('dpm-user'); page = 'home'; render(); };
}

// ... renderChat, renderChannels (аналогічно до попередньої відповіді) ...

// Додай renderChat, renderChannels з попередньої відповіді (оптимізовано) тут

window.onload = function() { loadTheme(); render(); };
