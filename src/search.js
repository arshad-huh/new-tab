export function filterBookmarks(flatIndex, query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const titleMatches = [];
  const hostMatches = [];

  for (const bm of flatIndex) {
    if (bm.title.toLowerCase().includes(q)) {
      titleMatches.push(bm);
      continue;
    }
    try {
      if (new URL(bm.url).hostname.toLowerCase().includes(q)) {
        hostMatches.push(bm);
      }
    } catch {}
  }

  // Title matches first, then host-only matches
  return [...titleMatches, ...hostMatches];
}
