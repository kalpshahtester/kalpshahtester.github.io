(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__portfolioMotionState = { status: reduceMotion ? "reduced-motion" : "loading", gsap: false, scrollTrigger: false, lenis: false };
  const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("readingProgress");
  const backToTop = document.getElementById("backToTop");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");
  const year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  // Keep persistent UI in sync with native page scrolling.
  let scrollFrame = 0;
  const updateScrollUI = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      const y = window.scrollY || 0;
      if (header) header.classList.toggle("is-scrolled", y > 18);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (maxScroll > 0 ? Math.min(100, y / maxScroll * 100) : 0) + "%";
      if (backToTop) backToTop.classList.toggle("is-visible", y > 650);
    });
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  updateScrollUI();

  // Accessible responsive navigation: keyboard escape, outside click and focus restoration.
  const closeMenu = (restoreFocus = false) => {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open") || false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav?.classList.contains("is-open")) closeMenu(true);
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle?.contains(event.target)) closeMenu();
  });
  const desktopQuery = window.matchMedia("(min-width: 851px)");
  desktopQuery.addEventListener?.("change", event => { if (event.matches) closeMenu(); });

  // Highlight the section currently being explored.
  if ("IntersectionObserver" in window && nav) {
    const sections = [...document.querySelectorAll("main section[id]")];
    const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-32% 0px -58% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Small interactive checklist. This is explicitly an illustration, not a live test.
  const checks = document.getElementById("consoleChecks");
  const runButton = document.getElementById("runChecks");
  const consoleProgress = document.getElementById("consoleProgress");
  const consoleMessage = document.getElementById("consoleMessage");
  let checkTimer = null;
  let checkIndex = 0;
  const resetChecks = () => {
    if (checkTimer) window.clearInterval(checkTimer);
    checkTimer = null;
    checkIndex = 0;
    checks?.querySelectorAll(".console-check").forEach((item, index) => {
      item.classList.remove("done");
      const state = item.querySelector("b");
      const number = item.querySelector(".console-status");
      if (state) state.textContent = "READY";
      if (number) number.textContent = String(index + 1).padStart(2, "0");
    });
    if (consoleProgress) consoleProgress.style.width = "0%";
    if (consoleMessage) consoleMessage.textContent = "Waiting for a sample run.";
    if (runButton) {
      runButton.disabled = false;
      runButton.innerHTML = 'Run sample <span aria-hidden="true">↗</span>';
    }
  };
  runButton?.addEventListener("click", () => {
    const items = [...(checks?.querySelectorAll(".console-check") || [])];
    if (!items.length || runButton.disabled) return;
    resetChecks();
    runButton.disabled = true;
    if (consoleMessage) consoleMessage.textContent = "Sample checks in progress…";
    const delay = reduceMotion ? 20 : 360;
    checkTimer = window.setInterval(() => {
      const item = items[checkIndex];
      item?.classList.add("done");
      const state = item?.querySelector("b");
      if (state) state.textContent = "CHECKED";
      checkIndex += 1;
      if (consoleProgress) consoleProgress.style.width = (checkIndex / items.length * 100) + "%";
      if (consoleMessage) consoleMessage.textContent = "Illustrative step " + checkIndex + " of " + items.length + ".";
      if (checkIndex >= items.length) {
        window.clearInterval(checkTimer);
        checkTimer = null;
        if (consoleMessage) consoleMessage.textContent = "Sample complete — no external site was accessed.";
        runButton.disabled = false;
        runButton.textContent = "Run again ↻";
      }
    }, delay);
  });

  // In-page navigation keeps the URL, keyboard focus and scroll position in sync.
  const focusTarget = target => {
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };
  const scrollToTarget = target => {
    if (!target) return;
    focusTarget(target);
    if (window.__portfolioLenis) {
      window.__portfolioLenis.scrollTo(target, { offset: -78 });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  };

  backToTop?.addEventListener("click", () => {
    if (location.hash) history.pushState({ portfolioAnchor: "#top" }, "", location.pathname + location.search);
    scrollToTarget(document.getElementById("top"));
  });

  // Desktop pointer treatment. Native pointers remain available on touch devices.
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (finePointer && dot && ring && !reduceMotion) {
    document.documentElement.classList.add("cursor-ready");
    let pointerX = -100, pointerY = -100, ringX = -100, ringY = -100, pointerFrame = 0;
    const animateCursor = () => {
      dot.style.transform = "translate3d(" + pointerX + "px," + pointerY + "px,0) translate(-50%,-50%)";
      ringX += (pointerX - ringX) * .22;
      ringY += (pointerY - ringY) * .22;
      ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0) translate(-50%,-50%)";
      if (Math.abs(pointerX - ringX) > .5 || Math.abs(pointerY - ringY) > .5) {
        pointerFrame = window.requestAnimationFrame(animateCursor);
      } else {
        pointerFrame = 0;
      }
    };
    const moveCursor = event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(animateCursor);
    };
    window.addEventListener("pointermove", moveCursor, { passive: true });
    document.querySelectorAll("a,button,.project-card,.toolkit-card").forEach(target => {
      target.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
      target.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
    });
    document.addEventListener("pointerleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("pointerenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  }

  // Import motion libraries progressively. A CDN failure never blocks the portfolio.
  if (!reduceMotion) {
    const moduleUrls = [
      "https://cdn.jsdelivr.net/npm/gsap@3.15.1/+esm",
      "https://cdn.jsdelivr.net/npm/gsap@3.15.1/ScrollTrigger/+esm",
      "https://cdn.jsdelivr.net/npm/lenis@1.3.27/+esm"
    ];
    Promise.allSettled(moduleUrls.map(url => import(url))).then(results => {
      const gsapModule = results[0].status === "fulfilled" ? results[0].value : null;
      const scrollModule = results[1].status === "fulfilled" ? results[1].value : null;
      const lenisModule = results[2].status === "fulfilled" ? results[2].value : null;
      const gsap = gsapModule?.gsap || gsapModule?.default;
      const ScrollTrigger = scrollModule?.ScrollTrigger || scrollModule?.default?.ScrollTrigger;
      const Lenis = lenisModule?.default || lenisModule?.Lenis;

      if (!gsap) {
        window.__portfolioMotionState = { status: "fallback", gsap: false, scrollTrigger: false, lenis: false };
        return;
      }
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

      // Lenis uses native scroll and is optional; GSAP works with native scrolling too.
      let lenisEnabled = false;
      if (Lenis) {
        try {
          const lenis = new Lenis({ autoRaf: false, smoothWheel: true, lerp: 0.085, wheelMultiplier: 0.9 });
          window.__portfolioLenis = lenis;
          if (ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add(time => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);
          lenisEnabled = true;
        } catch (error) {
          console.warn("Smooth scrolling enhancement was skipped.", error);
        }
      }
      window.__portfolioMotionState = {
        status: "ready",
        gsap: true,
        scrollTrigger: Boolean(ScrollTrigger),
        lenis: lenisEnabled
      };

      gsap.defaults({ ease: "power3.out" });

      const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTimeline
        // Keep readable text at full contrast during motion; animate position, not opacity.
        .from(".hero-eyebrow", { y: 16, duration: .65 })
        .from(".hero-title", { y: 52, duration: 1.05 }, "-=.35")
        .from(".hero-description", { y: 20, duration: .7 }, "-=.62")
        .from(".hero-actions .button", { y: 18, stagger: .12, duration: .6 }, "-=.48")
        .from(".hero-current", { y: 14, duration: .55 }, "-=.38")
        .from(".portrait-frame", { y: 34, opacity: 0, rotate: 7, duration: 1.1 }, "-=1.1")
        .from(".float-card", { y: 18, stagger: .13, duration: .65 }, "-=.66")
        .from(".hero-foot", { y: 8, duration: .45 }, "-=.35");

      gsap.to(".orbit-one", { rotation: 337, duration: 42, ease: "none", repeat: -1 });
      gsap.to(".orbit-two", { rotation: -321, duration: 58, ease: "none", repeat: -1 });
      gsap.to(".float-card-top", { y: -9, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".float-card-bottom", { y: 8, duration: 3.3, ease: "sine.inOut", repeat: -1, yoyo: true });

      if (ScrollTrigger) {
        gsap.utils.toArray("[data-reveal]").forEach((element, index) => {
          gsap.from(element, {
            y: 38, duration: .82, delay: (index % 3) * .045,
            scrollTrigger: { trigger: element, start: "top 88%", once: true }
          });
        });

        gsap.to(".portrait-frame", {
          y: 55, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
        });

        gsap.utils.toArray(".project-card").forEach(card => {
          const visual = card.querySelector(".project-visual");
          if (visual) gsap.fromTo(visual, { clipPath: "inset(8% 8% 8% 8% round 6px)" }, {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            scrollTrigger: { trigger: card, start: "top 82%", end: "top 38%", scrub: .7 }
          });
        });

        ScrollTrigger.refresh();
      } else {
        gsap.utils.toArray("[data-reveal]").forEach(element => {
          gsap.from(element, { y: 28, duration: .7 });
        });
      }

      // Animate verified metrics only after they enter the viewport.
      gsap.utils.toArray("[data-count]").forEach(element => {
        const target = Number(element.getAttribute("data-count"));
        const suffix = element.getAttribute("data-suffix") || "";
        if (!Number.isFinite(target)) return;
        if (ScrollTrigger) {
          const counter = { value: 0 };
          gsap.to(counter, {
            value: target, duration: 1.5, ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 92%", once: true },
            onUpdate: () => { element.textContent = Math.round(counter.value).toLocaleString("en-IN") + suffix; }
          });
        }
      });

      // Subtle pointer parallax on hero artwork and tactile project panels.
      if (finePointer && window.matchMedia("(min-width: 851px)").matches) {
        const visual = document.querySelector(".hero-visual");
        visual?.addEventListener("pointermove", event => {
          const bounds = visual.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - .5;
          const y = (event.clientY - bounds.top) / bounds.height - .5;
          gsap.to(".portrait-frame", { x: x * 10, y: y * 8, rotate: 2 + x * 1.2, duration: .55, overwrite: true });
          gsap.to(".orbit-one,.orbit-two", { x: x * 5, y: y * 5, duration: .8, overwrite: true });
        });
        visual?.addEventListener("pointerleave", () => {
          gsap.to(".portrait-frame", { x: 0, y: 0, rotate: 2, duration: .8, overwrite: true });
          gsap.to(".orbit-one,.orbit-two", { x: 0, y: 0, duration: .8, overwrite: true });
        });
      }
    }).catch(error => {
      // If an animation library fails to load, all content remains readable and usable.
      window.__portfolioMotionState = { status: "fallback", gsap: false, scrollTrigger: false, lenis: false };
      console.warn("Optional motion libraries could not be loaded.", error);
    });
  }

  // Handle hash links consistently, including the skip link when Lenis is active.
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
    let id = "top";
    if (location.hash) {
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    }
    scrollToTarget(document.getElementById(id) || document.getElementById("top"));
  });
})();