const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());

const header = $("#siteHeader");
const progress = $("#scrollProgress");
let scrollFrame = 0;

function updateScrollState() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (maxScroll > 0 ? window.scrollY / maxScroll * 100 : 0) + "%";
    header?.classList.toggle("scrolled", window.scrollY > 20);
  });
}
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState, { passive: true });
updateScrollState();

const menuButton = $(".nav-toggle");
const primaryNav = $("#primaryNav");

function closeMenu(restoreFocus = false) {
  primaryNav?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuButton?.focus();
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(isOpen));
  primaryNav?.classList.toggle("open", isOpen);
  if (isOpen) primaryNav?.querySelector("a")?.focus();
});

primaryNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMenu(true);
  }
});

const navLinks = $$(".hud-nav nav a");
const navSections = navLinks
  .map(link => $(link.getAttribute("href")))
  .filter(section => section instanceof HTMLElement);

if ("IntersectionObserver" in window && navSections.length) {
  const activeSectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => {
        const active = link.hash === "#" + entry.target.id;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }, { rootMargin: "-35% 0px -55% 0px" });

  navSections.forEach(section => activeSectionObserver.observe(section));
}

document.documentElement.dataset.appReady = "true";
