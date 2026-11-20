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
    assert.match(await image.evaluate(el => el.currentSrc), /Kalp(?:%20|\s)Shah(?:%20|\s)Profile(?:%20|\s)Photo\.png$/i, "Portrait should use the original profile PNG asset");
    assert.equal(await image.getAttribute("alt"), "Portrait of Kalp Shah, Manual QA Tester", "Portrait alternative text is missing or inaccurate");
    const linkedin = desktop.locator(".hero-linkedin");
    assert.equal(await linkedin.getAttribute("href"), "https://www.linkedin.com/in/kalp-shah-software-tester/", "Hero LinkedIn destination is incorrect");
    assert.equal(await linkedin.getAttribute("target"), "_blank", "LinkedIn should open in a new tab");
    assert.equal(await desktop.locator('.footer-contact-links a[href="https://www.linkedin.com/in/kalp-shah-software-tester/"]').count(), 1, "Contact LinkedIn link is missing");
    assert.equal(await desktop.locator('.hero-actions a[download]').count(), 1, "Résumé download link is missing");
    const viewResume = desktop.locator("#resumeViewButton");
    const downloadResume = desktop.locator("#resumeDownloadButton");
    await viewResume.waitFor({ state: "visible" });
    await downloadResume.waitFor({ state: "visible" });
    assert.ok((await viewResume.innerText()).includes("View Resume"), "View Resume label is missing");
    assert.ok((await downloadResume.innerText()).includes("Download Resume"), "Download Resume label is missing");
    assert.equal(await viewResume.getAttribute("href"), "/Kalp%20Shah%20Manual%20Tester%20Resume.pdf");
    assert.equal(await downloadResume.getAttribute("href"), await viewResume.getAttribute("href"), "View and download actions must point to the same résumé PDF");
    assert.equal(await viewResume.getAttribute("target"), "_blank", "View Resume should open the PDF in a new tab");
    assert.ok((await viewResume.getAttribute("aria-label") || "").includes("résumé"), "View Resume needs a descriptive accessible label");
    const pdfInfo = await desktop.evaluate(async href => {
      const response = await fetch(new URL(href, window.location.origin), { cache: "no-store" });
      const bytes = await response.arrayBuffer();
      return {
        status: response.status,
        contentType: response.headers.get("content-type") || "",
        signature: String.fromCharCode(...new Uint8Array(bytes.slice(0, 5))),
        size: bytes.byteLength
      };
    }, await viewResume.getAttribute("href"));
    assert.equal(pdfInfo.status, 200, "Résumé PDF should return HTTP 200");
    assert.match(pdfInfo.contentType, /application\/pdf/i, "Résumé should be served as a PDF");
    assert.equal(pdfInfo.signature, "%PDF-", "Résumé response is not a valid PDF");
    assert.ok(pdfInfo.size > 1000, "Résumé PDF response is unexpectedly small");

  });
  await record("home / desktop", "Desktop navigation reaches sections", async () => {
    for (const id of ["about", "work", "approach", "experience", "toolkit", "footer-contact"]) {
      const link = desktop.locator('.hud-nav nav a[href="#' + id + '"]');
      await link.click();
      await desktop.waitForTimeout(100);
      assert.equal(await desktop.locator("#" + id).count(), 1, "Missing section #" + id);
      assert.equal(new URL(desktop.url()).hash, "#" + id, "Navigation did not update hash for #" + id);
    }
  });
  await record("home / desktop", "Standalone sections removed and footer contacts remain usable", async () => {
    assert.equal(await desktop.locator(".contact-section").count(), 0, "Standalone conversation section should be removed");
    assert.equal(await desktop.locator(".quality-section").count(), 0, "Site quality report section should be removed");
    assert.equal(await desktop.locator(".footer-contact-links a").count(), 4, "Footer should expose email, LinkedIn, GitHub and WhatsApp");
    assert.equal(await desktop.locator('.footer-contact-links a[href^="mailto:"]').count(), 1, "Footer email link is missing");
    assert.equal(await desktop.locator('.footer-contact-links a[href="https://github.com/kalpshahtester"]').count(), 1, "Footer GitHub link is missing");
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
  await record("home / responsive matrix", "Primary sections and hero actions fit 280–1920px viewports", async () => {
    const widths = [280, 320, 360, 390, 412, 430, 540, 768, 850, 1024, 1280, 1366, 1920];
    for (const width of widths) {
      await desktop.setViewportSize({ width, height: 900 });
      const metrics = await desktop.evaluate(() => {
        const ids = ["about", "work", "approach", "experience", "toolkit", "footer-contact"];
        const resumeActions = [...document.querySelectorAll(".hero-actions a")].map(el => { const rect = el.getBoundingClientRect(); return { text: el.textContent.trim(), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), visible: rect.width > 0 && getComputedStyle(el).visibility !== "hidden" && getComputedStyle(el).display !== "none" }; });
        const sections = ids.map(id => {
          const element = document.getElementById(id);
          const rect = element.getBoundingClientRect();
          return {
            id,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth
          };
        });
        const header = document.getElementById("siteHeader");
        const wideNodes = [...document.querySelectorAll("body *")].map(el => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || "",
            className: typeof el.className === "string" ? el.className.toString().slice(0,90) : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            clientWidth: el.clientWidth,
            scrollWidth: el.scrollWidth,
            display: style.display,
            whiteSpace: style.whiteSpace
          };
        }).filter(el => el.right > innerWidth + 2 || el.left < -2 || el.scrollWidth > el.clientWidth + 2)
          .sort((a,b) => Math.max(b.right-innerWidth, b.scrollWidth-b.clientWidth) - Math.max(a.right-innerWidth, a.scrollWidth-a.clientWidth))
          .slice(0,18);
        return {
          viewport: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          headerWidth: header?.scrollWidth || 0,
          sections,
          resumeActions,
          wideNodes
        };
      });
      assert.ok(metrics.documentWidth <= width + 1, width + "px document overflow: " + JSON.stringify(metrics));
      assert.ok(metrics.bodyWidth <= width + 1, width + "px body overflow: " + JSON.stringify(metrics));
      assert.ok(metrics.headerWidth <= width + 1, width + "px navigation overflow: " + JSON.stringify(metrics));
      assert.equal(metrics.resumeActions.length, 4, width + "px should render all four hero actions: " + JSON.stringify(metrics.resumeActions));
      for (const action of metrics.resumeActions) {
        assert.ok(action.visible && action.width > 0, width + "px hero action is hidden: " + JSON.stringify(action));
        assert.ok(action.left >= -1 && action.right <= width + 1, width + "px hero action is clipped: " + JSON.stringify(action));
      }
      for (const section of metrics.sections) {
        assert.ok(section.left >= -1 && section.right <= width + 1, width + "px " + section.id + " extends beyond viewport: " + JSON.stringify(metrics));
        assert.ok(section.scrollWidth <= section.clientWidth + 1, width + "px " + section.id + " has internal horizontal overflow: " + JSON.stringify(metrics));
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
    await mobile.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false", "Escape should close the mobile menu");
    assert.ok(await toggle.evaluate(el => document.activeElement === el), "Escape should restore focus to the menu button");
    await toggle.click();
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
