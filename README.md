# Kalp Shah — Manual QA Tester Portfolio

Live website: **https://kalpshahtester.github.io/**

This repository contains the published portfolio for Kalp Shah, a Manual QA Tester focused on web and WordPress quality assurance.

## Production structure

- \`index.html\` — main portfolio and professional profile
- \`projects/saucedemo.html\` — SauceDemo manual QA case study
- \`projects/makemytrip.html\` — MakeMyTrip testing assessment
- \`assets/css/premium.css\` — shared visual system, responsive layout and motion fallbacks
- \`assets/css/case-study.css\` — case-study layouts and responsive content
- \`assets/js/premium.js\` — homepage interactions, progressive GSAP/ScrollTrigger and Lenis enhancements
- \`assets/js/case-study.js\` — case-study navigation and progressive motion
- \`scripts/verify-site.mjs\` — static structural, accessibility-marker and local-link checks
- \`scripts/browser-smoke.mjs\` — Chromium smoke checks across 11 viewport sizes
- \`scripts/serve-site.mjs\` — local static server used by browser QA

## Stack and progressive enhancement

The site is intentionally static and GitHub Pages compatible. It uses semantic HTML, CSS, vanilla JavaScript, Space Grotesk / DM Sans / DM Mono typography, GSAP with ScrollTrigger, and Lenis for optional smooth scrolling on the homepage.

Animation libraries are progressive enhancements. The site content remains accessible if a CDN is unavailable or a visitor requests reduced motion. The case-study pages use native scrolling.

## Accuracy and transparency

- The professional positioning is Manual QA / Web / WordPress QA.
- SauceDemo project figures are labelled: 47 scenarios, 62+ test cases and 282 execution records.
- The 100+ users figure refers to the earlier IT support role, not QA users.
- SauceDemo is a public demo application used for a portfolio project. MakeMyTrip is a testing assessment.
- Decorative interactive visuals are clearly labelled; they do not report live website test execution.
- No unverified client work, production access, defect totals or professional automation experience is claimed.

## Run checks locally

Use Node.js 24 or newer.

\`\`\`bash
node scripts/verify-site.mjs
node --check assets/js/premium.js
node --check assets/js/case-study.js
npm install --no-save --package-lock=false playwright@1.65.1
npx playwright install chromium
node scripts/serve-site.mjs
\`\`\`

In a second terminal:

\`\`\`bash
BASE_URL=http://127.0.0.1:4173 node scripts/browser-smoke.mjs
\`\`\`

## Deployment

GitHub Pages publishes the root of the \`main\` branch. The quality workflow runs on pull requests, branch pushes and production-branch pushes. It checks JavaScript syntax, static structure, accessibility markers, local asset paths and responsive Chromium behaviour before changes are merged.
