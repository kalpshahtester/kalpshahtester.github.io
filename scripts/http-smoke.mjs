import assert from "node:assert/strict";

const baseURL = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const pages = [
  { path: "/", heading: "Find the issue." },
  { path: "/projects/saucedemo.html", heading: "Testing the" },
  { path: "/projects/makemytrip.html", heading: "Travel journeys" }
];
const responses = new Map();
const localAssets = new Set([
  "/Kalp%20Shah%20Profile%20Photo.png",
  "/Kalp%20Shah%20Manual%20Tester%20Resume.pdf",
  "/Kalp%20Shah%20HCL%20GUVI%20Certification.png",
  "/Kalp%20Shah%20Generative%20AI%20Mastermind%20Course%20Certificate.jpeg",
  "/Kalp%20Shah%20Outskill%20Certificate.png",
  "/favicon.svg",
  "/favicon.ico",
  "/assets/favicon.svg",
  "/assets/favicon-16x16.png",
  "/assets/favicon-32x32.png",
  "/assets/apple-touch-icon.png",
  "/robots.txt",
  "/sitemap.xml"
]);
let assertions = 0;

async function getResource(resourcePath) {
  const url = new URL(resourcePath, baseURL);
  const key = url.pathname + url.search;
  if (responses.has(key)) return responses.get(key);
  let lastResult;
  // GitHub Pages can expose the new HTML before the CDN edge has finished
  // propagating a newly deployed root-level image. Retry transient 404/5xx
  // responses, with a cache-busting query, before declaring the asset missing.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const requestUrl = new URL(url);
    const response = await fetch(requestUrl, {
      redirect: "follow",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    lastResult = {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      bytes,
      text: bytes.toString("utf8")
    };
    if (response.status < 500 && response.status !== 404) break;
    if (attempt < 7) await new Promise(resolve => setTimeout(resolve, 2500));
  }
  responses.set(key, lastResult);
  return lastResult;
}

function localUrl(value) {
  if (!value || value.startsWith("#") || value.startsWith("//")) return null;
  let url;
  try { url = new URL(value, baseURL); } catch { return null; }
  if (url.origin !== baseURL) return null;
  return url.pathname + url.search;
}

for (const page of pages) {
  const result = await getResource(page.path);
  assert.equal(result.status, 200, page.path + " should return HTTP 200");
  assert.match(result.contentType, /text\/html/i, page.path + " should be served as HTML");
  const heading = result.text.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "";
  assert.ok(heading.replace(/<[^>]+>/g, " ").includes(page.heading), page.path + " primary heading is missing");
  if (page.path === "/") {
    assert.match(result.text, /<a\b(?=[^>]*id="resumeDownloadButton")(?=[^>]*download="Kalp-Shah-Manual-QA-Tester-Resume\.pdf")[^>]*>Download Resume/i, "Homepage Download Resume action is missing");
    assert.doesNotMatch(result.text, /View Resume|resumeViewButton|resume-view-button/i, "Homepage must contain only the Download Resume action, not View Resume");
  }
  assertions += page.path === "/" ? 5 : 3;

  for (const match of result.text.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const resource = localUrl(match[1]);
    if (resource) localAssets.add(resource);
  }
  for (const match of result.text.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const item of match[1].split(",")) {
      const resource = localUrl(item.trim().split(/\s+/)[0]);
      if (resource) localAssets.add(resource);
    }
  }
}

const mimeRules = [
  { suffix: ".html", pattern: /text\/html/i },
  { suffix: ".css", pattern: /text\/css/i },
  { suffix: ".js", pattern: /javascript|ecmascript/i },
  { suffix: ".png", pattern: /image\/png/i },
  { suffix: ".webp", pattern: /image\/webp/i },
  { suffix: ".jpeg", pattern: /image\/jpeg/i },
  { suffix: ".svg", pattern: /image\/svg\+xml/i },
  { suffix: ".ico", pattern: /image\/x-icon|image\/vnd\.microsoft\.icon/i },
  { suffix: ".pdf", pattern: /application\/pdf/i },
  { suffix: ".xml", pattern: /application\/xml|text\/xml/i },
  { suffix: ".txt", pattern: /text\/plain/i }
];

for (const asset of localAssets) {
  const result = await getResource(asset);
  assert.equal(result.status, 200, "Local resource should return HTTP 200: " + asset);
  assert.ok(result.bytes.length > 0, "Local resource must not be empty: " + asset);
  const pathname = new URL(asset, baseURL).pathname.toLowerCase();
  const rule = mimeRules.find(item => pathname.endsWith(item.suffix));
  if (rule) {
    assert.match(result.contentType, rule.pattern, asset + " returned an unexpected MIME type: " + result.contentType);
  }
  if (pathname.endsWith(".pdf")) {
    assert.equal(result.bytes.subarray(0, 5).toString("ascii"), "%PDF-", "Résumé resource is not a valid PDF");
  }
  assertions += pathname.endsWith(".pdf") ? 3 : 2;
}

for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
  const html = (await getResource(route)).text;
  assert.ok(html.includes("/#work"), route + " must navigate back to the homepage work section");
  assert.ok(!html.includes("/#projects"), route + " still contains the invalid #projects link");
  assertions += 2;
}

console.log("HTTP smoke passed: " + assertions + " assertions across " + pages.length + " routes and " + localAssets.size + " unique local resources.");
