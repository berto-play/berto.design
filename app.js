'use strict';

// ── Ratings ───────────────────────────────────────────────────────────────────

const RATINGS = ['Not yet', 'Developing', 'Solid', 'Strong'];

const RC = {
  'Not yet':    { text: '#ff453a', bg: 'rgba(255,69,58,0.12)',   dot: '#ff453a' },
  'Developing': { text: '#ffd60a', bg: 'rgba(255,214,10,0.12)',  dot: '#ffd60a' },
  'Solid':      { text: '#0a84ff', bg: 'rgba(10,132,255,0.12)',  dot: '#0a84ff' },
  'Strong':     { text: '#30d158', bg: 'rgba(48,209,88,0.12)',   dot: '#30d158' },
};

// ── Subjects ──────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: 'dr',   role: 'Direct Report' },
  { id: 'me',   role: '360 Self'      },
  { id: 'pm',   role: 'PM'            },
  { id: 'boss', role: 'Leadership'    },
];

// ── Criteria ──────────────────────────────────────────────────────────────────

const CRITERIA = {
  dr: [
    { id: 'framing', area: 'Problem Framing',
      question: 'Are they framing before executing?',
      signals: ['Defined requirements before opening tools', 'Asked clarifying questions first', 'Stayed in problem space before proposing solutions'] },
    { id: 'execution', area: 'Design Execution',
      question: 'Are they executing well within given scope?',
      signals: ['Strong attention to detail and precision', 'Stayed within the given frame', 'Delivered to brief without deviation'] },
    { id: 'presentation', area: 'Presentation & Reviews',
      question: 'Are they presenting work effectively?',
      signals: ['Led with insight, not a research dump', 'Structured the narrative clearly', 'Kept the room engaged'] },
    { id: 'feedback', area: 'Feedback Reception',
      question: 'Are they receiving and applying feedback?',
      signals: ['Received feedback without defensiveness', 'Applied it in the next session', 'Did not repeat the same pattern after feedback'] },
    { id: 'workload', area: 'Workload Management',
      question: 'Are they handling scope independently?',
      signals: ['Handled complexity without hand-holding', 'Did not get lost in the weeds', 'Delivered without needing to be pulled back in'] },
  ],

  me: [
    { id: 'speed', area: 'Speed & Output',
      question: 'Am I moving fast enough?',
      signals: ['Design is ahead of tech delivery', 'Features move to dev-ready without delays', 'I prototype fast instead of over-researching'] },
    { id: 'process', area: 'Process Ownership',
      question: 'Am I running reviews with structure?',
      signals: ['I set the agenda before every review', 'I come with a point of view, not just an update', 'Every review ends with one decision made'] },
    { id: 'proactive', area: 'Proactiveness',
      question: 'Am I driving the work or waiting to be told?',
      signals: ['I identify what the team needs before they ask', 'I kick off features with clear framing', 'I do not wait for a complete brief before acting'] },
    { id: 'clarity', area: 'Demanding Clarity',
      question: 'Am I naming blockers and demanding inputs?',
      signals: ['I flag blockers out loud, not silently absorb them', 'Design does not start without user stories', 'I tell stakeholders directly what I need'] },
    { id: 'dr_read', area: 'Direct Report Verdict',
      question: 'Do I have a clear read on my direct report?',
      signals: ['I give direct, honest feedback without softening it', 'I lead by example in sessions they attend', 'I can give leadership a clear growing or not verdict'] },
    { id: 'challenge', area: 'Product Challenge',
      question: 'Am I pushing back when something is off?',
      signals: ['I use experience to question the thinking', 'I name when something does not make sense', 'I challenge scope before committing to designing'] },
    { id: 'stakeholders', area: 'Right Stakeholders',
      question: 'Am I using the right people for the right things?',
      signals: ['Domain questions go to domain experts', 'Systems questions go to the systems lead', 'I only pull leadership in for decisions, not context'] },
    { id: 'lines', area: 'Blurred Lines',
      question: 'Am I clear on where design ends and product starts?',
      signals: ['I name when something is a product call vs a design call', 'I do not absorb product work without flagging it', 'I empower my direct report based on their strengths'] },
  ],

  pm: [
    { id: 'briefs', area: 'Brief Quality',
      question: 'Are briefs clear and complete before design starts?',
      signals: ['User stories delivered before design opens', 'Requirements are specific and actionable', 'Scope is defined, not open-ended'] },
    { id: 'timing', area: 'Timeliness',
      question: 'Are inputs arriving when needed?',
      signals: ['No design delays caused by missing PM inputs', 'Deadlines respected on their side', 'Advance notice given when things change'] },
    { id: 'unblocking', area: 'Unblocking',
      question: 'Are they removing blockers quickly?',
      signals: ['Responds to questions same day', 'Does not leave design stuck waiting', 'Gets decisions made without escalation'] },
    { id: 'priority', area: 'Prioritisation',
      question: 'Are priorities clear and stable?',
      signals: ['Clear on what is next and why', 'No sudden switches without explanation', 'Team is aligned on the roadmap'] },
    { id: 'pm_align', area: 'Alignment',
      question: 'Are PM and design in sync?',
      signals: ['No scope creep introduced without flagging', 'Decisions are documented and shared', 'Shows up to reviews prepared'] },
  ],

  boss: [
    { id: 'expectations', area: 'Clarity of Expectations',
      question: 'Do I know what is expected of me?',
      signals: ['Feedback is specific and actionable', 'I know how I am being assessed', 'I am not guessing what good looks like'] },
    { id: 'feedback_q', area: 'Quality of Feedback',
      question: 'Is feedback useful and direct?',
      signals: ['Feedback names the actual issue, not a symptom', 'I can act on it immediately', 'It is honest, not softened to disappear'] },
    { id: 'decisions', area: 'Decision Support',
      question: 'Are decisions being made when needed?',
      signals: ['I am not stuck waiting for a call from leadership', 'Direction is given once and clearly', 'Ambiguity is resolved, not parked'] },
    { id: 'access', area: 'Access & Availability',
      question: 'Can I get time with leadership when needed?',
      signals: ['I can raise a concern and get a response', 'I am not blocked by unavailability', 'Context is given proactively, not after the fact'] },
    { id: 'strategic', area: 'Strategic Alignment',
      question: 'Are we on the same page about direction?',
      signals: ['I understand the bigger picture they are working in', 'No surprise pivots without context', 'I feel informed enough to make calls independently'] },
  ],
};

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  view: 'lock',
  data: null,
  draft: null,   // { subject, ratings: {areaId: rating}, note, expanded: id|null }
  reportTab: 'dr',
};

// ── Auth ──────────────────────────────────────────────────────────────────────

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('log-v1-' + pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function savePin(pin) { localStorage.setItem('pin_hash', await hashPin(pin)); }
async function checkPin(pin) {
  const s = localStorage.getItem('pin_hash');
  return !!s && s === await hashPin(pin);
}
function isLocalMode() { return !localStorage.getItem('gh_token'); }
function isSetup() { return !!localStorage.getItem('pin_hash'); }

// ── GitHub ────────────────────────────────────────────────────────────────────

function ghHeaders() {
  return {
    'Authorization': `token ${localStorage.getItem('gh_token')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
  };
}
function ghRepo() { return localStorage.getItem('gh_repo') || 'berto-play/berto-log-data'; }

async function ghRead() {
  const res = await fetch(`https://api.github.com/repos/${ghRepo()}/contents/data.json`, { headers: ghHeaders() });
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) throw new Error('GitHub read failed: ' + res.status);
  const file = await res.json();
  return { data: JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))))), sha: file.sha };
}

async function ghWrite(data, sha) {
  const body = { message: 'log update', content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))) };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${ghRepo()}/contents/data.json`,
    { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error('GitHub write failed: ' + res.status);
  const result = await res.json();
  localStorage.setItem('gh_sha', result.content.sha);
}

// ── Data ──────────────────────────────────────────────────────────────────────

function getLabels() {
  try { return JSON.parse(localStorage.getItem('labels') || '{}'); } catch { return {}; }
}

function subjectLabel(id) {
  return getLabels()[id] || SUBJECTS.find(s => s.id === id)?.role || id;
}

function emptyData() {
  return { sessions: [], pendingSync: false };
}

async function loadData() {
  try {
    const { data, sha } = await ghRead();
    if (data) {
      if (sha) localStorage.setItem('gh_sha', sha);
      // migrate old format
      const normalised = data.sessions ? data : { sessions: [], pendingSync: false };
      localStorage.setItem('data', JSON.stringify(normalised));
      return normalised;
    }
    const fresh = emptyData();
    await ghWrite(fresh, null);
    localStorage.setItem('data', JSON.stringify(fresh));
    return fresh;
  } catch {
    const local = localStorage.getItem('data');
    if (local) {
      const parsed = JSON.parse(local);
      return parsed.sessions ? parsed : emptyData();
    }
    return emptyData();
  }
}

async function saveData(data) {
  localStorage.setItem('data', JSON.stringify(data));
  if (isLocalMode()) return;
  try {
    await ghWrite(data, localStorage.getItem('gh_sha'));
    data.pendingSync = false;
    localStorage.setItem('data', JSON.stringify(data));
  } catch {
    data.pendingSync = true;
    localStorage.setItem('data', JSON.stringify(data));
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function daysLogged(sessions) {
  return new Set(sessions.map(s => s.date)).size;
}

function calcVerdict(ratings) {
  const vals = Object.values(ratings).filter(Boolean);
  if (vals.length < 2) return null;
  const avg = vals.reduce((sum, r) => sum + RATINGS.indexOf(r), 0) / vals.length;
  return avg >= 2.0 ? 'growing' : avg >= 1.0 ? 'not_sure' : 'flag';
}

function verdictLabel(v) {
  return { growing: 'Growing', not_sure: 'Not Sure', flag: 'Flag a Concern' }[v] || '—';
}

function verdictColor(v) {
  return { growing: 'var(--green)', not_sure: 'var(--yellow)', flag: 'var(--red)' }[v] || 'var(--text2)';
}

function latestSession(sessions, subjectId) {
  return [...sessions].reverse().find(s => s.subject === subjectId) || null;
}

function patternByArea(sessions, subjectId) {
  const counts = {};
  sessions.filter(s => s.subject === subjectId).forEach(s => {
    Object.entries(s.ratings).forEach(([area, rating]) => {
      if (!rating) return;
      if (!counts[area]) counts[area] = {};
      counts[area][rating] = (counts[area][rating] || 0) + 1;
    });
  });
  const dominant = {};
  Object.entries(counts).forEach(([area, tally]) => {
    dominant[area] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  });
  return dominant;
}

// ── Report ────────────────────────────────────────────────────────────────────

function buildDiscussionGuide(data, subjectId) {
  const label    = subjectLabel(subjectId);
  const sessions = data.sessions.filter(s => s.subject === subjectId);
  const latest   = latestSession(data.sessions, subjectId);
  const pattern  = patternByArea(data.sessions, subjectId);
  const criteria = CRITERIA[subjectId];
  const verdict  = latest ? calcVerdict(latest.ratings) : null;

  let t = '';
  t += `Subject: ${label} (${SUBJECTS.find(s => s.id === subjectId)?.role})\n`;
  t += `Sessions logged: ${sessions.length} across ${new Set(sessions.map(s => s.date)).size} days\n\n`;

  if (subjectId === 'dr') {
    t += `Verdict: ${verdictLabel(verdict)}\n`;
    t += `Here is what I am seeing, right?\n\n`;
  } else if (subjectId === 'me') {
    t += `Self-assessment against expectations:\n\n`;
  } else if (subjectId === 'pm') {
    t += `Accountability record:\n\n`;
  } else {
    t += `Leadership relationship:\n\n`;
  }

  criteria.forEach(c => {
    const dominant = pattern[c.id];
    if (!dominant) return;
    const trend = dominant === 'Strong' || dominant === 'Solid' ? '↑' : dominant === 'Not yet' ? '↓' : '→';
    t += `${trend} ${c.area}: ${dominant}`;
    if (latest?.ratings[c.id] && latest.ratings[c.id] !== dominant) {
      t += ` (last session: ${latest.ratings[c.id]})`;
    }
    t += '\n';
  });

  if (latest?.note) t += `\nNote: ${latest.note}`;

  if (subjectId === 'dr' || subjectId === 'me') {
    t += '\n\nWhat I need from you: [add your ask before this conversation]';
    t += '\nOne thing I am not sure about yet: [name the gap before sharing]';
  }

  if (subjectId === 'pm') {
    const gaps = criteria.filter(c => pattern[c.id] === 'Not yet' || pattern[c.id] === 'Developing').map(c => c.area);
    if (gaps.length) t += `\n\nConsistent gaps: ${gaps.join(', ')}`;
  }

  return t;
}

// ── Export ────────────────────────────────────────────────────────────────────

function downloadReport(text, subjectId) {
  const date  = new Date().toISOString().split('T')[0];
  const label = subjectLabel(subjectId).toLowerCase().replace(/\s+/g, '-');
  const blob  = new Blob([text], { type: 'text/plain' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `log-${label}-${date}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function render(html) { document.getElementById('app').innerHTML = html; }

// ── Views ─────────────────────────────────────────────────────────────────────

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

        <div class="form-divider">Code names</div>
        <p class="field-hint">Use code names — these are stored privately, never in the public code.</p>
        ${SUBJECTS.map(s => `
          <label>${s.role}</label>
          <input type="text" id="label_${s.id}" placeholder="e.g. ${defaultCodeName(s.id)}" autocomplete="off" spellcheck="false">
        `).join('')}

        <div class="form-divider">GitHub sync <span class="optional-label">optional</span></div>
        <label>Personal access token</label>
        <input type="password" id="gh_token" placeholder="ghp_… or github_pat_…" autocomplete="off">
        <p class="field-hint">Skip this to use local-only mode — data stays on this device. Add a token later in Settings to enable cross-device sync.</p>
        <label>Data repo (owner/name)</label>
        <input type="text" id="gh_repo" value="berto-play/berto-log-data" autocomplete="off" spellcheck="false">

        <p id="setup-error" class="error hidden"></p>
        <button class="btn-primary" id="setup-btn" onclick="doSetup()">Get started</button>
        <p class="local-mode-hint muted small">No token? Tap Get started — data saves locally on this device.</p>
      </div>
    </div>
  `);
}

function defaultCodeName(id) {
  return { dr: 'Alpha', me: 'Self', pm: 'Charlie', boss: 'Eagle' }[id] || id;
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
        ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k =>
          `<button class="key${k==='' ? ' invisible' : ''}" onclick="pinKey('${k}')">${k}</button>`
        ).join('')}
      </div>
    </div>
  `);
  window._pin = '';
}

function viewHome(data) {
  const days     = daysLogged(data.sessions);
  const labels   = getLabels();

  render(`
    <div class="screen home">
      <div class="home-header">
        <div class="logo-sm">Log</div>
        <span class="days-badge">${days} day${days !== 1 ? 's' : ''} logged</span>
        ${isLocalMode() ? '<span class="local-badge">Local only</span>' : data.pendingSync ? '<span class="sync-badge">⬆ pending</span>' : ''}
      </div>

      <div class="subject-list">
        ${SUBJECTS.map(s => {
          const latest  = latestSession(data.sessions, s.id);
          const verdict = latest ? calcVerdict(latest.ratings) : null;
          const count   = data.sessions.filter(x => x.subject === s.id).length;
          const label   = labels[s.id] || defaultCodeName(s.id);
          return `
            <div class="subject-card" onclick="startAssess('${s.id}')">
              <div class="subject-card-left">
                <div class="subject-role">${esc(s.role)}</div>
                <div class="subject-name">${esc(label)}</div>
                <div class="subject-meta">${count} session${count !== 1 ? 's' : ''}${latest ? ' · ' + latest.date : ''}</div>
              </div>
              <div class="subject-card-right">
                ${verdict ? `<div class="verdict-chip" style="color:${verdictColor(verdict)};border-color:${verdictColor(verdict)}">${verdictLabel(verdict)}</div>` : '<div class="verdict-chip muted">No data</div>'}
                <div class="add-btn">＋</div>
              </div>
            </div>`;
        }).join('')}
      </div>

      <nav class="bottom-nav">
        <button class="nav-btn active">Home</button>
        <button class="nav-btn" onclick="goHistory()">History</button>
        <button class="nav-btn" onclick="goReport()">Report</button>
        <button class="nav-btn" onclick="goSettings()">Settings</button>
      </nav>
    </div>
  `);
}

function viewAssess(subjectId) {
  const { draft } = state;
  const criteria  = CRITERIA[subjectId];
  const label     = subjectLabel(subjectId);
  const rated     = Object.values(draft.ratings).filter(Boolean).length;
  const pct       = Math.round((rated / criteria.length) * 100);

  render(`
    <div class="screen assess">
      <div class="screen-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <div>
          <div style="font-size:13px;color:var(--text2)">${esc(SUBJECTS.find(s=>s.id===subjectId)?.role)}</div>
          <div style="font-weight:700">${esc(label)}</div>
        </div>
      </div>

      ${rated > 0 ? `
        <div class="progress-row">
          <span class="muted small">${rated} of ${criteria.length} rated</span>
          <span class="muted small">${pct}%</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      ` : ''}

      <div class="accordion-list">
        ${criteria.map(c => {
          const rating  = draft.ratings[c.id];
          const isOpen  = draft.expanded === c.id;
          const col     = rating ? RC[rating] : null;
          return `
            <div class="accordion-card${isOpen ? ' open' : ''}">
              <button class="accordion-head" onclick="toggleCard('${c.id}')">
                <span class="area-dot" style="background:${col ? col.dot : 'var(--border)'}"></span>
                <div class="area-text">
                  <span class="area-name">${esc(c.area)}</span>
                  <span class="area-q">${esc(c.question)}</span>
                </div>
                ${rating ? `<span class="area-rating" style="color:${col.text};background:${col.bg}">${esc(rating)}</span>` : ''}
                <span class="chevron">${isOpen ? '▲' : '▼'}</span>
              </button>
              <div class="accordion-body">
                <p class="signals-label">Signals</p>
                <ul class="signals-list">
                  ${c.signals.map(s => `<li>→ ${esc(s)}</li>`).join('')}
                </ul>
                <p class="signals-label">Rate</p>
                <div class="rating-grid">
                  ${RATINGS.map(r => {
                    const active = rating === r;
                    const rc = RC[r];
                    return `<button class="rating-btn${active ? ' active' : ''}"
                      style="${active ? `color:${rc.text};background:${rc.bg};border-color:${rc.text}` : ''}"
                      onclick="rateArea('${subjectId}','${c.id}','${r}')">${esc(r)}</button>`;
                  }).join('')}
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>

      <textarea id="assess-note" class="note-input" maxlength="200"
        placeholder="Optional note — one line">${esc(draft.note || '')}</textarea>
      <p id="save-error" class="error hidden"></p>
      <button class="btn-primary${rated === 0 ? ' disabled' : ''}" ${rated === 0 ? 'disabled' : ''}
        id="save-btn" onclick="saveAssess('${subjectId}')">Save session</button>
    </div>
  `);
}

function viewHistory(data) {
  const grouped = {};
  [...data.sessions].reverse().forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  const rows = Object.entries(grouped).map(([date, items]) => {
    const label = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
    return `
      <div class="history-day">
        <div class="history-date">${label}</div>
        ${items.map(s => {
          const rated   = Object.values(s.ratings).filter(Boolean).length;
          const verdict = calcVerdict(s.ratings);
          const subj    = SUBJECTS.find(x => x.id === s.subject);
          return `
            <div class="history-item">
              <span class="role-badge">${esc(subj?.role || s.subject)}</span>
              <span class="hist-name">${esc(subjectLabel(s.subject))}</span>
              ${verdict ? `<span class="hist-verdict" style="color:${verdictColor(verdict)}">${verdictLabel(verdict)}</span>` : ''}
              <span class="hist-count muted">${rated} area${rated !== 1 ? 's' : ''}</span>
              <button class="delete-btn" onclick="deleteSession('${s.id}')" title="Delete">✕</button>
              ${s.note ? `<span class="hist-note">${esc(s.note)}</span>` : ''}
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
        ${rows || '<p class="empty">No sessions logged yet.</p>'}
      </div>
      <nav class="bottom-nav">
        <button class="nav-btn" onclick="goHome()">Home</button>
        <button class="nav-btn active">History</button>
        <button class="nav-btn" onclick="goReport()">Report</button>
        <button class="nav-btn" onclick="goSettings()">Settings</button>
      </nav>
    </div>
  `);
}

function viewReport(data) {
  const tab      = state.reportTab;
  const text     = buildDiscussionGuide(data, tab);
  const latest   = latestSession(data.sessions, tab);
  const verdict  = latest ? calcVerdict(latest.ratings) : null;

  render(`
    <div class="screen report">
      <div class="screen-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span>Report</span>
      </div>

      <div class="report-tabs">
        ${SUBJECTS.map(s => `
          <button class="report-tab${tab === s.id ? ' active' : ''}" onclick="switchTab('${s.id}')">
            ${esc(s.role.split(' ')[0])}
          </button>`).join('')}
      </div>

      <div class="report-subject">
        <span class="report-name">${esc(subjectLabel(tab))}</span>
        ${verdict ? `<span class="verdict-chip" style="color:${verdictColor(verdict)};border-color:${verdictColor(verdict)}">${verdictLabel(verdict)}</span>` : ''}
      </div>

      <pre id="report-text" class="report-text">${esc(text)}</pre>

      <div class="export-row">
        <button class="btn-secondary" onclick="doCopy()">Copy</button>
        <button class="btn-secondary" onclick="doDownload()">Download .txt</button>
      </div>
      <button class="btn-danger" style="width:100%;margin-top:8px" onclick="wipeData()">Wipe all data</button>

      <nav class="bottom-nav">
        <button class="nav-btn" onclick="goHome()">Home</button>
        <button class="nav-btn" onclick="goHistory()">History</button>
        <button class="nav-btn active">Report</button>
        <button class="nav-btn" onclick="goSettings()">Settings</button>
      </nav>
    </div>
  `);
}

// ── Actions ───────────────────────────────────────────────────────────────────

async function doSetup() {
  const pin1  = document.getElementById('pin1').value.trim();
  const pin2  = document.getElementById('pin2').value.trim();
  const token = document.getElementById('gh_token').value.trim();
  const repo  = document.getElementById('gh_repo').value.trim();
  const err   = document.getElementById('setup-error');
  const btn   = document.getElementById('setup-btn');

  function showErr(msg) { err.textContent = msg; err.classList.remove('hidden'); }

  if (pin1.length < 4)     return showErr('PIN must be 4 digits');
  if (pin1 !== pin2)       return showErr('PINs do not match');
  if (token && !repo.includes('/')) return showErr('Repo format: owner/name');

  const labels = {};
  SUBJECTS.forEach(s => {
    const val = document.getElementById('label_' + s.id)?.value.trim();
    labels[s.id] = val || defaultCodeName(s.id);
  });

  err.classList.add('hidden');
  btn.textContent = 'Setting up…';
  btn.disabled = true;

  if (token) {
    localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_repo', repo);
  } else {
    localStorage.removeItem('gh_token');
    localStorage.removeItem('gh_repo');
    localStorage.setItem('local_mode', '1');
  }

  localStorage.setItem('labels', JSON.stringify(labels));
  await savePin(pin1);

  try {
    state.data = token ? await loadData() : emptyData();
    if (!token) localStorage.setItem('data', JSON.stringify(state.data));
    goHome();
  } catch {
    showErr('Could not connect to GitHub. Check your token and repo name.');
    btn.textContent = 'Get started';
    btn.disabled = false;
  }
}

async function deleteSession(id) {
  if (!confirm('Delete this session?')) return;
  state.data.sessions = state.data.sessions.filter(s => s.id !== id);
  await saveData(state.data);
  viewHistory(state.data);
}

async function wipeData() {
  if (!confirm('Wipe ALL sessions? This cannot be undone.')) return;
  state.data = emptyData();
  await saveData(state.data);
  goHome();
}

let _pin = '';
async function pinKey(key) {
  if (key === '⌫') { _pin = _pin.slice(0, -1); }
  else if (_pin.length < 4) { _pin += key; }

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
    const e = document.getElementById('lock-error');
    if (e) { e.classList.remove('hidden'); setTimeout(() => e.classList.add('hidden'), 1600); }
  }
}

function startAssess(subjectId) {
  state.draft = { subject: subjectId, ratings: {}, note: '', expanded: null };
  viewAssess(subjectId);
}

function toggleCard(areaId) {
  state.draft.expanded = state.draft.expanded === areaId ? null : areaId;
  viewAssess(state.draft.subject);
}

function rateArea(subjectId, areaId, rating) {
  state.draft.ratings[areaId] = rating;
  state.draft.expanded = null;
  viewAssess(subjectId);
}

async function saveAssess(subjectId) {
  const note  = document.getElementById('assess-note')?.value || '';
  const btn   = document.getElementById('save-btn');
  const errEl = document.getElementById('save-error');

  btn.textContent = 'Saving…';
  btn.disabled = true;

  const session = {
    id:      Date.now().toString(),
    date:    new Date().toISOString().split('T')[0],
    subject: subjectId,
    ratings: { ...state.draft.ratings },
    note,
  };

  state.data.sessions.push(session);

  try {
    await saveData(state.data);
    goHome();
  } catch {
    errEl.textContent = 'Saved locally. Will sync when online.';
    errEl.classList.remove('hidden');
    btn.textContent = 'Go home';
    btn.disabled = false;
    btn.onclick = goHome;
  }
}

function switchTab(id) {
  state.reportTab = id;
  viewReport(state.data);
}

async function doCopy() {
  const text = document.getElementById('report-text')?.textContent || '';
  const btn  = document.querySelectorAll('.btn-secondary')[0];
  try {
    await navigator.clipboard.writeText(text);
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
  } catch { alert(text); }
}

function doDownload() {
  const text = document.getElementById('report-text')?.textContent || '';
  downloadReport(text, state.reportTab);
}

function viewSettings() {
  const labels = getLabels();
  render(`
    <div class="screen setup">
      <div class="screen-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span>Settings</span>
      </div>
      <div class="form">
        <div class="form-divider">Code names</div>
        <p class="field-hint">Update the code names for each subject. Session data is not affected.</p>
        ${SUBJECTS.map(s => `
          <label>${s.role}</label>
          <input type="text" id="label_${s.id}"
            value="${esc(labels[s.id] || defaultCodeName(s.id))}"
            autocomplete="off" spellcheck="false">
        `).join('')}
        <div class="form-divider">GitHub sync</div>
        ${isLocalMode()
          ? `<p class="field-hint">Currently local-only. Add a token to enable cross-device sync.</p>
             <label>Personal access token</label>
             <input type="password" id="settings_token" placeholder="ghp_…" autocomplete="off">
             <label>Data repo (owner/name)</label>
             <input type="text" id="settings_repo" value="berto-play/berto-log-data" autocomplete="off" spellcheck="false">`
          : `<p class="field-hint" style="color:var(--green)">✓ Syncing to GitHub</p>
             <button class="btn-danger" style="margin-top:8px" onclick="disconnectGitHub()">Disconnect GitHub</button>`
        }
        <p id="settings-msg" class="hidden" style="color:var(--green);font-size:14px;margin-top:8px">Saved.</p>
        <button class="btn-primary" onclick="saveSettings()">Save</button>
      </div>
    </div>
  `);
}

function saveSettings() {
  const labels = {};
  SUBJECTS.forEach(s => {
    const val = document.getElementById('label_' + s.id)?.value.trim();
    labels[s.id] = val || defaultCodeName(s.id);
  });
  localStorage.setItem('labels', JSON.stringify(labels));

  // Connect GitHub if token provided in local mode
  if (isLocalMode()) {
    const token = document.getElementById('settings_token')?.value.trim();
    const repo  = document.getElementById('settings_repo')?.value.trim();
    if (token && repo && repo.includes('/')) {
      localStorage.setItem('gh_token', token);
      localStorage.setItem('gh_repo', repo);
      localStorage.removeItem('local_mode');
      // sync existing local data to GitHub
      saveData(state.data);
    }
  }

  const msg = document.getElementById('settings-msg');
  if (msg) { msg.classList.remove('hidden'); setTimeout(() => { msg.classList.add('hidden'); viewSettings(); }, 1200); }
}

function disconnectGitHub() {
  if (!confirm('Disconnect GitHub? Data stays on this device but will no longer sync.')) return;
  localStorage.removeItem('gh_token');
  localStorage.removeItem('gh_repo');
  localStorage.removeItem('gh_sha');
  localStorage.setItem('local_mode', '1');
  viewSettings();
}

// ── Router ────────────────────────────────────────────────────────────────────

function goHome()     { state.view = 'home';     viewHome(state.data); }
function goHistory()  { state.view = 'history';  viewHistory(state.data); }
function goReport()   { state.view = 'report';   viewReport(state.data); }
function goSettings() { state.view = 'settings'; viewSettings(); }

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  isSetup() ? viewLock() : viewSetup();
}

document.addEventListener('DOMContentLoaded', init);
