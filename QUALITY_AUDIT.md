# Portfolio quality audit — 22 November 2026

## Release under review

- Website: https://kalpshahtester.github.io/
- Repository: https://github.com/kalpshahtester/kalpshahtester.github.io
- Portfolio source commit under review: `fec7076a98aa156a75cfaa04d894066bb80c0133` — [visible-text link-name fix](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/fec7076a98aa156a75cfaa04d894066bb80c0133)
- Latest fully validated deployment before this commit: `a9e57666729d0c16e4d3d57992212b1e56d11a44`
- Vite deployment, live smoke and browser interaction checks succeeded for the source fix; its Lighthouse audit was still pending when this report was updated.

## Latest completed production validation

| Check | Result | Evidence |
|---|---|---|
| Source quality, Vite build and Pages artifact validation | Passed | [Portfolio quality checks](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44982946003) |
| Built-site HTTP resource smoke test | Passed | Included in the quality-check run above |
| Live route and local-resource smoke test | Passed — 70 assertions across 3 routes and 27 unique local resources | [Production smoke test](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44982980815) |
| Production browser interaction checks | Passed — 17 passed, 0 failed | [Browser interaction tests](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44982980797) |
| Responsive viewport matrix | Passed at 13 widths from 280px through 1920px | Included in the browser-interaction run |
| Browser JavaScript error checks | No uncaught JavaScript errors observed on the tested homepage and project pages | Included in the browser-interaction run |
| Production Lighthouse audit | Completed on all 3 public routes | [Lighthouse audit and downloadable reports](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44982980799) |

The browser run checks the portrait, hero and contact LinkedIn destinations, desktop section navigation, project quick-view dialog, sample QA interaction, back-to-top control, mobile navigation, project pages, and horizontal overflow across the tested responsive matrix.

## Latest Lighthouse scores

Measured on the deployed site on 22 November 2026 (commit `a9e5766`):

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 70 | 100 | 100 | 100 |
| SauceDemo case study | 100 | 100 | 100 | 100 |
| MakeMyTrip case study | 99 | 100 | 100 | 100 |

The homepage performance score fluctuates between runs (70–73 in the latest two measurements). The latest report recorded an LCP of 7,950ms. The portrait PNG is 1,098,777 bytes but is rendered at 282×282px; Lighthouse estimates about 630 KiB of savings from proper image sizing. Render-blocking `refinements.css` was 9,545 bytes and estimated 154ms, while total main-thread work was 2.3s. These are lab results, not guaranteed user timings.

A local 512×512 WebP candidate (9,024 bytes) was generated and visually checked, but it was not committed or deployed because the binary upload could not be integrity-verified. The original PNG remains unchanged. The image optimization is still an open, evidence-based performance task.

The latest completed audit also flagged two brand links for visible-text/accessibility-name mismatch even though the Accessibility category scored 100. Commit `fec7076` removes the custom label overrides and adds browser assertions for the visible link names; its Lighthouse audit is pending.

## Changes in this release

| Area | Update |
|---|---|
| Visual system | Refined section spacing, alignment, typography hierarchy, cards and responsive sizing. [Commit 60e70e6](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/60e70e683460e41461878b1a5959da8b86fde789) |
| Responsive layout | Fixed mobile and tablet headline/section-heading overflow issues. [Commit d3f2cd4](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/d3f2cd473d851d2c10e3e957421903c499843a17), [0803766](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/0803766800a0d51fbb8ae6120e9ca6cfcc74cf74), [94efb8c](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/94efb8c40f3f92b0f9b477d93ef29d9acab29d3d) |
| Accessibility | Brand links now use visible text for their names; the current commit also verifies computed link names in browser tests. [Commit fec7076](https://github.com/kalpshahtester/kalpshahtester.github.io/commit/fec7076a98aa156a75cfaa04d894066bb80c0133) |
| About and work copy | Clarified current manual QA responsibilities and the evidence-led testing workflow, including ShareX, Excel/Google Sheets, ClickUp, Slack and retesting. |
| Experience and skills | Kept current Manual QA work separate from previous IT support experience; strengthened wording around test design, defect reporting, responsive checks and WordPress QA. |
| Credentials | Distinguished TOPS Manual Testing training from supplementary certificates and professional work history. |
| Contact and metadata | Verified LinkedIn in the hero CTA and contact section; retained the LinkedIn profile in structured profile metadata. |
| Deployment reliability | Original portrait PNG remains the common source for both Pages build paths; no unverified generated WebP dependency was introduced. |

## Content accuracy

- Current role: Manual QA Tester at NXS Infotech Private Limited (May 2026–Present).
- Previous role: Computer Engineer / IT Support at J. B. And Brothers Pvt. Ltd. (June 2020–January 2025).
- Manual Testing training: TOPS Technologies (April–September 2025).
- SauceDemo is identified as a public practice application, not production client work. Its figures refer to that practice project.
- MakeMyTrip is identified as a testing assessment, not a client engagement.
- Supplementary certificates are presented separately from professional experience.
- The résumé, education details, project evidence and contact destinations remain linked from the portfolio.

## Deployment reliability

The repository still has both the Vite GitHub Actions deployment and the branch-based GitHub Pages (Jekyll) deployment running successfully. These can compete to publish the site. The Pages source setting cannot be changed through the available connector; manually set **Settings → Pages → Build and deployment → Source → GitHub Actions** to use the Vite deployment consistently.

## Validation boundaries and remaining work

The automated checks confirm the tested build, routes, referenced local resources, defined interactions and configured viewport matrix. They do not replace manual visual review on physical iOS/Android devices, keyboard and screen-reader review with assistive technology, or testing across every browser engine.

Direct live-page inspection through this session was unavailable; production verification was performed by the GitHub Actions HTTP smoke test, Playwright interaction test and Lighthouse run. The current `fec7076` deployment/audit cycle is pending.

The homepage is not considered fully performance-optimized. The next pass should prioritize the portrait image's delivery size and LCP path, then inspect the main-thread/render-delay trace before changing animation or CSS behavior. Lighthouse scores are lab measurements and can vary between runs.
