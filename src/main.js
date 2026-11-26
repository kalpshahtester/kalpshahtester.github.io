const get = (selector) => document.querySelector(selector);
document.documentElement.classList.add("js");
get("#year").textContent = new Date().getFullYear();

const menu = get(".nav-toggle");
const nav = get("#primaryNav");
function setMenu(open) {
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
}
menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    setMenu(false);
    menu.focus();
  }
});
get("#backToTop").addEventListener("click", () => {
  get("#top").scrollIntoView();
  get(".brand").focus({preventScroll:true});
});

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const stack = get(".depth-stack");
const hero = get(".hero");
const progress = get("#scrollProgress");
let pending = false;
function paint() {
  pending = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (distance ? Math.min(100, Math.max(0, scrollY / distance * 100)) : 0) + "%";
  const depth = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
  stack.style.setProperty("--yaw", (-15 + depth * 46) + "deg");
  stack.style.setProperty("--pitch", (9 - depth * 22) + "deg");
}
function schedulePaint() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(paint);
  }
}
addEventListener("scroll", schedulePaint, {passive:true});
addEventListener("resize", schedulePaint);
motion.addEventListener("change", schedulePaint);
paint();

const typed = get("#typed");
const label = typed.textContent;
if (!motion.matches) {
  let count = 0;
  const timer = setInterval(() => {
    count = motion.matches ? label.length : count + 1;
    typed.textContent = label.slice(0, count);
    if (count >= label.length) clearInterval(timer);
  }, 75);
}

get("#runChecks").addEventListener("click", () => {
  const statuses = document.querySelectorAll(".console-row i");
  const button = get("#runChecks");
  button.disabled = true;
  statuses.forEach(status => status.textContent = "READY");
  get("#consoleMessage").textContent = "Running sample checks…";
  statuses.forEach((status, index) => {
    setTimeout(() => {
      status.textContent = "DONE";
      if (index === statuses.length - 1) {
        get("#consoleMessage").textContent = "Four sample checks complete.";
        button.disabled = false;
      }
    }, motion.matches ? 0 : 200 * (index + 1));
  });
});

// Load the optional renderer only as the investigation approaches the viewport.
const investigation = get(".investigation");
const richScene = matchMedia("(min-width: 761px) and (prefers-reduced-motion: no-preference)");
let sceneNearby = false;
let sceneVersion = 0;
let disposeScene;
async function updateInvestigation() {
  const version = ++sceneVersion;
  disposeScene?.();
  disposeScene = undefined;
  if (!sceneNearby || !richScene.matches) return;
  try {
    const { mountInspection } = await import("./scenes/inspection.js");
    if (version !== sceneVersion) return;
    const dispose = await mountInspection(investigation);
    if (version === sceneVersion) disposeScene = dispose;
    else dispose();
  } catch {
    // Original image captures and workbooks are available without WebGL.
  }
}
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    sceneNearby = true;
    updateInvestigation();
  }, {rootMargin:"350px"});
  observer.observe(investigation);
  richScene.addEventListener("change", updateInvestigation);
}
