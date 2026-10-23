# MAES17 — geodesy, land surveying and land development website

A multilingual (Armenian / Russian / English) marketing site for **MAES17**, operated by
Erik Tovmasyan, individual entrepreneur. It is built with React, TypeScript and Vite and
statically prerendered, so every public page ships as complete HTML with its own metadata.

## Quick start

```bash
npm install
npm run dev        # development server with hot reload → http://localhost:5173
npm run build      # typecheck + client build + SSR build + static prerender → dist/
npm run preview    # serve dist/ → http://localhost:4173 (same server as npm start)
npm start          # production server with dynamic origin
npm test           # unit and integration tests (Vitest)
```

Requires Node.js 20.19+ (22 LTS recommended).

`.npmrc` sets `legacy-peer-deps=true`. npm 10.9 crashes with `Cannot read properties of null (reading 'edgesOut')` when it resolves Vitest's optional peer dependencies, and this setting avoids the crash. `@testing-library/dom` is listed explicitly for the same reason.

### Site origin (domain) — dynamic

No domain is hard-coded. Canonical URLs, hreflang, the sitemap, `robots.txt`, Open Graph and JSON-LD use the origin resolved in this order:

1. **Build time:** `VITE_SITE_URL` if set, otherwise the production URL the hosting platform exposes (Vercel `VERCEL_PROJECT_PRODUCTION_URL`, Netlify `URL`, Cloudflare Pages `CF_PAGES_URL`, Render `RENDER_EXTERNAL_URL`, Railway `RAILWAY_PUBLIC_DOMAIN`). See `scripts/site-origin.mjs`.
2. **Request time:** when the build did not know the domain, pages contain the reserved placeholder `https://site-origin.invalid`. `npm start` (`scripts/preview.mjs`) replaces it with the domain of each request, so one build works on any domain.
3. **Browser:** after client-side navigation, head tags use `window.location.origin`.

| Variable        | When                  | Purpose                                                                           |
| --------------- | --------------------- | --------------------------------------------------------------------------------- |
| `VITE_SITE_URL` | build (optional)      | Fixed origin, e.g. `https://maes17.am`. Required only on plain static hosts.      |
| `PORT`          | `npm start`           | Port, default 4173.                                                               |
| `ALLOWED_HOSTS` | `npm start` (prod)    | Comma-separated hostnames; requests with other `Host` headers fall back to the first one, which prevents canonical spoofing. |
| `TRUST_PROXY=1` | `npm start` behind a proxy | Use `X-Forwarded-Proto` / `X-Forwarded-Host`.                               |

## Stack

- React 19 + TypeScript (strict) + Vite 7
- React Router 7 (declarative routes, `/:lang/...`)
- Tailwind CSS 4: design tokens live in `src/styles/globals.css` under `@theme`
- Motion (Framer Motion) for scroll-linked and interaction animation
- i18next + react-i18next with JSON translation files
- Lucide icons and self-hosted variable fonts (Fontsource)
- Vitest + Testing Library; `sharp` for image and brand-asset generation

## Rendering strategy (SEO)

The site is **statically prerendered at build time** (SSG). There is no Node server in production.

1. `vite build` creates the client bundle.
2. `vite build --ssr src/entry-server.tsx` creates a render function.
3. `scripts/prerender.mjs` renders every route in every language with `renderToString` and writes the following:
   - `dist/<lang>/<path>/index.html` for each of the 42 pages
   - `404.html` (noindex)
   - the root `index.html`, which redirects to the stored or default language
   - `sitemap.xml` with hreflang alternates
   - `robots.txt`
   - `llms.txt`
4. In the browser, `src/entry-client.tsx` loads the page's language and **hydrates** the existing HTML.

Head tags are generated from one pure function, `getPageMeta(route, locale, t)` in `src/seo/metadata.ts`. The prerenderer writes them into the static HTML. After client-side navigation, a small head manager (`src/seo/head-tags.ts`) replaces them, so crawlers and users always see the same title, description, canonical, hreflang, Open Graph and JSON-LD. There is no Helmet dependency, and indexing does not depend on JavaScript.

The scroll and reveal animations never hide prerendered content. Reveal effects only switch on after hydration, and only for elements below the fold. Crawlers, visitors without JavaScript and reduced-motion users see everything.

**Limitations:**
- Content changes require a rebuild and redeploy. There is no CMS.
- Routes are known at build time. To add a page, add it to `src/app/routes.ts` (`indexableRoutes`) and `src/app/App.tsx`.
- The static host must serve `dist/404.html` for unknown paths. Netlify, Vercel, Cloudflare Pages, GitHub Pages and nginx with `error_page 404 /404.html;` all do.
- The root `/` redirect is a static page that uses a meta refresh plus a script, and it remembers the visitor's language. You can replace it with a host-level redirect, for example a Netlify `_redirects` line `/  /hy/  302`, but the stored-language preference is then ignored at the root.

## Project structure

```text
src/
  app/            App routes, providers, route model (routes.ts), hooks
  components/
    animations/   Reveal, TopographicBackground, contour generator
    brand/        Logo, symbol, wordmark (shared geometry in logo-paths.ts)
    chat/         ChatWidget, ChatPanel, chat-engine.ts, chat-types.ts, knowledge-base.ts
    contact/      ContactLauncher, ContactForm, inquiry.ts (validation + WhatsApp link)
    layout/       Header, Footer, MobileMenu, LanguageSwitcher, Breadcrumbs, LocaleLayout
    sections/     Page sections (heroes, services accordion, traverse process, FAQ, CTA)
    ui/           Button, Picture, LocalizedLink, Coordinate, markers, badges
  config/         company.ts (single source of truth), site.ts (locales, site URL)
  content/        services.ts, projects.ts, images manifest, chat/<lang>.json knowledge bases
  i18n/           i18next setup, locale utilities, lazy resource loading
  locales/<lang>/ common, home, about, services, contacts, faq JSON
  pages/          Home, About, Services, ServiceDetail, Contacts, FAQ, Credits, NotFound
  seo/            metadata.ts, structured-data.ts, head-tags.ts
  styles/         globals.css (tokens, primitives), fonts.ts
scripts/          prerender, preview server, image pipeline, brand asset generator
tests/            routing, language switching, translations, chat engine, form validation
public/           favicons, manifest, optimized photos, brand assets
```

Translations live in `src/locales/<lang>/*.json` rather than `public/locales`. The files are still plain JSON and editing them never requires touching components. Bundling them lets the prerenderer read them synchronously and lets the browser download only the active language, before hydration, without a flash of untranslated text.

## Customization

### Company data: `src/config/company.ts`

The phone number, WhatsApp and Telegram links, the owner's name, brand assets and service area are all defined here. They feed the following:
- the header, footer and contact page
- the floating contact launcher
- chat answers
- JSON-LD and metadata

Translation files never contain the phone number or the name. They use `{{phone}}`, `{{owner}}` and `{{company}}`, and a test fails if a literal value slips in.

Fields set to `null` (email, address, hours) are not rendered. Fill them only with verified data. `serviceArea.confirmed: false` keeps the area out of copy and structured data until you confirm it.

### Languages
- To add a language:
  1. Add it to `locales` and `localeMeta` in `src/config/site.ts`.
  2. Copy `src/locales/en` to a new folder and `src/content/chat/en.json` to a new file, then translate.
  3. Add a `localizedName` spelling to `companyConfig.owner`.
- The default language (`hy`) is set by `defaultLocale`.
- `tests/translations.test.ts` checks that every language has identical keys, array lengths and placeholders.

### Services, projects and images
- **Services:** `src/content/services.ts` controls which services exist, their order, image, icon and related services. The text is in `services.json` under `items.<slug>`. To unpublish a service, remove its entry from both.
- **Projects:** `src/content/projects.ts`, with text in `home.json` → `projects.items`. All current projects are **demonstration content** (`demo: true`) and display a "Demonstration content" badge.
- **Photos:**
  1. List sources in `scripts/image-sources.json`.
  2. Run `npm run images`. It downloads to `.cache/images`, writes responsive WebP files to `public/images/photos` and generates `src/content/images.generated.json` with credits.
  3. To use your own photos, put them in `assets-src/photos/` and add an entry with `"local": "assets-src/photos/<file>"` (optionally `"crop"`), then reference the `name` in code.

### Imagery

- **Illustrations:** `npm run art` generates the illustration series in `assets-src/art/` (procedural terrain, contours and survey-plan overlays in the site palette, deterministic seeds). They are used for the service and project images and the About hero.
- **Owner media:** `assets-src/photos/` and `assets-src/video/` hold images and the hero video supplied by the owner. The hero video (`public/videos/hero.mp4`) plays over its poster frame, only after hydration, and is skipped for reduced-motion and Save-Data visitors; a pause button is provided.
- After changing sources, run `npm run images` to rebuild the WebP renditions.
- **Hero video edit:** `public/videos/hero.mp4` is the first 3 seconds of `assets-src/video/hero-source.mp4` played at half speed, with frames interpolated to 30 fps and no audio track. The source's closing logo card is not used. To regenerate it with ffmpeg:
  `ffmpeg -t 3 -i assets-src/video/hero-source.mp4 -an -vf "setpts=2.0*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart public/videos/hero.mp4`

### Brand
`npm run brand` regenerates the brand assets from `src/components/brand/logo-paths.ts`:
- primary logo in light and dark versions
- standalone symbol
- `favicon.svg` and `favicon.ico`
- touch and manifest icons
- `og-image.jpg`

The symbol is a triangulation point (the cartographic sign for a geodetic control point) inside terrain contour lines. The wordmark is drawn monoline on the same stroke weight, and the accent is survey-pole orange.

## Chat assistant

The chat is a rule-based FAQ assistant that works without a backend.
- The UI is `ChatWidget` and `ChatPanel`. The panel and knowledge base load only when the chat is opened.
- The engine (`chat-engine.ts`) normalizes text, unifies ё/е, strips Armenian ՞ marks and scores keyword stems per intent.
- Answers come only from `src/content/chat/<lang>.json`. Unknown questions get a transparent fallback with contact details.
- The engine implements the `ChatEngine` interface (`reply(input): Promise<ChatReply>`). A real AI service can replace it later behind a **server-side** endpoint. Never put an API key in frontend code.

## Contact form

There is no backend and no email address, so the form neither posts to a server nor uses `mailto:`.
1. It validates the fields, with accessible errors and an error summary.
2. It then opens **WhatsApp with the message prefilled** (`wa.me/<number>?text=…`).
3. The visitor sends the message from WhatsApp.

The success state says this explicitly and offers copy-to-clipboard for Telegram, so the site never claims that a message was delivered.

## SEO, GEO and AEO

- Each route and locale has a unique title and description, plus a canonical, hreflang alternates (including `x-default`), Open Graph and Twitter metadata, and breadcrumbs on inner pages.
- All public localized pages are indexable. Only the 404 page carries `noindex`.
- **JSON-LD:**
  - `Organization` on every page, with one stable `@id` across locales, founder as a `Person`, a telephone `ContactPoint` and `knowsAbout`
  - `WebSite` on the home page
  - `Service` on service pages
  - `BreadcrumbList` on inner pages
  - `FAQPage` on `/faq`

  `LocalBusiness` is deliberately not used because there is no verified address. No ratings, prices or certifications are emitted.
- Google currently shows FAQ rich results only for a limited set of sites, so the `FAQPage` markup is valid but may not produce rich results. Structured data never guarantees rich results.
- The sitemap and robots.txt are generated at build time.
- `llms.txt` (from `scripts/llms.template.txt`) gives AI crawlers a plain-text summary. It is a discovery aid only, not a ranking factor and not a guarantee of citation.
- The FAQ answers are short and direct, followed by more context. They are written identically across languages and use the native `<details>` element, so the content stays in the HTML.

## Accessibility and performance

The site includes:
- semantic landmarks and a skip link
- visible focus rings and keyboard-operable menus and dialogs (Escape closes them)
- labelled icon-only buttons
- `aria-live` chat log and form errors linked with `aria-describedby`
- reduced-motion support in CSS, Motion and reveal logic
- intrinsic image sizes (CLS ≈ 0)
- lazy-loaded below-the-fold images
- self-hosted fonts loaded by unicode range
- inlined CSS

Lighthouse 12 against `npm run preview` (brotli enabled) on this machine:

| Page                                   | Mobile perf | Desktop perf | A11y | Best practices | SEO |
| -------------------------------------- | ----------- | ------------ | ---- | -------------- | --- |
| `/hy/`                                 | 79          | 97           | 100  | 100            | 100 |
| `/en/services/topographic-surveying/`  | 80          | —            | 100  | 100            | 100 |
| `/ru/contacts/`                        | 82          | 99           | 100  | 100            | 100 |

On mobile (simulated slow 4G), LCP is about 3.6–4.2 s. Most of it is render delay while the variable web fonts load. Two options would improve this further:
- subsetting the fonts to the glyphs actually used
- switching the heading font to `font-display: optional`

## Deployment

Deploy the `dist/` directory to any static host:
1. Either run it with `npm start` (dynamic origin; set `ALLOWED_HOSTS`), deploy to a platform listed above, or set `VITE_SITE_URL` for a plain static host.
2. Run `npm run build`.
3. Upload `dist/`.

`vercel.json` is included. On Netlify, set the build command to `npm run build` and the publish directory to `dist`. Hashed files in `/assets/` can be cached immutably.

## Open items for the owner

- **Statistics:** the figures in the home statistics section (`companyConfig.stats`) are placeholders and are labelled as demonstration figures. Replace them with real numbers and set `confirmed: true`.
- **Owner-supplied media** (`assets-src/photos/`, `assets-src/video/hero-source.mp4`): confirm usage rights. The terrain-scan image had an AI-generator watermark that the pipeline crops out. The hero video is 864 × 496 px; a 1920 px version would look sharper on large screens.

- **Telegram link:** `https://t.me/+37441171793` is unverified. The `t.me/+…` form is also used for invite links. Test it on a phone, or replace it with a username link (`https://t.me/<username>`).
- **Native spellings of the owner's name:** confirm Էրիկ Թովմասյան and Эрик Товмасян (`companyConfig.owner.localizedName`).
- **Translations:** review the Armenian and Russian service terminology. For example, ցանցի հավասարակշռում vs. հավասարեցում, and «Строительная геодезия» as the short label.
- **Missing company data:** confirm the service list, service area, working hours, and any email or office address, then add them in `company.ts`.
- **Demonstration projects:** replace them with verified projects and set `demo: false`.
- **Domain:** once it is live, submit `https://<domain>/sitemap.xml` in Google Search Console and Yandex Webmaster.
