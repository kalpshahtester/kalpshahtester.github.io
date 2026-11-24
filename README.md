# Kalp Shah — Manual QA Portfolio

A professional portfolio showcasing manual software testing, WordPress and web quality assurance, test documentation, and evidence-led defect reporting.

<p align="left">
  <a href="https://kalpshahtester.github.io/"><strong>View Live Portfolio ↗</strong></a>
  &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/in/kalp-shah-software-tester/">LinkedIn</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/kalpshahtester">GitHub Profile</a>
  &nbsp;·&nbsp;
  <strong>Updated résumé in preparation</strong>
</p>

<p align="left">
  <a href="https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/deploy.yml"><img src="https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/deploy.yml/badge.svg" alt="GitHub Pages deployment status"></a>
  <a href="https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/portfolio-quality-check.yml"><img src="https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/portfolio-quality-check.yml/badge.svg" alt="Portfolio quality checks status"></a>
  <a href="https://img.shields.io/website?url=https%3A%2F%2Fkalpshahtester.github.io%2F"><img src="https://img.shields.io/website?url=https%3A%2F%2Fkalpshahtester.github.io%2F" alt="Portfolio website availability"></a>
</p>

---

## About

Kalp Shah is a Manual QA Tester based in Gujarat, India, focused on testing WordPress and web applications from the user's perspective. He is currently exploring Manual QA Tester / Web QA opportunities in **Surat and Ahmedabad**.

Most recently, he worked at **NXS Infotech Private Limited (May–November 2026)**, testing website functionality, UI consistency, forms, navigation, responsive behaviour, page content and on-page SEO fundamentals. He captured testing evidence with screenshots or recordings, documented expected-versus-actual results, tracked defects and retested fixes.

**QA focus**
- Functional, smoke, sanity, regression and exploratory testing
- Positive, negative, boundary and edge-case scenarios
- Test scenarios, test cases, test plans and Requirement Traceability Matrix (RTM)
- Reproducible bug reports with clear evidence
- Responsive UI, forms, navigation, content and link validation
- WordPress and CMS website quality checks

## Featured QA Work

The portfolio contains two documented practice / assessment projects. They are not presented as production client engagements.

### 1. SauceDemo — End-to-End Manual QA

A structured manual testing project covering login, product browsing, sorting, cart operations and checkout on a public e-commerce practice application.

| Project evidence | Recorded total |
|---|---:|
| Test scenarios | 47 |
| Test cases | 62+ |
| Execution records | 282 |
| Documented defects | 7 |

- [Read the SauceDemo case study](https://kalpshahtester.github.io/projects/saucedemo.html)
- [View the project repository](https://github.com/kalpshahtester/Manual-Testing-Project-saucedemo-website)

### 2. MakeMyTrip — Web Testing Assessment

A manual testing assessment exploring travel-platform user journeys, including login, flight and hotel search, form validation, navigation, UI checks and negative scenarios.

- [Read the MakeMyTrip case study](https://kalpshahtester.github.io/projects/makemytrip.html)
- [View the assessment repository](https://github.com/kalpshahtester/MakeMyTrip-Testing-Assessment)

## Professional Experience

| Period | Role | Organisation |
|---|---|---|
| May 2026 – November 2026 | Manual QA Tester — WordPress & Web QA | NXS Infotech Private Limited |
| June 2020 – January 2025 | Computer Engineer / IT Support | J. B. And Brothers Pvt. Ltd. |

Previous IT support experience included assisting more than 100 users, troubleshooting hardware and software issues, and resolving day-to-day technical problems. This experience developed practical troubleshooting, communication and problem-analysis skills that support the current QA role.

## QA Workflow

The portfolio reflects a practical, evidence-led testing process:

1. **Understand** — review the website, requirements, user goals and important user journeys.
2. **Design coverage** — prepare test scenarios and test cases with clear expected results.
3. **Execute** — perform manual functional, UI, responsive and content checks.
4. **Record defects** — capture screenshots or recordings and document steps to reproduce, expected results and actual results.
5. **Track and communicate** — maintain defect and execution records, share developer updates, and follow issue status.
6. **Retest and regress** — verify fixes and run focused regression checks before closing findings.

## Tools & Technologies

| Area | Tools / Technologies |
|---|---|
| Manual QA | Functional, regression, smoke, sanity, exploratory and negative testing |
| Test documentation | Test scenarios, test cases, test plans, RTM, bug reports and execution trackers |
| Website testing | WordPress, browser DevTools, responsive checks and on-page SEO validation |
| QA collaboration | ClickUp, Slack and ShareX |
| Documentation | Microsoft Excel and Google Sheets |
| Development environment | VS Code, Git and GitHub |
| Portfolio implementation | HTML, CSS, JavaScript, Vite, Three.js, GSAP / ScrollTrigger and Lenis |

The professional profile is focused on **Manual QA and Web Testing**. Kalp is currently seeking Manual QA / Web QA opportunities in Surat and Ahmedabad. Supplementary course certificates are displayed separately from professional experience; they do not define the professional work history.

## Education & Training

- **Diploma in Information Technology** — Dr. S. & S. S. Ghandhy College of Engineering & Technology.
- **Manual Testing training** — TOPS Technologies, April–September 2025.
- Additional course certificates are available in the portfolio's Skills & Toolkit section.

## Portfolio Features

- Responsive portfolio homepage and two project case-study pages.
- Profile, experience, education and QA skills; the updated résumé link will be added when the new PDF is ready.
- Certificate previews linked to their original files.
- LinkedIn, GitHub and direct contact links.
- Search and social-sharing metadata, canonical URLs, sitemap and robots file.
- Accessible page landmarks, skip links, descriptive image alternatives and reduced-motion support.
- Source-level checks, production build verification, HTTP smoke tests, browser interaction tests and Lighthouse reports.

## Tech Stack

- **Markup:** HTML5
- **Styling:** CSS3, responsive layouts and custom design tokens
- **Application code:** JavaScript ES modules
- **Build tooling:** Vite
- **Visual / motion libraries:** Three.js, GSAP / ScrollTrigger and Lenis
- **Hosting:** GitHub Pages
- **Automation in CI:** GitHub Actions, Playwright and Lighthouse

The portfolio is intentionally built without a front-end framework. The main site uses Vite with vanilla JavaScript; the case-study pages are standalone HTML pages sharing the same visual system.

## Repository Structure

```text
.
├── index.html                         # Portfolio homepage
├── projects/
│   ├── saucedemo.html                 # SauceDemo case study
│   └── makemytrip.html                # MakeMyTrip assessment
├── src/
│   ├── main.js                        # Homepage entry point
│   ├── scenes/
│   │   └── qa-scene.js                # Optional Three.js scene
│   └── styles/
│       ├── main.css
│       ├── quality.css
│       └── refinements.css
├── assets/
│   ├── css/                           # Shared and case-study styles
│   └── js/                            # Case-study scripts
├── scripts/
│   ├── stage-pages-assets.mjs         # Prepare public Pages assets
│   ├── verify-portfolio.mjs           # Source-level audit
│   ├── verify-pages-build.mjs         # Built artifact audit
│   ├── serve-site.mjs                 # Serve the dist directory
│   ├── http-smoke.mjs                 # Route and asset smoke tests
│   └── browser-interaction-smoke.mjs  # Playwright browser checks
├── .github/
│   └── workflows/                     # CI, deployment and production audits
├── package.json
├── package-lock.json
└── vite.config.js
```

## Run Locally

### Requirements

- Node.js 22
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kalpshahtester/kalpshahtester.github.io.git
cd kalpshahtester.github.io
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Build & Validate

The Pages build stages the existing project routes, public assets, certificates and metadata into Vite's `public/` directory before creating the production output. The previous résumé file remains in the repository for now, but it is not promoted as the current downloadable résumé.

Run the build steps in this order:

```bash
node scripts/stage-pages-assets.mjs
npm run check
npm run build
node scripts/verify-pages-build.mjs
```

The generated production site is written to `dist/`.

### Test the built site over HTTP

Start a local server against the exact production build:

**macOS / Linux**

```bash
SITE_ROOT=dist PORT=4173 node scripts/serve-site.mjs
```

**Windows PowerShell**

```powershell
$env:SITE_ROOT = "dist"
$env:PORT = "4173"
node scripts/serve-site.mjs
```

In a second terminal, run the HTTP smoke test:

**macOS / Linux**

```bash
BASE_URL=http://127.0.0.1:4173 npm run smoke
```

**Windows PowerShell**

```powershell
$env:BASE_URL = "http://127.0.0.1:4173"
npm run smoke
```

## Quality & CI Checks

| Check | What it validates |
|---|---|
| `npm run check` | JavaScript syntax, required assets, three-page HTML structure, unique IDs, local anchors, cross-page fragments, ARIA references, accessible names, image alt text, safe external links, metadata, CSS balance and sitemap entries. |
| `npm run build` | Vite production build. |
| `node scripts/verify-pages-build.mjs` | Generated deployment files, bundled CSS / JavaScript, project routes, résumé, portrait and certificate assets. |
| `npm run smoke` | HTTP status, content type and non-empty responses for the homepage, case studies and local resources. |
| Production Playwright workflow | Desktop and mobile interactions, navigation, project dialog, sample QA interaction, JavaScript errors and responsive overflow checks. |
| Production Lighthouse workflow | Performance, Accessibility, Best Practices and SEO audits for all three public routes. |

### GitHub Actions

- **Portfolio quality checks** run on pushes and pull requests targeting `main`. They stage assets, run the source audit, build the site, verify the Pages artifact and smoke-test the generated output.
- **Deploy Vite portfolio to GitHub Pages** builds and publishes the `dist/` artifact when changes are pushed to `main`, or when manually started.
- **Production smoke, browser and Lighthouse workflows** run after a successful Pages deployment. Lighthouse HTML and JSON reports are uploaded as a workflow artifact for 30 days.

Useful workflow links:
- [Deployment workflow](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/deploy.yml)
- [Quality-check workflow](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/portfolio-quality-check.yml)
- [Production browser tests](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/browser-interaction-smoke.yml)
- [Production smoke tests](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/production-smoke.yml)
- [Lighthouse audits](https://github.com/kalpshahtester/kalpshahtester.github.io/actions/workflows/lighthouse-production.yml)

For the latest measured checks and known follow-up items, see [QUALITY_AUDIT.md](./QUALITY_AUDIT.md).

## Images & Identity

The original committed profile PNG is the source of truth for the homepage portrait. It is displayed using `object-fit: contain`; no cropping, face replacement or retouching is applied. The same committed image is used by the source and production build paths.

Certificate previews link to their full-size source files. The résumé is available from the homepage and from the repository root.

## Scope & Accuracy

- SauceDemo is a **public practice application**, not production work for Sauce Labs.
- MakeMyTrip is a **testing assessment**, not a client engagement or employment relationship with MakeMyTrip.
- The SauceDemo figures above describe that practice project only.
- The 100+ user support figure belongs to the previous IT Support role, not the QA role.
- Supplementary course certificates are not represented as professional experience.

## Known Limitations

Automated source, build, HTTP, browser and Lighthouse checks cover defined routes and scenarios. They do not prove every possible user journey or replace manual visual review on physical iOS / Android devices, screen-reader testing with assistive technology, or cross-browser checks on every browser engine.

Homepage Lighthouse performance remains an improvement area. Scores can vary between lab runs; current measurements and remaining work are documented in the quality audit and the corresponding GitHub Actions artifacts.

## Contact

- **Portfolio:** [kalpshahtester.github.io](https://kalpshahtester.github.io/)
- **LinkedIn:** [Kalp Shah — Software Tester](https://www.linkedin.com/in/kalp-shah-software-tester/)
- **GitHub:** [@kalpshahtester](https://github.com/kalpshahtester)
- **Email:** [manualtesterkalpshah@gmail.com](mailto:manualtesterkalpshah@gmail.com)

---

<p align="center">
  <sub>Built to present practical manual QA work, clear testing evidence and a commitment to dependable web experiences.</sub>
</p>
