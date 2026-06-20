/**
 * Generates favicon PNG/ICO assets from the horizontal logo lockup.
 * Source: public/images/logo.png (Elevated Health wordmark + leaf badge)
 *
 * Usage: node scripts/generate-favicons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public/images/logo.png");
const PUBLIC = path.join(ROOT, "public");
const NAVY = { r: 0, g: 71, b: 126 };

function isNavy(r, g, b, a) {
  if (a < 128) return false;
  return Math.sqrt((r - NAVY.r) ** 2 + (g - NAVY.g) ** 2 + (b - NAVY.b) ** 2) < 55;
}

async function findLeafCrop(data, width, height) {
  const cols = [];
  for (let x = 0; x < width; x++) {
    let navy = 0;
    for (let y = 0; y < height; y++) {
      const i = (y * width + x) * 4;
      if (isNavy(data[i], data[i + 1], data[i + 2], data[i + 3])) navy++;
    }
    cols.push(navy);
  }

  let startX = 650;
  for (let x = 580; x < 900; x++) {
    const window = cols.slice(x, x + 40).reduce((a, b) => a + b, 0) / 40;
    const prev = cols.slice(x - 20, x).reduce((a, b) => a + b, 0) / 20;
    if (window > height * 0.35 && prev < height * 0.08) {
      startX = x;
      break;
    }
  }

  let bMinX = width,
    bMinY = height,
    bMaxX = 0,
    bMaxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = startX; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isNavy(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        bMinX = Math.min(bMinX, x);
        bMinY = Math.min(bMinY, y);
        bMaxX = Math.max(bMaxX, x);
        bMaxY = Math.max(bMaxY, y);
      }
    }
  }

  const pad = 12;
  return {
    left: bMinX - pad,
    top: bMinY - pad,
    width: bMaxX - bMinX + 1 + pad * 2,
    height: bMaxY - bMinY + 1 + pad * 2,
  };
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing source logo at public/images/logo.png");
    process.exit(1);
  }

  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const crop = await findLeafCrop(data, info.width, info.height);

  const badge = await sharp(SRC).extract(crop).png().toBuffer();
  const badgeMeta = await sharp(badge).metadata();
  const size = Math.max(badgeMeta.width, badgeMeta.height);
  const padX = Math.floor((size - badgeMeta.width) / 2);
  const padY = Math.floor((size - badgeMeta.height) / 2);

  const square = await sharp(badge)
    .extend({
      top: padY,
      bottom: size - badgeMeta.height - padY,
      left: padX,
      right: size - badgeMeta.width - padX,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  for (const s of [16, 32, 48, 180, 192, 512]) {
    const out = path.join(PUBLIC, `favicon-${s}.png`);
    await sharp(square)
      .resize(s, s, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(out);
    console.log("wrote", path.relative(ROOT, out));
  }

  fs.writeFileSync(
    path.join(PUBLIC, "favicon.ico"),
    await pngToIco([
      path.join(PUBLIC, "favicon-16.png"),
      path.join(PUBLIC, "favicon-32.png"),
      path.join(PUBLIC, "favicon-48.png"),
    ]),
  );
  console.log("wrote public/favicon.ico");

  await sharp(square)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(PUBLIC, "apple-touch-icon.png"));
  console.log("wrote public/apple-touch-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
