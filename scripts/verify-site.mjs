import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const required = [
  "index.html",
  "assets/css/site.css",
  "assets/js/site.js",
  "projects/saucedemo.html",
  "projects/makemytrip.html"
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), "Missing file: " + file);

const pages = ["index.html", "projects/saucedemo.html", "projects/makemytrip.html"];
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.match(html, /<html lang="en">/i, page + ": missing document language");
  assert.match(html, /<title>[^<]+<\/title>/i, page + ": missing title");
  assert.match(html, /name="description"/i, page + ": missing meta description");
  assert.match(html, /<main\b/i, page + ": missing main landmark");
  assert.match(html, /class="skip-link"/i, page + ": missing skip link");

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    assert.match(match[1], /\balt="/i, page + ": image without alt text");
  }
  for (const match of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/gi)) {
    assert.match(match[1], /\brel="[^"]*noopener/i, page + ": unsafe target=_blank link");
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)) {
    const urlPath = decodeURIComponent(match[1]).replace(/^\//, "");
    if (!urlPath || urlPath.endsWith("/")) continue;
    assert.ok(fs.existsSync(path.join(root, urlPath)), page + ": broken local path /" + urlPath);
  }
}

const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.match(home, /47/, "missing verified scenario metric");
assert.match(home, /62\+/, "missing verified test-case metric");
assert.match(home, /282/, "missing verified execution metric");
assert.doesNotMatch(home, /7 critical defects|Playwright QA Automation|kalp-shah-software-tester/i, "unverified or outdated profile claim found");

const css = fs.readFileSync(path.join(root, "assets/css/site.css"), "utf8");
assert.match(css, /prefers-reduced-motion/i, "missing reduced-motion handling");
assert.match(css, /:focus-visible/i, "missing keyboard focus styling");

console.log("Portfolio structure checks passed for " + pages.length + " pages.");
