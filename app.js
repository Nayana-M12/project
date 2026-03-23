// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8888/api';

// ─── PAGE NAVIGATION ──────────────────────────────────────────────────────────
function enterApp(page) {
  // only allow entry if logged in
  if (!currentUser) {
    openAuth('login');
    return;
  }
  const landing = document.getElementById('landingPage');
  landing.classList.add('hide');
  setTimeout(() => { landing.style.display = 'none'; }, 500);
  showPage(page || 'home', null);
}

function openAuthFromLanding(tab) {
  document.querySelectorAll('.landing-info').forEach(p => p.style.display = 'none');
  const hero = document.querySelector('.landing-hero');
  if (hero) hero.style.display = '';
  openAuth(tab);
}

function showLandingHero() {
  document.querySelectorAll('.landing-info').forEach(p => p.style.display = 'none');
  const hero = document.querySelector('.landing-hero');
  if (hero) hero.style.display = '';
  document.querySelectorAll('.landing-nav-links a').forEach(a => a.classList.remove('active'));
}

function showLandingInfo(section, el) {
  const hero = document.querySelector('.landing-hero');
  if (hero) hero.style.display = 'none';
  document.querySelectorAll('.landing-info').forEach(p => p.style.display = 'none');
  document.getElementById('info-' + section).style.display = 'flex';
  document.querySelectorAll('.landing-nav-links a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
}

function showPage(name, navEl) {
  // block if landing page is still visible (user not logged in yet)
  const landing = document.getElementById('landingPage');
  const landingVisible = landing && landing.style.display !== 'none' && !landing.classList.contains('hide');
  if (landingVisible && !currentUser) {
    openAuth('login');
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  if (navEl) {
    navEl.classList.add('active');
  } else {
    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
      if (el.getAttribute('onclick') && el.getAttribute('onclick').includes("'" + name + "'")) {
        el.classList.add('active');
      }
    });
  }
  window.scrollTo(0, 0);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
// fake in-memory user store
const users = JSON.parse(localStorage.getItem('DemoCrazy_users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('DemoCrazy_current') || 'null');

function openAuth(tab) {
  document.getElementById('authModal').classList.remove('hidden');
  switchAuthTab(tab);
}
function closeAuth() {
  document.getElementById('authModal').classList.add('hidden');
}
function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const err   = document.getElementById('loginError');
  if (!email || !pass) { showErr(err, '⚠️ Fill in all fields. Even politicians manage that.'); return; }
  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) { showErr(err, '❌ Wrong credentials. Did you forget your own name again?'); return; }
  loginSuccess(user);
}

async function doSignup() {
  const name   = document.getElementById('signupName').value.trim();
  const party  = document.getElementById('signupParty').value.trim();
  const email  = document.getElementById('signupEmail').value.trim();
  const state  = document.getElementById('signupState').value;
  const pass   = document.getElementById('signupPass').value;
  const reason = document.getElementById('signupReason').value;
  const err    = document.getElementById('signupError');

  if (!name || !email || !state || !pass) { showErr(err, '⚠️ Please fill all required fields. We know it\'s hard.'); return; }
  if (pass.length < 8) { showErr(err, '❌ Password too short. Unlike your list of promises.'); return; }
  if (users.find(u => u.email === email)) { showErr(err, '❌ Email already registered. You can\'t run twice. Yet.'); return; }

  const user = { name, party: party || 'Independent (Confused)', email, state, pass, reason, id: 'CAND-' + Math.floor(Math.random()*90000+10000) };

  // sync to backend first
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, party: party || 'Independent (Confused)', state, reason })
    });
    const data = await res.json();
    if (!res.ok && res.status !== 409) {
      showErr(err, '⚠️ Server error: ' + (data.error || 'Could not save. Try again.'));
      return;
    }
  } catch (e) {
    // backend unreachable — continue with local storage only
    console.warn('Backend unreachable, saving locally only:', e);
  }

  users.push(user);
  localStorage.setItem('DemoCrazy_users', JSON.stringify(users));
  loginSuccess(user);
}

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem('DemoCrazy_current', JSON.stringify(user));
  closeAuth();
  updateNavUser();
  showToast(`🎉 Welcome, ${user.name.split(' ')[0]}! Your political career starts now. We're sorry.`);
  // dismiss landing page and enter app
  const landing = document.getElementById('landingPage');
  if (landing && !landing.classList.contains('hide')) {
    landing.classList.add('hide');
    setTimeout(() => { landing.style.display = 'none'; }, 500);
    showPage('home', null);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('DemoCrazy_current');
  updateNavUser();
  showToast('👋 Logged out. The nation breathes easy.');
  // bring back landing page
  const landing = document.getElementById('landingPage');
  landing.classList.remove('hide');
  landing.style.display = '';
  // reset to hero view
  document.querySelectorAll('.landing-info').forEach(p => p.style.display = 'none');
  const hero = document.querySelector('.landing-hero');
  if (hero) hero.style.display = '';
  document.querySelectorAll('.landing-nav-links a').forEach(a => a.classList.remove('active'));
}

function updateNavUser() {
  const sidebarAuth = document.getElementById('sidebarAuth');
  const sidebarLogout = document.getElementById('sidebarLogout');
  const sidebarName = document.getElementById('sidebarName');
  if (currentUser) {
    sidebarAuth.classList.add('hidden');
    sidebarLogout.classList.remove('hidden');
    sidebarName.textContent = currentUser.name.split(' ')[0];
    sidebarName.onclick = openProfile;
    document.getElementById('sidebarAvatar').onclick = openProfile;
  } else {
    sidebarAuth.classList.remove('hidden');
    sidebarLogout.classList.add('hidden');
    sidebarName.textContent = 'Guest';
    sidebarName.onclick = null;
    document.getElementById('sidebarAvatar').onclick = null;
  }
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function openProfile() {
  if (!currentUser) return;
  const u = currentUser;
  document.getElementById('profileAvatarBig').textContent = u.name[0].toUpperCase();
  document.getElementById('profileName').textContent = u.name;
  document.getElementById('profileId').textContent = u.id;
  document.getElementById('pParty').textContent = u.party || '—';
  document.getElementById('pState').textContent = u.state || '—';
  document.getElementById('pEmail').textContent = u.email;
  document.getElementById('pReason').textContent = u.reason || '—';
  document.getElementById('profileView').classList.remove('hidden');
  document.getElementById('profileEdit').classList.add('hidden');
  document.getElementById('profileModal').classList.remove('hidden');
}
function closeProfile() {
  document.getElementById('profileModal').classList.add('hidden');
}
function openEditProfile() {
  const u = currentUser;
  document.getElementById('editName').value = u.name;
  document.getElementById('editParty').value = u.party || '';
  document.getElementById('editState').value = u.state || '';
  document.getElementById('editReason').value = u.reason || '';
  document.getElementById('editPass').value = '';
  document.getElementById('editError').classList.add('hidden');
  document.getElementById('profileView').classList.add('hidden');
  document.getElementById('profileEdit').classList.remove('hidden');
}
function cancelEdit() {
  document.getElementById('profileView').classList.remove('hidden');
  document.getElementById('profileEdit').classList.add('hidden');
}
function saveProfile() {
  const name  = document.getElementById('editName').value.trim();
  const party = document.getElementById('editParty').value.trim();
  const state = document.getElementById('editState').value;
  const reason= document.getElementById('editReason').value;
  const pass  = document.getElementById('editPass').value;
  const err   = document.getElementById('editError');

  if (!name) { showErr(err, '⚠️ Name cannot be empty. Even politicians have names.'); return; }
  if (pass && pass.length < 8) { showErr(err, '❌ Password too short. Try harder.'); return; }

  // update in users array
  const idx = users.findIndex(u => u.email === currentUser.email);
  const updated = { ...currentUser, name, party: party || 'Independent (Confused)', state, reason };
  if (pass) updated.pass = pass;
  if (idx > -1) users[idx] = updated;
  localStorage.setItem('DemoCrazy_users', JSON.stringify(users));
  currentUser = updated;
  localStorage.setItem('DemoCrazy_current', JSON.stringify(updated));

  updateNavUser();
  cancelEdit();
  openProfile();
  showToast('✅ Profile updated! Your lies are now on record.');
}

function showErr(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

// ─── TICKER ──────────────────────────────────────────────────────────────────
const tickerItems = [
  "🔴 POLY-JEE 2024 results delayed — committee formed to form another committee",
  "🟡 Candidate promises to build metro on moon if elected",
  "🔴 MP caught sleeping in parliament — says he was 'meditating on policy'",
  "🟢 New record: politician kept 0.5 promises this term",
  "🔴 NETA-NEET topper disqualified for writing 'vote for me' on answer sheet",
  "🟡 Government announces free WiFi — only available in minister's bungalow",
];
function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const text = tickerItems.join('   •••   ');
  track.textContent = text + '   •••   ' + text;
}

// ─── NEWS FEED ───────────────────────────────────────────────────────────────
const newsData = [
  { tag: "BREAKING", featured: true, title: "Supreme Court Rules Politicians Must Score 10% on DemoCrazy to File Nomination", body: "In a landmark judgment, the court declared 'democracy without minimum competence is just expensive chaos.' 94% of sitting MPs immediately filed appeals. The remaining 6% didn't understand what an appeal was.", time: "Just now" },
  { tag: "BREAKING", title: "Local MLA Promises Flying Cars by 2025, Delivers Pothole Instead", body: "Voters remain optimistic. The pothole is reportedly 'very aerodynamic'.", time: "2 mins ago" },
  { tag: "POLITICS", title: "Candidate Scores 4/200 in POLY-JEE, Still Confident He Can Run Finance Ministry", body: "\"Numbers are overrated,\" he told reporters while counting on fingers.", time: "15 mins ago" },
  { tag: "EXAM NEWS", title: "NETA-NEET Results Delayed Due to 'Technical Issues' (Printer Ran Out of Ink)", body: "Officials assure the delay has nothing to do with the 47 blank answer sheets.", time: "1 hr ago" },
  { tag: "VIRAL", title: "Politician Caught Googling 'What is GDP' During Budget Session", body: "His browser history also includes 'how to look busy in parliament'.", time: "3 hrs ago" },
  { tag: "VIRAL", title: "MP Submits 300-Page Report on Pothole. Pothole Still There.", body: "The report recommends forming a sub-committee to study the report.", time: "4 hrs ago" },
  { tag: "POLITICS", title: "CAT-MINISTER Topper Celebrates by Promising Free WiFi on Moon", body: "Implementation timeline: 'Soon. Very soon. After elections.'", time: "5 hrs ago" },
  { tag: "EXAM NEWS", title: "New Rule: Politicians Must Score 30% to Attend Parliament. 80% Currently Ineligible.", body: "Emergency session called to lower the passing marks to 5%.", time: "Yesterday" },
  { tag: "POLITICS", title: "Minister Inaugurates Same Bridge for the 4th Time, Each Time a Different Ribbon Color", body: "Sources say the bridge has never actually been used. It leads to a field.", time: "Yesterday" },
  { tag: "VIRAL", title: "Neta Spends ₹2 Crore on 'Awareness Campaign' About Saving Money", body: "The campaign featured gold-plated pamphlets and a helicopter flyover.", time: "2 days ago" },
];

let activeNewsTag = 'all';

function filterNews(tag, btn) {
  activeNewsTag = tag;
  document.querySelectorAll('.ncat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNews();
}

function renderNews() {
  const featured = newsData.find(n => n.featured);
  const rest = newsData.filter(n => !n.featured && (activeNewsTag === 'all' || n.tag === activeNewsTag));

  // featured card
  const featEl = document.getElementById('newsFeatured');
  if (featured && (activeNewsTag === 'all' || activeNewsTag === featured.tag)) {
    featEl.style.display = '';
    featEl.innerHTML = `
      <span class="featured-tag">⭐ FEATURED • ${featured.tag}</span>
      <h3>${featured.title}</h3>
      <p>${featured.body}</p>
      <div class="news-time">🕐 ${featured.time}</div>
    `;
  } else {
    featEl.style.display = 'none';
  }

  // grid
  const grid = document.getElementById('newsGrid');
  grid.innerHTML = rest.map(n => `
    <div class="news-card">
      <span class="news-tag">${n.tag}</span>
      <h4>${n.title}</h4>
      <p>${n.body}</p>
      <div class="news-time">🕐 ${n.time}</div>
    </div>
  `).join('');
}

// ─── TRENDING ────────────────────────────────────────────────────────────────
const trendingItems = [
  "POLY-JEE 2024 answer key leaked (it was blank)",
  "\"Pothole tourism\" trending in UP",
  "#NetaJEE goes viral on Twitter",
  "Minister's son scores 1/200, gets cabinet post",
  "Free biryani scheme: only ministers eligible",
];
function renderTrending() {
  const el = document.getElementById('trendingList');
  if (!el) return;
  el.innerHTML = trendingItems.map((t, i) => `
    <div class="trending-item">
      <span class="trend-num">${i + 1}</span>
      <span class="trend-text">${t}</span>
    </div>
  `).join('');
}

// ─── JOKE OF THE DAY ─────────────────────────────────────────────────────────
const jokes = [
  "\"The economy is like my son's exam result — we don't talk about it.\" — Anonymous Neta",
  "\"I have not failed. I have successfully identified 10,000 ways to not keep a promise.\" — Every Politician",
  "\"Roads? Where we're going, we don't need roads. We have potholes.\" — Local MLA",
  "\"I am not corrupt. I am just... financially creative.\" — Finance Minister, probably",
  "\"My vision for 2047 is very clear. I will explain it after the 2024 elections.\" — Campaign Speech",
  "\"We will bring back black money. It is currently on a world tour.\" — Opposition Leader",
];
let jokeIdx = 0;
function newJoke() {
  jokeIdx = (jokeIdx + 1) % jokes.length;
  const el = document.getElementById('jokeText');
  if (el) el.textContent = jokes[jokeIdx];
}
function initJoke() {
  const el = document.getElementById('jokeText');
  if (el) el.textContent = jokes[0];
}

// ─── POLL ─────────────────────────────────────────────────────────────────────
const pollData = [
  { label: "Yes, 100%", votes: 8420 },
  { label: "Only if it's open book", votes: 3210 },
  { label: "No, they'll cheat anyway", votes: 5670 },
  { label: "What is an exam?", votes: 1100 },
];
let pollVoted = false;
function renderPoll() {
  const el = document.getElementById('pollOptions');
  if (!el) return;
  const total = pollData.reduce((s, p) => s + p.votes, 0);
  el.innerHTML = pollData.map((p, i) => {
    const pct = Math.round((p.votes / total) * 100);
    return `
      <div class="poll-opt ${pollVoted ? 'voted' : ''}" onclick="vote(${i})">
        <div class="poll-bar" style="width:${pollVoted ? pct : 0}%"></div>
        <span class="poll-label">${p.label}</span>
        ${pollVoted ? `<span class="poll-pct">${pct}%</span>` : ''}
      </div>
    `;
  }).join('');
}
function vote(i) {
  if (pollVoted) return;
  pollData[i].votes += 1;
  pollVoted = true;
  renderPoll();
  // animate bars
  setTimeout(() => {
    document.querySelectorAll('.poll-bar').forEach((bar, idx) => {
      const total = pollData.reduce((s, p) => s + p.votes, 0);
      bar.style.width = Math.round((pollData[idx].votes / total) * 100) + '%';
    });
  }, 50);
}

// ─── MOCK EXAM ────────────────────────────────────────────────────────────────
const examQuestions = {
  'POLYJEE': [
    { q: "If a banana and a potato have an argument, who wins the election?", opts: ["Banana, obviously", "Potato, it has more roots", "The onion who was crying nearby", "None, they form a coalition"], ans: 2 },
    { q: "A politician promises to bring the moon. What is the moon's current reaction?", opts: ["Excited", "Filing a restraining order", "Already packed its bags", "Asking for a bribe first"], ans: 1 },
    { q: "How many promises does a neta make before breakfast?", opts: ["Zero, they skip breakfast", "47", "Infinity, they're still going", "Only one — to eat breakfast"], ans: 2 },
    { q: "If corruption weighs 5kg and democracy weighs 2kg, what is the combined weight of Indian politics?", opts: ["7kg", "A lot of drama", "Depends on the season", "Please form a committee"], ans: 1 },
    { q: "A minister's car has 8 wheels. How many potholes does it avoid?", opts: ["All of them", "None, it flies", "It doesn't — it made the potholes", "Exactly 3.5"], ans: 2 },
  ],
  'NETA-NEET': [
    { q: "A doctor and a politician both lie. Who recovers faster?", opts: ["The doctor", "The politician", "The patient", "The lie itself"], ans: 3 },
    { q: "If you eat 3 free biryani packets from 3 different parties, what do you get?", opts: ["Full stomach", "Indigestion and confusion", "A cabinet post", "All of the above"], ans: 3 },
    { q: "What is the scientific name of a neta who disappears after elections?", opts: ["Homo Abscondus", "Promiseus Brokus", "Ghaibus Maximus", "All of the above"], ans: 2 },
    { q: "A rally has 10,000 people. 9,999 are paid ₹500 each. What is the total enthusiasm?", opts: ["Very high", "₹49,99,500", "One genuine supporter", "Depends on the samosa quality"], ans: 2 },
    { q: "Which is heavier — a politician's speech or a politician's work?", opts: ["The speech, always", "The work, obviously", "They weigh the same: zero", "Please don't ask this"], ans: 0 },
  ],
  'CAT-MINISTER': [
    { q: "A minister has ₹100 crore. He spends ₹200 crore on his campaign. Where did the extra money come from?", opts: ["Savings", "Donations", "Don't ask", "A very generous uncle"], ans: 2 },
    { q: "If 2 ministers fight on TV for 2 hours, how much work gets done?", opts: ["Double the work", "Exactly 0 units", "Negative work", "The TV gets damaged"], ans: 2 },
    { q: "A scam is discovered on Monday. By Friday it is:", opts: ["Solved", "Forgotten", "Renamed a 'scheme'", "Blamed on the opposition"], ans: 2 },
    { q: "What is the correct formula for winning an election?", opts: ["Hard work + honesty", "Free stuff + loud music + confusion", "Policy + execution", "None of the above work"], ans: 1 },
    { q: "A neta inaugurates a toilet. How many press conferences follow?", opts: ["One", "Seventeen", "One per tile", "Until the next election"], ans: 1 },
  ]
};

let currentExam = null;
let currentQ = 0;
let userAnswers = [];

function startExam(type) {
  currentExam = type;
  currentQ = 0;
  userAnswers = new Array(5).fill(null);
  document.getElementById('examTitle').textContent = `📝 ${type} — Question Paper`;
  document.getElementById('examModal').classList.remove('hidden');
  renderQuestion();
}

function renderQuestion() {
  const qs = examQuestions[currentExam];
  const q = qs[currentQ];
  document.getElementById('qCounter').textContent = `Q ${currentQ + 1} / ${qs.length}`;
  document.getElementById('progressFill').style.width = `${((currentQ + 1) / qs.length) * 100}%`;
  document.getElementById('questionBox').innerHTML = `
    <p class="question-text"><strong>Q${currentQ + 1}.</strong> ${q.q}</p>
    <div class="options">
      ${q.opts.map((o, i) => `
        <label>
          <input type="radio" name="opt" value="${i}" ${userAnswers[currentQ] === i ? 'checked' : ''} onchange="userAnswers[currentQ]=${i}"/>
          ${String.fromCharCode(65 + i)}. ${o}
        </label>
      `).join('')}
    </div>
  `;
}

function nextQ() {
  if (currentQ < 4) { currentQ++; renderQuestion(); }
}
function prevQ() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}
function closeExam() {
  document.getElementById('examModal').classList.add('hidden');
}

function submitExam() {
  const qs = examQuestions[currentExam];
  let score = 0;
  userAnswers.forEach((a, i) => { if (a === qs[i].ans) score++; });
  const percent = (score / qs.length) * 100;

  // tier: [minPercent, emoji, headline, subtext, cssClass]
  const tiers = [
    [100, '🏆', 'PERFECT SCORE!',
      "You're dangerously overqualified. Please don't enter politics — you'll ruin the vibe.",
      'result-gold'],
    [80,  '🎉', 'Excellent!',
      "You know too much. Politics will corrupt you within 3 months. We give it 2.",
      'result-green'],
    [60,  '😐', 'Meh. Okay.',
      "Junior minister material. Congratulations. We're so sorry.",
      'result-blue'],
    [40,  '😬', 'Below Average',
      "You qualify for the opposition bench. Your job: shout, sleep, repeat.",
      'result-yellow'],
    [20,  '🤦', 'Yikes.',
      "This is embarrassing. Even the pothole you promised to fix scored higher.",
      'result-orange'],
    [0,   '💀', 'CATASTROPHIC FAILURE',
      "Congratulations! You scored " + score + "/5. You are PERFECT for a cabinet position. Welcome to Indian politics. 🎊",
      'result-red'],
  ];

  const tier = tiers.find(([min]) => percent >= min);
  const [, emoji, headline, subtext, cls] = tier;

  // funny fail-specific roasts
  const failRoasts = [
    "Our algorithm has automatically filed your nomination for 3 constituencies.",
    "A committee has been formed to investigate how you got this wrong.",
    "Don't worry — the answer key will be leaked next time.",
    "You have been awarded the 'Padma Bewakoof' for services to democracy.",
    "Your score has been sent to the Election Commission as a warning.",
  ];
  const extra = percent < 40 ? `<p class="result-roast">"${failRoasts[Math.floor(Math.random() * failRoasts.length)]}"</p>` : '';

  document.getElementById('questionBox').innerHTML = `
    <div class="result-box ${cls}">
      <div class="result-emoji">${emoji}</div>
      <div class="result-score">${score} / ${qs.length}</div>
      <div class="result-headline">${headline}</div>
      <p class="result-sub">${subtext}</p>
      ${extra}
      <div class="result-bar-wrap">
        <div class="result-bar" style="width:0%" data-pct="${percent}"></div>
      </div>
      <span class="result-pct">${Math.round(percent)}%</span>
    </div>
  `;

  // animate bar
  setTimeout(() => {
    const bar = document.querySelector('.result-bar');
    if (bar) bar.style.width = bar.dataset.pct + '%';
  }, 100);

  document.querySelector('.exam-controls').style.display = 'none';
  document.querySelector('.submit-btn').style.display = 'none';

  // save score to backend
  const playerName = currentUser ? currentUser.name : 'Anonymous Neta';
  fetch(`${API_BASE}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playerName, score: Math.round(percent) })
  }).then(() => loadLeaderboard()).catch(() => {});
}

// ─── CHATBOT ──────────────────────────────────────────────────────────────────
const speechTemplates = [
  (t) => `🎙️ OFFICIAL POLITICAL ADDRESS\n${'─'.repeat(40)}\n\nMy dear brothers, sisters, and people who accidentally wandered in,\n\nToday I stand before you to talk about ${t}. For 75 years, ${t} has suffered. My heart bleeds. My eyes water. My accountant is concerned.\n\nThe previous government had ONE job — fix ${t}. Instead, they went on foreign trips to "study" ${t} in Switzerland. Switzerland! As if ${t} grows in the Alps!\n\nBut friends, I am different. I have a VISION. A ROADMAP. A POWERPOINT with 47 slides about ${t}. Slide 3 is particularly moving.\n\nOur 5-point plan for ${t}:\n1. Acknowledge ${t} exists ✅ (done today)\n2. Form a committee 📋\n3. Rename the committee 📋➡️📋\n4. Lose the committee's report 🗑️\n5. Blame the opposition for ${t} 👉\n\n"${t} is not just a problem. It is an opportunity. An opportunity for me to get re-elected."\n\nJai Hind! Vote wisely! (Vote for me.) 🇮🇳`,

  (t) => `🎙️ EMERGENCY PRESS CONFERENCE\n${'─'.repeat(40)}\n\nNamaste, respected journalists and people who came for the free samosas.\n\nI have been asked about ${t}. Let me be crystal clear — we take ${t} very, very seriously. So seriously that we have formed not one, not two, but THREE committees on ${t}.\n\nCommittee 1: Studies ${t}\nCommittee 2: Studies Committee 1\nCommittee 3: Has not met yet (key members are on a study tour of Dubai)\n\nThe opposition says we have done nothing about ${t}. This is FALSE. We have done NOTHING about ${t} very efficiently. Do you know how hard it is to do nothing this consistently? It requires dedication.\n\nI want to assure the nation — ${t} will be resolved before the next election. Which election? I cannot say. There are many elections.\n\n"If ${t} were a person, I would shake its hand and promise it a cabinet position."\n\nThank you. No questions. Especially not about ${t}. 🚪`,

  (t) => `🎙️ ELECTION RALLY SPEECH — CLASSIFIED\n${'─'.repeat(40)}\n\nYUVAON! MAHILAON! BUZURGON! AND THAT ONE GUY ASLEEP IN THE BACK!\n\n${t.toUpperCase()}! Say it with me! ${t.toUpperCase()}!\n\nMy friends, the issue of ${t} is not just an issue. It is an emotion. A sentiment. A WhatsApp forward that has been shared 4 lakh times.\n\nI remember when I was young, my mother said to me — "Beta, one day you will fix ${t}." I said, "Maa, I don't even know what ${t} is." She said, "Neither do the politicians, but they talk about it anyway."\n\nAnd here I am.\n\nThe opposition laughs at ${t}. They LAUGH! While you suffer, they laugh. While you cry, they laugh. Honestly they seem to be having a great time but that is NOT THE POINT.\n\nVote for me and I PERSONALLY guarantee that ${t} will be mentioned in at least 3 more speeches.\n\nBharat Mata Ki Jai! 🇮🇳✊ (Please also follow me on Instagram)`,

  (t) => `🎙️ BUDGET SESSION SPEECH\n${'─'.repeat(40)}\n\nHon'ble Speaker, distinguished members, and the gentleman sleeping in Row C,\n\nI rise to speak on the matter of ${t}. This is a matter of grave national importance. I have prepared a 4-hour speech on ${t}. Don't worry — I will only read the first 3 hours and 58 minutes.\n\nThe numbers on ${t} are shocking:\n📊 ${t} has increased by 200% (source: I made this up)\n📊 ${t} affects 84.7% of Indians (the 0.7% is very specific and therefore trustworthy)\n📊 ₹47,000 crore has been allocated for ${t} (₹46,999 crore is for administrative costs)\n\nThe opposition's policy on ${t} can be summarised in one word: chaos. Actually two words: total chaos. Three words: absolute total chaos.\n\nOur government's policy on ${t} is bold, visionary, and will be announced after further consultation, pending committee approval, subject to budget availability, weather permitting.\n\n"${t} is the backbone of this nation. We will not rest until that backbone is thoroughly examined by a subcommittee."\n\nI yield the floor. Please wake up Row C. 🛎️`,

  (t) => `🎙️ VICTORY SPEECH (PRE-WRITTEN, JUST IN CASE)\n${'─'.repeat(40)}\n\nThe people have spoken! And what they said was: "${t}!"\n\nI am humbled. I am moved. I am also slightly surprised because my astrologer said it would be closer.\n\nThis victory is not mine — it belongs to every person who believed that ${t} could be solved. It belongs to the auto driver who drove me to the rally. It belongs to my cousin who managed my social media. It belongs to the 47 people who actually read my manifesto on ${t}.\n\nTo my opponents: I respect you. I respect your views on ${t}. I respect that you also had no idea how to fix ${t} but at least we were confused together.\n\nMy first act as your representative: I will personally visit the ${t} situation. I will look at it. I will nod seriously. I will say "hmmm." A photo will be taken. Change will be implied.\n\nThe journey of a thousand miles begins with a single press release about ${t}.\n\nJai Hind! 🎉🇮🇳 (Fireworks budget: ₹2 crore. ${t} budget: pending.)`,
];

const promiseBank = {
  any: [
    "Free internet for every cow in the country 🐄",
    "Potholes will be renamed 'Adventure Zones' to boost tourism 🕳️",
    "Every citizen will receive a certificate of appreciation for paying taxes 📜",
    "Parliament sessions will now include a mandatory nap time 😴",
    "All politicians will wear GPS trackers. The data will be kept secret. 🛰️",
    "We will build a wall around corruption. Corruption will pay for it. 🧱",
    "Every government form will be reduced to just one page. The font will be size 2. 📄",
    "Inflation will be renamed 'Price Enthusiasm' to boost morale 📈",
    "A new ministry of Excuses will be established with a budget of ₹500 crore 💼",
    "All traffic signals will be made optional to improve flow 🚦",
  ],
  UP: [
    "Free samosa with every government document 🥟",
    "Expressways will be built to every relative's village 🛣️",
    "Ganga will be cleaned by 2047. Or 2050. We'll see. 🌊",
    "Every UP resident will get a free lathi for self-defence 🪄",
  ],
  TN: [
    "Free biryani on all government holidays 🍛",
    "Every auto driver will receive a philosophy degree 🛺",
    "Chennai rains will be officially renamed 'Blessings' 🌧️",
    "Rajinikanth will be appointed Chief Advisor of Everything 🕶️",
  ],
  MH: [
    "Vada pav will be declared the national food of Maharashtra 🍔",
    "Mumbai local trains will run on time (April Fools!) 🚂",
    "Every Mumbaikar will get 10 extra square feet of personal space 📐",
    "Dharavi will be redeveloped into a 5-star slum 🏙️",
  ],
  DL: [
    "Odd-even rule extended to politicians — only half can lie on odd days 🚗",
    "Free AAP umbrella with every vote 🌂",
    "Delhi air quality will be upgraded from 'Hazardous' to 'Spicy' 😷",
    "Yamuna will be cleaned. Again. For the 14th time. 🏞️",
  ],
};

function generateSpeech() {
  const topic = document.getElementById('speechTopic').value.trim() || 'corruption';
  const template = speechTemplates[Math.floor(Math.random() * speechTemplates.length)];
  const text = template(topic);
  const out = document.getElementById('speechOutput');

  // typewriter effect
  out.classList.remove('hidden');
  out.innerHTML = '<span class="speech-cursor"></span>';
  let i = 0;
  const speed = 18;
  function type() {
    if (i < text.length) {
      out.innerHTML = text.slice(0, i + 1).replace(/\n/g, '<br/>') + '<span class="speech-cursor">|</span>';
      i++;
      setTimeout(type, speed);
    } else {
      out.innerHTML = text.replace(/\n/g, '<br/>');
      out.innerHTML += `
        <div class="gen-actions">
          <button onclick="copySpeech()" class="gen-action-btn">📋 Copy Speech</button>
          <button onclick="generateSpeech()" class="gen-action-btn">🔄 Regenerate</button>
        </div>`;
    }
  }
  type();
}

function copySpeech() {
  const topic = document.getElementById('speechTopic').value.trim() || 'corruption';
  const template = speechTemplates[Math.floor(Math.random() * speechTemplates.length)];
  navigator.clipboard.writeText(template(topic)).catch(() => {});
  showToast('📋 Speech copied! Go ruin democracy.');
}

function generatePromise() {
  const state = document.getElementById('promiseState').value;
  const pool = [...promiseBank.any, ...(promiseBank[state] || [])];
  const picked = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const out = document.getElementById('promiseOutput');

  out.classList.remove('hidden');
  out.innerHTML = `
    <div class="promise-header">📋 Official Election Promises <span class="promise-stamp">CERTIFIED HOLLOW™</span></div>
    <div class="promise-cards">
      ${picked.map((p, i) => `
        <div class="promise-card" style="animation-delay:${i * 0.12}s">
          <div class="promise-num">${i + 1}</div>
          <div class="promise-text">${p}</div>
        </div>
      `).join('')}
    </div>
    <div class="promise-disclaimer">⚠️ These promises have a 0% fulfillment rate. Results may vary. Void where democracy exists.</div>
    <div class="gen-actions">
      <button onclick="copyPromises()" class="gen-action-btn">📋 Copy Promises</button>
      <button onclick="generatePromise()" class="gen-action-btn">🔄 New Promises</button>
    </div>
  `;

  // track analytics
  fetch(`${API_BASE}/analytics/promise`, { method: 'POST' }).catch(() => {});
}

function copyPromises() {
  const cards = document.querySelectorAll('.promise-text');
  const text = [...cards].map((c, i) => `${i+1}. ${c.textContent}`).join('\n');
  navigator.clipboard.writeText(text).catch(() => {});
  showToast('📋 Promises copied! Good luck keeping them.');
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
// seed data shown until backend responds
const leaderboardData = [
  { name: "Pappu Sharma", state: "UP", exam: "POLYJEE", score: 187, status: "pass" },
  { name: "Kamla Devi", state: "TN", exam: "NETA-NEET", score: 174, status: "pass" },
  { name: "Raju Bhai", state: "MH", exam: "CAT-MINISTER", score: 162, status: "pass" },
  { name: "Sunita Yadav", state: "DL", exam: "POLYJEE", score: 155, status: "pass" },
  { name: "Masterji Tiwari", state: "UP", exam: "NETA-NEET", score: 143, status: "pass" },
  { name: "Chotu Neta", state: "MH", exam: "CAT-MINISTER", score: 98, status: "pass" },
  { name: "Lallan Prasad", state: "UP", exam: "POLYJEE", score: 67, status: "pending" },
  { name: "Guddu Singh", state: "TN", exam: "NETA-NEET", score: 45, status: "pending" },
  { name: "Bablu Chacha", state: "DL", exam: "CAT-MINISTER", score: 23, status: "fail" },
  { name: "Feku Lal", state: "MH", exam: "POLYJEE", score: 12, status: "fail" },
];

let liveLeaderboard = [...leaderboardData];
let currentFilter = 'all';

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    const data = await res.json();
    if (data.length > 0) {
      // map backend shape to frontend shape
      liveLeaderboard = data.map(d => ({
        name: d.name,
        state: '🗳️',
        exam: 'POLYJEE',
        score: d.score,
        status: d.score >= 60 ? 'pass' : d.score >= 40 ? 'pending' : 'fail'
      }));
    }
  } catch (e) {
    // fallback to seed data silently
  }
  renderLeaderboard();
}

function filterBoard(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLeaderboard();
}

function renderLeaderboard() {
  const data = currentFilter === 'all'
    ? liveLeaderboard
    : liveLeaderboard.filter(d => d.exam === currentFilter);

  const sorted = [...data].sort((a, b) => b.score - a.score);
  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = sorted.map((d, i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
    const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1;
    const statusClass = `status-${d.status}`;
    const statusText = d.status === 'pass' ? '✅ Qualified' : d.status === 'fail' ? '❌ Failed' : '⏳ Pending';
    return `
      <tr>
        <td class="${rankClass}">${rankIcon}</td>
        <td>${d.name}</td>
        <td>${d.state}</td>
        <td>${d.exam}</td>
        <td>${d.score}</td>
        <td class="${statusClass}">${statusText}</td>
      </tr>
    `;
  }).join('');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
initTicker();
renderNews();
renderTrending();
initJoke();
renderPoll();
loadLeaderboard();
updateNavUser();

// if already logged in, skip landing page
if (currentUser) {
  const landing = document.getElementById('landingPage');
  if (landing) landing.style.display = 'none';
  showPage('home', null);
}
