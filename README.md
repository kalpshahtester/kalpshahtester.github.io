# Kalp Shah — Manual QA Tester Portfolio

This branch contains a recruiter-focused refresh proposal for the published portfolio at https://kalpshahtester.github.io/.

## Preview branch
- Branch: `recruiter-portfolio-refresh`
- The published `main` branch is not changed by this preview.
- The refresh is implemented as static HTML, CSS and JavaScript so it remains compatible with GitHub Pages without adding a backend or mandatory build system.

## Structure
- `index.html` — recruiter-focused homepage
- `projects/saucedemo.html` — SauceDemo manual QA case study
- `projects/makemytrip.html` — MakeMyTrip assessment case study
- `assets/css/site.css` — responsive design system and components
- `assets/js/site.js` — accessible navigation, progressive reveals and the clearly labelled QA simulation
- `scripts/verify-site.mjs` — local structural checks

## Design and implementation choices
- Semantic HTML and progressive enhancement.
- Manrope, Space Grotesk and DM Mono typography.
- A navy / cyan / violet design system with responsive layouts.
- Native scrolling and CSS transitions as the baseline.
- GSAP + ScrollTrigger loaded as a progressive enhancement; the page remains usable if the animation CDN is unavailable.
- No heavy 3D runtime or autoplay media on the recruiter landing page.
- Reduced-motion support, visible focus states, skip link and keyboard-operable navigation.

## Accuracy and privacy
- The primary positioning remains Manual QA / Web / WordPress QA.
- Project metrics are labelled by source; SauceDemo uses 47 scenarios, 62+ test cases and 282 execution records.
- No unverified critical-defect count, automation proficiency, API-testing claim, client name or confidential client evidence is advertised.
- The current LinkedIn URL and existing public resume / certificate assets are retained.
- The existing public profile image is referenced from the live site. A professionally retouched replacement is not included yet because the source pixels need to be supplied for an accurate edit.

## Quality checks
Run:
```bash
node scripts/verify-site.mjs
node --check assets/js/site.js
```

This branch is a review candidate. Merge it into `main` only after reviewing the pages, checking the real portrait crop on devices, and confirming the public profile details.
