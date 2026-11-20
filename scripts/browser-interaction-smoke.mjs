import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseURL = (process.env.BASE_URL || "https://kalpshahtester.github.io").replace(/\/$/, "");
const screenshotDir = process.env.SAVE_SCREENSHOTS_DIR;
const browser = await chromium.launch({ headless: true });
const failures = [];
const results = [];

async function record(pageName, label, fn) {
  try { await fn(); results.push({ page: pageName, test: label, status: "PASS" }); }
  catch (error) { failures.push({ page: pageName, test: label, error: error.message }); results.push({ page: pageName, test: label, status: "FAIL" }); }
}

async function saveScreenshot(page, filename) {
  if (!screenshotDir) return;
  await fs.mkdir(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, filename), fullPage: true, animations: "disabled" });
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const desktopErrors = [];
  const desktopConsoleErrors = [];
  desktop.on("console", msg => { if (msg.type() === "error") desktopConsoleErrors.push(msg.text()); });
  desktop.on("response", response => {
    if (response.request().resourceType() === "script" && (response.headers()["content-type"] || "").includes("text/css")) {
      desktopConsoleErrors.push("SCRIPT URL SERVED AS CSS: " + response.url());
    }
  });
  desktop.on("pageerror", error => desktopErrors.push(error.message));
  await desktop.goto(baseURL + "/?ci=" + Date.now(), { waitUntil: "networkidle" });
  await desktop.waitForFunction(() => document.documentElement.dataset.appReady === "true", null, { timeout: 8000 });
  await desktop.evaluate(() => document.fonts.ready);

  await record("home / desktop", "Homepage, original portrait and editorial styling render", async () => {
    assert.match(await desktop.title(), /Kalp Shah.*Manual QA Tester/);
    const image = desktop.locator(".profile-photo");
    await image.waitFor({ state: "visible" });
    assert.ok(await image.evaluate(el => el.complete && el.naturalWidth > 0), "Profile portrait did not load");
    assert.match(await image.evaluate(el => el.currentSrc), /Kalp(?:%20|\s)Shah(?:%20|\s)Profile(?:%20|\s)Photo\.png$/i, "Portrait should use the original profile PNG");
    assert.equal(await image.getAttribute("alt"), "Portrait of Kalp Shah, Manual QA Tester");
    assert.equal(await desktop.locator(".hero-linkedin").count(), 0, "Hero should use the quieter text-link presentation");
    assert.equal(await desktop.locator('.hero-actions a[download]').count(), 1, "Résumé download link is missing");
    const design = await desktop.evaluate(() => ({
      background: getComputedStyle(document.body).backgroundColor,
      titleFont: getComputedStyle(document.querySelector(".hero h1")).fontFamily,
      projectRows: document.querySelectorAll(".project-row").length,
      oldLab: document.querySelectorAll(".lab-workbench").length
    }));
    assert.equal(design.background, "rgb(246, 244, 238)", "Editorial paper background did not apply");
    assert.match(design.titleFont, /DM Serif Display/);
    assert.equal(design.projectRows, 3);
    assert.equal(design.oldLab, 0);
  });

  await record("home / desktop", "Main navigation reaches every section", async () => {
    for (const id of ["work", "about", "approach", "experience", "toolkit", "contact"]) {
      const link = desktop.locator('.hud-nav nav a[href="#' + id + '"]');
      await link.click();
      assert.equal(await desktop.locator("#" + id).count(), 1, "Missing section #" + id);
      assert.equal(new URL(desktop.url()).hash, "#" + id, "Navigation did not update hash for #" + id);
    }
  });

  await record("home / desktop", "Project entries link to both case studies and source repositories", async () => {
    assert.equal(await desktop.locator('.project-row a[href="/projects/saucedemo.html"]').count(), 1);
    assert.equal(await desktop.locator('.project-row a[href="/projects/makemytrip.html"]').count(), 1);
    assert.equal(await desktop.locator('.project-row a[href*="Manual-Testing-Project-saucedemo-website"]').count(), 1);
    assert.equal(await desktop.locator('.project-row a[href*="MakeMyTrip-Testing-Assessment"]').count(), 1);
    assert.match(await desktop.locator("#work").innerText(), /Not production-client experience/);
    assert.match(await desktop.locator("#work").innerText(), /Client details kept confidential/);
  });

  await record("home / desktop", "Résumé, contact and profile links are present", async () => {
    assert.equal(await desktop.locator('.hero-actions a[download]').getAttribute("href"), "/Kalp%20Shah%20Manual%20Tester%20Resume.pdf");
    assert.equal(await desktop.locator('.contact-links a[href="mailto:manualtesterkalpshah@gmail.com"]').count(), 1);
    assert.equal(await desktop.locator('.contact-links a[href="https://www.linkedin.com/in/kalp-shah-software-tester/"]').count(), 1);
    assert.equal(await desktop.locator('.contact-links a[href="https://github.com/kalpshahtester"]').count(), 1);
  });

  await saveScreenshot(desktop, "editorial-desktop-homepage.png");

  await record("home / responsive matrix", "Editorial sections fit 280–1920px viewports without horizontal overflow", async () => {
    const widths = [280, 320, 360, 390, 412, 430, 540, 600, 760, 850, 1024, 1280, 1366, 1920];
    for (const width of widths) {
      await desktop.setViewportSize({ width, height: 900 });
      const metrics = await desktop.evaluate(() => {
        const ids = ["top", "work", "about", "approach", "experience", "toolkit", "contact"];
        const sections = ids.map(id => {
          const element = document.getElementById(id);
          const rect = element.getBoundingClientRect();
          return { id, left: Math.round(rect.left), right: Math.round(rect.right), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
        });
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          headerWidth: document.getElementById("siteHeader").scrollWidth,
          sections
        };
      });
      assert.ok(metrics.documentWidth <= width + 1, width + "px document overflow: " + JSON.stringify(metrics));
      assert.ok(metrics.bodyWidth <= width + 1, width + "px body overflow: " + JSON.stringify(metrics));
      assert.ok(metrics.headerWidth <= width + 1, width + "px header overflow: " + JSON.stringify(metrics));
      for (const section of metrics.sections) {
        assert.ok(section.left >= -1 && section.right <= width + 1, width + "px " + section.id + " extends beyond viewport: " + JSON.stringify(metrics));
        assert.ok(section.scrollWidth <= section.clientWidth + 1, width + "px " + section.id + " has internal overflow: " + JSON.stringify(metrics));
      }
    }
    await desktop.setViewportSize({ width: 1440, height: 1000 });
  });

  await record("home / desktop", "No uncaught JavaScript errors", async () => {
    assert.deepEqual([...desktopErrors, ...desktopConsoleErrors], []);
  });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const mobileErrors = [];
  const mobileConsoleErrors = [];
  mobile.on("console", msg => { if (msg.type() === "error") mobileConsoleErrors.push(msg.text()); });
  mobile.on("pageerror", error => mobileErrors.push(error.message));
  await mobile.goto(baseURL + "/?ci=" + Date.now(), { waitUntil: "networkidle" });
  await mobile.waitForFunction(() => document.documentElement.dataset.appReady === "true", null, { timeout: 8000 });
  await record("home / mobile", "Mobile navigation opens, follows a link and closes accessibly", async () => {
    const toggle = mobile.locator(".nav-toggle");
    await toggle.waitFor({ state: "visible" });
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    assert.ok(await mobile.locator(".hud-nav nav").evaluate(el => el.classList.contains("open")));
    await mobile.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.ok(await toggle.evaluate(el => document.activeElement === el));
    await toggle.click();
    await mobile.locator('.hud-nav nav a[href="#about"]').click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.equal(new URL(mobile.url()).hash, "#about");
  });
  await record("home / mobile", "Mobile layout has no horizontal overflow", async () => {
    const sizes = await mobile.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    assert.ok(sizes.page <= sizes.viewport + 1, "Mobile horizontal overflow: " + JSON.stringify(sizes));
  });
  await saveScreenshot(mobile, "editorial-mobile-homepage.png");
  await record("home / mobile", "No uncaught JavaScript errors", async () => {
    assert.deepEqual([...mobileErrors, ...mobileConsoleErrors], []);
  });

  for (const route of ["/projects/saucedemo.html", "/projects/makemytrip.html"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(baseURL + route, { waitUntil: "networkidle" });
    await record(route, "Case study renders in the editorial colour system", async () => {
      assert.ok((await page.locator("h1").first().textContent()).trim().length > 0);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(246, 244, 238)");
    });
    await record(route, "Case study has no horizontal overflow", async () => {
      const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
      assert.ok(sizes.page <= sizes.viewport + 1, "Case-study horizontal overflow: " + JSON.stringify(sizes));
    });
    await record(route, "Case study has no uncaught JavaScript errors", async () => assert.deepEqual(errors, []));
    if (screenshotDir) await saveScreenshot(page, route.includes("saucedemo") ? "editorial-mobile-saucedemo.png" : "editorial-mobile-makemytrip.png");
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
