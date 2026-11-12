# CLAUDE.md — Enrollment Frontend (BCP)

## Project overview

Back-office SPA for the BCP partner/client **enrolment** workflow: data-entry users create partner
files, validators approve/reject them, central admins manage users, roles, permissions and the
audit log. All data comes from the Spring Boot backend `dl-ms-enrolment` (sibling repo
`Enrolement-Backend`). UI copy is bilingual FR/EN.

**Stack** (see `package.json`): React 18 + TypeScript 5 + Vite 5, Tailwind CSS 3 (`darkMode: 'class'`),
React Router 6, Zustand 4 (state), Axios 1 (HTTP), lucide-react (icons).
There is **no component library**: every UI primitive is hand-written with Tailwind.

| Path | Responsibility |
|---|---|
| `src/App.tsx` | Routing, role gating (`PROFIL_ADMIN_CENTRAL` for `/users`, `/roles`, `/permissions`, `/audit`), inline 403/404 pages |
| `src/components/layout/` | `Layout` (shell), `Sidebar` (role-based nav + pending-validation badge), `Navbar` (lang/theme/user menu) |
| `src/components/common/` | Shared primitives: `FormComponents` (FormInput/FormSelect/SearchableSelect/FormSection/FormBlock/FormToggleRow), `Table`, `Toggle`, `ConfirmDialog`, `CountrySelect`, `ToastContainer`, `Loader`, toggles, `GeometricDecor` |
| `src/components/pages/` | One file per screen. `PartnersPage.tsx` (~2.2k lines) holds every partner view (list, create/edit tabs, drafts, validate, consult) switched by `initialMode`/`viewMode` |
| `src/services/api.ts` | Single Axios client + `apiService` — **all endpoints live here** |
| `src/utils/` | Zustand stores (`authStore`, `langStore` with `t('FR','EN')`, `toastStore`), `logger`, `validation`, `helpers` (`storage` = JSON localStorage wrapper), ISO country/currency lists |
| `src/types/index.ts` | Shared DTO/interface types |
| `src/styles/globals.css` | Design tokens-in-use: base styles + reusable component classes (see below) |
| `tailwind.config.js` | Brand colors (`bcp-*`, `brown-*`, `warm-*`, `dark-*`), `gray` mapped to Tailwind `stone`, shadows, animations |

Unused legacy files (nothing imports them): `src/components/pages/index.tsx`, `src/styles/designSystem.ts`, `src/styles/index.ts`.

## Commands

```bash
npm run dev          # Vite dev server on http://localhost:5173
npm run type-check   # tsc --noEmit  (must pass)
npm run build        # tsc && vite build → dist/
npm run lint         # currently FAILS: no ESLint config exists in the repo
```

- `dist/` is **tracked in git**. To verify a build without touching it:
  `npx vite build --outDir <some-temp-dir> --emptyOutDir`.
- No test suite exists.

## Development rules

- UI work must not change business logic, data flow or contracts. Never rename or alter variables,
  functions, hooks, props, DTOs/types, form field names, submitted values, API endpoints, HTTP methods,
  payloads, routes or validation rules as part of a visual change.
- Do not replace backend data with mocks.
- Reuse the existing primitives in `components/common` and the classes in `globals.css` before writing
  new markup; prefer editing `className` strings over restructuring JSX.
- Keep visual changes isolated from logic. If a visual change needs a logic change, keep it minimal and
  call it out.
- Don't add dependencies or a UI framework without a clear need; the project is Tailwind-only.
- Every visible string goes through `t('Texte FR', 'English text')`; components that render text call
  `useLangStore()` so they re-render on language change.
- Support both themes: every surface/text color needs a `dark:` counterpart.

## Design guidelines

Reference: **https://uupm.cc/** (UI UX Pro Max). It is a design-guidelines database (styles, palettes,
UX rules), not an installable component library — apply its rules, don't look for packages.
Over HTTPS the site may fail behind the corporate proxy; plain HTTP or its GitHub repo
(`nextlevelbuilder/ui-ux-pro-max-skill`) works.

- **Palette**: orange `bcp-orange #FF9900` = primary actions/active state; brown `bcp-brown #6B4C3A` =
  secondary emphasis/depth and the sidebar; warm taupe grey (`gray-*`, custom ramp in
  `tailwind.config.js`) = text, borders, neutrals; cream `sand-*` = light-theme canvas (`sand-200`),
  cards (`sand-50`) and borders (`sand-300/400`). Avoid plain-white page areas; pure white is for inputs.
  Gradients only subtle orange→brown (hero panels, accent lines, avatars, icon chips).
- **Layout identity**: deep-brown gradient sidebar with orange active pill; cream navbar; every page
  starts with a centered `.page-hero` (`page-hero-icon` → `page-title` → `page-subtitle` →
  `page-hero-actions`). Tables, forms and data stay left-aligned.
- **Background**: `GeometricDecor` = soft orange/brown glows, a faint dot grid and fine flowing curves,
  fixed behind content at low opacity. Don't reintroduce large flat shapes.
- **Status colors** are semantic only: emerald = active/validated, amber = pending/submitted,
  red = rejected/destructive, brown/neutral = draft/info. Avoid blue/purple/cyan.
- **Reusable classes** (`globals.css`, `@layer components` so utilities can override them):
  `card-base` (+ `card-interactive`), `page-hero` (+ `page-hero-icon`, `page-hero-actions`),
  `page-title`, `page-subtitle`, `section-label`,
  `btn-primary | btn-secondary | btn-outline | btn-ghost | btn-danger | btn-success | btn-icon`,
  `premium-input` (inputs/selects/textarea, ≥44px), `badge` + `badge-success|warning|danger|brand|neutral`,
  `table-head`, `table-th`, `data-row`, `modal-backdrop`, `modal-panel`, `custom-scrollbar`.
- Radii: `rounded-xl` controls, `rounded-2xl` cards/modals. Elevation: `shadow-bcp-card` (rest) <
  `shadow-bcp-soft` < `shadow-bcp-medium` (overlays/forms) < `shadow-bcp-hover`.
- Typography: semibold headings, medium labels (`text-[13px] font-semibold`), no `font-black`/italic for
  body UI; `tabular-nums` for amounts, IDs, dates (tables get it globally).
- Motion: short, purposeful transitions only (`animate-fadeIn`, `animate-slideUp`, `animate-shake` for
  errors, `animate-progress` for loaders). No perpetual decorative animation in the app shell.
  `prefers-reduced-motion` is honored globally.
- Accessibility: visible focus rings (`focus-visible:ring-4 ring-bcp-orange/…`), `aria-label` on
  icon-only buttons, `role="switch"`/`aria-checked` on toggles, labels or `aria-label` on inputs,
  4.5:1 text contrast in both themes.
- Responsive: layouts must work at phone, tablet and desktop widths; wide tables scroll inside
  `overflow-x-auto` containers, never the page.

## Authentication and environments

- Login: `POST /auth/login {username, password}` to the backend, which authenticates against
  **Keycloak** (realm configured in the backend's `application.properties`) and returns a JWT,
  refresh token, profile and `roleNames`.
- The frontend stores `authToken`, `refreshToken`, `user` in `localStorage` (`utils/helpers.ts`
  `storage`). Axios adds `Authorization: Bearer …`; on 401 it calls `POST /auth/refresh` once, else
  clears storage and redirects to `/login`. On app load `useAuth` hydrates from storage and refreshes
  roles via `GET /auth/me`.
- Roles (names and helpers in `src/utils/roles.ts`, mirrored by the backend's `security/Profiles.java`):
  `PROFIL_ADMIN_CENTRAL` (full admin), `PROFIL_AGENT_HABILITATION` (users page only; may grant only
  agent d'enrôlement / consultant and may not touch admin or habilitation accounts),
  `PROFIL_AGENT_ENROLEMENT` (entry + validation, 4-eyes rule enforced by the backend),
  `PROFIL_CONSULTATION`. `PROFIL_SAISIE` / `PROFIL_VALIDATEUR` are legacy, merged into
  `PROFIL_AGENT_ENROLEMENT` by a backend startup migration.
  Authenticated users with no role see `NoRolePage`. Client-side gating is cosmetic; the backend
  enforces permissions (`PermissionAuthorizationFilter`).
- **Test user**: none exists in the frontend or backend. For real data, sign in through the normal
  login with a dedicated account from the **non-production** Keycloak realm whose roles were assigned
  in the app (Users page). Never hard-code or commit credentials.
- **Dev-only UI preview** (`src/utils/devAuth.ts`): with `VITE_DEV_AUTH_BYPASS=true` in the git-ignored
  `.env.development.local` and `npm run dev`, the app starts "signed in" as a fake user holding all four
  roles, the sidebar shows every section, and 401s no longer redirect to `/login`. A red "DEV PREVIEW"
  pill is shown. It is gated on `import.meta.env.DEV`, so `vite build` strips it (verified: no trace in
  the bundle even with the flag set). Backend security is untouched: API calls carry no token and are
  rejected, so pages render without data. Remove the line or set it to `false` to restore normal login.
- Config is build-time Vite env: `VITE_API_URL` (API base, default `http://localhost:8080`) and
  `VITE_LOG_LEVEL` (`debug|info|warn|error|silent`). Other `VITE_*` keys in `.env` are not read by the
  code. `.env` is tracked — keep it free of secrets.
- Local backend default port is `8094` (`SERVER_PORT` in the backend), so set `VITE_API_URL` to
  match. The Vite `/api` proxy (→ `localhost:8080`) is only used if `VITE_API_URL=/api`.
- UAT: the Docker image bakes `VITE_API_URL` at build time (default `https://enrolment-uat-api.gbp.cpm.net`,
  overridable by the GitLab CI variable); nginx serves static files only. Never document passwords,
  tokens or client secrets here.

## Validation checklist (before handing back UI work)

- [ ] `npm run type-check` passes and a build succeeds (temp `--outDir`, see above).
- [ ] `git diff` shows no changes to handlers, `value`/`onChange` wiring, `apiService` calls, payloads,
      routes, types or business constants — only classes/markup/ARIA.
- [ ] Existing features still work for each role (list, create/edit tabs, drafts, validate/reject,
      consult, admin pages, CSV export).
- [ ] Light **and** dark themes, FR **and** EN, checked at phone, tablet and desktop widths.
- [ ] No new console errors; no horizontal page scroll; focus rings visible on keyboard navigation.
