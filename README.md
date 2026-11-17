# Kalp Shah — Manual QA portfolio

Premium, evidence-led portfolio for Manual QA, web and WordPress testing. The homepage uses Vite, vanilla JavaScript, Three.js, GSAP / ScrollTrigger and Lenis. The two case studies use the same gold / obsidian palette and shared typography.

## Local development

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

## Reproduce a GitHub Pages build

The user-site uses `base: "/"`. Public case-study routes and root-level assets are staged into Vite's public directory before the build.

```bash
node scripts/stage-pages-assets.mjs
npm run check
npm run build
node scripts/verify-pages-build.mjs
```

To serve the exact generated artifact and run the HTTP resource audit:

```bash
SITE_ROOT=dist PORT=4173 node scripts/serve-site.mjs
```

In another terminal:

```bash
BASE_URL=http://127.0.0.1:4173 npm run smoke
```

On Windows PowerShell, set environment variables with `$env:SITE_ROOT="dist"`, `$env:PORT="4173"` and `$env:BASE_URL="http://127.0.0.1:4173"`.

## Quality gates

- `npm run check` validates JavaScript syntax and the current three-page source structure: unique IDs, local anchors and cross-page fragments, ARIA references, accessible names, image alt text, safe external links, local assets, social metadata, CSS block balance and sitemap entries.
- `node scripts/verify-pages-build.mjs` validates the actual generated Pages artifact, including the bundled Vite CSS / JavaScript, case-study assets, résumé, original portrait and all certificates.
- `npm run smoke` fetches each published route and every locally referenced resource, checking HTTP status, content type and non-empty responses.
- The same staging, build and artifact validation steps run in pull-request CI and Pages deployment. A separate production smoke workflow runs against the public URL after deployment.
- Lighthouse runs after deployment and stores measured HTML / JSON reports as a GitHub Actions artifact. Scores are not hardcoded into the page.

## Images and identity

The original profile PNG is used directly by the hero image and retained as the source of truth. The deployed page does not depend on an optional image conversion or CDN derivative. No crop, face replacement or retouching is performed. The three existing certificate files are displayed as responsive previews and link to the full-size originals.

## Content accuracy

SauceDemo is a public practice application. MakeMyTrip is a testing assessment. Neither is represented as production client work or employment. The 47 scenarios, 62+ test cases and 282 execution records refer to the SauceDemo practice project. “100+ users supported” refers separately to prior IT support experience. Training certificates are separate from professional work experience.

## Limitations

Static and HTTP checks do not replace browser-driven visual review, screen-reader testing, or checks on physical iOS / Android devices and multiple browser engines. Those manual checks remain a separate release activity.
