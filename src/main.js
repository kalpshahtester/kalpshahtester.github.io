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


// Progressive reveal: content remains visible when motion is reduced or JS is unavailable.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealTargets = [
  ".section-topline", ".section-heading", ".project-row", ".about-layout",
  ".principles-line > div", ".approach-list li", ".experience-row",
  ".education-row > div", ".skill-index > div", ".certificate-card",
  ".contact-inner > div"
].flatMap(selector => $$(selector));

if (!motionPreference.matches && "IntersectionObserver" in window) {
  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.transitionDelay = (index % 4) * 65 + "ms";
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealTargets.forEach(element => revealObserver.observe(element));
}

// A restrained pointer response adds depth on desktop without moving content on touch devices.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !motionPreference.matches) {
  $$(".project-row, .certificate-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(900px) rotateX(${-y * 1.8}deg) rotateY(${x * 1.8}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}
