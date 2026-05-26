import { getBookmarkModel } from './bookmarks.js';
import { renderGrid, renderSearchResults, makeBookmarkTile } from './render.js';
import { filterBookmarks } from './search.js';
import { initTheme, cycleTheme } from './theme.js';

const grid          = document.getElementById('grid');
const emptyState    = document.getElementById('empty-state');
const searchInput   = document.getElementById('search');
const searchClear   = document.getElementById('search-clear');
const themeToggle   = document.getElementById('theme-toggle');
const overlay       = document.getElementById('folder-overlay');
const overlayTitle  = document.getElementById('overlay-title');
const overlayGrid   = document.getElementById('overlay-grid');
const overlayClose  = document.getElementById('overlay-close');
const overlayBg     = document.getElementById('overlay-backdrop');

let model = { items: [], flatIndex: [] };
let overlayOpen = false;

// ── Boot ───────────────────────────────────────────────
async function boot() {
  // Theme first — minimize any color flash
  initTheme();

  try {
    model = await getBookmarkModel();
  } catch (err) {
    console.error('[Bookmark Home] Failed to load bookmarks:', err);
  }

  if (!model.items.length) {
    emptyState.hidden = false;
  } else {
    renderGrid(grid, model.items, openFolder);
  }

  searchInput.focus({ preventScroll: true });
}

// ── Search ─────────────────────────────────────────────
let searchTimeout;

searchInput.addEventListener('input', () => {
  const q = searchInput.value;
  searchClear.hidden = !q;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => applySearch(q), 80);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    clearSearch();
    return;
  }
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (!q) return;
    const results = filterBookmarks(model.flatIndex, q);
    if (results[0]) window.location.href = results[0].url;
  }
});

searchClear.addEventListener('click', clearSearch);

function applySearch(q) {
  if (!q.trim()) {
    renderGrid(grid, model.items, openFolder);
    return;
  }
  const results = filterBookmarks(model.flatIndex, q);
  renderSearchResults(grid, results);
}

function clearSearch() {
  searchInput.value = '';
  searchClear.hidden = true;
  renderGrid(grid, model.items, openFolder);
  searchInput.focus({ preventScroll: true });
}

// Focus search on "/" key (when not already focused)
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus({ preventScroll: true });
    searchInput.select();
  }
  if (e.key === 'Escape' && overlayOpen) {
    closeFolder();
  }
});

// ── Folder overlay ─────────────────────────────────────
function openFolder(folder) {
  overlayTitle.textContent = folder.title;
  overlayGrid.innerHTML = '';

  // Lazy-render folder contents
  const frag = document.createDocumentFragment();
  for (const child of folder.children) {
    frag.appendChild(makeBookmarkTile(child));
  }
  overlayGrid.appendChild(frag);

  overlay.classList.remove('hidden');
  // Trigger transition on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => overlay.classList.add('open'));
  });

  overlayOpen = true;
  overlayClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeFolder() {
  overlay.classList.remove('open');
  overlayOpen = false;
  document.body.style.overflow = '';

  // Hide after transition completes
  overlay.addEventListener('transitionend', () => {
    overlay.classList.add('hidden');
    overlayGrid.innerHTML = '';
  }, { once: true });
}

overlayClose.addEventListener('click', closeFolder);
overlayBg.addEventListener('click', closeFolder);

// ── Theme ──────────────────────────────────────────────
themeToggle.addEventListener('click', cycleTheme);

// ── Start ──────────────────────────────────────────────
boot();
