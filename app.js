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

function doSignup() {
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
}

function logout() {
  currentUser = null;
  localStorage.removeItem('DemoCrazy_current');
  updateNavUser();
  showToast('👋 Logged out. The nation breathes easy.');
}

function updateNavUser() {
  const authEl = document.getElementById('navAuth');
  const userEl = document.getElementById('navUser');
  if (currentUser) {
    authEl.classList.add('hidden');
    userEl.classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name.split(' ')[0];
  } else {
    authEl.classList.remove('hidden');
    userEl.classList.add('hidden');
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
    { q: "What is the full form of MP?", opts: ["Member of Parliament", "More Promises", "Mango Person", "My Privilege"], ans: 0 },
    { q: "How many states are in India?", opts: ["28", "29", "30", "I'll form a committee to find out"], ans: 0 },
    { q: "The Constitution of India was adopted on:", opts: ["15 Aug 1947", "26 Jan 1950", "26 Nov 1949", "After tea break"], ans: 2 },
    { q: "What does 'Jai Hind' mean?", opts: ["Victory to India", "Good Morning India", "Vote for me", "All of the above"], ans: 0 },
    { q: "A no-confidence motion requires how many days notice?", opts: ["7 days", "10 days", "14 days", "Whenever I feel like it"], ans: 2 },
  ],
  'NETA-NEET': [
    { q: "Which vitamin is obtained from sunlight?", opts: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"], ans: 3 },
    { q: "What is the powerhouse of the cell?", opts: ["Nucleus", "Mitochondria", "My constituency office", "Ribosome"], ans: 1 },
    { q: "DNA stands for:", opts: ["Do Not Ask", "Deoxyribonucleic Acid", "Daily Neta Activity", "Data Not Available"], ans: 1 },
    { q: "Normal human body temperature is:", opts: ["37°C", "98°C", "100°F", "Hot-headed"], ans: 0 },
    { q: "Which organ purifies blood?", opts: ["Heart", "Liver", "Kidney", "The Election Commission"], ans: 2 },
  ],
  'CAT-MINISTER': [
    { q: "If a minister takes 3 hours to make a decision that takes 10 mins, what is the efficiency?", opts: ["Very high", "5.5%", "Negative", "Depends on election year"], ans: 2 },
    { q: "A budget deficit means:", opts: ["Spending > Revenue", "Revenue > Spending", "Money is a social construct", "Time to print more notes"], ans: 0 },
    { q: "GDP stands for:", opts: ["Gross Domestic Product", "Government's Daily Promise", "Grand Development Plan", "Get Demonetized Please"], ans: 0 },
    { q: "Inflation is best controlled by:", opts: ["Raising interest rates", "Blaming the opposition", "Printing more money", "Changing the topic"], ans: 0 },
    { q: "FDI stands for:", opts: ["Foreign Direct Investment", "Free Dosa Initiative", "Fake Data Incoming", "Fund Diversion Index"], ans: 0 },
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
}

// ─── CHATBOT ──────────────────────────────────────────────────────────────────
const speechTemplates = [
  (t) => `My dear brothers and sisters,\n\nToday I stand before you to talk about ${t}. For too long, ${t} has been ignored by the previous government. But I promise you — under my leadership, ${t} will be revolutionized!\n\nWe will form a high-level committee to study ${t}. The committee will submit a report in 6 months. The report will be reviewed in another 6 months. And then, my friends, we will think about it.\n\nJai Hind! 🇮🇳`,
  (t) => `Friends, the issue of ${t} is not just an issue — it is an emotion. It is a feeling. It is a sentiment that runs deep in the veins of every Indian.\n\nThe opposition has destroyed ${t}. They had 70 years! 70 years and they did nothing about ${t}. But we, in just 5 years, have thought about ${t} at least twice.\n\nVote for me and ${t} will be fixed. Probably. Maybe. Inshallah.\n\nThank you. Jai Mata Di! 🙏`,
];

const promiseBank = {
  any: [
    "Free internet for every cow in the country 🐄",
    "Potholes will be renamed 'Adventure Zones' to boost tourism 🕳️",
    "Every citizen will receive a certificate of appreciation for paying taxes 📜",
    "Parliament sessions will now include a mandatory nap time 😴",
    "All politicians will wear GPS trackers. The data will be kept secret. 🛰️",
  ],
  UP: [
    "Free samosa with every government document 🥟",
    "Expressways will be built to every relative's village 🛣️",
    "Ganga will be cleaned by 2047. Or 2050. We'll see. 🌊",
  ],
  TN: [
    "Free biryani on all government holidays 🍛",
    "Every auto driver will receive a philosophy degree 🛺",
    "Chennai rains will be officially renamed 'Blessings' 🌧️",
  ],
  MH: [
    "Vada pav will be declared the national food of Maharashtra 🍔",
    "Mumbai local trains will run on time (April Fools!) 🚂",
    "Every Mumbaikar will get 10 extra square feet of personal space 📐",
  ],
  DL: [
    "Odd-even rule extended to politicians — only half can lie on odd days 🚗",
    "Free AAP umbrella with every vote 🌂",
    "Delhi air quality will be upgraded from 'Hazardous' to 'Spicy' 😷",
  ],
};

function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  document.getElementById(tab + 'Tab').classList.remove('hidden');
  btn.classList.add('active');
}

function generateSpeech() {
  const topic = document.getElementById('speechTopic').value.trim() || 'corruption';
  const template = speechTemplates[Math.floor(Math.random() * speechTemplates.length)];
  const out = document.getElementById('speechOutput');
  out.textContent = template(topic);
  out.classList.remove('hidden');
}

function generatePromise() {
  const state = document.getElementById('promiseState').value;
  const pool = [...promiseBank.any, ...(promiseBank[state] || [])];
  const picked = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const out = document.getElementById('promiseOutput');
  out.textContent = "📋 Official Election Promises:\n\n" + picked.map((p, i) => `${i + 1}. ${p}`).join('\n\n');
  out.classList.remove('hidden');
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
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

let currentFilter = 'all';

function filterBoard(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLeaderboard();
}

function renderLeaderboard() {
  const data = currentFilter === 'all'
    ? leaderboardData
    : leaderboardData.filter(d => d.exam === currentFilter);

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
renderLeaderboard();
updateNavUser();
