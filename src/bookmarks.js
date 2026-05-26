export function buildFaviconUrl(url) {
  try {
    const u = new URL(chrome.runtime.getURL('/_favicon/'));
    u.searchParams.set('pageUrl', url);
    u.searchParams.set('size', '64');
    return u.toString();
  } catch {
    return '';
  }
}

function normalizeTitle(title, url) {
  if (title && title.trim()) return title.trim();
  try { return new URL(url).hostname; } catch { return url; }
}

// Flatten a folder node's children recursively into bookmark items only
function flattenToBookmarks(node) {
  const out = [];
  if (!node.children) return out;
  for (const child of node.children) {
    if (child.url) {
      out.push({
        type: 'bookmark',
        id: child.id,
        title: normalizeTitle(child.title, child.url),
        url: child.url,
        faviconUrl: buildFaviconUrl(child.url),
      });
    } else {
      out.push(...flattenToBookmarks(child));
    }
  }
  return out;
}

export async function getBookmarkModel() {
  const tree = await chrome.bookmarks.getTree();
  const rootChildren = tree[0]?.children ?? [];

  const items = [];
  const flatIndex = [];

  // rootChildren = [Bookmarks Bar, Other Bookmarks, Mobile Bookmarks]
  for (const rootFolder of rootChildren) {
    if (!rootFolder.children) continue;
    for (const node of rootFolder.children) {
      if (node.url) {
        const bm = {
          type: 'bookmark',
          id: node.id,
          title: normalizeTitle(node.title, node.url),
          url: node.url,
          faviconUrl: buildFaviconUrl(node.url),
        };
        items.push(bm);
        flatIndex.push(bm);
      } else {
        // Top-level folder
        const children = flattenToBookmarks(node);
        const folder = {
          type: 'folder',
          id: node.id,
          title: node.title || 'Folder',
          children,
        };
        items.push(folder);
        flatIndex.push(...children);
      }
    }
  }

  return { items, flatIndex };
}
