# Portfolio quality audit — 23 November 2026

## Release under review

- Website: https://kalpshahtester.github.io/
- Repository: https://github.com/kalpshahtester/kalpshahtester.github.io
- Validated implementation commit: `69010126812f3b9e7b876c1d5267fc03b24e9765` — [Deploy Vite after branch-based Pages build](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/69010126812f3b9e7b876c1d5267fc03b24e9765)
- Vite deployment: succeeded after the branch-based Pages workflow completed.
- Production HTTP smoke, Playwright browser checks and Lighthouse: succeeded for this deployment.

## Latest validation results

| Check | Result | Evidence |
|---|---|---|
| Source audit, JavaScript syntax, Vite build and Pages artifact verification | Passed | [Portfolio quality checks](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45111166592) |
| Built-site HTTP smoke test | Passed — 76 assertions across 3 routes and 30 unique local resources | Included in the quality-check run above |
| Built-site responsive browser checks | Passed — 17 passed, 0 failed | Included in the quality-check run above |
| Production responsive browser interaction tests | Passed — 17 passed, 0 failed | [Production browser tests](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45111291750) |
| Responsive viewport matrix | Passed at 13 widths from 280px through 1920px | Included in the browser-interaction runs |
| JavaScript runtime checks | No uncaught errors on the tested homepage and project pages | Included in the browser-interaction runs |
| Live route and local-resource smoke test | Passed — 76 assertions across 3 routes and 30 unique local resources | [Production smoke test](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45111291686) |
| Production Lighthouse audit | Completed on all 3 public routes | [Lighthouse audit and reports](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45111291779) |
| Vite GitHub Pages deployment | Passed | [Deployment run](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45111166617) |
| GitHub Pages branch-based build | Passed before the final Vite deployment | [Pages build and deployment](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45111165880) |

The browser checks cover the profile portrait, hero and footer contact destinations, résumé download, desktop section navigation, project quick-view dialog, sample QA interaction, back-to-top control, mobile navigation, project pages, responsive layout and horizontal overflow.

## Latest Lighthouse scores

Latest production measurement on 23 November 2026, from Lighthouse run `45111291779` for the same implementation commit `6901012` (audit-document-only revision `48b5e`):

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 98 | 100 | 100 | 100 |
| SauceDemo case study | 98 | 100 | 100 | 100 |
| MakeMyTrip case study | 100 | 100 | 100 | 100 |

Homepage lab metrics:

| Metric | Latest result |
|---|---:|
| Largest Contentful Paint | 1.6 s |
| First Contentful Paint | 1.6 s |
| Speed Index | 1.6 s |
| Total Blocking Time | 110 ms |
| Cumulative Layout Shift | 0 |

A prior production trace recorded a 7.4 s homepage LCP and large image-format/responsive-sizing opportunities. Two successful optimized runs now both measure a 1.6 s homepage LCP; the earlier optimized run `45110938346` scored 99/99/98 (homepage/SauceDemo/MakeMyTrip), while the latest run `45111291779` scored 98/98/100. The latest report shows 0 estimated bytes saved for both next-generation image formats and responsive image sizing. Lighthouse lab scores and timings can vary between runs; use the linked report as the source of truth for each measurement.

## Profile image optimization

The original profile image remains unchanged as the `<img>` fallback and social metadata image. The Vite build now generates responsive WebP variants from that exact source and injects a WebP `<source>` plus responsive preload into the built homepage.

| Asset | Size | Reduction vs. original PNG |
|---|---:|---:|
| Original PNG (768×768) | 1,098,777 bytes | — |
| WebP 320×320 | 8,260 bytes | 99.2% smaller |
| WebP 640×640 | 24,148 bytes | 97.8% smaller |
| WebP 768×768 | 39,892 bytes | 96.4% smaller |

The generated portrait was visually inspected against the original. It is a format conversion and proportional resize only; no retouching, face reshaping or identity changes were made. The browser regression test verifies that supported browsers select one of the WebP variants while the original PNG remains the fallback.

## Fixes in this audit

| Area | Update |
|---|---|
| Image performance | Enabled the existing responsive-portrait generator and HTML injection scripts in both deployment and quality-check workflows. Added WebP MIME/resource validation and build-artifact checks. |
| Browser regression checks | Updated the portrait test to verify the original PNG fallback, responsive WebP `srcset` and the actual `currentSrc` selected by Chromium. |
| Deployment ordering | The branch-based Pages workflow was observed deploying after the first Vite run and replacing the optimized artifact. The Vite deploy job now checks the Pages build type and, while the source is branch-based, waits for the same-commit `pages build and deployment` run to complete before deploying the Vite artifact. The latest run confirms that ordering. |
| Accessibility | The visible `K.` monogram remains decorative and marked `aria-hidden="true"` in both brand links. [Commit dfce48c](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/dfce48c68ea703af33c1c9ff35134bd091f01707) |
| Responsive layout | Mobile/tablet hero and section-heading overflow fixes remain covered by the 13-width browser matrix: [d3f2cd4](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/d3f2cd473d851d2c10e3e957421903c499843a17), [0803766](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/0803766800a0d51fbb8ae6120e9ca6cfcc74cf74), [94efb8c](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/94efb8c40f3f92b0f9b477d93ef29d9acab29d3d). |
| Visual system | Section spacing, alignment, typography hierarchy, cards and responsive sizing remain in place: [commit 60e70e6](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/60e70e683460e41461878b1a5959da8b86fde789). |

An intermediate production browser run for commit `ad1d5a0` failed one portrait assertion because the branch-based Pages deployment replaced the Vite artifact before the test ran. This exposed the deployment-ordering issue. The final deployment for `6901012` waited for the branch-based workflow and then passed all 17 production browser tests.

## Content accuracy

- Current role: Manual QA Tester at NXS Infotech Private Limited (May 2026–Present).
- Previous role: Computer Engineer / IT Support at J. B. And Brothers Pvt. Ltd. (June 2020–January 2025).
- Manual Testing training: TOPS Technologies (April–September 2025).
- SauceDemo is identified as a public practice application, not production client work. Its figures refer to that practice project.
- MakeMyTrip is identified as a testing assessment, not a client engagement.
- Supplementary certificates are presented separately from professional experience.
- Résumé, education details, project evidence and existing contact destinations remain linked.

## Deployment reliability

The repository Pages source is still branch-based, so GitHub also runs the generated `pages build and deployment` workflow. The latest Vite deployment checks the Pages API build type, waits for the same-commit branch workflow to finish, and then publishes the optimized Vite artifact last. This avoids the previous overwrite race and is verified by the successful production smoke, browser and Lighthouse runs.

Changing **Settings → Pages → Build and deployment → Source → GitHub Actions** remains the cleaner configuration because it removes the duplicate branch deployment. That setting still requires a manual repository-settings change; the available GitHub connection cannot update it. The deployment workflow's wait guard remains in place as a safe fallback until the source setting is changed.

## Validation boundaries and remaining work

- Automated source, build, route, local-resource, interaction and configured responsive checks passed.
- Physical iOS/Android device review, keyboard-only review with assistive technology and screen-reader testing have not been performed in this audit.
- No direct physical-device or human visual browser review was performed. Live verification used GitHub Actions HTTP smoke, Playwright and Lighthouse; the profile WebP output was inspected against the original image.
- Performance is no longer the main open issue. The remaining improvement is the manual Pages source change to GitHub Actions and a later clean audit to confirm the deployment ordering remains stable.
- This audit included fixes, so the two-consecutive-clean-audit stopping condition has not yet been met.
