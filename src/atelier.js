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
if (evidence && !motionPreference.matches && !coarsePointer.matches) {
  let frame = 0;
  const onMove = event => {
    if(frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = evidence.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      evidence.style.transform = `perspective(1400px) rotateY(${(-8 + x * 12).toFixed(2)}deg) rotateX(${(5 - y * 8).toFixed(2)}deg)`;
    });
  };
  evidence.addEventListener("pointermove", onMove, {passive:true});
  evidence.addEventListener("pointerleave", () => { cancelAnimationFrame(frame); evidence.style.transform=""; });
}
