import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const required = [
  "index.html",
  "projects/saucedemo.html",
  "projects/makemytrip.html",
  "assets/css/premium.css",
  "assets/css/case-study.css",
  "assets/js/case-study.js",
  "Kalp Shah Profile Photo.png",
  "assets/images/kalp-shah-profile-320.webp",
  "assets/images/kalp-shah-profile-640.webp",
  "assets/images/kalp-shah-profile-768.webp",
  "assets/images/kalp-shah-profile-960.webp",
  "Kalp Shah Manual Tester Resume.pdf",
  "Kalp Shah HCL GUVI Certification.png",
  "Kalp Shah Generative AI Mastermind Course Certificate.jpeg",
  "Kalp Shah Outskill Certificate.png",
  "favicon.ico",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml"
];

for (const file of required) {
  const fullPath = path.join(dist, file);
  assert.ok(fs.existsSync(fullPath), "Missing deployment artifact file: " + file);
  assert.ok(fs.statSync(fullPath).size > 0, "Empty deployment artifact file: " + file);
}

const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
const scriptTags = [...html.matchAll(/<script\b[^>]*>/gi)].map(match => match[0]);
const cssFiles = linkTags
  .filter(tag => /rel="stylesheet"/i.test(tag))
  .map(tag => tag.match(/href="([^"]+)"/i)?.[1])
  .filter(file => file?.startsWith("/assets/") && file.endsWith(".css"));
const jsFiles = scriptTags
  .map(tag => tag.match(/src="([^"]+)"/i)?.[1])
  .filter(Boolean);

assert.ok(cssFiles.some(file => file.startsWith("/assets/") && file.endsWith(".css")), "Built homepage must reference a production CSS bundle");
assert.ok(!html.includes("/src/styles/main.css") && !html.includes("/src/styles/quality.css"), "Built homepage must not request unbundled source CSS");
assert.ok(jsFiles.some(file => file.startsWith("/assets/") && file.endsWith(".js")), "Built homepage must reference a production JavaScript bundle");

for (const asset of [...cssFiles, ...jsFiles]) {
  const url = new URL(asset, "https://kalpshahtester.github.io");
  const diskPath = path.join(dist, decodeURIComponent(url.pathname.replace(/^\//, "")));
  assert.ok(fs.existsSync(diskPath), "Missing Vite bundle: " + asset);
  assert.ok(fs.statSync(diskPath).size > 0, "Empty Vite bundle: " + asset);
}

const bundledCss = cssFiles
  .map(asset => fs.readFileSync(path.join(dist, decodeURIComponent(new URL(asset, "https://kalpshahtester.github.io").pathname.slice(1))), "utf8"))
  .join("\n");
assert.ok(bundledCss.includes(".hud-nav") && bundledCss.includes(".hero"), "Production CSS lacks core portfolio selectors");

const originalPng = fs.readFileSync(path.join(dist, "Kalp Shah Profile Photo.png"));
assert.deepEqual([...originalPng.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Original profile photo must remain a PNG");
for (const width of [320, 640, 768, 960]) {
  const portraitPath = path.join(dist, "assets/images/kalp-shah-profile-" + width + ".webp");
  const portrait = fs.readFileSync(portraitPath);
  assert.equal(portrait.toString("ascii", 0, 4), "RIFF", width + "px portrait must be a RIFF container");
  assert.equal(portrait.toString("ascii", 8, 12), "WEBP", width + "px portrait must be WebP");
  assert.ok(portrait.length > 0 && portrait.length < originalPng.length, width + "px WebP must be smaller than the original PNG");
}
assert.match(html, /class="hero-portrait"/, "Built homepage missing portrait figure");
assert.ok(html.includes('src="/Kalp%20Shah%20Profile%20Photo.png"') || html.includes('src="/Kalp Shah Profile Photo.png"'), "Original profile PNG must remain the portrait fallback");
assert.match(html, /<source type="image\/webp" srcset="[^"]*kalp-shah-profile-320\.webp 320w[^"]*"/, "Homepage must provide responsive WebP portrait candidates");
assert.match(html, /<link rel="preload" as="image" type="image\/webp"[^>]*href="\/assets\/images\/kalp-shah-profile-768\.webp"/, "Homepage must preload the responsive portrait");
assert.match(html, /class="certificate-card"/, "Built homepage missing certificate gallery");

for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
  const projectHtml = fs.readFileSync(path.join(dist, route.slice(1)), "utf8");
  assert.ok(projectHtml.includes("/#work"), route + " must link to the real homepage work section");
  assert.ok(!projectHtml.includes("/#projects"), route + " contains an obsolete homepage fragment");
}

console.log("Pages artifact audit passed: Vite bundles, project routes, résumé, original profile portrait and certificates.");
