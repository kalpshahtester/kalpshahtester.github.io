import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173";
const routes = [
  { path: "/", heading: /Find the edge/i },
  { path: "/projects/saucedemo.html", heading: /Testing the/i },
  { path: "/projects/makemytrip.html", heading: /Travel journeys/i }
];
const viewports = [
  { width: 280, height: 653 },
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 540, height: 720 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 3440, height: 1440 }
];
const browser = await chromium.launch({ headless: true });
const failures = [];
let checks = 0;

try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    page.setDefaultTimeout(12_000);
    page.on("pageerror", error => failures.push(route.path + " page error: " + error.message));
    page.on("response", response => {
      const url = response.url();
      if (url.startsWith(baseURL) && response.status() >= 400) {
        failures.push(route.path + " local HTTP " + response.status() + ": " + url);
      }
    });
    page.on("requestfailed", request => {
      if (request.url().startsWith(baseURL)) failures.push(route.path + " failed local request: " + request.url());
    });

    const response = await page.goto(baseURL + route.path, { waitUntil: "domcontentloaded" });
    assert.ok(response && response.ok(), route.path + " should return HTTP 200");
    assert.ok(await page.title(), route.path + " must have a title");
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    assert.match(await page.getByRole("heading", { level: 1 }).innerText(), route.heading);

    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(450);

    if (route.path === "/") {
      const portrait = page.locator(".portrait-frame img");
      const imageLoaded = await portrait.evaluate(img => img.complete && img.naturalWidth > 0);
      assert.ok(imageLoaded, "homepage portrait must load");
      const heroPosition = await page.locator(".hero").evaluate(el => getComputedStyle(el).position);
      assert.equal(heroPosition, "relative", "hero footer must be positioned inside the hero");

      await page.getByRole("button", { name: /run sample/i }).click();
      await page.waitForFunction(() => document.querySelectorAll(".console-check.done").length === 4, null, { timeout: 8_000 });
      assert.match(await page.locator("#consoleMessage").innerText(), /no external site was accessed/i);
      checks += 2;
    }

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(90);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        offenders: [...document.querySelectorAll("body *")].map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === "string" ? el.className : "",
            id: el.id || "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            position: getComputedStyle(el).position
          };
        }).filter(el => (el.right > innerWidth + 1 || el.left < -1) && el.width > 0).sort((a, b) => b.right - a.right).slice(0, 24)
      }));
      const visibleOverflow = await page.evaluate(() => {
        const selectors = "main h1, main h2, main p, main .button, main .project-card, main .case-content, main .contact-card";
        const boxOverflow = [...document.querySelectorAll(selectors)].map(el => {
          const rect = el.getBoundingClientRect();
          return {
            selector: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().replace(/\\s+/g, ".") : ""),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            kind: "element"
          };
        }).filter(item => item.left < -1 || item.right > innerWidth + 1);
        const textOverflow = [...document.querySelectorAll("main h1, main h2")].flatMap(el => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return [...range.getClientRects()].map(rect => ({
            selector: el.tagName.toLowerCase() + (el.id ? "#" + el.id : ""),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            kind: "rendered heading text"
          })).filter(item => item.left < -1 || item.right > innerWidth + 1);
        });
        return [...boxOverflow, ...textOverflow];
      });
      assert.ok(
        dimensions.document <= dimensions.viewport + 1 && visibleOverflow.length === 0,
        route.path + " visible horizontal overflow at " + viewport.width + "px: " + JSON.stringify({ ...dimensions, visibleOverflow })
      );
      checks += 1;
    }

    // Mobile navigation must open, navigate and close without trapping the user.
    await page.setViewportSize({ width: 390, height: 844 });
    if (route.path === "/") {
      const toggle = page.locator("#menuToggle");
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true", "mobile menu should open");
      await page.locator('#primaryNav a[href="#projects"]').click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false", "mobile menu should close after navigation");
    } else {
      const toggle = page.locator("#menuToggle");
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true", "case-study mobile menu should open");
      await page.locator('#primaryNav a[href="/#projects"]').click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false", "case-study mobile menu should close after navigation");
    }
    checks += 2;

    // Reduced motion must leave all primary content visible and operable.
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.ok(await page.getByRole("heading", { level: 1 }).isVisible());
    checks += 1;

    await page.close();
  }
  assert.deepEqual(failures, [], "Browser runtime and local resource errors were detected");
  console.log("Browser smoke checks passed: " + checks + " assertions across " + routes.length + " pages and " + viewports.length + " viewport sizes.");
} finally {
  await browser.close();
}
