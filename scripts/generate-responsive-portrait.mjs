import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const source = path.resolve("Kalp Shah Profile Photo.png");
const outputDirectory = path.resolve("public/assets/images");
const widths = [320, 640, 768];

assert.ok(fs.existsSync(source), "Original profile portrait is missing.");
fs.mkdirSync(outputDirectory, { recursive: true });

const originalSize = fs.statSync(source).size;
for (const width of widths) {
  const output = path.join(outputDirectory, "kalp-shah-profile-" + width + ".webp");
  const result = spawnSync("cwebp", [
    "-quiet", "-q", "88", "-m", "6", "-mt", "-metadata", "none",
    "-resize", String(width), "0",
    source, "-o", output
  ], { stdio: "inherit" });

  if (result.error) throw result.error;
  assert.equal(result.status, 0, "cwebp failed while creating the " + width + "px portrait.");
  assert.ok(fs.existsSync(output), "Missing generated portrait: " + output);
  const bytes = fs.readFileSync(output);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF", "Generated image is not a RIFF container.");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP", "Generated image is not WebP.");
  assert.ok(bytes.length > 0 && bytes.length < originalSize, "Optimized portrait is not smaller than the original PNG.");
  console.log(width + "px WebP: " + bytes.length.toLocaleString("en-US") + " bytes");
}
console.log("Responsive portrait variants generated from the original PNG; the source file was not modified.");
