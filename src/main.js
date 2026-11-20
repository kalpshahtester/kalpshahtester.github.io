const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.toggle("reduced-motion", reduced);
document.documentElement.classList.add("js-ready");
$("#year").textContent = new Date().getFullYear();


// Scroll progress and header state are independent of the animation libraries.
const progress = $("#scrollProgress");
let progressFrame = 0;
const updateProgress = () => {
  if (progressFrame) return;
  progressFrame = requestAnimationFrame(() => {
    progressFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max ? scrollY / max * 100 : 0) + "%";
    $("#siteHeader")?.classList.toggle("scrolled", scrollY > 20);
  });
};
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress, { passive: true });
updateProgress();

// Accessible mobile navigation, including Escape-to-close and focus restoration.
const navToggle = $(".nav-toggle");
const nav = $(".hud-nav nav");
const closeMenu = (restoreFocus = false) => {
  navToggle?.setAttribute("aria-expanded", "false");
  nav?.classList.remove("open");
  if (restoreFocus) navToggle?.focus();
};
navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("open", open);
  if (open) nav?.querySelector("a")?.focus();
});
$$(".hud-nav nav a").forEach(link => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navToggle?.getAttribute("aria-expanded") === "true") closeMenu(true);
});

// Active navigation follows the section currently occupying the reading viewport.
const navLinks = $$(".hud-nav nav a");
const sections = navLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      const active = link.hash === "#" + entry.target.id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }), { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => activeObserver.observe(section));
}

// Reveal content without making it dependent on animation-library downloads.
const revealTargets = $$(".reveal-lines,.reveal-card,.timeline article,.toolkit-grid article");
if (!reduced && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add("is-visible"));
}

// Lightweight counters use native animation frames; GSAP is not required for core content.
const animateCounter = (el, target, suffix) => {
  if (reduced) {
    el.textContent = target + suffix;
    return;
  }
  const started = performance.now();
  const duration = 850;
  const tick = now => {
    const ratio = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - ratio, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (ratio < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const counterTargets = $$("[data-count]");
if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    animateCounter(el, Number(el.dataset.count), el.dataset.suffix || "");
    counterObserver.unobserve(el);
  }), { threshold: 0.6 });
  counterTargets.forEach(el => counterObserver.observe(el));
} else {
  counterTargets.forEach(el => animateCounter(el, Number(el.dataset.count), el.dataset.suffix || ""));
}

// Motion is deliberately CSS-led: no 3D scene or animation-library download is needed for core content.

// Accessible project details: native dialog handles focus and Escape behavior.
const dialog = document.createElement("dialog");
dialog.className = "project-dialog";
dialog.setAttribute("aria-labelledby", "projectDialogTitle");
dialog.innerHTML = '<form method="dialog"><button class="dialog-close" aria-label="Close project details">×</button></form><p class="eyebrow" id="projectDialogType">PROJECT DETAIL</p><h2 id="projectDialogTitle"></h2><p id="projectDialogCopy"></p><a class="button button-accent" id="projectDialogLink">Open full case study ↗</a>';
document.body.append(dialog);
$$(".work-card").forEach(card => {
  const title = $("h3", card)?.textContent || "Selected project";
  const link = $('a[href*="/projects/"]', card);
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "project-open";
  trigger.textContent = "Quick view ↗";
  trigger.setAttribute("aria-label", "Quick view: " + title);
  $(".work-body", card)?.append(trigger);
  trigger.addEventListener("click", () => {
    $("#projectDialogTitle").textContent = title;
    $("#projectDialogType").textContent = $(".eyebrow", card)?.textContent || "PROJECT";
    $("#projectDialogCopy").textContent = $("p:not(.eyebrow)", card)?.textContent || "";
    const target = $("#projectDialogLink");
    target.href = link?.href || "#work";
    dialog.showModal();
    $(".dialog-close", dialog).focus();
  });
});
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

// Accessible QA Lab tabs: mouse, touch and keyboard users can switch sample views.
const labTabs = $$(".lab-tab");
const setLabTab = (activeTab, moveFocus = false) => {
  labTabs.forEach(tab => {
    const selected = tab === activeTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = $("#" + tab.getAttribute("aria-controls"));
    if (panel) panel.hidden = !selected;
  });
  if (moveFocus) activeTab.focus();
};
labTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setLabTab(tab));
  tab.addEventListener("keydown", event => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % labTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + labTabs.length) % labTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = labTabs.length - 1;
    else return;
    event.preventDefault();
    setLabTab(labTabs[nextIndex], true);
  });
});

const sampleText = id => {
  const root = $("#" + id);
  if (!root) return "";
  return [...root.querySelectorAll("dl > div")].map(row => {
    const label = $("dt", row)?.textContent?.trim() || "";
    const value = $("dd", row)?.innerText?.trim() || "";
    return label + ":\n" + value;
  }).join("\n\n");
};
const writeClipboard = async value => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard is unavailable in this browser.");
};
const bindSampleCopy = (buttonId, sourceId, statusId, successText) => {
  const button = $("#" + buttonId);
  const status = $("#" + statusId);
  button?.addEventListener("click", async () => {
    const value = sampleText(sourceId);
    if (!value) return;
    button.disabled = true;
    try {
      await writeClipboard(value);
      if (status) status.textContent = successText;
    } catch (error) {
      if (status) status.textContent = "Copy is unavailable here. Select the sample text to copy it manually.";
      console.warn("QA Lab copy action was unavailable.", error);
    } finally {
      button.disabled = false;
    }
  });
};
bindSampleCopy("copyBugReport", "sampleBugText", "bugCopyStatus", "Sample bug report copied. This is illustrative data.");
bindSampleCopy("copyTestCase", "sampleCaseText", "caseCopyStatus", "Sample test case copied. No execution result is claimed.");

// Local illustrative checklist only. No remote requests or external-site scanning.
const checks = $("#consoleChecks");
const run = $("#runChecks");
const message = $("#consoleMessage");
run?.addEventListener("click", () => {
  const rows = $$(".console-row", checks);
  run.disabled = true;
  rows.forEach(row => {
    row.classList.remove("done");
    $("i", row).textContent = "QUEUED";
  });
  message.textContent = "Running local sample checks…";
  let index = 0;
  const timer = setInterval(() => {
    const row = rows[index];
    row.classList.add("done");
    $("i", row).textContent = "CHECKED";
    index += 1;
    message.textContent = index === rows.length
      ? "4 sample checks complete — no external site accessed."
      : "Sample step " + index + " / " + rows.length;
    if (index === rows.length) {
      clearInterval(timer);
      run.disabled = false;
      run.textContent = "Run again ↻";
    }
  }, reduced ? 20 : 260);
});

$("#backToTop")?.addEventListener("click", () => {
  scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
});

if (!reduced && matchMedia("(pointer:fine) and (hover:hover)").matches) {
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  addEventListener("pointermove", event => {
    dot.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
    ring.style.transform = "translate3d(" + (event.clientX - 16) + "px," + (event.clientY - 16) + "px,0)";
  }, { passive: true });
  $$("a,button").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
}


// Expose a deterministic readiness marker for production smoke tests and diagnostics.
document.documentElement.dataset.appReady = "true";
