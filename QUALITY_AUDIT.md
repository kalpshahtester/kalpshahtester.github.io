# Portfolio quality audit — 20 November 2026

## Release under review

- Website: https://kalpshahtester.github.io/
- Repository: https://github.com/kalpshahtester/kalpshahtester.github.io
- Release commit: `a0e96eea71354d20e56672cdbe0040db91b54627`
- Deployment: GitHub Pages deployment completed successfully.

## Latest production validation

| Check | Result | Evidence |
|---|---|---|
| Source quality, Vite build and Pages artifact validation | Passed | [Portfolio quality checks](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44595633979) |
| Built-site HTTP resource smoke test | Passed | Included in the quality-check run above |
| Live route and local-resource smoke test | Passed — 71 assertions across 3 routes and 29 unique local resources | [Production smoke test](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44595751896) |
| Production browser interaction checks | Passed — 16 passed, 0 failed | [Browser interaction tests](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44595751950) |
| Responsive viewport matrix | Passed at 13 widths from 280px through 1920px | Included in the browser-interaction run |
| Browser JavaScript error checks | No uncaught JavaScript errors observed on the tested homepage and project pages | Included in the browser-interaction run |
| Production Lighthouse audit | Passed on all 3 public routes | [Lighthouse audit and downloadable reports](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/runs/44595752231) |

The Playwright run also checked homepage portrait loading, hero and contact LinkedIn destinations, desktop section navigation, the project quick-view dialog, the sample QA interaction, the back-to-top control, mobile navigation and both project-detail pages. The responsive matrix explicitly checked the page, header, Experience section and Skills section for horizontal overflow.

## Latest Lighthouse scores

Measured on the deployed site on 20 November 2026:

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 71 | 100 | 100 | 100 |
| SauceDemo case study | 100 | 100 | 100 | 100 |
| MakeMyTrip case study | 99 | 100 | 100 | 100 |

Lighthouse performance remains the primary improvement area on the homepage. The original committed profile PNG is intentionally used as the single portrait source so both the repository-source Pages build and the Vite Pages artifact resolve the same image. A future image-delivery optimization should use a committed derivative and validate both deployment paths before replacing the current source.

## Changes in this release

| Area | Update |
|---|---|
| Visual system | Refined the dark navy/charcoal background, subtle ambient treatment, spacing, typography hierarchy and section widths. |
| Hero and portrait | Reframed the portrait as a centered, predictable image card. The original image remains uncropped and uses `object-fit: contain`. |
| Cards and grids | Standardized work-card surfaces, equal-height behaviour, card content flow, spacing and responsive grid sizing. |
| Responsive layout | Added narrow-screen sizing and wrapping rules; verified Experience and Skills through 280px–1920px viewports. |
| About and work copy | Clarified the current manual QA responsibilities and the evidence-led testing workflow, including ShareX, Excel/Google Sheets, ClickUp, Slack and retesting. |
| Experience and skills | Kept current Manual QA work separate from previous IT support experience; strengthened the wording around test design, defect reporting, responsive checks and WordPress QA. |
| Credentials | Distinguished TOPS Manual Testing training from supplementary certificates and professional work history. |
| Contact and metadata | Verified LinkedIn in the hero CTA and contact section, and retained the LinkedIn profile in structured profile metadata. Improved search and social descriptions. |
| Deployment reliability | Removed reliance on generated, untracked WebP files. The committed original portrait is now the shared asset for both Pages build paths. |

## Content accuracy

- Current role: Manual QA Tester at NXS Infotech Private Limited (May 2026–Present).
- Previous role: Computer Engineer / IT Support at J. B. And Brothers Pvt. Ltd. (June 2020–January 2025).
- Manual Testing training: TOPS Technologies (April–September 2025).
- SauceDemo is identified as a public practice application, not production client work. Its figures refer to that practice project.
- MakeMyTrip is identified as a testing assessment, not a client engagement.
- Supplementary certificates are presented separately from professional experience.
- The résumé, education details, project evidence and contact destinations remain linked from the portfolio.

## Validation boundaries and remaining work

The automated checks confirm the tested build, routes, referenced local resources, defined interactions and configured viewport matrix. They do not replace manual visual review on physical iOS/Android devices, keyboard and screen-reader review with assistive technology, or testing across every browser engine.

The homepage's Lighthouse Performance score of 71 is not being represented as fully optimized. The next performance pass should inspect the current report artifact, prioritize the measured largest-contentful-paint path, and test any image compression or delivery changes in both the source-branch and Vite deployment outputs. Lighthouse scores are lab measurements and can vary between runs.
