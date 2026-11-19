import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve("dist/index.html");
assert.ok(fs.existsSync(outputPath), "Built homepage is missing. Run the Vite build first.");

let html = fs.readFileSync(outputPath, "utf8");
const sourceSet = [
  "/assets/images/kalp-shah-profile-320.webp 320w",
  "/assets/images/kalp-shah-profile-640.webp 640w",
  "/assets/images/kalp-shah-profile-768.webp 768w"
].join(", ");
const sizes = "(max-width: 600px) 260px, 350px";
const sourceTag = '<source type="image/webp" srcset="' + sourceSet + '" sizes="' + sizes + '" />';
const picturePattern = /(<picture class="profile-photo-wrap">)([\\s\\S]*?<img\\b[^>]*class="profile-photo"[^>]*\\/?>(?:[\\s\\S]*?))(<\\/picture>)/;

const pictureMatch = html.match(picturePattern);
assert.ok(pictureMatch, "Could not locate the profile portrait picture in dist/index.html.");
assert.ok(!pictureMatch[2].includes('type="image/webp"'), "Responsive portrait source has already been injected.");
html = html.replace(picturePattern, "$1" + sourceTag + "$2$3");

const preload = '<link rel="preload" as="image" type="image/webp" href="/assets/images/kalp-shah-profile-768.webp" imagesrcset="' + sourceSet + '" imagesizes="' + sizes + '" fetchpriority="high" />';
const canonicalPattern = /(<link rel="canonical" href="https:\\/\\/kalpshahtester\\.github\\.io\\/" \\/>)/;
assert.match(html, canonicalPattern, "Could not locate canonical link for the image preload.");
html = html.replace(canonicalPattern, "$1\\n    " + preload);

assert.ok(html.includes(sourceTag), "Responsive WebP source was not added.");
assert.ok(html.includes(preload), "Responsive WebP preload was not added.");
fs.writeFileSync(outputPath, html);
console.log("Built homepage now preloads a responsive WebP portrait and retains the original PNG fallback.");
