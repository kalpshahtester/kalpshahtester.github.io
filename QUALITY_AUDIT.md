# Portfolio quality audit — 19 November 2026

## Latest production evidence

The current release is deployed from commit `b33f5dd682e5983bdd1e5b871039aac4de993cc1` on `main`.

Production GitHub Actions checks completed successfully:

| Check | Result |
|---|---|
| Vite production build and Pages artifact validation | Passed |
| Source quality checks and local built-site smoke test | Passed |
| Live route/resource smoke test | 71 assertions passed across 3 routes and 29 local resources |
| Real-browser interaction smoke test | 15 passed, 0 failed |
| Uncaught JavaScript errors | 0 on the tested homepage desktop/mobile and case-study pages |
| Mobile horizontal overflow | None at the tested 390px viewport |

The latest measured production Lighthouse scores (19 November 2026):

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 76 | 100 | 100 | 100 |
| SauceDemo case study | 91 | 100 | 100 | 100 |
| MakeMyTrip case study | 100 | 100 | 100 | 100 |

Homepage lab metrics: First Contentful Paint 1.6 s, Largest Contentful Paint 6.9 s, Speed Index 1.8 s, Total Blocking Time 10 ms, Time to Interactive 7.5 s and Cumulative Layout Shift 0.021. The measured LCP element is the hero introduction paragraph; its render delay accounts for most of the remaining LCP time. The profile portrait is still a large source PNG, with Lighthouse estimating about 1.0 MiB of potential image-delivery savings.

## Fixes added in this pass

| Priority | Finding | Action |
|---|---|---|
| High | The original portrait PNG is about 1.1 MB for a relatively small on-screen image. | The deployment pipeline now generates 320px, 640px and 768px WebP derivatives from the original PNG, adds a responsive `<picture>` source and an image preload to the built homepage, and retains the existing PNG as the fallback. The original photo remains unchanged. |
| High | The 280px responsive viewport was not covered by the prior live browser check; the body also had a 320px minimum width. | Reduced the minimum width to 280px and expanded the production browser test to 13 viewport widths from 280px through 1920px, including explicit checks on Experience & Education and Skills & Toolkit. |
| Medium | Mobile navigation needed a direct keyboard regression check. | Added an Escape-to-close test and verifies focus returns to the Menu button. |
| Medium | The production artifact needed to prove the responsive formats are actually present and valid. | Added RIFF/WebP signature, file-size, markup and preload assertions to the Pages artifact verifier; live smoke tests request each generated image and verify its MIME type. |

The responsive variants are generated in the Pages build rather than committed over the original portrait. This keeps the source image available for local/source fallback and preserves the original unmodified file.

## Remaining measured work

1. Re-run Lighthouse after this release to measure the actual WebP transfer savings. The scores above describe the release before these newly added image variants are measured in production.
2. Investigate the homepage hero paragraph's 6.2 s render-delay contribution. Image optimization reduces payload but does not by itself prove that the text LCP delay is fixed.
3. Continue manual visual checks in Chrome, Firefox and Safari, with particular attention to the 04 / Experience & Education and 05 / Skills & Toolkit layouts, keyboard focus, reduced motion and touch scrolling.
4. Verify the résumé, LinkedIn, email, WhatsApp and project links periodically.

## Validation boundaries

The source audit checks unique IDs, local and cross-page fragments, ARIA references, image alternatives, accessible names, safe external links, local assets, social metadata, CSS structure and sitemap entries. The Pages artifact audit checks generated bundles, routes, downloadable résumé, original portrait fallback, responsive WebP files and certificates. HTTP smoke tests check all live routes and discovered local resources. The Playwright checks exercise real browser interactions at the configured desktop/mobile conditions and the extended responsive viewport matrix.

These automated checks do not replace a complete manual visual inspection on physical devices or across every supported browser. Lighthouse scores are lab measurements and can vary between runs. A passing build or smoke test is not represented as proof of every possible user journey.
