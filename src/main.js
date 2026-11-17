import { createQAScene } from "./scenes/qa-scene.js";
import "./styles/main.css";
import "./styles/quality.css";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);
document.documentElement.classList.toggle("reduced-motion", reduced);
$("#year").textContent = new Date().getFullYear();

const preloader = $(".preloader");
if (preloader && !reduced) { const count = $("#preloaderCount"), bar = $(".preloader-bar i"); let value = 0; const timer = setInterval(() => { value = Math.min(100, value + 8); count.textContent = value; bar.style.width = `${value}%`; if (value === 100) { clearInterval(timer); setTimeout(() => preloader.remove(), 180); } }, 18); } else preloader?.remove();
createQAScene($("#qaScene"));

const progress = $("#scrollProgress");
addEventListener("scroll", () => { const max = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${max ? scrollY / max * 100 : 0}%`; $("#siteHeader").classList.toggle("scrolled", scrollY > 20); }, { passive: true });
const navToggle = $(".nav-toggle"), nav = $(".hud-nav nav");
navToggle?.addEventListener("click", () => { const open = navToggle.getAttribute("aria-expanded") !== "true"; navToggle.setAttribute("aria-expanded", open); nav.classList.toggle("open", open); });
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => { navToggle?.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }));

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }), { threshold: 0.15 });
document.querySelectorAll(".reveal-lines,.reveal-card,.timeline article,.toolkit-grid article").forEach((el) => observer.observe(el));
const counters = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; const el = entry.target; const target = Number(el.dataset.count); let current = 0; const step = Math.max(1, Math.ceil(target / 24)); const tick = () => { current = Math.min(target, current + step); el.textContent = `${current}${el.dataset.suffix || ""}`; if (current < target && !reduced) requestAnimationFrame(tick); }; tick(); counters.unobserve(el); }), { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => counters.observe(el));

const checks = $("#consoleChecks"), run = $("#runChecks"), message = $("#consoleMessage");
run?.addEventListener("click", () => { const rows = [...checks.querySelectorAll(".console-row")]; run.disabled = true; let index = 0; message.textContent = "Sample checks in progress…"; const timer = setInterval(() => { const row = rows[index]; row.classList.add("done"); row.querySelector("i").textContent = "CHECKED"; index += 1; message.textContent = index === rows.length ? "Sample complete — no external site was accessed." : `Illustrative step ${index} of ${rows.length}.`; if (index === rows.length) { clearInterval(timer); run.disabled = false; run.textContent = "Run again ↻"; } }, reduced ? 25 : 350); });
$("#backToTop")?.addEventListener("click", () => { scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); $("#main").focus(); });
if (matchMedia("(pointer:fine) and (hover:hover)").matches && !reduced) { const dot = $(".cursor-dot"), ring = $(".cursor-ring"); addEventListener("pointermove", (event) => { dot.style.transform = `translate(${event.clientX}px,${event.clientY}px)`; ring.style.transform = `translate(${event.clientX - 16}px,${event.clientY - 16}px)`; }); document.querySelectorAll("a,button").forEach((el) => { el.addEventListener("mouseenter", () => ring.classList.add("hover")); el.addEventListener("mouseleave", () => ring.classList.remove("hover")); }); }

