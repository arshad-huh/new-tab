function faviconImg(url, title, size = 32) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.width = size;
  img.height = size;
  img.loading = 'lazy';
  img.onerror = () => {
    img.style.display = 'none';
    const fb = img.closest('.tile-icon, .folder-icon-wrap')?.querySelector('.favicon-fallback');
    if (fb) fb.hidden = false;
  };
  return img;
}

function fallbackLetter(title) {
  const span = document.createElement('span');
  span.className = 'favicon-fallback';
  span.hidden = true;
  span.textContent = (title || '?')[0].toUpperCase();
  return span;
}

export function makeBookmarkTile(item) {
  const a = document.createElement('a');
  a.href = item.url;
  a.className = 'tile bookmark-tile';
  a.title = item.title;
  a.setAttribute('role', 'listitem');

  const iconWrap = document.createElement('div');
  iconWrap.className = 'tile-icon';
  iconWrap.appendChild(faviconImg(item.faviconUrl, item.title, 32));
  iconWrap.appendChild(fallbackLetter(item.title));

  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = item.title;

  a.appendChild(iconWrap);
  a.appendChild(label);
  return a;
}

export function makeFolderTile(item, onOpen) {
  const btn = document.createElement('button');
  btn.className = 'tile folder-tile';
  btn.title = item.title;
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('role', 'listitem');

  const iconWrap = document.createElement('div');
  iconWrap.className = 'tile-icon folder-icon-wrap';

  const preview = document.createElement('div');
  preview.className = 'folder-preview';

  const slots = item.children.slice(0, 4);
  for (const child of slots) {
    const mini = document.createElement('img');
    mini.src = child.faviconUrl;
    mini.alt = '';
    mini.className = 'folder-preview-img';
    mini.loading = 'lazy';
    mini.onerror = () => { mini.style.display = 'none'; };
    preview.appendChild(mini);
  }
  for (let i = slots.length; i < 4; i++) {
    const blank = document.createElement('div');
    blank.className = 'folder-preview-blank';
    preview.appendChild(blank);
  }

  iconWrap.appendChild(preview);

  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = item.title;

  btn.appendChild(iconWrap);
  btn.appendChild(label);
  btn.addEventListener('click', () => onOpen(item));
  return btn;
}

export function renderGrid(container, items, onFolderOpen) {
  container.innerHTML = '';
  if (!items.length) return;
  const frag = document.createDocumentFragment();
  for (const item of items) {
    if (item.type === 'bookmark') {
      frag.appendChild(makeBookmarkTile(item));
    } else if (item.type === 'folder') {
      frag.appendChild(makeFolderTile(item, onFolderOpen));
    }
  }
  container.appendChild(frag);
}

export function renderSearchResults(container, results) {
  container.innerHTML = '';
  if (!results.length) {
    const p = document.createElement('p');
    p.className = 'empty-results';
    p.textContent = 'No bookmarks match your search.';
    container.appendChild(p);
    return;
  }
  const frag = document.createDocumentFragment();
  for (const item of results) {
    frag.appendChild(makeBookmarkTile(item));
  }
  container.appendChild(frag);
}
