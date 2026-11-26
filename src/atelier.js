// Progressive motion layer; does not hide content unless observers are supported.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = window.matchMedia("(pointer: coarse)");
const targets = document.querySelectorAll(".section-heading, .work-card, .approach-track article, .toolkit-grid article, .certificate-card, .timeline article, .hero-copy, .hero-evidence, .inspection-steps article");
if ("IntersectionObserver" in window && !motionPreference.matches) {
  document.documentElement.classList.add("motion-ready");
  targets.forEach((node, index) => { node.classList.add("reveal-item"); if(node.matches(".work-card")) node.dataset.motionIndex=String(index%2); });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  }), {threshold:0.08, rootMargin:"0px 0px -24px 0px"});
  targets.forEach(node => observer.observe(node));
  const restore = () => { document.documentElement.classList.remove("motion-ready");targets.forEach(node=>node.classList.remove("reveal-item"));observer.disconnect(); };
  motionPreference.addEventListener("change", event => { if (event.matches) restore(); }, {once:true});
}
const evidence = document.querySelector(".hero-evidence");
const desktopMotion = matchMedia("(min-width: 761px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
if (evidence) {
  let frame = 0, pointerX = 0, pointerY = 0;
  const render = () => {
    frame = 0;
    if (!desktopMotion.matches) {
      ["--depth-y","--depth-x","--depth-shift"].forEach(p=>evidence.style.removeProperty(p));
      return;
    }
    const hero = evidence.closest(".hero").getBoundingClientRect();
    if (hero.bottom < 0 || hero.top > innerHeight) return;
    const progress = Math.max(0, Math.min(1, -hero.top / Math.max(hero.height,1)));
    evidence.style.setProperty("--depth-y", (-5 + progress * 10 + pointerX * 3).toFixed(2)+"deg");
    evidence.style.setProperty("--depth-x", (2 - progress * 6 - pointerY * 3).toFixed(2)+"deg");
    evidence.style.setProperty("--depth-shift", (progress * 36).toFixed(2)+"px");
  };
  const schedule = () => { if (!frame) frame=requestAnimationFrame(render); };
  evidence.addEventListener("pointermove", e => {
    const r=evidence.getBoundingClientRect();
    pointerX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));
    pointerY=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
    schedule();
  }, {passive:true});
  evidence.addEventListener("pointerleave",()=>{pointerX=pointerY=0;schedule();});
  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule);
  desktopMotion.addEventListener("change",schedule);
  schedule();
}
