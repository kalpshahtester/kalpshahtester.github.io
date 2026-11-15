import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const required = [
  "index.html",
  "assets/css/premium.css",
  "assets/css/case-study.css",
  "assets/js/premium.js",
  "assets/js/case-study.js",
  "assets/favicon.svg",
  "assets/favicon-16x16.png",
  "assets/favicon-32x32.png",
  "assets/apple-touch-icon.png",
  "favicon.ico",
  "projects/saucedemo.html",
  "projects/makemytrip.html",
  "scripts/serve-site.mjs",
  "scripts/browser-smoke.mjs",
  ".htmlvalidate.json",
  ".github/workflows/portfolio-quality-check.yml",
  ".github/workflows/production-smoke.yml",
  "QUALITY_AUDIT.md",
  "Kalp Shah Profile Photo.png",
  "Kalp Shah Manual Tester Resume.pdf",
  "Kalp Shah HCL GUVI Certification.png",
  "Kalp Shah Generative AI Mastermind Course Certificate.jpeg",
  "Kalp Shah Outskill Certificate.png",
  "robots.txt",
  "sitemap.xml"
];
for (const file of required) {
  assert.ok(fs.existsSync(path.join(root, file)), "Missing production file: " + file);
}

const routes = [
  { route: "/", file: "index.html" },
  { route: "/projects/saucedemo.html", file: "projects/saucedemo.html" },
  { route: "/projects/makemytrip.html", file: "projects/makemytrip.html" }
];
const pageHtml = new Map();

for (const { route, file } of routes) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  pageHtml.set(route, html);

  assert.ok(html.includes('href="/assets/favicon.svg?v=4"'), file + ": missing versioned SVG favicon");
  assert.ok(html.includes('href="/assets/favicon-32x32.png?v=4"'), file + ": missing PNG favicon fallback");
  assert.ok(html.includes('href="/assets/favicon-16x16.png?v=4"'), file + ": missing small PNG favicon");
  assert.ok(html.includes('href="/favicon.ico?v=4"'), file + ": missing legacy ICO favicon");
  assert.ok(html.includes('href="/assets/apple-touch-icon.png?v=4"'), file + ": missing Apple touch icon");

  assert.match(html, /<!doctype html>/i, file + ": missing HTML5 doctype");
  assert.match(html, /<html lang="en">/i, file + ": missing document language");
  assert.match(html, /<meta name="viewport"/i, file + ": missing responsive viewport");
  assert.match(html, /<title>[^<]+<\/title>/i, file + ": missing title");
  assert.match(html, /name="description"/i, file + ": missing meta description");
  assert.match(html, /property="og:title"/i, file + ": missing social title");
  assert.match(html, /property="og:image"/i, file + ": missing social image");
  assert.match(html, /rel="canonical"/i, file + ": missing canonical URL");
  assert.match(html, /<header\b/i, file + ": missing header landmark");
  assert.match(html, /<main\b/i, file + ": missing main landmark");
  assert.match(html, /<footer\b/i, file + ": missing footer landmark");
  assert.match(html, /class="skip-link"/i, file + ": missing skip link");

  const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, file + ": duplicate id attribute");
  assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, file + ": expected exactly one H1");

  for (const match of html.matchAll(/href="#([^"]+)"/gi)) {
    assert.ok(ids.includes(match[1]), file + ": broken in-page anchor #" + match[1]);
  }
  for (const match of html.matchAll(/\baria-(?:labelledby|describedby|controls|owns|flowto)="([^"]+)"/gi)) {
    for (const id of match[1].split(/\s+/)) {
      assert.ok(ids.includes(id), file + ": ARIA reference points to missing id #" + id);
    }
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    assert.match(match[1], /\balt="/i, file + ": image without alt text");
    assert.match(match[1], /\bsrc="/i, file + ": image without src");
  }
  for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    assert.match(match[1], /\btype="(?:button|submit|reset)"/i, file + ": button missing explicit type");
    const buttonText = match[2].replace(/<[^>]+>/g, "").trim();
    assert.ok(/\baria-label=/.test(match[1]) || buttonText.length > 0 || /<img\b[^>]*\balt="[^"]+"/i.test(match[2]), file + ": button has no accessible name");
  }
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1];
    const inner = match[2].replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;/g, " ").trim();
    assert.match(attrs, /\bhref="/i, file + ": anchor without href");
    assert.ok(inner || /\baria-label=/.test(attrs) || /<img\b[^>]*\balt="[^"]+"/i.test(match[2]), file + ": link has no accessible name");
  }
  for (const match of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/gi)) {
    assert.match(match[1], /\brel="[^"]*noopener/i, file + ": unsafe target=_blank link");
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const rawPath = match[1].split(/[?#]/)[0];
    const urlPath = decodeURIComponent(rawPath).replace(/^\//, "");
    if (!urlPath || urlPath.endsWith("/")) continue;
    assert.ok(fs.existsSync(path.join(root, urlPath)), file + ": broken local path /" + urlPath);
  }
}

for (const [route, html] of pageHtml) {
  for (const match of html.matchAll(/href="(\/[^"]*#([^"]+))"/g)) {
    const targetRoute = match[1].split("#")[0] || "/";
    const destinationHtml = pageHtml.get(targetRoute);
    assert.ok(destinationHtml, route + ": linked route does not exist: " + targetRoute);
    const destinationIds = [...destinationHtml.matchAll(/\bid="([^"]+)"/gi)].map(item => item[1]);
    assert.ok(destinationIds.includes(match[2]), route + ": linked route has no #" + match[2]);
  }
}

const faviconSvg = fs.readFileSync(path.join(root, "assets/favicon.svg"), "utf8");
assert.match(faviconSvg, /<svg\b[^>]*viewBox="0 0 64 64"/i, "SVG favicon must have a 64px viewBox");
assert.match(faviconSvg, /<path\b/i, "SVG favicon must include the K monogram");
assert.match(faviconSvg, /#D2FF4B/i, "SVG favicon must preserve the brand accent");

for (const { file, size } of [
  { file: "assets/favicon-16x16.png", size: 16 },
  { file: "assets/favicon-32x32.png", size: 32 },
  { file: "assets/apple-touch-icon.png", size: 180 }
]) {
  const png = fs.readFileSync(path.join(root, file));
  assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), file + ": invalid PNG signature");
  assert.equal(png.readUInt32BE(16), size, file + ": unexpected width");
  assert.equal(png.readUInt32BE(20), size, file + ": unexpected height");
}
const ico = fs.readFileSync(path.join(root, "favicon.ico"));
assert.equal(ico.readUInt16LE(0), 0, "ICO reserved header must be zero");
assert.equal(ico.readUInt16LE(2), 1, "root favicon must be a Windows icon");
assert.ok(ico.readUInt16LE(4) >= 3, "ICO must include multiple browser-size variants");
const icoSizes = Array.from({ length: ico.readUInt16LE(4) }, (_, index) => {
  const offset = 6 + index * 16;
  return [ico.readUInt8(offset) || 256, ico.readUInt8(offset + 1) || 256].join("x");
});
for (const expected of ["16x16", "32x32", "48x48"]) {
  assert.ok(icoSizes.includes(expected), "ICO is missing " + expected + " variant");
}

const home = pageHtml.get("/");
assert.ok(home.includes('href="/assets/css/premium.css"'), "homepage must load the premium stylesheet");
assert.ok(home.includes('src="/assets/js/premium.js"'), "homepage must load the premium JavaScript");
assert.match(home, /role="group" aria-label="Profile portrait/i, "hero profile visual needs an accessible semantic group");
assert.match(home, /role="img" aria-label="Decorative interface illustration/i, "SauceDemo project visual needs an accessible name");
assert.match(home, /47/, "missing verified scenario metric");
assert.match(home, /62\+/, "missing verified test-case metric");
assert.match(home, /282/, "missing verified execution metric");
assert.match(home, /Illustrative animation only/i, "interactive QA sample must be clearly labelled");
assert.doesNotMatch(home, /7 critical defects|Playwright QA Automation|kalp-shah-software-tester/i, "unverified or outdated profile claim found");

for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
  const html = pageHtml.get(route);
  assert.ok(html.includes('href="/assets/css/premium.css"'), route + ": premium global stylesheet missing");
  assert.ok(html.includes('href="/assets/css/case-study.css"'), route + ": case-study stylesheet missing");
  assert.ok(html.includes('src="/assets/js/case-study.js"'), route + ": case-study JavaScript missing");
  assert.match(html, /<main id="main" class="case-page" tabindex="-1">/, route + ": main region must be focusable for the skip link");
}

for (const cssPath of ["assets/css/premium.css", "assets/css/case-study.css"]) {
  const css = fs.readFileSync(path.join(root, cssPath), "utf8");
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let depth = 0;
  for (const char of stripped) {
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    assert.ok(depth >= 0, cssPath + ": unexpected closing brace");
  }
  assert.equal(depth, 0, cssPath + ": unbalanced CSS braces");
}

const premiumCss = fs.readFileSync(path.join(root, "assets/css/premium.css"), "utf8");
assert.match(premiumCss, /prefers-reduced-motion/i, "shared stylesheet must respect reduced motion");
assert.match(premiumCss, /:focus-visible/i, "shared stylesheet must provide keyboard focus styling");
assert.match(premiumCss, /\.hero\s*\{[^}]*position\s*:\s*relative/i, "hero must contain its absolutely positioned footer");
assert.match(premiumCss, /@media\s*\(max-width:\s*600px\)/i, "homepage missing phone layout");
assert.match(premiumCss, /@media\s*\(max-width:\s*850px\)/i, "homepage missing tablet navigation layout");

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const { route } of routes) {
  assert.ok(sitemap.includes("https://kalpshahtester.github.io" + route), "sitemap missing " + route);
}
console.log("Static structure, metadata, accessibility references and all local production assets passed across " + routes.length + " pages.");
