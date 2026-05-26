# Bookmark Home — New Tab Extension

A Chrome extension that replaces your default New Tab page with a clean, mobile home-screen-style grid of all your bookmarks.

---

## Features

- **Bookmark grid** — all your bookmarks displayed as icon tiles with labels
- **Folders** — appear as iOS-style tiles; click to open contents in a smooth overlay
- **Live search** — filter bookmarks by name or website as you type
- **Keyboard shortcuts** — `/` to focus search, `Enter` to open top result, `Esc` to close
- **Light / Dark / Auto theme** — follows your OS, with a manual toggle
- **Fast** — no external libraries, no internet requests, loads instantly

---

## Install

1. Download or clone this repo to your computer
2. Open Chrome → go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** → select the project folder
5. Open a new tab — done

---

## Project Structure

```
new-tab/
├── manifest.json       Chrome extension config
├── newtab.html         The new tab page
├── src/
│   ├── main.js         App entry point
│   ├── bookmarks.js    Reads your Chrome bookmarks
│   ├── render.js       Draws tiles and folders on screen
│   ├── search.js       Search/filter logic
│   ├── theme.js        Light/dark theme handling
│   └── styles.css      All styling
└── icons/              Extension icons
```

---

## Tech

Vanilla JS · CSS Grid · Chrome MV3 · No dependencies · No build step
