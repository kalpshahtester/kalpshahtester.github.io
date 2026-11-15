(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("readingProgress");
  const backToTop = document.getElementById("backToTop");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");

  // Keep the header, reading progress and back-to-top control in sync.
  const updateScrollUI = () => {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", y > 18);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (maxScroll > 0 ? (y / maxScroll) * 100 : 0) + "%";
    if (backToTop) backToTop.classList.toggle("is-visible", y > 650);
  };
  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI, { passive: true });
  updateScrollUI();

  // Accessible mobile navigation.
  const closeMenu = (restoreFocus = false) => {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
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
  window.matchMedia("(min-width: 801px)").addEventListener?.("change", event => {
    if (event.matches) closeMenu();
  });

  // Reveal content progressively, while leaving it visible when JS is unavailable.
  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-motion");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Light GSAP enhancement; if the CDN is unavailable, the page remains fully usable.
  if (!reduceMotion) {
    Promise.all([
      import("https://cdn.jsdelivr.net/npm/gsap@3.15.1/+esm"),
      import("https://cdn.jsdelivr.net/npm/gsap@3.15.1/ScrollTrigger/+esm")
    ]).then(([gsapModule, scrollModule]) => {
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray(".workflow-step, .skill-card").forEach((element, index) => {
        gsap.fromTo(element, { y: 14, opacity: 0.72 }, {
          y: 0, opacity: 1, duration: 0.55, delay: (index % 4) * 0.04, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 92%", once: true }
        });
      });
      ScrollTrigger.refresh();
    }).catch(() => {
      // IntersectionObserver and CSS transitions are the graceful fallback.
    });
  }

  // Portfolio-only QA checklist simulation — it does not inspect an external website.
  const data = {
    journey: {
      title: "User journey checks",
      description: "Check that key user actions work in sequence and that users can recover from an interrupted flow.",
      checks: ["Primary navigation and key actions", "Successful and unsuccessful paths", "Back, refresh and repeat actions", "Session and redirect behaviour"]
    },
    forms: {
      title: "Form validation checks",
      description: "Exercise form fields with missing, malformed and boundary values to check the feedback users receive.",
      checks: ["Required fields and inline messages", "Malformed email and invalid values", "Minimum and maximum field lengths", "Repeated submission and preserved input"]
    },
    responsive: {
      title: "Responsive interface checks",
      description: "Review layout and interaction at common viewport widths, including keyboard and touch usability.",
      checks: ["Mobile, tablet and desktop layouts", "No horizontal overflow", "Visible focus and usable touch targets", "Navigation and orientation changes"]
    },
    content: {
      title: "Content and metadata checks",
      description: "Review the structure and presentation of page content and basic search metadata.",
      checks: ["Page title and meta description", "One clear H1 and logical headings", "Meaningful image alternative text", "Links and canonical URL"]
    }
  };
  const area = document.getElementById("testArea");
  const title = document.getElementById("scenarioTitle");
  const description = document.getElementById("scenarioDescription");
  const list = document.getElementById("scenarioChecks");
  const status = document.getElementById("runStatus");
  const progressBar = document.getElementById("simulationProgress");
  const message = document.getElementById("simulationMessage");
  const runButton = document.getElementById("runSimulation");
  const resetButton = document.getElementById("resetSimulation");
  let timer = null;
  let active = false;

  const renderScenario = () => {
    if (!area || !list) return;
    const scenario = data[area.value] || data.journey;
    if (active) stopSimulation();
    title.textContent = scenario.title;
    description.textContent = scenario.description;
    list.replaceChildren(...scenario.checks.map(label => {
      const item = document.createElement("li");
      item.textContent = label;
      return item;
    }));
    status.textContent = "READY";
    progressBar.style.width = "0%";
    message.textContent = "Ready. This demo does not connect to or test a live website.";
  };

  const stopSimulation = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
    active = false;
    if (runButton) runButton.disabled = false;
  };

  runButton?.addEventListener("click", () => {
    if (!list || active) return;
    const items = [...list.querySelectorAll("li")];
    if (!items.length) return;
    stopSimulation();
    active = true;
    runButton.disabled = true;
    status.textContent = "RUNNING";
    message.textContent = "Running illustrative checks in this browser…";
    let completed = 0;
    const delay = reduceMotion ? 40 : 420;
    timer = window.setInterval(() => {
      if (completed < items.length) {
        items[completed].classList.add("is-done");
        completed += 1;
        progressBar.style.width = (completed / items.length * 100) + "%";
        message.textContent = "Simulated check " + completed + " of " + items.length + " complete.";
      }
      if (completed >= items.length) {
        stopSimulation();
        status.textContent = "DEMO COMPLETE";
        message.textContent = "Simulation complete. No live application was accessed or tested.";
      }
    }, delay);
  });

  resetButton?.addEventListener("click", () => {
    stopSimulation();
    renderScenario();
  });
  area?.addEventListener("change", renderScenario);
  renderScenario();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Add current-section context to the navigation without replacing browser history.
  if ("IntersectionObserver" in window) {
    const sections = [...document.querySelectorAll("main section[id]")];
    const navLinks = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }
})();