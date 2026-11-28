import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve("dist/index.html");
assert.ok(fs.existsSync(outputPath), "Built homepage is missing. Run the Vite build first.");

let html = fs.readFileSync(outputPath, "utf8");
const sourceSet = [
  "/assets/images/kalp-shah-profile-320.webp 320w",
  "/assets/images/kalp-shah-profile-640.webp 640w",
  "/assets/images/kalp-shah-profile-768.webp 768w",
  "/assets/images/kalp-shah-profile-960.webp 960w"
].join(", ");
const sizes = "(max-width: 430px) calc(27vw - 12px), (max-width: 540px) calc(90vw - 20px), (max-width: 760px) 450px, (max-width: 1080px) 37vw, 430px";
const sourceTag = '<source type="image/webp" srcset="' + sourceSet + '" sizes="' + sizes + '" />';

const pictureStart = '<picture class="profile-photo-wrap">';
const pictureEnd = "</picture>";
const start = html.indexOf(pictureStart);
const end = html.indexOf(pictureEnd, start);
assert.ok(start >= 0 && end > start, "Could not locate the profile portrait picture in dist/index.html.");
const pictureContents = html.slice(start + pictureStart.length, end);
assert.ok(pictureContents.includes('class="profile-photo"'), "Profile portrait fallback image is missing.");
assert.ok(!pictureContents.includes('type="image/webp"'), "Responsive portrait source has already been injected.");
html = html.slice(0, start) + pictureStart + sourceTag + pictureContents + pictureEnd + html.slice(end + pictureEnd.length);

const preload = '<link rel="preload" as="image" type="image/webp" href="/assets/images/kalp-shah-profile-768.webp" imagesrcset="' + sourceSet + '" imagesizes="' + sizes + '" fetchpriority="high" />';
const canonical = '<link rel="canonical" href="https://kalpshahtester.github.io/" />';
assert.ok(html.includes(canonical), "Could not locate canonical link for the image preload.");
html = html.replace(canonical, canonical + "\n    " + preload);

assert.ok(html.includes(sourceTag), "Responsive WebP source was not added.");
assert.ok(html.includes(preload), "Responsive WebP preload was not added.");
fs.writeFileSync(outputPath, html);
console.log("Built homepage now preloads a responsive WebP portrait and retains the original PNG fallback.");
