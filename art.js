'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'berto_studio_v1';
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt/';

const STYLES = [
  { id: 'none',       label: 'Free',        suffix: '' },
  { id: 'photo',      label: 'Photo',       suffix: ', photorealistic, professional photography, 8k, highly detailed, sharp focus' },
  { id: 'watercolor', label: 'Watercolor',  suffix: ', beautiful watercolor painting, soft wet brushstrokes, artistic, paper texture' },
  { id: 'oil',        label: 'Oil Paint',   suffix: ', oil painting on canvas, impasto texture, classical fine art, rich color palette' },
  { id: 'anime',      label: 'Anime',       suffix: ', high quality anime illustration, vibrant colors, detailed character art' },
  { id: 'cyberpunk',  label: 'Cyberpunk',   suffix: ', cyberpunk aesthetic, neon lights, rain-soaked streets, futuristic city, dark atmosphere' },
  { id: 'abstract',   label: 'Abstract',    suffix: ', abstract expressionism, bold dynamic brushstrokes, vibrant colors, modern art' },
  { id: 'sketch',     label: 'Sketch',      suffix: ', detailed pencil sketch, fine linework, graphite on paper, hatching' },
  { id: 'fantasy',    label: 'Fantasy',     suffix: ', epic fantasy art, magical atmosphere, ethereal glow, detailed concept art' },
  { id: 'minimal',    label: 'Minimal',     suffix: ', minimalist art, clean lines, negative space, elegant simplicity, flat design' },
  { id: 'retro',      label: 'Retro',       suffix: ', retro vintage aesthetic, synthwave colors, 80s nostalgia, warm tones' },
  { id: 'dark',       label: 'Dark Art',    suffix: ', dark fantasy, gothic atmosphere, dramatic chiaroscuro lighting, moody' },
];

const RATIOS = [
  { id: 'square',    label: '1:1',   w: 1024, h: 1024 },
  { id: 'portrait',  label: '4:5',   w: 896,  h: 1120 },
  { id: 'landscape', label: '3:2',   w: 1152, h: 768  },
  { id: 'wide',      label: '16:9',  w: 1280, h: 720  },
];

const SURPRISE_PROMPTS = [
  'A majestic dragon soaring above ancient snow-capped mountain peaks at golden hour',
  'Bioluminescent deep-sea creatures drifting through a midnight ocean',
  'A solitary figure standing at the edge of a neon-lit futuristic city in the rain',
  'Ancient library with floating books and warm golden light beams piercing through dust',
  'Cherry blossom petals swirling around a weathered Japanese temple at dusk',
  'A cosmic garden where galaxies bloom like flowers across the night sky',
  'Underwater ruins of a forgotten civilization, exotic coral and marine life everywhere',
  'A lone wolf howling at a shimmering aurora borealis over a frozen lake',
  'Steampunk clockwork city floating above clouds at a breathtaking sunset',
  'A witches cottage nestled deep in an enchanted glowing forest at midnight',
  'Translucent crystals growing from the ocean floor, pulsing with inner violet light',
  'A dreamlike landscape where geometric shapes float silently in soft pastel skies',
  'Portrait of a futuristic samurai in neon-lit armor standing in a rainy alley',
  'A winding path through a forest of giant luminescent mushrooms at twilight',
  'The surface of an alien desert planet as twin moons rise on the horizon',
  'A child launching a paper boat on a river of stars',
  'An old lighthouse on a cliff, surrounded by a raging storm of purple lightning',
  'A fox with nine tails standing in a field of moonlit silver grass',
];

// ─── State ────────────────────────────────────────────────────────────────────

let state = {
  view: 'gallery',     // create | gallery | piece | loading
  pieces: [],
  style: 'none',
  ratio: 'square',
  prompt: '',
  generating: false,
  loadingPrompt: '',
  viewingPiece: null,
};

// ─── Data ─────────────────────────────────────────────────────────────────────

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      state.pieces = Array.isArray(d.pieces) ? d.pieces : [];
    }
  } catch (_) {
    state.pieces = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pieces: state.pieces }));
}

function buildImageUrl(prompt, styleId, ratioId, seed) {
  const s = STYLES.find(x => x.id === styleId) || STYLES[0];
  const r = RATIOS.find(x => x.id === ratioId) || RATIOS[0];
  const full = (prompt + s.suffix).trim();
  const encoded = encodeURIComponent(full);
  return `${POLLINATIONS_BASE}${encoded}?width=${r.w}&height=${r.h}&nologo=true&model=flux&seed=${seed}`;
}

function randSeed() {
  return Math.floor(Math.random() * 9999999);
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.view === 'loading') {
    app.appendChild(buildLoading());
  } else if (state.view === 'piece') {
    app.appendChild(buildPieceView());
  } else {
    if (state.view === 'create') app.appendChild(buildCreate());
    else if (state.view === 'gallery') app.appendChild(buildGallery());
    app.appendChild(buildNav());
  }
}

// ── Create Screen ────────────────────────────────────────────────────────────

function buildCreate() {
  const wrap = el('div', 'screen create-screen');

  // Header
  const header = el('div', 'screen-header');
  const title = el('div', 'header-title', 'Studio');
  const surpriseBtn = el('button', 'btn-surprise');
  surpriseBtn.id = 'btnSurprise';
  surpriseBtn.innerHTML = '<span class="surprise-star">✦</span> Surprise me';
  header.appendChild(title);
  header.appendChild(surpriseBtn);
  wrap.appendChild(header);

  // Scrollable content
  const content = el('div', 'create-content');

  // Prompt section
  const promptSection = el('div', 'prompt-section');
  const textarea = el('textarea', 'prompt-input');
  textarea.id = 'promptInput';
  textarea.placeholder = 'Describe your vision…';
  textarea.value = state.prompt;
  textarea.maxLength = 500;
  promptSection.appendChild(textarea);
  const charCount = el('div', 'char-count');
  charCount.id = 'charCount';
  charCount.textContent = `${state.prompt.length} / 500`;
  promptSection.appendChild(charCount);
  content.appendChild(promptSection);

  // Style section
  const styleSection = el('div', 'section');
  styleSection.appendChild(el('div', 'section-label', 'Style'));
  const styleScroll = el('div', 'style-scroll');
  STYLES.forEach(s => {
    const btn = el('button', 'style-chip' + (state.style === s.id ? ' active' : ''));
    btn.dataset.styleId = s.id;
    btn.textContent = s.label;
    styleScroll.appendChild(btn);
  });
  styleSection.appendChild(styleScroll);
  content.appendChild(styleSection);

  // Ratio section
  const ratioSection = el('div', 'section');
  ratioSection.appendChild(el('div', 'section-label', 'Aspect Ratio'));
  const ratioRow = el('div', 'ratio-row');
  RATIOS.forEach(r => {
    const btn = el('button', 'ratio-btn' + (state.ratio === r.id ? ' active' : ''));
    btn.dataset.ratioId = r.id;
    const maxDim = Math.max(r.w, r.h);
    const scale = 32 / maxDim;
    const pw = Math.round(r.w * scale);
    const ph = Math.round(r.h * scale);
    btn.innerHTML = `
      <div class="ratio-icon-wrap">
        <div class="ratio-icon" style="width:${pw}px;height:${ph}px"></div>
      </div>
      <div class="ratio-label">${r.label}</div>
    `;
    ratioRow.appendChild(btn);
  });
  ratioSection.appendChild(ratioRow);
  content.appendChild(ratioSection);

  wrap.appendChild(content);

  // Sticky footer with generate button
  const footer = el('div', 'create-footer');
  const genBtn = el('button', 'btn-generate');
  genBtn.id = 'btnGenerate';
  genBtn.innerHTML = '<span class="gen-star">✦</span> Generate';
  footer.appendChild(genBtn);
  wrap.appendChild(footer);

  return wrap;
}

// ── Loading Screen ───────────────────────────────────────────────────────────

function buildLoading() {
  const wrap = el('div', 'screen loading-screen');

  const inner = el('div', 'loading-inner');

  const orb = el('div', 'loading-orb');
  orb.innerHTML = `
    <div class="orb-ring r1"></div>
    <div class="orb-ring r2"></div>
    <div class="orb-ring r3"></div>
    <div class="orb-core">✦</div>
  `;
  inner.appendChild(orb);

  const label = el('div', 'loading-label', 'Creating your masterpiece…');
  inner.appendChild(label);

  const promptPreview = el('div', 'loading-prompt', state.loadingPrompt);
  inner.appendChild(promptPreview);

  const hint = el('div', 'loading-hint', 'This can take 15–30 seconds');
  inner.appendChild(hint);

  wrap.appendChild(inner);
  return wrap;
}

// ── Gallery Screen ───────────────────────────────────────────────────────────

function buildGallery() {
  const wrap = el('div', 'screen gallery-screen');

  const header = el('div', 'screen-header');
  header.appendChild(el('div', 'header-title', 'Gallery'));
  const countEl = el('div', 'header-count');
  countEl.textContent = state.pieces.length === 0
    ? ''
    : `${state.pieces.length} piece${state.pieces.length !== 1 ? 's' : ''}`;
  header.appendChild(countEl);
  wrap.appendChild(header);

  const scrollArea = el('div', 'gallery-scroll');

  if (state.pieces.length === 0) {
    const empty = el('div', 'empty-state');
    empty.innerHTML = `
      <div class="empty-orb">✦</div>
      <div class="empty-title">Your gallery is empty</div>
      <div class="empty-sub">Create your first piece in the Studio tab</div>
    `;
    scrollArea.appendChild(empty);
  } else {
    const grid = el('div', 'gallery-grid');
    [...state.pieces].reverse().forEach(piece => {
      const card = el('div', 'gallery-card');
      card.dataset.pieceId = piece.id;

      const imgWrap = el('div', 'gallery-thumb');
      const ratioData = RATIOS.find(r => r.id === piece.ratio) || RATIOS[0];
      imgWrap.style.paddingBottom = `${(ratioData.h / ratioData.w) * 100}%`;

      const img = el('img', 'gallery-img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = piece.url;
      img.alt = piece.prompt;
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);

      const caption = el('div', 'gallery-caption', piece.prompt);
      card.appendChild(caption);

      grid.appendChild(card);
    });
    scrollArea.appendChild(grid);
  }

  wrap.appendChild(scrollArea);
  return wrap;
}

// ── Single Piece View ────────────────────────────────────────────────────────

function buildPieceView() {
  const piece = state.viewingPiece;
  if (!piece) { state.view = 'gallery'; renderApp(); return el('div'); }

  const wrap = el('div', 'piece-screen');

  // Top bar
  const topBar = el('div', 'piece-topbar');
  const backBtn = el('button', 'btn-back');
  backBtn.id = 'btnBack';
  backBtn.innerHTML = '← Back';
  topBar.appendChild(backBtn);
  wrap.appendChild(topBar);

  // Image
  const imgWrap = el('div', 'piece-img-wrap');
  const ratioData = RATIOS.find(r => r.id === piece.ratio) || RATIOS[0];
  const img = el('img', 'piece-img');
  img.src = piece.url;
  img.alt = piece.prompt;
  img.style.aspectRatio = `${ratioData.w} / ${ratioData.h}`;
  imgWrap.appendChild(img);
  wrap.appendChild(imgWrap);

  // Bottom sheet
  const sheet = el('div', 'piece-sheet');

  const promptText = el('p', 'piece-prompt', piece.prompt);
  sheet.appendChild(promptText);

  const styleLbl = STYLES.find(s => s.id === piece.style)?.label || 'Free';
  const ratioLbl = RATIOS.find(r => r.id === piece.ratio)?.label || '1:1';
  const meta = el('div', 'piece-meta');
  meta.innerHTML = `
    <span class="meta-chip">${styleLbl}</span>
    <span class="meta-chip">${ratioLbl}</span>
    <span class="meta-chip">${piece.created}</span>
  `;
  sheet.appendChild(meta);

  const actions = el('div', 'piece-actions');

  const downloadBtn = el('button', 'btn-action');
  downloadBtn.id = 'btnDownload';
  downloadBtn.innerHTML = '↓ Save';
  actions.appendChild(downloadBtn);

  const remixBtn = el('button', 'btn-action');
  remixBtn.id = 'btnRemix';
  remixBtn.innerHTML = '↺ Remix';
  actions.appendChild(remixBtn);

  const deleteBtn = el('button', 'btn-action btn-danger');
  deleteBtn.id = 'btnDelete';
  deleteBtn.innerHTML = '✕ Delete';
  actions.appendChild(deleteBtn);

  sheet.appendChild(actions);
  wrap.appendChild(sheet);

  return wrap;
}

// ── Bottom Nav ───────────────────────────────────────────────────────────────

function buildNav() {
  const nav = el('nav', 'bottom-nav');
  nav.innerHTML = `
    <button class="nav-btn ${state.view === 'create' ? 'active' : ''}" data-nav="create">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
      <span class="nav-label">Create</span>
    </button>
    <button class="nav-btn ${state.view === 'gallery' ? 'active' : ''}" data-nav="gallery">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
      <span class="nav-label">Gallery</span>
    </button>
  `;
  return nav;
}

// ─── Event Handling ───────────────────────────────────────────────────────────

document.addEventListener('click', async e => {
  // Bottom nav
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) {
    state.view = navBtn.dataset.nav;
    renderApp();
    return;
  }

  // Style chip
  const styleChip = e.target.closest('[data-style-id]');
  if (styleChip) {
    state.style = styleChip.dataset.styleId;
    renderApp();
    // Restore prompt after re-render
    const input = document.getElementById('promptInput');
    if (input) input.focus();
    return;
  }

  // Ratio button
  const ratioBtn = e.target.closest('[data-ratio-id]');
  if (ratioBtn) {
    state.ratio = ratioBtn.dataset.ratioId;
    renderApp();
    return;
  }

  // Surprise me
  if (e.target.closest('#btnSurprise')) {
    const idx = Math.floor(Math.random() * SURPRISE_PROMPTS.length);
    state.prompt = SURPRISE_PROMPTS[idx];
    state.style = STYLES[Math.floor(Math.random() * (STYLES.length - 1)) + 1].id;
    state.ratio = RATIOS[Math.floor(Math.random() * RATIOS.length)].id;
    renderApp();
    const input = document.getElementById('promptInput');
    if (input) input.focus();
    return;
  }

  // Generate
  if (e.target.closest('#btnGenerate')) {
    const input = document.getElementById('promptInput');
    const prompt = (input ? input.value : state.prompt).trim();
    if (!prompt) {
      const section = document.querySelector('.prompt-section');
      section?.classList.add('shake');
      setTimeout(() => section?.classList.remove('shake'), 500);
      return;
    }
    state.prompt = prompt;
    await doGenerate(prompt, state.style, state.ratio);
    return;
  }

  // Gallery card
  const card = e.target.closest('.gallery-card');
  if (card) {
    const piece = state.pieces.find(p => p.id === card.dataset.pieceId);
    if (piece) {
      state.viewingPiece = piece;
      state.view = 'piece';
      renderApp();
    }
    return;
  }

  // Back button
  if (e.target.closest('#btnBack')) {
    state.view = 'gallery';
    state.viewingPiece = null;
    renderApp();
    return;
  }

  // Download
  if (e.target.closest('#btnDownload')) {
    if (state.viewingPiece) await doDownload(state.viewingPiece);
    return;
  }

  // Remix
  if (e.target.closest('#btnRemix')) {
    const piece = state.viewingPiece;
    if (piece) {
      state.prompt = piece.prompt;
      state.style = piece.style;
      state.ratio = piece.ratio;
      state.view = 'create';
      state.viewingPiece = null;
      renderApp();
    }
    return;
  }

  // Delete
  if (e.target.closest('#btnDelete')) {
    const piece = state.viewingPiece;
    if (piece) {
      state.pieces = state.pieces.filter(p => p.id !== piece.id);
      saveData();
      state.view = 'gallery';
      state.viewingPiece = null;
      renderApp();
    }
    return;
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'promptInput') {
    state.prompt = e.target.value;
    const counter = document.getElementById('charCount');
    if (counter) counter.textContent = `${state.prompt.length} / 500`;
  }
});

// ─── Actions ──────────────────────────────────────────────────────────────────

async function doGenerate(prompt, styleId, ratioId) {
  if (state.generating) return;

  state.generating = true;
  state.loadingPrompt = prompt;
  state.view = 'loading';
  renderApp();

  const seed = randSeed();
  const url = buildImageUrl(prompt, styleId, ratioId, seed);

  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const piece = {
      id: `${Date.now()}-${seed}`,
      prompt,
      style: styleId,
      ratio: ratioId,
      url,
      seed,
      created: new Date().toISOString().split('T')[0],
    };

    state.pieces.push(piece);
    saveData();

    state.viewingPiece = piece;
    state.view = 'piece';
    state.generating = false;
    renderApp();

  } catch (_) {
    state.generating = false;
    state.view = 'create';
    renderApp();
    showToast('Generation failed — please try again');
  }
}

async function doDownload(piece) {
  try {
    const res = await fetch(piece.url);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = `studio-${piece.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objUrl);
    showToast('Saved to downloads');
  } catch (_) {
    window.open(piece.url, '_blank');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = el('div', 'toast', msg);
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadData();
renderApp();
