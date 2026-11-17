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
  "Kalp-Shah-Profile-Photo.webp",
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
  .filter(Boolean);
const jsFiles = scriptTags
  .map(tag => tag.match(/src="([^"]+)"/i)?.[1])
  .filter(Boolean);

assert.ok(cssFiles.some(file => file.startsWith("/assets/") && file.endsWith(".css")), "Built homepage must reference a production CSS bundle");
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

for (const file of ["Kalp-Shah-Profile-Photo.webp"]) {
  const bytes = fs.readFileSync(path.join(dist, file));
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", file + ": missing RIFF header");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", file + ": missing WebP signature");
}
const originalPng = fs.readFileSync(path.join(dist, "Kalp Shah Profile Photo.png"));
assert.deepEqual([...originalPng.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Original profile photo must remain a PNG");
assert.match(html, /class="hero-portrait"/, "Built homepage missing portrait figure");
assert.match(html, /class="certificate-card"/, "Built homepage missing certificate gallery");

for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
  const projectHtml = fs.readFileSync(path.join(dist, route.slice(1)), "utf8");
  assert.ok(projectHtml.includes("/#work"), route + " must link to the real homepage work section");
  assert.ok(!projectHtml.includes("/#projects"), route + " contains an obsolete homepage fragment");
}

console.log("Pages artifact audit passed: Vite bundles, project routes, résumé, profile image, WebP and certificates.");
