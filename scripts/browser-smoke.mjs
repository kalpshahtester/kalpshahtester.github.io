import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173";
const routes = [
  { path: "/", heading: /Find the edge/i, motionState: "__portfolioMotionState" },
  { path: "/projects/saucedemo.html", heading: /Testing the/i, motionState: "__caseStudyMotionState" },
  { path: "/projects/makemytrip.html", heading: /Travel journeys/i, motionState: "__caseStudyMotionState" }
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
const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const browser = await chromium.launch({ headless: true });
const failures = [];
const auditResults = [];
let checks = 0;

async function runAccessibilityAudit(page, route, viewportName) {
  const result = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  const violations = result.violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.help,
    nodes: violation.nodes.map(node => ({
      target: node.target,
      summary: node.failureSummary?.slice(0, 500)
    }))
  }));
  auditResults.push({ route, viewport: viewportName, violations });
  assert.deepEqual(
    violations,
    [],
    "Accessibility violations on " + route + " at " + viewportName + ": " + JSON.stringify(violations)
  );
  checks += 1;
}

try {
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on("pageerror", error => failures.push(route.path + " uncaught page error: " + error.message));
    page.on("console", message => {
      if (message.type() === "error") failures.push(route.path + " console error: " + message.text());
    });
    page.on("response", response => {
      const url = response.url();
      const criticalExternal = /^(https:\/\/cdn\.jsdelivr\.net|https:\/\/fonts\.googleapis\.com|https:\/\/fonts\.gstatic\.com)\//i.test(url);
      if ((url.startsWith(baseURL) || criticalExternal) && response.status() >= 400) {
        failures.push(route.path + " HTTP " + response.status() + ": " + url);
      }
    });
    page.on("requestfailed", request => {
      const url = request.url();
      const criticalExternal = /^(https:\/\/cdn\.jsdelivr\.net|https:\/\/fonts\.googleapis\.com|https:\/\/fonts\.gstatic\.com)\//i.test(url);
      if (url.startsWith(baseURL) || criticalExternal) {
        failures.push(route.path + " failed request: " + url + " — " + (request.failure()?.errorText || "unknown"));
      }
    });

    const response = await page.goto(baseURL + route.path, { waitUntil: "domcontentloaded" });
    assert.ok(response && response.ok(), route.path + " should return HTTP 200");
    assert.ok(await page.title(), route.path + " must have a title");
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    assert.match(await page.getByRole("heading", { level: 1 }).innerText(), route.heading);

    // The first keyboard stop is the skip link, and activating it focuses main.
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.className), "skip-link", route.path + " skip link must be first keyboard stop");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.activeElement?.id === "main");
    await page.evaluate(() => history.replaceState({}, "", location.pathname + location.search));
    checks += 2;

    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(300);
    if (route.path !== "/") {
      // Audit the settled, fully opaque intro state rather than measuring text midway through a fade-in.
      await page.waitForFunction(() => {
        const intro = [".case-breadcrumbs", ".case-title", ".case-lead"];
        return intro.every(selector => {
          const element = document.querySelector(selector);
          return !element || Number(getComputedStyle(element).opacity) >= 0.99;
        });
      }, null, { timeout: 8_000 });
    }

    // Verify that the production CSS and JavaScript have actually loaded.
    const loadedAssets = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"],script[src]')]
      .map(element => ({ url: element.href || element.src, loaded: element.tagName === "SCRIPT" ? element.dataset.loaded !== "false" : Boolean(element.sheet) })));
    assert.ok(loadedAssets.some(asset => asset.url.includes("/assets/css/premium.css") && asset.loaded), route.path + " premium stylesheet did not load");
    assert.ok(loadedAssets.some(asset => asset.url.includes("/assets/js/") && asset.loaded), route.path + " JavaScript asset did not load");
    if (route.path !== "/") {
      assert.ok(loadedAssets.some(asset => asset.url.includes("/assets/css/case-study.css") && asset.loaded), route.path + " case-study stylesheet did not load");
    }
    checks += 3;

    // All page images must complete successfully and have alternative text.
    const imageResults = await page.locator("img").evaluateAll(images => images.map(image => ({
      src: image.currentSrc || image.src,
      loaded: image.complete && image.naturalWidth > 0,
      altPresent: image.hasAttribute("alt")
    })));
    assert.ok(imageResults.every(image => image.loaded && image.altPresent), route.path + " contains a broken or unlabelled image: " + JSON.stringify(imageResults));
    checks += 1;

    // The animation libraries must initialise on the normal-motion experience.
    await page.waitForFunction(
      stateName => window[stateName]?.status === "ready" || window[stateName]?.status === "fallback",
      route.motionState,
      { timeout: 20_000 }
    );
    const motion = await page.evaluate(stateName => window[stateName], route.motionState);
    assert.equal(motion?.status, "ready", route.path + " motion libraries failed to initialise: " + JSON.stringify(motion));
    assert.equal(motion?.gsap, true, route.path + " GSAP did not initialise");
    assert.equal(motion?.scrollTrigger, true, route.path + " ScrollTrigger did not initialise");
    if (route.path === "/") assert.equal(motion?.lenis, true, "homepage Lenis smooth scrolling did not initialise");
    checks += route.path === "/" ? 4 : 3;

    // Confirm in-page navigation targets and asset paths can be resolved by the browser.
    const linkAudit = await page.locator('a[href^="/"]').evaluateAll(async links => {
      const urls = [...new Set(links.map(link => new URL(link.getAttribute("href"), location.origin)).filter(url => url.origin === location.origin && !url.hash).map(url => url.pathname))];
      const results = await Promise.all(urls.map(async pathname => {
        try {
          const response = await fetch(pathname, { method: "HEAD", cache: "no-store" });
          return { pathname, status: response.status, ok: response.ok };
        } catch (error) {
          return { pathname, status: 0, ok: false, error: String(error) };
        }
      }));
      return results;
    });
    assert.ok(linkAudit.every(item => item.ok), route.path + " contains a broken first-party link: " + JSON.stringify(linkAudit));
    checks += linkAudit.length;

    await runAccessibilityAudit(page, route.path, "1366px desktop");

    if (route.path === "/") {
      const portrait = page.locator(".portrait-frame img");
      assert.ok(await portrait.evaluate(img => img.complete && img.naturalWidth > 0), "homepage portrait must load");
      assert.equal(await page.locator(".hero").evaluate(element => getComputedStyle(element).position), "relative", "hero footer must be positioned inside the hero");

      await page.getByRole("button", { name: /run sample/i }).click();
      await page.waitForFunction(() => document.querySelectorAll(".console-check.done").length === 4, null, { timeout: 8_000 });
      assert.match(await page.locator("#consoleMessage").innerText(), /no external site was accessed/i);
      await page.getByRole("button", { name: /run again/i }).click();
      await page.waitForFunction(() => document.querySelectorAll(".console-check.done").length === 4, null, { timeout: 8_000 });
      checks += 3;

      // Keyboard escape must close the menu and return focus to its trigger.
      await page.setViewportSize({ width: 390, height: 844 });
      const toggle = page.locator("#menuToggle");
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true", "mobile menu should open");
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false", "Escape should close the mobile menu");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "menuToggle", "Escape should return focus to the menu trigger");
      await toggle.click();
      await page.locator('#primaryNav a[href="#projects"]').click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false", "mobile menu should close after navigation");
      await page.waitForFunction(() => location.hash === "#projects");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "projects", "in-page navigation should move keyboard focus to the destination");
      await page.goBack();
      await page.waitForFunction(() => location.hash === "");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator("#backToTop").waitFor({ state: "visible" });
      await page.locator("#backToTop").click();
      await page.waitForFunction(() => window.scrollY < 4);
      assert.equal(await page.evaluate(() => document.activeElement?.id), "top", "homepage back-to-top should focus the hero section");
      assert.equal(await page.evaluate(() => location.hash), "", "homepage back-to-top should not leave a stale hash");
      checks += 9;

      // Check the custom cursor enhancement without allowing it to hide the only pointer.
      await page.setViewportSize({ width: 1366, height: 900 });
      await page.mouse.move(600, 400);
      assert.ok(await page.locator(".cursor-dot").evaluate(element => getComputedStyle(element).opacity !== "0"), "desktop cursor dot should be visible after pointer movement");
      checks += 1;
    } else {
      // Case-study section navigation must update both focus and the active section state.
      const sectionLink = page.locator('.case-sidebar a[href="#scope"]');
      await sectionLink.click();
      await page.waitForFunction(() => location.hash === "#scope");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "scope", "case-study anchor should move focus to the selected section");
      await page.waitForFunction(() => document.querySelector('.case-sidebar a[href="#scope"]')?.getAttribute("aria-current") === "location");
      await page.setViewportSize({ width: 390, height: 844 });
      const toggle = page.locator("#menuToggle");
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true", "case-study mobile menu should open");
      await page.keyboard.press("Escape");
      assert.equal(await toggle.getAttribute("aria-expanded"), "false", "case-study Escape should close the mobile menu");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "menuToggle", "case-study Escape should restore focus");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator("#backToTop").waitFor({ state: "visible" });
      await page.locator("#backToTop").click();
      await page.waitForFunction(() => window.scrollY < 4);
      assert.equal(await page.evaluate(() => location.hash), "", "case-study back-to-top should remove the previous hash");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "main", "case-study back-to-top should restore main focus");
      checks += 8;
    }

    // Every viewport must remain within the viewport without clipping user-facing content.
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(80);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
      }));
      const visibleOverflow = await page.evaluate(() => {
        const selectors = "main h1,main h2,main h3,main p,main a,main button,main li,main .project-card,main .case-content,main .contact-card";
        return [...document.querySelectorAll(selectors)].filter(element => !element.closest(".case-sidebar")).map(element => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, className: typeof element.className === "string" ? element.className : "", left: Math.round(rect.left), right: Math.round(rect.right) };
        }).filter(element => element.left < -1 || element.right > innerWidth + 1);
      });
      assert.ok(
        dimensions.document <= dimensions.viewport + 1 && visibleOverflow.length === 0,
        route.path + " visible horizontal overflow at " + viewport.width + "px: " + JSON.stringify({ ...dimensions, visibleOverflow })
      );
      checks += 1;
      if (viewport.width === 390 || viewport.width === 768) {
        await runAccessibilityAudit(page, route.path, viewport.width + "px responsive");
      }
    }

    // Test the reduced-motion path from a fresh page load, not after runtime settings change.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    const reducedState = await page.evaluate(stateName => window[stateName], route.motionState);
    assert.equal(reducedState?.status, "reduced-motion", route.path + " should respect prefers-reduced-motion");
    assert.ok(await page.getByRole("heading", { level: 1 }).isVisible(), route.path + " content must remain visible with reduced motion enabled");
    checks += 2;

    await context.close();
  }

  // Optional animation-CDN failure must not block page content or interactions.
  const fallbackContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.route("https://cdn.jsdelivr.net/**", route => route.abort());
  await fallbackPage.goto(baseURL + "/", { waitUntil: "domcontentloaded" });
  await fallbackPage.waitForFunction(() => window.__portfolioMotionState?.status === "fallback");
  assert.ok(await fallbackPage.getByRole("heading", { level: 1 }).isVisible(), "homepage content must remain visible when the animation CDN is unavailable");
  await fallbackPage.getByRole("button", { name: /run sample/i }).click();
  await fallbackPage.waitForFunction(() => document.querySelectorAll(".console-check.done").length === 4);
  checks += 2;
  await fallbackContext.close();

  assert.deepEqual(failures, [], "Browser runtime, console and critical asset errors were detected");
  console.log("Browser and accessibility checks passed: " + checks + " assertions across " + routes.length + " pages, " + viewports.length + " viewport sizes and " + auditResults.length + " axe scans.");
} finally {
  await browser.close();
}
