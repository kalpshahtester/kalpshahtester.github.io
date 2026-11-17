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
  "src/main.js", "src/scenes/qa-scene.js", "src/styles/main.css", "src/styles/quality.css",
  "assets/css/premium.css", "assets/css/case-study.css", "assets/js/case-study.js",
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
  try {
    url = new URL(value, "https://kalpshahtester.github.io/");
  } catch {
    return null;
  }
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
    for (const id of match[1].trim().split(/\s+/)) {
      assert.ok(ids.includes(id), page.file + ": unresolved ARIA reference " + id);
    }
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
    if (/target="_blank"/i.test(attrs)) {
      assert.match(attrs, /\brel="[^"]*noopener/i, page.file + ": unsafe target=_blank link");
    }
  }

  const urls = [
    ...[...html.matchAll(/\b(?:href|src)="([^"]+)"/gi)].map(match => match[1]),
    ...[...html.matchAll(/\bsrcset="([^"]+)"/gi)]
      .flatMap(match => match[1].split(",").map(item => item.trim().split(/\s+/)[0]))
  ];
  for (const value of urls) {
    const local = toLocalPath(value);
    if (!local) continue;
    assert.ok(fs.existsSync(path.join(root, local)), page.file + ": broken local resource " + value);
  }
}

for (const page of pages) {
  const html = htmlByRoute.get(page.route);
  for (const match of html.matchAll(/href="([^"]*#[^"]+)"/gi)) {
    let url;
    try {
      url = new URL(match[1], "https://kalpshahtester.github.io" + page.route);
    } catch {
      continue;
    }
    if (url.origin !== "https://kalpshahtester.github.io" || !url.hash) continue;
    const targetRoute = url.pathname || "/";
    const ids = idsByRoute.get(targetRoute);
    if (ids) {
      assert.ok(ids.has(decodeURIComponent(url.hash.slice(1))), page.file + ": broken cross-page fragment " + match[1]);
    }
  }
}

const home = htmlByRoute.get("/");
assert.match(home, /class="hero-portrait"/, "Homepage must render the profile portrait");
assert.match(home, /alt="Portrait of Kalp Shah, Manual QA Tester"/, "Profile image needs descriptive alt text");
assert.match(home, /class="certificate-grid"/, "Homepage must render the certificate gallery");
assert.equal([...home.matchAll(/class="certificate-card"/g)].length, 3, "Expected three certificate preview cards");
assert.match(home, /<script\b[^>]*src="\/src\/main\.js"/, "Vite entry module is not linked");
assert.match(home, /href="\/src\/styles\/main\.css"/, "Main stylesheet is not linked");
assert.match(home, /href="\/Kalp%20Shah%20Manual%20Tester%20Resume\.pdf"/, "Résumé link is missing");
assert.ok(home.includes('href="#work"'), "Homepage work navigation must target #work");
assert.doesNotMatch(home, /href="\/#projects"/, "Homepage contains an obsolete #projects destination");

for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
  const html = htmlByRoute.get(route);
  assert.ok(html.includes('href="/assets/css/premium.css?v=7"'), route + ": shared case-study CSS missing");
  assert.ok(html.includes('href="/assets/css/case-study.css"'), route + ": case-study CSS missing");
  assert.ok(html.includes('src="/assets/js/case-study.js"'), route + ": case-study runtime missing");
  assert.ok(html.includes('name="twitter:title"'), route + ": missing Twitter title metadata");
  assert.ok(html.includes('name="twitter:description"'), route + ": missing Twitter description metadata");
  assert.ok(!html.includes("/#projects"), route + ": obsolete homepage fragment found");
}

for (const file of ["src/styles/main.css", "src/styles/quality.css", "assets/css/premium.css", "assets/css/case-study.css"]) {
  const css = fs.readFileSync(path.join(root, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  for (const char of css) {
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    assert.ok(depth >= 0, file + ": unexpected closing brace");
  }
  assert.equal(depth, 0, file + ": unbalanced CSS blocks");
}

const caseCss = fs.readFileSync(path.join(root, "assets/css/premium.css"), "utf8");
assert.match(caseCss, /--acid:#e2c08d/i, "Case-study accent must match the homepage gold");
assert.match(caseCss, /--display:"Syne"/, "Case-study display font must match the homepage");
assert.match(caseCss, /--body:"Plus Jakarta Sans"/, "Case-study body font must match the homepage");
assert.match(caseCss, /--mono:"JetBrains Mono"/, "Case-study mono font must match the homepage");
assert.match(caseCss, /prefers-reduced-motion/i, "Case-study CSS must respect reduced motion");
assert.match(caseCss, /:focus-visible/i, "Case-study CSS must expose keyboard focus");

const caseRuntime = fs.readFileSync(path.join(root, "assets/js/case-study.js"), "utf8");
assert.match(caseRuntime, /status: "fallback"/, "Case-study motion CDN failures must set an explicit fallback state");

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const page of pages) {
  assert.ok(sitemap.includes("https://kalpshahtester.github.io" + page.route), "Sitemap missing " + page.route);
}

console.log("Portfolio source audit passed: 3 routes, links/fragments, ARIA references, image alternatives, social metadata, CSS structure and public assets.");
