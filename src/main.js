import "./styles/main.css";
import "./styles/quality.css";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = matchMedia("(pointer: coarse)").matches;
const lowPower = coarse || innerWidth < 760 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
document.documentElement.classList.toggle("reduced-motion", reduced);
$("#year").textContent = new Date().getFullYear();


// Scroll progress and header state are independent of the animation libraries.
const progress = $("#scrollProgress");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = (max ? scrollY / max * 100 : 0) + "%";
  $("#siteHeader")?.classList.toggle("scrolled", scrollY > 20);
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

// Keep the 3D payload off mobile, reduced-motion and low-power execution paths.
if (reduced || lowPower) $("#qaScene")?.setAttribute("hidden", "");
const scheduleIdle = callback => {
  if ("requestIdleCallback" in window) requestIdleCallback(callback, { timeout: 2200 });
  else setTimeout(callback, 900);
};
if (!reduced && !lowPower && $("#qaScene")) {
  scheduleIdle(() => {
    import("./scenes/qa-scene.js")
      .then(({ createQAScene }) => createQAScene($("#qaScene")))
      .catch(() => $("#qaScene")?.setAttribute("hidden", ""));
  });
}

// Desktop-only motion is split into deferred chunks. The heading remains visible before they load.
if (!reduced && !lowPower) {
  scheduleIdle(async () => {
    try {
      const results = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger")
      ]);
      const gsap = results[0].gsap;
      const ScrollTrigger = results[1].ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if ($(".hero-scene")) {
        gsap.to(".hero-scene", {
          y: -24,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
        });
        // Keep opacity at 1 so the main heading is eligible for early paint/LCP.
        gsap.fromTo(".hero h1 span", { y: 18, opacity: 1 }, {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: "power3.out"
        });
      }

      gsap.utils.toArray(".timeline article").forEach((item, index) => {
        gsap.fromTo(item, { x: -18, opacity: 1 }, {
          x: 0, opacity: 1, duration: 0.65, ease: "power2.out",
          scrollTrigger: { trigger: item, start: "top 82%" },
          delay: index * 0.04
        });
      });

      // Keep approach steps in normal document flow. Pinned horizontal
      // scrolling introduced a long artificial scroll segment and broke
      // predictable touch scrolling and anchor navigation on some screens.
      gsap.utils.toArray(".approach-track article").forEach((card, index) => {
        gsap.fromTo(card, { y: 16 }, {
          y: 0, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
          delay: index * 0.04
        });
      });

    } catch (error) {
      // The site remains completely usable when an optional animation chunk is unavailable.
      console.warn("Optional motion enhancement could not be initialized.", error);
    }
  });
}

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
