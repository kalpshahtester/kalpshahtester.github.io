import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./styles/main.css";
import "./styles/quality.css";

gsap.registerPlugin(ScrollTrigger);
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = matchMedia("(pointer: coarse)").matches;
const lowPower = coarse || innerWidth < 760 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
document.documentElement.classList.toggle("reduced-motion", reduced);
$("#year").textContent = new Date().getFullYear();

const preloader = $(".preloader");
if (preloader && !reduced) {
  const count = $("#preloaderCount"), bar = $(".preloader-bar i"), started = performance.now();
  const tick = () => {
    const value = Math.min(100, Math.round(((performance.now() - started) / 950) * 100));
    count.textContent = value; bar.style.width = value + "%";
    if (value < 100) requestAnimationFrame(tick);
    else setTimeout(() => { preloader.classList.add("is-done"); setTimeout(() => preloader.remove(), 450); }, 80);
  };
  requestAnimationFrame(tick);
} else preloader?.remove();

let lenis;
if (!reduced && !coarse) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const progress = $("#scrollProgress");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = (max ? scrollY / max * 100 : 0) + "%";
  $("#siteHeader")?.classList.toggle("scrolled", scrollY > 20);
};
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const navToggle = $(".nav-toggle"), nav = $(".hud-nav nav");
navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") !== "true";
  navToggle.setAttribute("aria-expanded", String(open)); nav.classList.toggle("open", open);
});
$$(".hud-nav nav a").forEach(link => link.addEventListener("click", () => {
  navToggle?.setAttribute("aria-expanded", "false"); nav?.classList.remove("open");
}));

// Active navigation follows the section currently occupying the reading viewport.
const navLinks = $$(".hud-nav nav a");
const sections = navLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
const activeObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  navLinks.forEach(link => {
    const active = link.hash === "#" + entry.target.id;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
  });
}), { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => activeObserver.observe(section));

// Scroll reveals are progressive enhancement; content remains visible without JS or motion.
if (!reduced && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  $$(".reveal-lines,.reveal-card,.timeline article,.toolkit-grid article").forEach(el => observer.observe(el));
} else $$(".reveal-lines,.reveal-card,.timeline article,.toolkit-grid article").forEach(el => el.classList.add("is-visible"));

const counters = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  const el = entry.target, target = Number(el.dataset.count), suffix = el.dataset.suffix || "";
  if (reduced) el.textContent = target + suffix;
  else gsap.to({ value: 0 }, { value: target, duration: 1.35, ease: "power2.out",
    onUpdate() { el.textContent = Math.round(this.targets()[0].value) + suffix; } });
  counters.unobserve(el);
}), { threshold: 0.6 });
$$("[data-count]").forEach(el => counters.observe(el));

// Keep the 3D payload out of the critical path; mobile/reduced-motion uses the CSS fallback.
if (!reduced && !lowPower && $("#qaScene")) {
  const loadScene = () => import("./scenes/qa-scene.js").then(({ createQAScene }) => createQAScene($("#qaScene"))).catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(loadScene, { timeout: 1800 });
  else setTimeout(loadScene, 500);
}

// Lifecycle choreography: browser layers separate and status pins progress with scroll.
if (!reduced && !lowPower && $(".hero-scene")) {
  gsap.to(".hero-scene", { y: -24, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
  gsap.fromTo(".hero h1 span", { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out", delay: 0.1 });
  gsap.utils.toArray(".timeline article").forEach((item, index) => gsap.fromTo(item, { x: -18, opacity: 0 }, {
    x: 0, opacity: 1, duration: 0.7, ease: "power2.out",
    scrollTrigger: { trigger: item, start: "top 82%" }, delay: index * 0.04
  }));
}

// Four-step pinned horizontal approach on larger screens; natural vertical stack on small screens.
const track = $(".approach-track");
if (track && !reduced && !lowPower) {
  const cards = $$(".approach-track article");
  gsap.to(track, { x: () => -Math.max(0, track.scrollWidth - track.parentElement.clientWidth),
    ease: "none", scrollTrigger: { trigger: ".approach-section", start: "top top+=90",
      end: () => "+=" + Math.max(500, track.scrollWidth), pin: true, scrub: 1, invalidateOnRefresh: true } });
  cards.forEach((card, i) => gsap.fromTo(card, { opacity: .45 }, { opacity: 1,
    scrollTrigger: { trigger: card, containerAnimation: gsap.getTweensOf(track)[0], start: "left 85%", end: "left 45%", scrub: true } }));
}

// Accessible project details: native dialog provides focus handling and Escape behavior.
const dialog = document.createElement("dialog");
dialog.className = "project-dialog";
dialog.setAttribute("aria-labelledby", "projectDialogTitle");
dialog.innerHTML = '<form method="dialog"><button class="dialog-close" aria-label="Close project details">×</button></form><p class="eyebrow" id="projectDialogType">PROJECT DETAIL</p><h2 id="projectDialogTitle"></h2><p id="projectDialogCopy"></p><a class="button button-accent" id="projectDialogLink">Open full case study ↗</a>';
document.body.append(dialog);
$$(".work-card").forEach(card => {
  const title = $("h3", card)?.textContent || "Selected project";
  const link = $('a[href*="/projects/"]', card);
  const trigger = document.createElement("button");
  trigger.type = "button"; trigger.className = "project-open"; trigger.textContent = "Quick view ↗";
  trigger.setAttribute("aria-label", "Quick view: " + title);
  $(".work-body", card)?.append(trigger);
  trigger.addEventListener("click", () => {
    $("#projectDialogTitle").textContent = title;
    $("#projectDialogType").textContent = $(".eyebrow", card)?.textContent || "PROJECT";
    $("#projectDialogCopy").textContent = $("p:not(.eyebrow)", card)?.textContent || "";
    const target = $("#projectDialogLink"); target.href = link?.href || "#work";
    dialog.showModal(); $(".dialog-close", dialog).focus();
  });
});
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

// Local illustrative checklist only. No remote requests or external-site scanning.
const checks = $("#consoleChecks"), run = $("#runChecks"), message = $("#consoleMessage");
run?.addEventListener("click", () => {
  const rows = $$(".console-row", checks); run.disabled = true;
  rows.forEach(row => { row.classList.remove("done"); $("i", row).textContent = "QUEUED"; });
  message.textContent = "Running local sample checks…";
  let index = 0;
  const timer = setInterval(() => {
    const row = rows[index]; row.classList.add("done"); $("i", row).textContent = "CHECKED";
    index++;
    message.textContent = index === rows.length ? "4 sample checks complete — no external site accessed." : "Sample step " + index + " / " + rows.length;
    if (index === rows.length) { clearInterval(timer); run.disabled = false; run.textContent = "Run again ↻"; }
  }, reduced ? 20 : 300);
});

$("#backToTop")?.addEventListener("click", () => {
  if (lenis) lenis.scrollTo(0); else scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
});
if (!reduced && matchMedia("(pointer:fine) and (hover:hover)").matches) {
  const dot = $(".cursor-dot"), ring = $(".cursor-ring");
  addEventListener("pointermove", event => {
    dot.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    ring.style.transform = `translate3d(${event.clientX - 16}px,${event.clientY - 16}px,0)`;
  }, { passive: true });
  $$("a,button").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
}
