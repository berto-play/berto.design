'use strict';

// ─── Signals ──────────────────────────────────────────────────────────────────

const DOMAINS = [
  { id: 'framing', label: 'Problem Framing', signals: [
    { id: 'dr_req_first',  track: 'dr', pos: true,  label: 'Requirements first' },
    { id: 'dr_clarified',  track: 'dr', pos: true,  label: 'Asked to clarify' },
    { id: 'dr_jumped',     track: 'dr', pos: false, label: 'Jumped to execution' },
    { id: 'me_gave_frame', track: 'me', pos: true,  label: 'Gave clear frame' },
    { id: 'me_no_context', track: 'me', pos: false, label: 'No context given' },
  ]},
  { id: 'execution', label: 'Design Execution', signals: [
    { id: 'dr_detail',     track: 'dr', pos: true,  label: 'Strong detail' },
    { id: 'dr_in_frame',   track: 'dr', pos: true,  label: 'Stayed in frame' },
    { id: 'dr_deviated',   track: 'dr', pos: false, label: 'Deviated from brief' },
    { id: 'me_strengths',  track: 'me', pos: true,  label: 'Played to strengths' },
    { id: 'me_open_scope', track: 'me', pos: false, label: 'Too much open scope' },
  ]},
  { id: 'presentation', label: 'Presentation & Reviews', signals: [
    { id: 'dr_insight',    track: 'dr', pos: true,  label: 'Led with insight' },
    { id: 'dr_lost_room',  track: 'dr', pos: false, label: 'Lost the room' },
    { id: 'me_owned',      track: 'me', pos: true,  label: 'Owned the format' },
    { id: 'me_drift',      track: 'me', pos: false, label: 'Let it drift' },
  ]},
  { id: 'feedback', label: 'Feedback Reception', signals: [
    { id: 'dr_rcvd_well',  track: 'dr', pos: true,  label: 'Received it well' },
    { id: 'dr_repeated',   track: 'dr', pos: false, label: 'Repeated the pattern' },
    { id: 'me_direct',     track: 'me', pos: true,  label: 'Gave direct feedback' },
    { id: 'me_softened',   track: 'me', pos: false, label: 'Over-softened it' },
  ]},
  { id: 'workload', label: 'Workload Management', signals: [
    { id: 'dr_handled',    track: 'dr', pos: true,  label: 'Handled scope well' },
    { id: 'dr_got_lost',   track: 'dr', pos: false, label: 'Got lost in complexity' },
    { id: 'me_protected',  track: 'me', pos: true,  label: 'Protected from complexity' },
    { id: 'me_overloaded', track: 'me', pos: false, label: 'Overloaded them' },
  ]},
];

const ASSESSMENT_DAYS = 7;

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  view: 'lock',
  data: null,
  draft: null,
  step: 0,
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function hashPin(pin) {
  const buf = await crypto.subtle.digest(
    'SHA-256', new TextEncoder().encode('log-v1-' + pin)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

async function savePin(pin) {
  localStorage.setItem('pin_hash', await hashPin(pin));
}

async function checkPin(pin) {
  const stored = localStorage.getItem('pin_hash');
  return !!stored && stored === await hashPin(pin);
}

function isSetup() {
  return !!localStorage.getItem('pin_hash') && !!localStorage.getItem('gh_token');
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

function ghHeaders() {
  return {
    'Authorization': `token ${localStorage.getItem('gh_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
  };
}

function ghRepo() {
  return localStorage.getItem('gh_repo') || 'berto-play/berto-log-data';
}

async function ghRead() {
  const res = await fetch(
    `https://api.github.com/repos/${ghRepo()}/contents/data.json`,
    { headers: ghHeaders() }
  );
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error('GitHub read failed: ' + res.status);
  const file = await res.json();
  const raw = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))));
  return { data: JSON.parse(raw), sha: file.sha };
}

async function ghWrite(data, sha) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const body = { message: 'log update', content };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${ghRepo()}/contents/data.json`,
    { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) }
  );
  if (!res.ok) throw new Error('GitHub write failed: ' + res.status);
  const result = await res.json();
  localStorage.setItem('gh_sha', result.content.sha);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

function emptyData() {
  return {
    config: { startDate: new Date().toISOString().split('T')[0] },
    interactions: [],
    manualVerdict: null,
    pendingSync: false,
  };
}

async function loadData() {
  try {
    const { data, sha } = await ghRead();
    if (data) {
      if (sha) localStorage.setItem('gh_sha', sha);
      localStorage.setItem('data', JSON.stringify(data));
      return data;
    }
    const fresh = emptyData();
    await ghWrite(fresh, null);
    localStorage.setItem('data', JSON.stringify(fresh));
    return fresh;
  } catch {
    const local = localStorage.getItem('data');
    return local ? JSON.parse(local) : emptyData();
  }
}

async function saveData(data) {
  localStorage.setItem('data', JSON.stringify(data));
  try {
    const sha = localStorage.getItem('gh_sha');
    await ghWrite(data, sha);
    data.pendingSync = false;
    localStorage.setItem('data', JSON.stringify(data));
  } catch {
    data.pendingSync = true;
    localStorage.setItem('data', JSON.stringify(data));
  }
}

// ─── Verdict ──────────────────────────────────────────────────────────────────

function calcVerdict(interactions) {
  let pos = 0, neg = 0;
  interactions.forEach(i =>
    i.entries.forEach(e =>
      e.signals.forEach(sid => {
        const domain = DOMAINS.find(d => d.id === e.domain);
        const sig = domain && domain.signals.find(s => s.id === sid);
        if (sig && sig.track === 'dr') sig.pos ? pos++ : neg++;
      })
    )
  );
  const total = pos + neg;
  if (total < 3) return null;
  const r = pos / total;
  return r >= 0.65 ? 'growing' : r <= 0.35 ? 'flag' : 'not_sure';
}

function verdictLabel(v) {
  return { growing: 'Growing', not_sure: 'Not Sure', flag: 'Flag a Concern' }[v] || '—';
}

function verdictColor(v) {
  return { growing: 'var(--green)', not_sure: 'var(--yellow)', flag: 'var(--red)' }[v] || 'var(--text2)';
}

function dayProgress(startDate) {
  const day = Math.min(
    Math.floor((Date.now() - new Date(startDate + 'T00:00:00')) / 86400000) + 1,
    ASSESSMENT_DAYS
  );
  return { day, pct: Math.round((day / ASSESSMENT_DAYS) * 100) };
}

// ─── Report ───────────────────────────────────────────────────────────────────

function buildReport(data) {
  const drByDomain = {}, meByDomain = {};
  DOMAINS.forEach(d => {
    drByDomain[d.id] = { pos: [], neg: [] };
    meByDomain[d.id] = { pos: [], neg: [] };
  });

  data.interactions.forEach(i =>
    i.entries.forEach(e =>
      e.signals.forEach(sid => {
        const domain = DOMAINS.find(d => d.id === e.domain);
        const sig = domain && domain.signals.find(s => s.id === sid);
        if (!sig) return;
        const target = sig.track === 'dr' ? drByDomain : meByDomain;
        sig.pos ? target[e.domain].pos.push(sig.label) : target[e.domain].neg.push(sig.label);
      })
    )
  );

  const domainLines = DOMAINS.map(d => {
    const dr = drByDomain[d.id];
    const total = dr.pos.length + dr.neg.length;
    if (!total) return null;
    const r = dr.pos.length / total;
    let line;
    if (r >= 0.7)       line = `Mostly strong — ${[...new Set(dr.pos)][0]}.`;
    else if (r <= 0.3)  line = `Consistent gap — ${[...new Set(dr.neg)][0]}.`;
    else                line = `Mixed — ${[...new Set(dr.pos)][0] || 'some positives'}, but ${[...new Set(dr.neg)][0] || 'some gaps'}.`;
    return `${d.label}: ${line}`;
  }).filter(Boolean);

  const meDid  = [...new Set(DOMAINS.flatMap(d => meByDomain[d.id].pos))].slice(0, 3);
  const meFell = [...new Set(DOMAINS.flatMap(d => meByDomain[d.id].neg))].slice(0, 2);

  const suggested = calcVerdict(data.interactions);
  const verdict   = data.manualVerdict || suggested;
  const { day }   = dayProgress(data.config.startDate);

  return { verdict, suggested, day, domainLines, meDid, meFell };
}

function formatReport(data) {
  const r = buildReport(data);
  let t = '';
  t += `Verdict on Direct Report: ${verdictLabel(r.verdict)}\n`;
  t += `Here is what I am seeing, right?\n\n`;

  if (r.domainLines.length) {
    t += r.domainLines.join('\n') + '\n';
  } else {
    t += `[Not enough data yet — ${r.day} of ${ASSESSMENT_DAYS} days logged]\n`;
  }

  t += `\nOn my side:\n`;
  if (r.meDid.length) r.meDid.forEach(l => { t += `  • ${l}\n`; });
  else t += `  • [Not enough data yet]\n`;

  if (r.meFell.length) {
    t += `\nWhere I fell short:\n`;
    r.meFell.forEach(l => { t += `  • ${l}\n`; });
  }

  t += `\nWhat I need from you: [add your ask before this conversation]`;
  t += `\n\nOne thing I am not sure about yet: [name the gap before sharing]`;
  return t;
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function app() { return document.getElementById('app'); }

function render(html) { app().innerHTML = html; }

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Views ────────────────────────────────────────────────────────────────────

function viewSetup() {
  render(`
    <div class="screen setup">
      <div class="setup-header">
        <div class="logo">Log</div>
        <p class="muted">Set up this device</p>
      </div>
      <div class="form">
        <label>PIN (4 digits)</label>
        <input type="password" inputmode="numeric" maxlength="4" id="pin1" placeholder="••••" autocomplete="new-password">
        <label>Confirm PIN</label>
        <input type="password" inputmode="numeric" maxlength="4" id="pin2" placeholder="••••" autocomplete="new-password">
        <label>GitHub token</label>
        <input type="password" id="gh_token" placeholder="ghp_… or github_pat_…" autocomplete="off">
        <p class="field-hint">
          github.com → Settings → Developer settings → Personal access tokens → Fine-grained.
          Grant read &amp; write on Contents for your data repo.
        </p>
        <label>Data repo (owner/name)</label>
        <input type="text" id="gh_repo" value="berto-play/berto-log-data" autocomplete="off" spellcheck="false">
        <p id="setup-error" class="error hidden"></p>
        <button class="btn-primary" id="setup-btn" onclick="doSetup()">Get started</button>
      </div>
    </div>
  `);
}

function viewLock() {
  render(`
    <div class="screen lock">
      <div class="logo">Log</div>
      <div class="pin-display" id="pin-dots">
        <span></span><span></span><span></span><span></span>
      </div>
      <p id="lock-error" class="error hidden">Wrong PIN — try again</p>
      <div class="numpad">
        ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
          <button class="key${k === '' ? ' invisible' : ''}" onclick="pinKey('${k}')">${k}</button>
        `).join('')}
      </div>
    </div>
  `);
  window._pin = '';
}

function viewHome(data) {
  const { day, pct } = dayProgress(data.config.startDate);
  const verdict = data.manualVerdict || calcVerdict(data.interactions);
  const todayStr = new Date().toISOString().split('T')[0];
  const loggedToday = data.interactions.some(i => i.date === todayStr);

  render(`
    <div class="screen home">
      <div class="home-header">
        <span class="day-badge">Day ${day} of ${ASSESSMENT_DAYS}</span>
        ${data.pendingSync ? '<span class="sync-badge">⬆ pending sync</span>' : ''}
      </div>
      <div class="verdict-card">
        <div class="verdict-label" style="color:${verdictColor(verdict)}">${verdictLabel(verdict)}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <p class="progress-text">${data.interactions.length} interaction${data.interactions.length !== 1 ? 's' : ''} logged</p>
      </div>
      <button class="btn-primary log-btn" onclick="startLog()">
        ${loggedToday ? '＋ Log another' : '＋ Log today'}
      </button>
      <nav class="bottom-nav">
        <button class="nav-btn active">Home</button>
        <button class="nav-btn" onclick="goHistory()">History</button>
        <button class="nav-btn" onclick="goReport()">Report</button>
      </nav>
    </div>
  `);
}

function viewLog() {
  const { draft, step } = state;

  if (step === 0) {
    render(`
      <div class="screen log">
        <div class="log-header">
          <button class="back-btn" onclick="goHome()">←</button>
          <span>Log interaction</span>
        </div>
        <p class="step-label">Who are you logging for?</p>
        <div class="choice-list">
          <button class="choice-btn ${draft.track === 'dr'   ? 'active' : ''}" onclick="setTrack('dr')">
            <strong>Direct Report</strong><span>Their signals</span>
          </button>
          <button class="choice-btn ${draft.track === 'me'   ? 'active' : ''}" onclick="setTrack('me')">
            <strong>Me</strong><span>My management</span>
          </button>
          <button class="choice-btn ${draft.track === 'both' ? 'active' : ''}" onclick="setTrack('both')">
            <strong>Both</strong><span>Log signals for both</span>
          </button>
        </div>
        <button class="btn-primary${!draft.track ? ' disabled' : ''}" ${!draft.track ? 'disabled' : ''} onclick="nextStep()">Next</button>
      </div>
    `);
    return;
  }

  if (step === 1) {
    render(`
      <div class="screen log">
        <div class="log-header">
          <button class="back-btn" onclick="prevStep()">←</button>
          <span>What came up?</span>
        </div>
        <p class="step-label">Select all that apply</p>
        <div class="domain-list">
          ${DOMAINS.map(d => `
            <button class="domain-btn${draft.domains.includes(d.id) ? ' active' : ''}" onclick="toggleDomain('${d.id}')">
              ${esc(d.label)}
            </button>
          `).join('')}
        </div>
        <button class="btn-primary${!draft.domains.length ? ' disabled' : ''}" ${!draft.domains.length ? 'disabled' : ''} onclick="nextStep()">Next</button>
      </div>
    `);
    return;
  }

  const domainIndex = step - 2;
  if (domainIndex < draft.domains.length) {
    const domainId = draft.domains[domainIndex];
    const domain   = DOMAINS.find(d => d.id === domainId);
    const signals  = domain.signals.filter(s => draft.track === 'both' || s.track === draft.track);
    const entry    = draft.entries.find(e => e.domain === domainId) || { signals: [] };
    const isLast   = domainIndex === draft.domains.length - 1;

    render(`
      <div class="screen log">
        <div class="log-header">
          <button class="back-btn" onclick="prevStep()">←</button>
          <span>${esc(domain.label)}</span>
        </div>
        <p class="step-label">Tap what happened</p>
        <div class="signal-list">
          ${signals.map(s => `
            <button class="signal-btn ${s.pos ? 'pos' : 'neg'}${entry.signals.includes(s.id) ? ' active' : ''}"
              onclick="toggleSignal('${domainId}','${s.id}')">
              <span class="signal-icon">${s.pos ? '↑' : '↓'}</span>
              ${esc(s.label)}
              ${draft.track === 'both' ? `<span class="signal-track">${s.track === 'dr' ? 'them' : 'me'}</span>` : ''}
            </button>
          `).join('')}
        </div>
        <button class="btn-primary" onclick="nextStep()">${isLast ? 'Add note' : 'Next domain'}</button>
      </div>
    `);
    return;
  }

  // Note step
  render(`
    <div class="screen log">
      <div class="log-header">
        <button class="back-btn" onclick="prevStep()">←</button>
        <span>Any notes?</span>
      </div>
      <p class="step-label muted">Optional — one line</p>
      <textarea id="log-note" class="note-input" maxlength="200"
        placeholder="e.g. caught herself and reframed mid-session">${esc(draft.note || '')}</textarea>
      <p id="save-error" class="error hidden"></p>
      <button class="btn-primary" id="save-btn" onclick="saveLog()">Save interaction</button>
    </div>
  `);
}

function viewHistory(data) {
  const grouped = {};
  [...data.interactions].reverse().forEach(i => {
    if (!grouped[i.date]) grouped[i.date] = [];
    grouped[i.date].push(i);
  });

  const rows = Object.entries(grouped).map(([date, items]) => {
    const label = new Date(date + 'T12:00:00')
      .toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
    return `
      <div class="history-day">
        <div class="history-date">${label}</div>
        ${items.map(i => {
          const count = i.entries.reduce((n, e) => n + e.signals.length, 0);
          return `
            <div class="history-item">
              <span class="track-badge ${i.track}">${i.track === 'dr' ? 'Them' : i.track === 'me' ? 'Me' : 'Both'}</span>
              <span class="signal-count">${count} signal${count !== 1 ? 's' : ''}</span>
              ${i.note ? `<span class="history-note">${esc(i.note)}</span>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  render(`
    <div class="screen history">
      <div class="screen-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span>History</span>
      </div>
      <div class="history-list">
        ${rows || '<p class="empty">No interactions logged yet.</p>'}
      </div>
      <nav class="bottom-nav">
        <button class="nav-btn" onclick="goHome()">Home</button>
        <button class="nav-btn active">History</button>
        <button class="nav-btn" onclick="goReport()">Report</button>
      </nav>
    </div>
  `);
}

function viewReport(data) {
  const r        = buildReport(data);
  const text     = formatReport(data);
  const suggested = calcVerdict(data.interactions);

  render(`
    <div class="screen report">
      <div class="screen-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span>Report</span>
      </div>
      <div class="report-verdict">
        <p class="muted small">Day ${r.day} of ${ASSESSMENT_DAYS} · App suggestion</p>
        <div class="verdict-large" style="color:${verdictColor(suggested)}">${verdictLabel(suggested)}</div>
        <p class="muted small">Your verdict</p>
        <div class="verdict-picker">
          ${['growing','not_sure','flag'].map(v => {
            const active = (data.manualVerdict || suggested) === v;
            return `<button class="verdict-option${active ? ' active' : ''}"
              style="${active ? `color:${verdictColor(v)};border-color:${verdictColor(v)}` : ''}"
              onclick="setVerdict('${v}')">${verdictLabel(v)}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="report-body">
        <pre id="report-text" class="report-text">${esc(text)}</pre>
      </div>
      <button class="btn-secondary" onclick="copyReport()">Copy discussion guide</button>
      <nav class="bottom-nav">
        <button class="nav-btn" onclick="goHome()">Home</button>
        <button class="nav-btn" onclick="goHistory()">History</button>
        <button class="nav-btn active">Report</button>
      </nav>
    </div>
  `);
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function doSetup() {
  const pin1  = document.getElementById('pin1').value.trim();
  const pin2  = document.getElementById('pin2').value.trim();
  const token = document.getElementById('gh_token').value.trim();
  const repo  = document.getElementById('gh_repo').value.trim();
  const err   = document.getElementById('setup-error');
  const btn   = document.getElementById('setup-btn');

  function showErr(msg) { err.textContent = msg; err.classList.remove('hidden'); }

  if (pin1.length < 4)   return showErr('PIN must be 4 digits');
  if (pin1 !== pin2)     return showErr('PINs do not match');
  if (!token)            return showErr('GitHub token is required');
  if (!repo.includes('/')) return showErr('Repo format: owner/name');

  err.classList.add('hidden');
  btn.textContent = 'Setting up…';
  btn.disabled = true;

  localStorage.setItem('gh_token', token);
  localStorage.setItem('gh_repo', repo);
  await savePin(pin1);

  try {
    state.data = await loadData();
    goHome();
  } catch (e) {
    showErr('Could not connect to GitHub. Check your token and repo name.');
    btn.textContent = 'Get started';
    btn.disabled = false;
  }
}

let _pin = '';

async function pinKey(key) {
  if (key === '⌫') {
    _pin = _pin.slice(0, -1);
  } else if (_pin.length < 4) {
    _pin += key;
  }

  const dots = document.querySelectorAll('#pin-dots span');
  dots.forEach((d, i) => d.classList.toggle('filled', i < _pin.length));

  if (_pin.length < 4) return;

  const ok = await checkPin(_pin);
  _pin = '';
  dots.forEach(d => d.classList.remove('filled'));

  if (ok) {
    state.data = await loadData();
    goHome();
  } else {
    const errEl = document.getElementById('lock-error');
    if (errEl) {
      errEl.classList.remove('hidden');
      setTimeout(() => errEl.classList.add('hidden'), 1600);
    }
  }
}

function startLog() {
  state.draft = { track: null, domains: [], entries: [], note: '' };
  state.step  = 0;
  viewLog();
}

function setTrack(track) {
  state.draft.track = track;
  viewLog();
}

function toggleDomain(id) {
  const d = state.draft.domains;
  const i = d.indexOf(id);
  i >= 0 ? d.splice(i, 1) : d.push(id);
  viewLog();
}

function toggleSignal(domainId, signalId) {
  let entry = state.draft.entries.find(e => e.domain === domainId);
  if (!entry) {
    entry = { domain: domainId, signals: [] };
    state.draft.entries.push(entry);
  }
  const i = entry.signals.indexOf(signalId);
  i >= 0 ? entry.signals.splice(i, 1) : entry.signals.push(signalId);
  viewLog();
}

function nextStep() { state.step++; viewLog(); }
function prevStep() { state.step = Math.max(0, state.step - 1); viewLog(); }

async function saveLog() {
  state.draft.note = (document.getElementById('log-note') || {}).value || '';

  const btn  = document.getElementById('save-btn');
  const errEl = document.getElementById('save-error');
  btn.textContent = 'Saving…';
  btn.disabled = true;

  const interaction = {
    id:      Date.now().toString(),
    date:    new Date().toISOString().split('T')[0],
    track:   state.draft.track,
    entries: state.draft.entries.filter(e => e.signals.length > 0),
    note:    state.draft.note,
  };

  state.data.interactions.push(interaction);

  try {
    await saveData(state.data);
    goHome();
  } catch {
    errEl.textContent = 'Saved locally. Will sync when back online.';
    errEl.classList.remove('hidden');
    btn.textContent = 'Go home';
    btn.disabled = false;
    btn.onclick = goHome;
  }
}

async function setVerdict(v) {
  state.data.manualVerdict = v;
  await saveData(state.data);
  viewReport(state.data);
}

async function copyReport() {
  const text = (document.getElementById('report-text') || {}).textContent || '';
  const btn  = document.querySelector('.btn-secondary');
  try {
    await navigator.clipboard.writeText(text);
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy discussion guide'; }, 1500); }
  } catch {
    alert(text);
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

function goHome()    { state.view = 'home';    viewHome(state.data); }
function goHistory() { state.view = 'history'; viewHistory(state.data); }
function goReport()  { state.view = 'report';  viewReport(state.data); }

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  if (!isSetup()) {
    viewSetup();
  } else {
    viewLock();
  }
}

document.addEventListener('DOMContentLoaded', init);
