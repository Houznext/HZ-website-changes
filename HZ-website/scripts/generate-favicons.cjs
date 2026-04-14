/**
 * Regenerates favicon + PWA icons from scripts/branding/favicon-source.png
 * Run: npm run generate-favicons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const toIco = require("to-ico");

const src = path.join(__dirname, "branding", "favicon-source.png");
const pub = path.join(__dirname, "..", "public");

async function squarePng(size) {
  return sharp(src)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(src)) {
    console.error("Missing:", src);
    process.exit(1);
  }

  const files = [
    [16, "favicon-16x16.png"],
    [32, "favicon-32x32.png"],
    [96, "favicon-96x96.png"],
    [180, "apple-touch-icon.png"],
    [192, "web-app-manifest-192x192.png"],
    [512, "web-app-manifest-512x512.png"],
  ];

  for (const [size, name] of files) {
    const buf = await squarePng(size);
    await fs.promises.writeFile(path.join(pub, name), buf);
    console.log("Wrote", name);
  }

  const icoBuf = await toIco([
    await squarePng(16),
    await squarePng(32),
    await squarePng(48),
  ]);
  await fs.promises.writeFile(path.join(pub, "favicon.ico"), icoBuf);
  console.log("Wrote favicon.ico");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
