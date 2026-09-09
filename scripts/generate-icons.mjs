/**
 * Renders the app icon set from one SVG source.
 *
 *   node scripts/generate-icons.mjs
 *
 * Outputs are committed, so this only needs re-running when the mark changes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "public");

const SKY_TOP = "#0B1620";
const SKY_BOTTOM = "#122A2C";
const GOLD = "#D8B15C";
const TERRAIN = "#1E3238";
const SAGE = "#8FB3A6";

/**
 * The mark: a sun clearing the horizon, which is the same thing the app's
 * background does over the course of a session. Kept to two shapes so it
 * still reads at 32px.
 *
 * `inset` shrinks the artwork towards the centre without shrinking the
 * background — that is how a maskable icon keeps its content inside the safe
 * zone a launcher may crop to.
 */
function icon({ size = 512, inset = 0 } = {}) {
  const scale = 1 - inset;
  const c = size / 2;
  const sun = size * 0.23 * scale;
  const horizonY = c + size * 0.13 * scale;
  // A wide, shallow hill: the horizon curves just enough to feel like ground.
  const hillR = size * 1.15 * scale;
  const sunY = horizonY - sun * 0.42;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${SKY_TOP}"/>
      <stop offset="1" stop-color="${SKY_BOTTOM}"/>
    </linearGradient>
    <clipPath id="above"><rect x="0" y="0" width="${size}" height="${horizonY}"/></clipPath>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#sky)"/>
  <circle cx="${c}" cy="${sunY}" r="${sun}" fill="${GOLD}" clip-path="url(#above)"/>
  <circle cx="${c}" cy="${horizonY + hillR}" r="${hillR}"
          fill="${TERRAIN}" stroke="${SAGE}" stroke-width="${size * 0.014 * scale}" stroke-opacity="0.5"/>
</svg>`;
}

/** Wrap a 32×32 PNG in an ICO container, for /favicon.ico requests. */
function ico(png) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(header.length, 18);
  return Buffer.concat([header, png]);
}

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

await mkdir(out, { recursive: true });

const square = icon();
const maskable = icon({ inset: 0.22 });

const files = [
  ["favicon.svg", Buffer.from(icon({ size: 64 }))],
  ["favicon-32.png", await png(square, 32)],
  ["favicon.ico", ico(await png(square, 32))],
  ["apple-touch-icon.png", await png(square, 180)],
  ["icon-192.png", await png(square, 192)],
  ["icon-512.png", await png(square, 512)],
  ["icon-maskable-512.png", await png(maskable, 512)],
];

for (const [name, data] of files) {
  await writeFile(resolve(out, name), data);
  console.log(`${name} — ${data.length} bytes`);
}
