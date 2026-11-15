# Kalp Shah — Manual QA Tester Portfolio

**Live website:** https://kalpshahtester.github.io/

The published portfolio belongs to Kalp Shah, a Manual QA Tester focused on web and WordPress quality assurance.

## Production files

- `index.html` — main portfolio and professional profile
- `projects/saucedemo.html` — SauceDemo manual QA case study
- `projects/makemytrip.html` — MakeMyTrip testing assessment
- `assets/css/premium.css` — shared design system and responsive layout
- `assets/css/case-study.css` — responsive case-study styling
- `assets/js/premium.js` — homepage navigation, cursor, checklist and progressive GSAP/ScrollTrigger/Lenis enhancements
- `assets/js/case-study.js` — case-study navigation and progressive motion

## Quality assurance

- `scripts/verify-site.mjs` — structural, asset, metadata, semantic and link validation
- `scripts/browser-smoke.mjs` — Playwright Chromium browser, responsive and axe accessibility suite
- `scripts/serve-site.mjs` — local static server used by the tests
- `.htmlvalidate.json` — strict HTML validation configuration
- `.github/workflows/portfolio-quality-check.yml` — source validation on pushes and pull requests
- `.github/workflows/production-smoke.yml` — live-site checks after a successful GitHub Pages deployment
- `QUALITY_AUDIT.md` — detailed audit scope, findings, fixes, validation results and limitations

The browser suite covers the three public pages across viewport widths from 280px to 3440px. It checks page/runtime errors, critical resources, image loading, internal links, keyboard navigation, focus, motion fallbacks, reduced motion, rendered text overflow and accessibility rules.

## Stack

Static HTML, CSS and vanilla JavaScript, with Space Grotesk / DM Sans / DM Mono typography, GSAP + ScrollTrigger, and Lenis as progressive enhancements. The website remains content-first if the animation CDN is unavailable or a visitor requests reduced motion.

## Accuracy and transparency

- Professional positioning remains Manual QA / Web / WordPress QA.
- SauceDemo metrics describe a practice project: 47 scenarios, 62+ test cases and 282 execution records.
- The 100+ users metric refers to the earlier IT support role.
- SauceDemo is a public demo application used for a portfolio project. MakeMyTrip is a testing assessment.
- Decorative interactive visuals are illustrative; they do not report live external-site test execution.
- No unverified client work, production access, defect totals or professional automation experience is claimed.

## Run the tests locally

Use Node.js 24 or newer.

```bash
node scripts/verify-site.mjs
node --check assets/js/premium.js
node --check assets/js/case-study.js
npm install --no-save --package-lock=false playwright@1.65.1 @axe-core/playwright@4.14.0 html-validate@11.21.1
npx html-validate index.html projects/saucedemo.html projects/makemytrip.html
npx playwright install chromium
node scripts/serve-site.mjs
```

In a second terminal:

```bash
BASE_URL=http://127.0.0.1:4173 node scripts/browser-smoke.mjs
```

GitHub Pages publishes the root of `main`. The production smoke workflow verifies the public site after each successful Pages release.
