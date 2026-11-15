# Portfolio quality audit — 15 November 2026

## Scope

The audit covered the three published HTML routes and the files that directly control their presentation and behaviour:

- `index.html`
- `projects/saucedemo.html`
- `projects/makemytrip.html`
- `assets/css/premium.css`
- `assets/css/case-study.css`
- `assets/js/premium.js`
- `assets/js/case-study.js`
- `scripts/verify-site.mjs`
- `scripts/browser-smoke.mjs`
- `scripts/serve-site.mjs`
- GitHub Actions quality and production-smoke workflows

The existing profile image, résumé, certificate files, local URLs, sitemap and robots file were also checked for presence and references.

## Findings addressed

| Area | Finding | Resolution |
|---|---|---|
| Keyboard navigation | Skip-link and in-page destinations did not consistently receive keyboard focus when smooth scrolling was active. | Added focusable main/section targets, a consistent anchor handler, URL-history handling and focus restoration. |
| Back-to-top | Returning to the top could leave a stale hash in the address bar. | Back-to-top now clears the hash, restores focus and returns the viewport to the page top. |
| Brand accessibility | Explicit brand-link labels replaced the visible name in the accessible name. | Removed the overriding labels so the visible brand text is used. |
| Decorative semantics | Some complex artwork containers lacked an appropriate semantic role. | Marked the profile visual as a group and project illustrations as labelled images; hid purely decorative glyphs from assistive technology. |
| Text contrast | Muted labels were slightly below the 4.5:1 WCAG AA threshold on the dark surfaces. | Lightened the shared quiet-text token. |
| Motion and readability | Fade-in animations could temporarily reduce the contrast of body text while it was moving. | Text now enters with positional motion rather than opacity fades. Image/decorative motion remains intact. |
| Responsive presentation | Very narrow phones needed additional type and metadata wrapping safeguards. | Added a dedicated 360px breakpoint and retained explicit 280px viewport checks. |
| Heading overflow | Element boxes alone can miss text glyphs that paint outside the viewport. | Browser QA now measures rendered heading text ranges as well as element boxes. |
| Pointer treatment | The custom cursor ring could stop interpolating when the pointer paused. | Replaced one-frame interpolation with continuous frame-based easing until the ring catches up. |
| Regression coverage | Earlier checks did not exercise the deployed runtime, accessibility, browser history, skip link, or CDN fallback paths deeply enough. | Added HTML validation, expanded static checks, Playwright runtime tests and axe accessibility scans. |

## Validation performed

The audit branch passed its complete quality workflow on GitHub Actions:

- HTML5 markup validation: passed for all three pages.
- JavaScript syntax validation: passed.
- Static validation: passed for required production assets, image alternatives, semantic landmarks, heading structure, duplicate IDs, ARIA references, anchor targets, cross-page fragments, safe external links, sitemap entries and CSS structure.
- Chromium browser validation: **117 assertions passed** across all three routes and 11 viewport widths: 280, 320, 360, 390, 430, 540, 768, 1024, 1366, 1920 and 3440 pixels.
- axe accessibility validation: **9 scans passed** (desktop, tablet and mobile widths for each of the three pages) using WCAG 2 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA and best-practice rules.
- Runtime validation: passed for local page resources, images, critical CDN/font requests, animation initialization, reduced-motion mode, CDN-failure fallback, skip links, mobile menu keyboard dismissal, focus restoration, in-page navigation/history, back-to-top, and horizontal/text overflow.

The successful audit run is available at:
https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/43719875026

## Deployment safeguard

A separate production smoke workflow has been added. After a successful GitHub Pages deployment from `main`, it runs the browser and accessibility suite against the public website URL. This makes the deployed copy—not only the source branch—part of future release verification.

## Limitations

Automated checks cannot prove the absence of every possible defect. They do not replace hands-on review with physical touch devices, screen readers, real-world network conditions, or every browser/OS combination. The test suite is designed to catch repeatable structural, accessibility, responsive, loading and interaction regressions before and after release.
