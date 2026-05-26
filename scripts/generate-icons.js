/**
 * Generates simple PNG icons for the Bookmark Home extension.
 * Run with: node scripts/generate-icons.js
 * Requires no external dependencies — uses Node built-ins only.
 */
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const SIZES = [16, 32, 48, 128];
const OUT   = path.join(__dirname, '..', 'icons');

// ── CRC32 (needed for PNG chunks) ─────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

// ── Pixel drawing ──────────────────────────────────────
function drawIcon(size) {
  // RGBA pixel buffer
  const px = new Uint8Array(size * size * 4);

  const cx = size / 2;
  const r  = size / 2;

  // Accent blue background with rounded square (circle approximation for small sizes)
  const bgR = 0x00, bgG = 0x7a, bgB = 0xff; // #007aff

  // Grid dot color: white
  const dotR = 255, dotG = 255, dotB = 255;

  // Dot layout: 2x2 grid, each dot ~20% of size, spaced 35% apart from center
  const dotRadius = Math.max(1, size * 0.10);
  const offset    = size * 0.22;
  const dots = [
    [cx - offset, cx - offset],
    [cx + offset, cx - offset],
    [cx - offset, cx + offset],
    [cx + offset, cx + offset],
  ];

  // Corner radius for rounded-square background
  const cornerR = size * 0.22;

  function roundedSquareAlpha(x, y) {
    // Distance from each corner quadrant
    const dx = Math.max(0, Math.abs(x - cx) - (r - cornerR));
    const dy = Math.max(0, Math.abs(y - cx) - (r - cornerR));
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Anti-alias within 1px
    return Math.max(0, Math.min(1, cornerR - dist + 0.5));
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const bgAlpha = roundedSquareAlpha(x + 0.5, y + 0.5);

      if (bgAlpha <= 0) {
        px[idx + 3] = 0; // transparent
        continue;
      }

      let r_ = bgR, g_ = bgG, b_ = bgB;
      let dotAlpha = 0;

      for (const [dx, dy] of dots) {
        const dist = Math.sqrt((x + 0.5 - dx) ** 2 + (y + 0.5 - dy) ** 2);
        dotAlpha = Math.max(dotAlpha, Math.max(0, Math.min(1, dotRadius - dist + 0.5)));
      }

      if (dotAlpha > 0) {
        r_ = Math.round(bgR + (dotR - bgR) * dotAlpha);
        g_ = Math.round(bgG + (dotG - bgG) * dotAlpha);
        b_ = Math.round(bgB + (dotB - bgB) * dotAlpha);
      }

      px[idx]     = r_;
      px[idx + 1] = g_;
      px[idx + 2] = b_;
      px[idx + 3] = Math.round(bgAlpha * 255);
    }
  }

  return px;
}

function buildPNG(size) {
  const pixels = drawIcon(size);

  // Build raw scanlines (filter byte + RGBA rows)
  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 4);
    raw[rowOffset] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = rowOffset + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  // IHDR: width, height, bit depth=8, color type=6 (RGBA), compression=0, filter=0, interlace=0
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8]  = 8; // bit depth
  ihdrData[9]  = 6; // RGBA
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Write icons ────────────────────────────────────────
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (const size of SIZES) {
  const png  = buildPNG(size);
  const file = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`Generated ${file} (${png.length} bytes)`);
}
console.log('Done.');
