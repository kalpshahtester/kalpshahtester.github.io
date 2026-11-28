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
const progress = get("#scrollProgress");
let pending = false;
function paint() {
  pending = false;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = "scaleX(" + (distance ? Math.min(1, Math.max(0, scrollY / distance)) : 0) + ")";
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

const captureSwitch = get(".evidence-switch");
const captureButtons = captureSwitch.querySelectorAll("[data-capture]");
const captures = document.querySelectorAll("[data-evidence-image]");
captureSwitch.hidden = false;
captureButtons.forEach(button => {
  button.addEventListener("click", () => {
    for (const option of captureButtons) {
      option.setAttribute("aria-pressed", String(option === button));
    }
    for (const capture of captures) {
      const selected = capture.dataset.evidenceImage === button.dataset.capture;
      if (selected && capture.hidden && !motion.matches) {
        capture.animate?.([{ transform: "scale(1.035)" }, { transform: "scale(1)" }], {
          duration: 270,
          easing: "ease-out"
        });
      }
      capture.hidden = !selected;
    }
  });
});

// Load the optional renderer only as the investigation approaches the viewport.
const investigation = get(".investigation");
const richScene = matchMedia("(min-width: 761px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)");
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

const deviceModel = get(".device-model");
const deviceButtons = [...document.querySelectorAll("[data-device]")];
const dimensions = {
  desktop: "Desktop · 1366 × 768",
  tablet: "Tablet · 768 × 1024",
  mobile: "Mobile · 390 × 844"
};
for (const button of deviceButtons) {
  button.addEventListener("click", () => {
    const mode = button.dataset.device;
    deviceModel.dataset.mode = mode;
    for (const option of deviceButtons) {
      option.setAttribute("aria-pressed", String(option === button));
    }
    get("#device-dimensions").textContent = dimensions[mode];
  });
}

const ruleTargets = [
  ".defect-preview-copy",
  ".qa-results dl > div",
  ".editorial-profile",
  ".investigation .inspection-steps article",
  ".work-card",
  ".approach-track article",
  ".device-section",
  ".timeline article",
  ".toolkit-grid article",
  ".footer-primary"
].join(", ");
let motionLoading = false;

async function mountPortfolioMotion() {
  if (motion.matches || motionLoading) return;
  motionLoading = true;

  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger")
    ]);
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      for (const target of document.querySelectorAll(ruleTargets)) {
        gsap.fromTo(target, { "--rule-progress": .16 }, {
          "--rule-progress": 1,
          ease: "none",
          scrollTrigger: { trigger: target, start: "top 90%", end: "top 55%", scrub: true }
        });
      }

      const revealTargets = [
        ".defect-preview .hero-evidence",
        ".qa-results dd",
        ".editorial-profile h2",
        ".work-body",
        ".approach-track b",
        ".timeline time",
        ".education-panel",
        ".toolkit-grid h3",
        ".certificate-card",
        ".site-footer h2"
      ].join(", ");
      for (const target of document.querySelectorAll(revealTargets)) {
        gsap.fromTo(target, { y: 12 }, {
          y: 0,
          duration: .58,
          ease: "power2.out",
          immediateRender: false,
          clearProps: "transform",
          scrollTrigger: { trigger: target, start: "top 88%", once: true }
        });
      }

      gsap.fromTo(".device-stage", { "--device-turn": "-7deg" }, {
        "--device-turn": "7deg",
        ease: "none",
        scrollTrigger: { trigger: ".device-stage", start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    media.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.to(".hero-portrait", {
        y: -14,
        rotationY: -5,
        transformPerspective: 950,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    });
  } catch {
    // Native scrolling and the complete content are independent of motion.
    motionLoading = false;
  }
}

function schedulePortfolioMotion() {
  if (motion.matches || motionLoading) return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(mountPortfolioMotion, { timeout: 1200 });
  } else {
    window.setTimeout(mountPortfolioMotion, 200);
  }
}

if (document.readyState === "complete") schedulePortfolioMotion();
else addEventListener("load", schedulePortfolioMotion, { once: true });
motion.addEventListener("change", schedulePortfolioMotion);
