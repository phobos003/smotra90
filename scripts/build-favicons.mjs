import sharp from "sharp"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const SRC = "public/foto/logo_n.png"
const OUT_DIR = "public"

const sizes = [
  { name: "icon-192.png", size: 192, padding: 0.18 },
  { name: "icon-512.png", size: 512, padding: 0.18 },
  { name: "apple-touch-icon.png", size: 180, padding: 0.16 },
]

// Brand gradient as a plain 1x1 colored background — sharp will resize it.
// We use a flat brand color for simplicity (cleaner in tiny sizes).
const BG = { r: 255, g: 255, b: 255, alpha: 1 }

await mkdir(OUT_DIR, { recursive: true })

for (const cfg of sizes) {
  const inset = Math.round(cfg.size * (1 - cfg.padding * 2))
  const innerLogo = await sharp(SRC)
    .resize({ width: inset, height: inset, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const offset = Math.round((cfg.size - inset) / 2)

  const out = await sharp({
    create: {
      width: cfg.size,
      height: cfg.size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: innerLogo, top: offset, left: offset }])
    .png()
    .toBuffer()

  const outPath = path.join(OUT_DIR, cfg.name)
  await writeFile(outPath, out)
  console.log("✓", outPath, `${cfg.size}x${cfg.size}`)
}

console.log("Done.")
