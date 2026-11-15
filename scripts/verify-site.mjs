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
  "projects/saucedemo.html",
  "projects/makemytrip.html",
  "scripts/serve-site.mjs",
  "scripts/browser-smoke.mjs"
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), "Missing file: " + file);

const pages = ["/", "/projects/saucedemo.html", "/projects/makemytrip.html"];
const pageHtml = new Map();

for (const route of pages) {
  const relative = route === "/" ? "index.html" : route.slice(1);
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  pageHtml.set(route, html);

  assert.match(html, /<html lang="en">/i, relative + ": missing document language");
  assert.match(html, /<meta name="viewport"/i, relative + ": missing responsive viewport");
  assert.match(html, /<title>[^<]+<\/title>/i, relative + ": missing title");
  assert.match(html, /name="description"/i, relative + ": missing meta description");
  assert.match(html, /property="og:title"/i, relative + ": missing social title");
  assert.match(html, /property="og:image"/i, relative + ": missing social image");
  assert.match(html, /<main\b/i, relative + ": missing main landmark");
  assert.match(html, /class="skip-link"/i, relative + ": missing skip link");

  const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, relative + ": duplicate id attribute");
  assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, relative + ": expected exactly one H1");

  for (const match of html.matchAll(/href="#([^"]+)"/gi)) {
    assert.ok(ids.includes(match[1]), relative + ": broken in-page anchor #" + match[1]);
  }
  for (const match of html.matchAll(/\baria-(?:labelledby|controls)="([^"]+)"/gi)) {
    for (const id of match[1].split(/\s+/)) {
      assert.ok(ids.includes(id), relative + ": ARIA reference points to missing id #" + id);
    }
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    assert.match(match[1], /\balt="/i, relative + ": image without alt text");
  }
  for (const match of html.matchAll(/<button\b([^>]*)>/gi)) {
    assert.match(match[1], /\btype="(?:button|submit|reset)"/i, relative + ": button missing explicit type");
  }
  for (const match of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/gi)) {
    assert.match(match[1], /\brel="[^"]*noopener/i, relative + ": unsafe target=_blank link");
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)) {
    const urlPath = decodeURIComponent(match[1]).replace(/^\//, "");
    if (!urlPath || urlPath.endsWith("/")) continue;
    assert.ok(fs.existsSync(path.join(root, urlPath)), relative + ": broken local path /" + urlPath);
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

const home = pageHtml.get("/");
assert.ok(home.includes('href="/assets/css/premium.css"'), "homepage must load the premium stylesheet");
assert.ok(home.includes('src="/assets/js/premium.js"'), "homepage must load the premium JavaScript");
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

console.log("Static portfolio checks passed across " + pages.length + " pages.");
