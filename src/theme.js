const THEMES = ['auto', 'light', 'dark'];
let current = 'auto';

function getIcons() {
  return {
    auto:  document.getElementById('icon-auto'),
    light: document.getElementById('icon-light'),
    dark:  document.getElementById('icon-dark'),
  };
}

function applyTheme(theme) {
  const icons = getIcons();

  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Swap visible icon
  for (const [key, el] of Object.entries(icons)) {
    if (el) el.hidden = key !== theme;
  }

  // Mirror to localStorage so the anti-flash inline script can read it sync
  try { localStorage.setItem('bh-theme', theme); } catch {}

  current = theme;
}

export async function initTheme() {
  try {
    const stored = await chrome.storage.local.get('theme');
    const theme = THEMES.includes(stored.theme) ? stored.theme : 'auto';
    applyTheme(theme);
  } catch {
    applyTheme('auto');
  }
}

export function cycleTheme() {
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
  applyTheme(next);
  try { chrome.storage.local.set({ theme: next }); } catch {}
}
