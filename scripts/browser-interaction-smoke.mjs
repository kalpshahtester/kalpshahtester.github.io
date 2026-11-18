import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = (process.env.BASE_URL || "https://kalpshahtester.github.io").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });
const failures = [];
const results = [];

async function record(pageName, label, fn) {
  try {
    await fn();
    results.push({ page: pageName, test: label, status: "PASS" });
  } catch (error) {
    failures.push({ page: pageName, test: label, error: error.message });
    results.push({ page: pageName, test: label, status: "FAIL" });
  }
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const desktopErrors = [];
  const desktopConsoleErrors = [];
  desktop.on("console", msg => { if (msg.type() === "error") desktopConsoleErrors.push(msg.text() + " @ " + JSON.stringify(msg.location())); });
  desktop.on("response", response => { if (response.request().resourceType() === "script" && (response.headers()["content-type"] || "").includes("text/css")) desktopConsoleErrors.push("SCRIPT URL SERVED AS CSS: " + response.url()); });
  desktop.on("requestfailed", request => desktopConsoleErrors.push("REQUEST FAILED: " + request.url() + " — " + request.failure()?.errorText));
  desktop.on("pageerror", error => desktopErrors.push(error.message));
  await desktop.goto(baseURL + "/?ci=" + Date.now(), { waitUntil: "networkidle" });
  await desktop.waitForFunction(() => document.documentElement.dataset.appReady === "true", null, { timeout: 8000 }).catch(() => {});
  await record("home / desktop", "Homepage and portrait render", async () => {
    assert.match(await desktop.title(), /Kalp Shah.*Manual QA Tester/);
    const image = desktop.locator(".profile-photo");
    await image.waitFor({ state: "visible" });
    assert.ok(await image.evaluate(el => el.complete && el.naturalWidth > 0), "Profile portrait did not load");
  });
  await record("home / desktop", "Desktop navigation reaches sections", async () => {
    for (const id of ["about", "work", "approach", "experience", "toolkit", "contact"]) {
      const link = desktop.locator('.hud-nav nav a[href="#' + id + '"]');
      await link.click();
      await desktop.waitForTimeout(100);
      assert.equal(await desktop.locator("#" + id).count(), 1, "Missing section #" + id);
      assert.equal(new URL(desktop.url()).hash, "#" + id, "Navigation did not update hash for #" + id);
    }
  });
  await record("home / desktop", "Project quick-view dialog opens and closes", async () => {
    const trigger = desktop.locator(".project-open").first();
    await trigger.waitFor({ state: "visible" });
    await trigger.click();
    const dialog = desktop.locator("dialog.project-dialog");
    await dialog.waitFor({ state: "visible" });
    assert.ok((await dialog.locator("#projectDialogTitle").textContent()).trim().length > 0);
    await dialog.locator(".dialog-close").click();
    await dialog.waitFor({ state: "hidden" });
  });
  await record("home / desktop", "Sample QA interaction completes", async () => {
    const run = desktop.locator("#runChecks");
    await run.click();
    await desktop.waitForFunction(() => document.querySelectorAll(".console-row.done").length === 4, null, { timeout: 5000 });
    assert.match(await desktop.locator("#consoleMessage").textContent(), /4 sample checks complete/i);
    assert.equal(await run.isEnabled(), true);
  });
  await record("home / desktop", "Back-to-top control works", async () => {
    await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await desktop.locator("#backToTop").click();
    await desktop.waitForFunction(() => window.scrollY < 100, null, { timeout: 4000 });
  });
  await record("home / desktop", "No uncaught JavaScript errors", async () => {
    assert.deepEqual([...desktopErrors, ...desktopConsoleErrors], []);
  });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const mobileErrors = [];
  const mobileConsoleErrors = [];
  mobile.on("console", msg => { if (msg.type() === "error") mobileConsoleErrors.push(msg.text() + " @ " + JSON.stringify(msg.location())); });
  mobile.on("response", response => { if (response.request().resourceType() === "script" && (response.headers()["content-type"] || "").includes("text/css")) mobileConsoleErrors.push("SCRIPT URL SERVED AS CSS: " + response.url()); });
  mobile.on("requestfailed", request => mobileConsoleErrors.push("REQUEST FAILED: " + request.url() + " — " + request.failure()?.errorText));
  mobile.on("pageerror", error => mobileErrors.push(error.message));
  await mobile.goto(baseURL + "/?ci=" + Date.now(), { waitUntil: "networkidle" });
  await mobile.waitForFunction(() => document.documentElement.dataset.appReady === "true", null, { timeout: 8000 }).catch(() => {});
  await record("home / mobile", "Mobile navigation opens and closes", async () => {
    const toggle = mobile.locator(".nav-toggle");
    await toggle.waitFor({ state: "visible" });
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    assert.ok(await mobile.locator(".hud-nav nav").evaluate(el => el.classList.contains("open")));
    await mobile.locator('.hud-nav nav a[href="#about"]').click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.ok(!(await mobile.locator(".hud-nav nav").evaluate(el => el.classList.contains("open"))));
    assert.equal(new URL(mobile.url()).hash, "#about");
  });
  await record("home / mobile", "Mobile layout has no horizontal page overflow", async () => {
    const sizes = await mobile.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll("body *")].map(el => ({tag:el.tagName,cls:typeof el.className==="string"?el.className:"",id:el.id,left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width)})).filter(x=>x.right>innerWidth+2||x.left < -2).slice(0,15) }));
    assert.ok(sizes.page <= sizes.viewport + 1, "Horizontal overflow: " + JSON.stringify(sizes));
  });
  await record("home / mobile", "No uncaught JavaScript errors", async () => {
    assert.deepEqual([...mobileErrors, ...mobileConsoleErrors], []);
  });

  for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await record(route, "Project page renders with a heading", async () => {
      assert.ok((await page.locator("h1").first().textContent()).trim().length > 0);
    });
    await record(route, "Project page has no horizontal overflow", async () => {
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      assert.ok(sizes.page <= sizes.viewport + 1, "Horizontal overflow: " + JSON.stringify(sizes));
    });
    await record(route, "Project page has no uncaught JavaScript errors", async () => {
      assert.deepEqual(errors, []);
    });
    await page.close();
  }

  console.log(JSON.stringify({ passed: results.filter(x => x.status === "PASS").length, failed: failures.length, results }, null, 2));
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
