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
  progress.style.width = (distance ? Math.min(100, Math.max(0, scrollY / distance * 100)) : 0) + "%";
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
      capture.hidden = capture.dataset.evidenceImage !== button.dataset.capture;
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


const deviceModel=document.querySelector(".device-model");
const deviceButtons=[...document.querySelectorAll("[data-device]")];
const dimensions={desktop:"Desktop · 1366 × 768",tablet:"Tablet · 768 × 1024",mobile:"Mobile · 390 × 844"};
deviceButtons.forEach(button=>button.addEventListener("click",()=>{
 const mode=button.dataset.device;
 if(!deviceModel||!dimensions[mode])return;
 deviceModel.dataset.mode=mode;
 deviceButtons.forEach(b=>b.setAttribute("aria-pressed",String(b===button)));
 document.querySelector("#device-dimensions").textContent=dimensions[mode];
}));
const spatialMotion=matchMedia("(prefers-reduced-motion: no-preference) and (min-width: 761px)");
let spatialFrame=0;
function renderSpatial(){
 spatialFrame=0;
 if(!deviceModel)return;
 if(!spatialMotion.matches){deviceModel.style.removeProperty("transform");return;}
 const rect=deviceModel.parentElement.getBoundingClientRect();
 const p=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));
 deviceModel.style.transform="rotateY("+((p-.5)*36)+"deg) rotateX("+((.5-p)*18)+"deg)";
}
function scheduleSpatial(){if(!spatialFrame)spatialFrame=requestAnimationFrame(renderSpatial)}
addEventListener("scroll",scheduleSpatial,{passive:true});
addEventListener("resize",scheduleSpatial);
spatialMotion.addEventListener("change",scheduleSpatial);
scheduleSpatial();
