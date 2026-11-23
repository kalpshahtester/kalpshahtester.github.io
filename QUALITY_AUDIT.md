# Portfolio quality audit — 23 November 2026

## Release under review

- Website: https://kalpshahtester.github.io/
- Repository: https://github.com/kalpshahtester/kalpshahtester.github.io
- Source commit: `dfce48c68ea703af33c1c9ff35134bd091f01707` — [hide decorative brand monograms from accessible names](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/dfce48c68ea703af33c1c9ff35134bd091f01707)
- Vite deployment: succeeded.
- Production HTTP smoke, Playwright browser checks and Lighthouse: completed successfully for this commit.

## Latest validation results

| Check | Result | Evidence |
|---|---|---|
| Source audit, JavaScript syntax, Vite build and Pages artifact verification | Passed | [Portfolio quality checks](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45108382009) |
| Built-site HTTP smoke test | Passed — 70 assertions across 3 routes and 27 unique local resources | Included in the quality-check run above |
| Responsive browser interaction tests | Passed — 17 passed, 0 failed | [Production browser tests](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45108433777) |
| Responsive viewport matrix | Passed at 13 widths from 280px through 1920px | Included in the browser-interaction run |
| JavaScript runtime checks | No uncaught errors on the tested homepage and project pages | Included in the browser-interaction run |
| Live route and local-resource smoke test | Passed — 72 assertions across 3 routes and 28 unique local resources | [Production smoke test](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45108433745) |
| Production Lighthouse audit | Completed on all 3 public routes | [Lighthouse audit and reports](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45108433660) |
| Vite GitHub Pages deployment | Passed | [Deployment run](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/45108381983) |

The browser checks cover the profile portrait, hero and footer contact destinations, desktop section navigation, project quick-view dialog, sample QA interaction, back-to-top control, mobile navigation, project pages, responsive layout and horizontal overflow.

## Latest Lighthouse scores

Latest recorded measurement on 23 November 2026, from the successful post-deployment Lighthouse run for the same site source (audit run `45108433660`; source commit `dfce48c`):

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 71 | 100 | 100 | 100 |
| SauceDemo case study | 100 | 100 | 100 | 100 |
| MakeMyTrip case study | 91 | 100 | 100 | 100 |

The homepage performance score remains the main technical quality gap. Scores vary between lab runs; the table records the latest completed run available when this report snapshot was written. The source portrait PNG is 1,098,777 bytes and is rendered at approximately 282×282px. A previous Lighthouse trace measured an LCP of 7,950ms and estimated roughly 630 KiB of savings from better image sizing. Another trace measured 9,545 bytes of render-blocking `refinements.css` (estimated 154ms) and 2.3 seconds of main-thread work. Treat these as lab measurements; scores and timings fluctuate.

An earlier local 512×512 WebP candidate (9,024 bytes) was visually checked but was not published because the binary upload could not be integrity-verified. The original portrait remains unchanged. Image optimization remains open; do not replace or retouch the user's photo without verifying the exact source and output.

## Fixes in this audit

| Area | Update |
|---|---|
| Accessibility | The visible `K.` monogram is decorative and is now marked `aria-hidden="true"` in both brand links. Screen readers receive the actual text brand name and descriptor without the fragmented computed name `K . KALP SHAH...`. [Commit dfce48c](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/dfce48c68ea703af33c1c9ff35134bd091f01707) |
| Browser regression checks | Updated the accessible-name assertions to validate the semantic brand text and verify the monogram is hidden from assistive technology. Failure output now includes a short stack trace. |
| Responsive layout | Earlier fixes for mobile/tablet hero and section-heading overflow remain covered by the 13-width browser matrix: [d3f2cd4](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/d3f2cd473d851d2c10e3e957421903c499843a17), [0803766](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/0803766800a0d51fbb8ae6120e9ca6cfcc74cf74), [94efb8c](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/94efb8c40f3f92b0f9b477d93ef29d9acab29d3d). |
| Visual system | Section spacing, alignment, typography hierarchy, cards and responsive sizing remain in place: [commit 60e70e6](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/60e70e683460e41461878b1a5959da8b86fde789). |

## Content accuracy

- Current role: Manual QA Tester at NXS Infotech Private Limited (May 2026–Present).
- Previous role: Computer Engineer / IT Support at J. B. And Brothers Pvt. Ltd. (June 2020–January 2025).
- Manual Testing training: TOPS Technologies (April–September 2025).
- SauceDemo is identified as a public practice application, not production client work. Its figures refer to that practice project.
- MakeMyTrip is identified as a testing assessment, not a client engagement.
- Supplementary certificates are presented separately from professional experience.
- Résumé, education details, project evidence and existing contact destinations remain linked.

## Deployment reliability

Both deployment paths still run:

1. Vite GitHub Actions deployment.
2. GitHub Pages branch-based Jekyll deployment.

Both succeeded on the latest source commit, but they can compete to publish the same site. The repository Pages source setting is not writable through the available GitHub connection. Manual configuration remains necessary: **Settings → Pages → Build and deployment → Source → GitHub Actions**.

## Validation boundaries and remaining work

- Automated source, build, route, local-resource, interaction and configured responsive checks passed.
- Physical iOS/Android device review, keyboard-only review with assistive technology and screen-reader testing have not been performed in this audit.
- Direct visual browser inspection was unavailable; live verification used GitHub Actions HTTP smoke, Playwright and Lighthouse.
- Homepage performance and Pages source configuration remain actionable. This is not yet a clean audit, and the two-consecutive-clean-audit stopping condition has not been met.
