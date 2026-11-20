import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pages = [
  { route: "/", file: "index.html" },
  { route: "/projects/saucedemo.html", file: "projects/saucedemo.html" },
  { route: "/projects/makemytrip.html", file: "projects/makemytrip.html" }
];
const htmlByRoute = new Map();
const idsByRoute = new Map();
const requiredFiles = [
  "src/main.js", "src/styles/main.css", "src/styles/editorial.css",
  "assets/css/premium.css", "assets/css/case-study.css", "assets/css/case-study-refresh.css",
  "assets/css/case-study-editorial.css", "assets/js/case-study.js",
  "Kalp Shah Profile Photo.png", "Kalp Shah Manual Tester Resume.pdf",
  "Kalp Shah HCL GUVI Certification.png",
  "Kalp Shah Generative AI Mastermind Course Certificate.jpeg",
  "Kalp Shah Outskill Certificate.png",
  "favicon.svg", "favicon.ico", "assets/favicon.svg",
  "assets/favicon-16x16.png", "assets/favicon-32x32.png", "assets/apple-touch-icon.png",
  "robots.txt", "sitemap.xml"
];

for (const file of requiredFiles) {
  const fullPath = path.join(root, file);
  assert.ok(fs.existsSync(fullPath), "Missing required source asset: " + file);
  assert.ok(fs.statSync(fullPath).size > 0, "Required source asset is empty: " + file);
}

function toLocalPath(value) {
  if (!value || value.startsWith("//") || value.startsWith("#")) return null;
  let url;
  try { url = new URL(value, "https://kalpshahtester.github.io/"); }
  catch { return null; }
  if (url.origin !== "https://kalpshahtester.github.io") return null;
  const pathname = decodeURIComponent(url.pathname);
  return pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page.file), "utf8");
  htmlByRoute.set(page.route, html);
  assert.match(html, /<!doctype html>/i, page.file + ": missing HTML5 doctype");
  assert.match(html, /<html\b[^>]*lang="en"/i, page.file + ": missing document language");
  assert.match(html, /<meta\s+name="viewport"/i, page.file + ": missing responsive viewport");
  assert.match(html, /<title>[^<]+<\/title>/i, page.file + ": missing page title");
  assert.match(html, /<meta\s+name="description"/i, page.file + ": missing SEO description");
  assert.match(html, /<link\s+rel="canonical"/i, page.file + ": missing canonical URL");
  assert.match(html, /<header\b/i, page.file + ": missing header landmark");
  assert.match(html, /<main\b/i, page.file + ": missing main landmark");
  assert.match(html, /<footer\b/i, page.file + ": missing footer landmark");
  assert.match(html, /class="skip-link"/i, page.file + ": missing skip link");
  assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, page.file + ": expected exactly one H1");

  const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, page.file + ": duplicate HTML id");
  idsByRoute.set(page.route, new Set(ids));

  for (const match of html.matchAll(/\b(?:aria-labelledby|aria-describedby|aria-controls|aria-owns|aria-flowto)="([^"]+)"/gi)) {
    for (const id of match[1].trim().split(/\s+/)) assert.ok(ids.includes(id), page.file + ": unresolved ARIA reference " + id);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    assert.match(match[1], /\balt="/i, page.file + ": image missing alt text");
    assert.match(match[1], /\bsrc="/i, page.file + ": image missing src");
  }

  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    assert.match(match[1], /\btype="(?:button|submit|reset)"/i, page.file + ": button missing explicit type");
    const label = match[2].replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;/g, " ").trim();
    assert.ok(label || /\baria-label="/i.test(match[1]), page.file + ": unnamed button");
  }

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1];
    const visibleText = match[2].replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;/g, " ").trim();
    assert.match(attrs, /\bhref="/i, page.file + ": anchor missing href");
    assert.ok(visibleText || /\baria-label="/i.test(attrs) || /<img\b[^>]*\balt="[^"]+"/i.test(match[2]), page.file + ": unnamed link");
    if (/target="_blank"/i.test(attrs)) assert.match(attrs, /\brel="[^"]*noopener/i, page.file + ": unsafe target=_blank link");
  }

  const urls = [
    ...[...html.matchAll(/\b(?:href|src)="([^"]+)"/gi)].map(match => match[1]),
    ...[...html.matchAll(/\bsrcset="([^"]+)"/gi)].flatMap(match => match[1].split(",").map(item => item.trim().split(/\s+/)[0]))
  ];
  for (const value of urls) {
    const local = toLocalPath(value);
    if (local) assert.ok(fs.existsSync(path.join(root, local)), page.file + ": broken local resource " + value);
  }
}

for (const page of pages) {
  const html = htmlByRoute.get(page.route);
  for (const match of html.matchAll(/href="([^"]*#[^"]+)"/gi)) {
    let url;
    try { url = new URL(match[1], "https://kalpshahtester.github.io" + page.route); }
    catch { continue; }
    if (url.origin !== "https://kalpshahtester.github.io" || !url.hash) continue;
    const ids = idsByRoute.get(url.pathname || "/");
    if (ids) assert.ok(ids.has(decodeURIComponent(url.hash.slice(1))), page.file + ": broken cross-page fragment " + match[1]);
  }
}

const home = htmlByRoute.get("/");
assert.match(home, /class="hero-portrait"/, "Homepage must render the profile portrait");
assert.match(home, /alt="Portrait of Kalp Shah, Manual QA Tester"/, "Profile image needs descriptive alt text");
assert.match(home, /class="[^"]*\\beditorial-hero\\b/, "Homepage must use the editorial hero structure");
assert.match(home, /class="project-row"/, "Homepage must show the work in editorial rows, not generic cards");
assert.equal([...home.matchAll(/class="project-row"/g)].length, 3, "Expected three accurately labelled work entries");
assert.match(home, /class="certificate-grid"/, "Homepage must render the certificate gallery");
assert.equal([...home.matchAll(/class="certificate-card"/g)].length, 3, "Expected three certificate links");
assert.match(home, /<script\b[^>]*src="\/src\/main\.js"/, "Vite entry module is not linked");
assert.ok(home.includes('href="/src/styles/main.css"') && home.includes('href="/src/styles/editorial.css"'), "Homepage must link the base and editorial stylesheets");
assert.ok(!home.includes("/src/styles/portfolio-refresh.css") && !home.includes("role=\"tablist\""), "Old dashboard-style design or interactive lab remains linked");
assert.ok(!fs.readFileSync(path.join(root, "src/main.js"), "utf8").includes('import "./styles/'), "Runtime entry must not load CSS as JavaScript modules");
assert.match(home, /href="\/Kalp%20Shah%20Manual%20Tester%20Resume\.pdf"/, "Résumé link is missing");
assert.match(home, /href="https:\/\/www\.linkedin\.com\/in\/kalp-shah-software-tester\//, "LinkedIn profile link is missing");
assert.match(home, /href="mailto:manualtesterkalpshah@gmail\.com"/, "Email contact link is missing");
assert.match(home, /47[\s\S]*62[\s\S]*282/, "SauceDemo practice-project metrics are missing");
assert.match(home, /100\+ users supported/, "Prior IT Support figure must remain attributed to that role");
for (const id of ["work", "about", "approach", "experience", "toolkit", "contact"]) assert.ok(home.includes('id="' + id + '"'), "Homepage is missing section " + id);

for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
  const html = htmlByRoute.get(route);
  assert.ok(html.includes('href="/assets/css/premium.css?v=7"'), route + ": shared case-study CSS missing");
  assert.ok(html.includes('href="/assets/css/case-study.css"'), route + ": case-study CSS missing");
  assert.ok(html.includes('href="/assets/css/case-study-refresh.css"'), route + ": legacy case-study base CSS missing");
  assert.ok(html.includes('href="/assets/css/case-study-editorial.css"'), route + ": editorial case-study CSS missing");
  assert.ok(html.includes('src="/assets/js/case-study.js"'), route + ": case-study runtime missing");
  assert.ok(html.includes('name="twitter:title"') && html.includes('name="twitter:description"'), route + ": missing social metadata");
  assert.ok(!html.includes("/#projects"), route + ": obsolete homepage fragment found");
}

const cssFiles = [
  "src/styles/main.css", "src/styles/editorial.css",
  "assets/css/premium.css", "assets/css/case-study.css",
  "assets/css/case-study-refresh.css", "assets/css/case-study-editorial.css"
];
for (const file of cssFiles) {
  const css = fs.readFileSync(path.join(root, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  for (const char of css) {
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    assert.ok(depth >= 0, file + ": unexpected closing brace");
  }
  assert.equal(depth, 0, file + ": unbalanced CSS blocks");
}

const editorial = fs.readFileSync(path.join(root, "src/styles/editorial.css"), "utf8");
assert.match(editorial, /--page:\s*#f6f4ee/i, "Homepage must use the warm editorial canvas");
assert.match(editorial, /DM Serif Display/, "Homepage must use the editorial display typeface");
assert.match(editorial, /--accent:\s*#b54732/i, "Homepage must use the restrained terracotta accent");
const caseEditorial = fs.readFileSync(path.join(root, "assets/css/case-study-editorial.css"), "utf8");
assert.match(caseEditorial, /DM Serif Display/, "Case studies must share the editorial display typeface");
assert.match(caseEditorial, /prefers-reduced-motion/i, "Case-study CSS must respect reduced motion");
assert.match(caseEditorial, /:focus-visible/, "Case-study CSS must expose keyboard focus");

const caseRuntime = fs.readFileSync(path.join(root, "assets/js/case-study.js"), "utf8");
assert.match(caseRuntime, /status: "fallback"/, "Case-study motion CDN failures must set an explicit fallback state");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const page of pages) assert.ok(sitemap.includes("https://kalpshahtester.github.io" + page.route), "Sitemap missing " + page.route);

console.log("Portfolio source audit passed: 3 routes, original assets, links/fragments, accessibility metadata and editorial styles.");
