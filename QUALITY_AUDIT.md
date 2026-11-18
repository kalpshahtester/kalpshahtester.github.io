# Portfolio quality audit — 18 November 2026

## Scope and evidence

Reviewed the current homepage, both case-study pages, navigation and interaction code, stylesheets, Vite build checks, deployment workflow, production smoke workflow and the latest available production Lighthouse report.

The latest pre-fix production Lighthouse run (17 November 2026, run 44179526091) measured:

| Category | Score |
|---|---:|
| Performance | 65 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Key measured lab metrics: First Contentful Paint 2.9 s, Largest Contentful Paint 8.2 s, Speed Index 3.5 s, Total Blocking Time 250 ms, Time to Interactive 8.2 s and Cumulative Layout Shift 0. The LCP element was the profile portrait.

## Findings and changes implemented

| Priority | Finding | Action |
|---|---|---|
| High | The homepage profile PNG transferred 1,098,777 bytes for a displayed image of about 231 × 201 px. Lighthouse estimated about 1.0 MiB savings from modern image formats and responsive sizing. | Added intrinsic width/height, eager loading, high fetch priority and synchronous decode hints. The original image remains unchanged to preserve identity. A true WebP/AVIF responsive derivative remains a follow-up because the source image must be processed and verified without altering the portrait. |
| High | The production audit showed an 8.2 s LCP, with about 2.32 s load delay and 2.66 s render delay. | Moved homepage CSS into the Vite entry imports so production can emit versioned, bundled CSS instead of requesting raw source stylesheets. Added source and built-artifact assertions to prevent regression. |
| Medium | The homepage brand link's accessible name ("Kalp Shah home") did not include its visible logo / brand text. | Updated the accessible name to include the visible brand wording. |
| Medium | The LinkedIn URL on the homepage differed from the URL published in the résumé. | Aligned the homepage link to the résumé's LinkedIn profile URL. |
| Medium | Scroll progress calculations ran directly inside each scroll event and read document geometry while writing UI state. | Coalesced progress updates through requestAnimationFrame to avoid redundant work during fast scrolling. |
| Medium | Lighthouse measured a 10-minute cache lifetime for the root portrait and source assets. | CSS is now bundled through Vite for fingerprinted production assets. GitHub Pages controls cache headers for root-level static files; the original PNG's cache policy cannot be changed in this repository. |
| Medium | Lighthouse's forced-reflow insight attributed about 193 ms to the scroll-progress handler. | The scroll-progress handler is now frame-coalesced. Re-measure after deployment to confirm the effect. |
| Medium | Only the homepage received a Lighthouse run; case-study routes were covered by HTTP smoke checks but not performance audits. | Expanded the production Lighthouse workflow to audit the homepage and both case studies separately. |

## Remaining recommendations

1. Create verified WebP or AVIF variants at appropriate responsive widths (for example 320, 480 and 768 px) from the original profile photo, retaining the PNG fallback and the exact original pixels / crop. Do not use generative image editing or face retouching.
2. Review the fresh Lighthouse report after deployment. Prioritize LCP and image transfer size over chasing a perfect score.
3. Perform real-browser visual checks at 320, 360, 390, 412, 430, 540, 768, 850, 1024, 1280, 1366 and 1920 px, especially the header, hero portrait, project cards, Experience & Education and Skills & Toolkit sections.
4. Manually verify keyboard operation, Escape-to-close navigation/dialog, visible focus, touch scrolling, reduced-motion behavior, and the three project routes in Chrome, Firefox and Safari.
5. Confirm résumé, LinkedIn, email and project repository destinations periodically.

## Validation status and limitations

The repository's source audit validates unique IDs, local and cross-page fragments, ARIA references, image alternatives, accessible names, safe external links, local assets, social metadata, CSS block balance and sitemap entries. The build audit validates generated Vite bundles and required public assets. Production smoke tests request all three routes and their local resources.

These checks do not prove visual correctness on physical devices or replace browser-based interaction testing. A successful build, smoke test or Lighthouse run is not represented as a manual visual inspection. Fresh scores after the current commits must be read from the new workflow artifact.
