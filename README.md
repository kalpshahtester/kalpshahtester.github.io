# Kalp Shah — Manual QA portfolio

A premium, evidence-led portfolio built with Vite, vanilla JavaScript, Three.js, GSAP / ScrollTrigger and Lenis. The visual language follows a single QA lifecycle: **New → Found → Fixed → Retested → Closed**.

## Local setup

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Production build and preview:

```bash
npm run check
npm run build
npm run preview
```

## GitHub Pages deployment

This is a GitHub **user site**, so `vite.config.js` intentionally uses `base: "/"`.

1. Open repository **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push to `main`. The Pages workflow installs dependencies with `npm ci`, builds `dist`, preserves the established root-level asset URLs and deploys the artifact.
4. Check the Actions tab for the build and deployment result.

The existing resume, profile photo, certificate image and case-study URLs are retained. The workflow copies the legacy root-level assets and project pages into the generated Pages artifact; this avoids breaking public URLs while preserving the existing repository source files.

## Quality and accessibility

- Keyboard-accessible navigation, visible focus, skip link and native dialog semantics.
- Reduced-motion mode disables the 3D scene, smooth scrolling and heavy choreography.
- Three.js is dynamically imported after the critical page content; the renderer caps pixel ratio at 2 and pauses when off-screen.
- The checklist terminal is illustrative and never contacts an external site.
- The quality-report section does not invent Lighthouse scores. A post-deployment workflow runs Lighthouse against the public URL and uploads JSON / HTML reports as an Actions artifact.

## Content accuracy

SauceDemo is a public practice application. MakeMyTrip is a testing assessment. Neither is production work for the named companies. The 47 scenarios, 62+ test cases and 282 execution records refer to the SauceDemo practice project. “100+ users supported” refers separately to IT support experience (2020–2025). Training certificates are not represented as professional automation experience.

## Verify after deployment

Check 360px and desktop layouts, Safari and Firefox, keyboard-only navigation, reduced motion, the resume / certificate / profile-photo URLs, both project case studies, and the latest Lighthouse artifact. Review real audit values before publishing them on the page.
