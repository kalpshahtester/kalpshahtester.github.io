(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__caseStudyMotionState = { status: reduceMotion ? "reduced-motion" : "loading", gsap: false, scrollTrigger: false };
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("readingProgress");
  const backToTop = document.getElementById("backToTop");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  let frame = 0;
  const updateScrollUI = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const y = window.scrollY || 0;
      header?.classList.toggle("is-scrolled", y > 18);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (maxScroll > 0 ? Math.min(100, y / maxScroll * 100) : 0) + "%";
      backToTop?.classList.toggle("is-visible", y > 600);
    });
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  updateScrollUI();

  const closeMenu = (restoreFocus = false) => {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open") || false;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav?.classList.contains("is-open")) closeMenu(true);
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });
  window.matchMedia("(min-width: 851px)").addEventListener?.("change", event => { if (event.matches) closeMenu(); });

  const sectionLinks = [...(document.querySelectorAll(".case-sidebar a[href^='#']"))];
  const sections = sectionLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    sections.forEach(section => observer.observe(section));
  }

  const focusTarget = target => {
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };
  const scrollToTarget = target => {
    if (!target) return;
    focusTarget(target);
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  backToTop?.addEventListener("click", () => {
    if (location.hash) history.pushState({ portfolioAnchor: "#top" }, "", location.pathname + location.search);
    scrollToTarget(document.getElementById("main"));
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      let id;
      try { id = decodeURIComponent(href.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      if (location.hash !== href) history.pushState({ portfolioAnchor: href }, "", href);
      scrollToTarget(target);
    });
  });

  window.addEventListener("popstate", () => {
    let id = "main";
    if (location.hash) {
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    }
    scrollToTarget(document.getElementById(id) || document.getElementById("main"));
  });

  if (!reduceMotion) {
    Promise.allSettled([
      import("https://cdn.jsdelivr.net/npm/gsap@3.15.1/+esm"),
      import("https://cdn.jsdelivr.net/npm/gsap@3.15.1/ScrollTrigger/+esm")
    ]).then(results => {
      if (results[0].status !== "fulfilled" || results[1].status !== "fulfilled") return;
      const gsapModule = results[0].value;
      const scrollModule = results[1].value;
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      if (!gsap || !ScrollTrigger) {
        window.__caseStudyMotionState = { status: "fallback", gsap: Boolean(gsap), scrollTrigger: Boolean(ScrollTrigger) };
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      window.__caseStudyMotionState = { status: "ready", gsap: true, scrollTrigger: true };
      gsap.from(".case-breadcrumbs", { y: 12, opacity: 0, duration: .6 });
      gsap.from(".case-title", { y: 40, opacity: 0, duration: .9, delay: .12 });
      gsap.from(".case-lead", { y: 16, opacity: 0, duration: .65, delay: .3 });
      gsap.utils.toArray("[data-reveal]").forEach((element, index) => {
        gsap.from(element, {
          y: 28, opacity: 0, duration: .7, delay: (index % 3) * .04,
          scrollTrigger: { trigger: element, start: "top 88%", once: true }
        });
      });
      ScrollTrigger.refresh();
    }).catch(error => {
      window.__caseStudyMotionState = { status: "fallback", gsap: false, scrollTrigger: false };
      console.warn("Optional case-study motion was skipped.", error);
    });
  }
})();