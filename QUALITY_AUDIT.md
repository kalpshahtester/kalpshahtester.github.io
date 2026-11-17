# Portfolio quality audit — 18 November 2026

## Scope

Reviewed the current production source for all three routes and the files responsible for page structure, styling, runtime interactions, asset staging, deployment, and production checks.

## Findings

| Priority | Finding | Repair |
|---|---|---|
| High | Both case-study pages linked back to `/#projects`, but the homepage section is `#work`. Breadcrumbs and “All projects” links landed at the top instead of the selected-work section. | Updated every cross-page work link to `/#work` and added source/build checks for the target fragment. |
| Medium | Case-study pages still used a lime-green accent, older navy backgrounds, and different fonts from the homepage. | Harmonized the case-study tokens to the portfolio's gold accent, obsidian surfaces, Syne / Plus Jakarta Sans / JetBrains Mono typography, and matching dark theme color. |
| Medium | The case-study mobile menu did not move focus to its first link when opened. | Focus now moves into the opened navigation; Escape still closes it and restores focus to the menu button. |
| Medium | When the case-study motion CDN rejected one import, the settled-promise branch returned without setting the documented fallback state. | The runtime now explicitly records `fallback`; essential page content remains independent of optional animation imports. |
| High | The prior `npm run check` only performed two JavaScript syntax checks. The active quality workflow built Vite but did not validate the final generated Pages artifact or request every local resource. | Added source-structure validation, deployment-artifact validation, a reusable HTTP smoke test, and made pull-request CI, deployment and post-deployment checks use the same asset model. |
| High | Old audit scripts referenced a previous homepage structure and imported Playwright / axe packages that were not installed in the project. They were not run by the active workflow. | Removed the obsolete scripts and replaced them with dependency-free tests for the current site. |
| Medium | Case-study pages used the old font family and loaded Google Fonts as a render-blocking stylesheet. | Updated them to the portfolio font family and non-blocking font loading. Added Twitter card metadata for both case studies. |

## Validation design

The updated checks are split into three layers:

1. Source validation: all three documents, unique IDs, local and cross-page fragments, ARIA ID references, image alternatives, accessible link / button names, safe external links, local files, social metadata, CSS block balance, and sitemap routes.
2. Build-artifact validation: the Vite CSS and JavaScript bundles, both project routes, root image assets, original profile PNG, generated WebP, résumé, certificates, favicon, robots and sitemap files.
3. HTTP smoke validation: requests the homepage, both case studies, and every local URL discovered from their HTML. It validates successful status codes, content types and non-empty responses. The same smoke script runs locally, in CI and against the live site after deployment.

## Production baseline before this audit

The last successful production Lighthouse run before this change reported:

| Category | Score |
|---|---:|
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

These values describe that run only. A fresh report must be generated after the current branch is deployed before claiming updated scores.

## Limitations

The automated source and HTTP checks do not execute layout and interaction in a real browser engine. They do not replace manual visual inspection at physical mobile sizes, screen-reader checks, Safari / Firefox review, or keyboard testing on the deployed pages. No such manual review is claimed by this audit.
