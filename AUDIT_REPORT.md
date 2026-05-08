# Crane Venture — Design Audit
**Date:** 2026-05-08 · **Build:** Vite + React + Tailwind v4 · **Live URL audited:** http://localhost:5173

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|:---:|-------------|
| 1 | Accessibility | **1** | 1 aria-label across 22 buttons; broken heading hierarchy (1 H1, 0 H2/H3); 0 `<label>` for 1 visible input; touch targets 32–36 px (below 44) |
| 2 | Performance | **3** | Tokens, `prefers-reduced-motion`, focus-visible all wired correctly. **But** MUI + Radix + emotion all bundled — duplicate component libs |
| 3 | Theming | **2** | Excellent token layer in `theme.css`, but **bypassed** at the call-site: `text-slate-*` used 760+ times vs. `text-muted-foreground` rarely |
| 4 | Responsive | **2** | `min-height: 32px` on every button in `theme.css:` — global rule guarantees WCAG 2.5.5 fail on mobile. No breakpoint variants in primary nav |
| 5 | Anti-Patterns | **1** | Indigo→violet brand, Inter, slate-only neutrals, dark-sidebar/light-body, "Intelligence Hub / Command Center / Action Matrix" — six classic AI tells stacked |
| **Total** | | **9 / 20** | **Poor — major overhaul needed** |

---

## Anti-Patterns Verdict — **DOES THIS LOOK AI-GENERATED?**

**Yes. Verdict: fail.** Six stacked tells, brutally honest:

1. **Brand = `#6366f1` → `#8b5cf6` (indigo-500 → violet-500).** Literally the textbook "AI app" gradient. The text-gradient utility in `theme.css:152` ships this exact pair. Every Replit/Vercel/Linear clone uses these two hexes. For a venture firm, it's anti-distinctive — Crane should look like a *fund*, not an LLM wrapper.
2. **Inter, everywhere.** `theme.css:53` and `fonts.css:1`. Inter is the most overused SaaS face on earth; pairing it with JetBrains Mono is the GitHub Copilot landing-page combo. A VC reading deal data doesn't need a developer-tool aesthetic.
3. **Slate-only neutrals.** `text-slate-400` appears **234** times, `text-slate-700` 126, `border-slate-200` 135, `bg-slate-50` 108. No warmth, no tonal variation — the gray-blue cast is the same one ChatGPT, Claude.ai, and v0 all use.
4. **Dark sidebar (`#0f0f12`) / light body (`#f8fafc`).** Asymmetric two-tone is the shadcn-starter default. `WorkOS / Linear / every B2B SaaS shipped in 2024` look. No commitment to either light or dark — the cheapest visual move available.
5. **AI taxonomy in nav labels.** "Intelligence Hub", "Command Center", "Action Matrix", "Quarterly Review" — all four are LLM-generated category names. Real VCs don't say "Action Matrix"; they say "To-do" or "Pipeline". This is the loudest tell.
6. **"Good morning, Anna" hero greeting.** Generic dashboard cliche from 2018 — every AI mockup has it.

**Tells the design avoids (good):** No glassmorphism (only 2 backdrop-blurs), 0 `bg-clip-text` in TSX, 0 `hover:scale`, no bouncy `cubic-bezier(0.68, -0.55, ...)`. The motion system in `theme.css:66-70` (`--ease-out-expo`, fade-in-up, stagger-children) is genuinely tasteful — Emil Kowalski-grade. **The motion is good. The visual identity is the problem.**

---

## Executive Summary

- **Score: 9/20.** Strong technical foundations (tokens, easing, reduced-motion, focus-visible) buried under a generic visual identity and shallow accessibility layer.
- **39 issues** documented: 4 P0, 13 P1, 14 P2, 8 P3.
- **Top 3 critical issues:**
  1. **Visual identity reads as AI slop** (P0) — fix or this never feels premium.
  2. **Form/button accessibility is broken** (P0) — 0 labels, ~5% aria coverage; ships with WCAG A failures, not just AA.
  3. **Touch targets globally too small** (P1) — `min-height: 32px` rule in `theme.css` violates WCAG 2.5.5 across every button on mobile.
- **Recommended next step:** Run `/distill` then `/typeset` + `/colorize` to strip the generic palette and reset to a venture-firm-distinctive identity. Then `/harden` for a11y and `/normalize` for token discipline.

---

## Detailed Findings by Severity

### P0 — Blocking

#### [P0] Generic AI-SaaS visual identity
- **Location:** `src/styles/theme.css:9` (`--primary: #6366f1`), `src/styles/theme.css:152` (`.text-gradient`), `src/styles/fonts.css:1` (Inter)
- **Category:** Anti-Pattern
- **Impact:** Crane is a venture capital firm. The current palette and typography make it indistinguishable from any AI productivity SaaS. For LP-facing or founder-facing surfaces this damages credibility — "Why are we using a tool that looks like a ChatGPT plugin?"
- **Recommendation:** Replace indigo→violet with a single confident brand color (e.g. graphite + a single ink accent like `#1B3F4A` or `#0E2240`). Replace Inter with a more characterful sans (e.g. **Söhne, Inter Display, Geist, Mona Sans, or Tiempos** for headings). Remove `.text-gradient` utility entirely.
- **Suggested command:** `/distill` → `/typeset` → `/colorize`

#### [P0] Form inputs have no labels
- **Location:** Live page has `1 input, 0 <label>` (eval result)
- **Category:** Accessibility
- **Impact:** WCAG **3.3.2 Labels or Instructions** failure. Screen-reader users cannot identify the input purpose. This is a Level **A** failure, not just AA.
- **Standard:** WCAG 2.2 Level A — 1.3.1, 3.3.2, 4.1.2
- **Recommendation:** Wrap every input with `<label>` (visible or `sr-only`) or add `aria-labelledby` / `aria-label`.
- **Suggested command:** `/harden`

#### [P0] AI taxonomy in primary nav
- **Location:** Sidebar — "Intelligence Hub", "Command Center", "Action Matrix", "Quarterly Review", "Founder Data"
- **Category:** Anti-Pattern (copy)
- **Impact:** Every label sounds LLM-generated. Real users (partners, analysts) don't speak this way. Damages trust on first impression and confirms the "AI-generated" feeling the user explicitly called out.
- **Recommendation:** Rename in plain VC vocabulary: "Pipeline", "Portfolio", "Tasks", "Quarterly", "Founders". Remove the all-caps section labels ("WORKSPACE", "WORKFLOW", "MY COMPANIES") — they're decorative noise.
- **Suggested command:** `/clarify`

#### [P0] Buttons missing aria-label, almost universally
- **Location:** 22 buttons rendered, **1** has `aria-label`. Codebase: 19 `aria-*` attributes total across 70+ components
- **Category:** Accessibility
- **Impact:** Icon-only buttons (Sign out, Collapse, etc.) are unreadable to screen readers. WCAG **4.1.2 Name, Role, Value** failure.
- **Recommendation:** Add `aria-label` to every icon-only or ambiguous button. Set up an ESLint rule (`jsx-a11y/control-has-associated-label`) to prevent regressions.
- **Suggested command:** `/harden`

### P1 — Major

#### [P1] Heading hierarchy broken on home view
- **Location:** Live page — 1 H1, 0 H2, 0 H3
- **Category:** Accessibility · **WCAG:** 1.3.1, 2.4.6
- **Impact:** Screen-reader users cannot scan structure. Sections are visual-only.
- **Recommendation:** Each card/section needs an `<h2>` or `<h3>`. Use `sr-only` if visual hierarchy doesn't need them.
- **Command:** `/harden`

#### [P1] Global `min-height: 32px` on buttons fails WCAG 2.5.5
- **Location:** `src/styles/theme.css:` (the global `button, [role="button"], a, select { min-height: 32px }` rule)
- **Category:** Responsive · **WCAG:** 2.5.5 Target Size (AAA 44×44, AA 24×24)
- **Impact:** Every button on mobile is too small to tap reliably. Sample of 12 buttons: **12/12 fail** the 44 px threshold (heights 32–36 px).
- **Recommendation:** Raise base to `min-height: 36px` desktop, `min-height: 44px` on touch via `@media (pointer: coarse)`.
- **Command:** `/adapt`

#### [P1] 11 px sidebar text, generally too small
- **Location:** `Full MVP` button uses `text-[11px]`, sidebar items use `text-[13px]`
- **Category:** Accessibility · **WCAG:** 1.4.4 Resize text
- **Impact:** 11 px is below the comfortable reading threshold. Combined with `text-slate-400` on dark background, fails contrast in the lower-contrast states.
- **Recommendation:** 11 px minimum body, 12 px metadata. Use scale: 12/13/14/16.
- **Command:** `/typeset`

#### [P1] Tokens exist but bypassed everywhere
- **Location:** `text-slate-*` usage frequency: 600+ across components vs. handful of `text-muted-foreground`
- **Category:** Theming
- **Impact:** Dark mode (`.dark` class) defines `--muted-foreground: #94a3b8`. Components hardcoded to `text-slate-500` will NOT update when the theme switches — broken dark mode by design.
- **Recommendation:** Replace `text-slate-500/600` → `text-muted-foreground`; `text-slate-900` → `text-foreground`; `bg-slate-50` → `bg-muted` or `bg-secondary`; `border-slate-200` → `border-border`. Codemod-able.
- **Command:** `/normalize`

#### [P1] Two component systems shipped in parallel
- **Location:** `package.json` — `@mui/material@7.3.5`, `@mui/icons-material@7.3.5`, `@emotion/*` AND 25× `@radix-ui/*` primitives
- **Category:** Performance
- **Impact:** MUI + Emotion + Radix is roughly **300–400 KB gzip** of redundant component code. MUI alone runtime-adds ~90 KB. Confused architecture: which library is canonical?
- **Recommendation:** Pick one. Radix + Tailwind (shadcn-style) is already the dominant pattern — remove MUI/Emotion. Audit imports; very likely <5 components actually depend on MUI.
- **Command:** `/optimize`

#### [P1] Brand color hard-coded in focus-visible
- **Location:** `theme.css:` `:focus-visible { outline: 2px solid #6366f1 }` and `::selection { background-color: #6366f1 }`
- **Category:** Theming
- **Impact:** Won't follow theme changes. If you rebrand (recommended P0), you'll have orphaned hex values.
- **Recommendation:** Use `var(--primary)` / `var(--ring)`.
- **Command:** `/normalize`

#### [P1] Active-state `transform: scale(0.97)` on every button/link
- **Location:** `theme.css` global rule on `button:active, [role="button"]:active`
- **Category:** Anti-Pattern (subtle)
- **Impact:** Universal transform on press feels cheap and "iOS demo" — not appropriate for a dense data app where buttons are clicked rapidly. Also conflicts with native input behavior.
- **Recommendation:** Remove the global. Apply scale-on-press only to large CTA buttons via a class.
- **Command:** `/animate`

#### [P1] Google Fonts loaded via `@import`, no preconnect
- **Location:** `fonts.css:1`
- **Category:** Performance
- **Impact:** Render-blocking; FOIT. CSS `@import` is the slowest possible way to load fonts.
- **Recommendation:** Move to `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html`, or self-host the woff2 with `font-display: swap`.
- **Command:** `/optimize`

#### [P1] No semantic landmarks
- **Location:** Page structure — `<aside>` exists (sidebar) but no `<main role="main">`, no `<nav aria-label>`, no `<header>`
- **Category:** Accessibility · **WCAG:** 1.3.1, 2.4.1
- **Impact:** Skip-link / landmark navigation broken. Power users can't jump.
- **Recommendation:** Wrap content in `<main>`, sidebar `<nav aria-label="Primary">`, top bar `<header>`.
- **Command:** `/harden`

#### [P1] No skip-to-content link
- **Location:** All pages
- **Category:** Accessibility · **WCAG:** 2.4.1
- **Impact:** Keyboard users tab through full sidebar before reaching content every navigation.
- **Recommendation:** Add `<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>` as first focusable element.
- **Command:** `/harden`

#### [P1] Heavy `text-slate-400` on light background
- **Location:** 234 occurrences of `text-slate-400`
- **Category:** Accessibility · **WCAG:** 1.4.3 Contrast
- **Impact:** `#94a3b8` on `#ffffff` = **3.05:1** — fails WCAG AA for normal text (needs 4.5:1). Used for body and metadata throughout.
- **Recommendation:** Reserve slate-400 for ≥18 px text only (passes AA Large at 3:1). For body, use slate-500 (4.65:1) or slate-600 (7.59:1).
- **Command:** `/colorize`

#### [P1] All-caps sidebar headers (`WORKSPACE`, `WORKFLOW`, `MY COMPANIES`)
- **Location:** Sidebar group labels, `text-slate-300` ish
- **Category:** Anti-Pattern (typography)
- **Impact:** All-caps + tiny + low-contrast = decorative noise. Reads as "AI generic dashboard." Real apps either drop these or use sentence case + a divider line.
- **Recommendation:** Drop the labels entirely; rely on visual grouping (gap, separator). Or sentence case at 12 px.
- **Command:** `/distill`

### P2 — Minor

#### [P2] Sidebar uses `transition-all duration-[280ms]` arbitrary value
- **Location:** Sidebar `<aside>`
- **Category:** Theming
- **Impact:** `--duration-slow: 280ms` exists in tokens; arbitrary class bypasses it.
- **Recommendation:** Add a `duration-slow` Tailwind utility mapped to the token.
- **Command:** `/normalize`

#### [P2] `text-[11px]` / `text-[13px]` arbitrary values
- **Location:** Sidebar buttons
- **Impact:** Bypasses Tailwind/theme typography scale. Inconsistent with `theme.css` typography.
- **Recommendation:** Use `text-xs` (12 px) / `text-sm` (14 px); align scale to the typography in `theme.css` `@layer base`.
- **Command:** `/typeset`

#### [P2] `bg-[#0f0f12]` arbitrary hex on sidebar
- **Location:** Sidebar `<aside>` className
- **Impact:** Token `--sidebar` exists with same value. Use it.
- **Recommendation:** `bg-sidebar`.
- **Command:** `/normalize`

#### [P2] Stagger animation cap at 10 children
- **Location:** `theme.css:107-117` — `.stagger-children > *:nth-child(1..10)`
- **Impact:** 11th+ child has no delay → pops in instantly, breaking the rhythm on long lists.
- **Recommendation:** Either cap with reduced delay, or use a CSS custom property + JS index calculation, or `animation-delay: calc(var(--i) * 40ms)`.
- **Command:** `/animate`

#### [P2] Charts: 5 colors, all medium-saturation
- **Location:** `theme.css` — `--chart-1..5`: indigo / emerald / amber / violet / pink
- **Impact:** Five high-saturation hues compete on every chart. Hard to read sequentially.
- **Recommendation:** Use a tonal scale (one hue, multiple lightnesses) for sequential data; reserve qualitative palette for categorical only.
- **Command:** `/colorize`

#### [P2] No `loading="lazy"` on images
- **Location:** Logo + any future avatars
- **Impact:** Initial page weight (small now, but should be a default).
- **Recommendation:** Default `loading="lazy"` and `decoding="async"` except for above-the-fold logo.
- **Command:** `/optimize`

#### [P2] No `prefers-color-scheme` listener
- **Location:** No automatic dark mode detection
- **Impact:** Tokens for `.dark` exist but the user has to manually toggle. OS preference ignored.
- **Recommendation:** Add `@media (prefers-color-scheme: dark)` mirror or a listener that adds the `.dark` class.
- **Command:** `/adapt`

#### [P2] Generic illustration-free empty states (likely)
- **Location:** Inferred — no `empty-state` components found in scan
- **Impact:** Empty list screens are usually where the generic look hits hardest.
- **Recommendation:** Add bespoke empty states with restrained line illustration or quote + clear CTA.
- **Command:** `/onboard`

#### [P2] No `keyboard` testing fixtures
- **Location:** No e2e tests for keyboard nav
- **Impact:** A11y regressions easy to ship.
- **Recommendation:** Add Playwright keyboard navigation tests for the primary flows.
- **Command:** `/harden`

#### [P2] Card padding/border patterns hand-rolled per component
- **Location:** `card-elevated` utility exists in `theme.css` but few `.card-*` classes referenced
- **Impact:** Each component re-implements card styling with slightly different values.
- **Recommendation:** Extract `card-elevated` + variants and use everywhere.
- **Command:** `/extract`

#### [P2] Action buttons styled inconsistently
- **Location:** Sidebar nav items have inline className strings, no shared component
- **Impact:** Drift over time; hard to change once.
- **Recommendation:** Extract `<NavItem />` and `<NavSection />` components.
- **Command:** `/extract`

#### [P2] Scrollbar styled at 6 px (mac-only nicety)
- **Location:** `theme.css` `::-webkit-scrollbar { width: 6px }`
- **Impact:** Touch users on Windows/Chrome get a near-invisible scrollbar — accessibility concern.
- **Recommendation:** 8 px on `(pointer: coarse)`, 6 px on `(pointer: fine)`.
- **Command:** `/adapt`

#### [P2] No focus styles on custom interactive divs
- **Location:** Several `<div>`-based clickables likely (typical Radix/shadcn pattern uses buttons, but custom items may exist)
- **Impact:** Where they exist, no visible focus ring → keyboard trap.
- **Recommendation:** Audit `onClick` on non-button elements; promote to `<button>` or add `tabIndex` + focus-visible styles.
- **Command:** `/harden`

#### [P2] `.dark` mode token mostly identical to light + inverted
- **Location:** `theme.css:62-79`
- **Impact:** Dark mode is a literal inversion — tonal flatness, no real consideration of dark-specific surface elevation.
- **Recommendation:** True dark UI uses a 3-tone surface system (canvas / surface / overlay) with subtle elevation. Mid-2010s Material guide is still useful here.
- **Command:** `/colorize`

### P3 — Polish

- **[P3]** Section-label letter-spacing/uppercase combo not using token. → `/normalize`
- **[P3]** Title attribute on icon-only buttons missing (tooltip fallback). → `/clarify`
- **[P3]** No `:visited` styles on links. → `/polish`
- **[P3]** `cursor: pointer` on `<select>` — browsers handle this; small redundancy. → `/distill`
- **[P3]** No `text-rendering: optimizeLegibility` on body. → `/typeset`
- **[P3]** No `font-feature-settings` for ligatures or tabular nums on monospace block. → `/typeset` (`font-mono-num` exists; not used widely)
- **[P3]** `box-shadow` colors hard-coded `rgba(0,0,0,0.08)` — won't tone in dark mode. → `/normalize`
- **[P3]** Logo at `/crane-logo.png` — not SVG, no `<picture>` for retina. → `/optimize`

---

## Patterns & Systemic Issues

1. **Token system is excellent on paper, ignored in practice.** The `theme.css` design system would score 4/4 if components actually used it. The fix is a codemod + ESLint rule banning raw `text-slate-*` / `bg-slate-*` / `border-slate-*` / hex literals in `*.tsx`.
2. **Accessibility is decoration, not infrastructure.** `aria-` attributes appear where someone copy-pasted a Radix snippet, but custom buttons and forms have none. There's no a11y check in CI, no axe-core in tests. This is fixable in a single pass.
3. **The visual identity reads "starter template", not "venture firm".** Every choice — Inter, indigo→violet, slate, dark sidebar, AI-named sections — is a default. Crane has no distinctive visual signature.
4. **Two component libraries side-by-side (MUI + Radix).** No clear rule for when to use which. Bundle bloat + design drift.
5. **Motion system is the single bright spot.** `--ease-out-expo`, fade-in-up, stagger-children, reduced-motion respect, focus-visible, active-state — this is well-designed. **Don't lose it during the redesign.**

---

## Positive Findings

- ✅ `theme.css` token architecture is well-structured (semantic naming, dark variant, sidebar tokens, chart tokens, shadow tokens).
- ✅ `prefers-reduced-motion` correctly disables animations.
- ✅ `:focus-visible` (not `:focus`) — modern, correct.
- ✅ Custom easing curves (`--ease-out-expo`, etc.) — deliberate, Emil-Kowalski-grade motion taste.
- ✅ Stagger-children + fade-in animation system is genuinely refined.
- ✅ `font-mono-num` utility for tabular numerals — a small detail that matters in finance UIs.
- ✅ Inter is loaded with `display=swap` (good).
- ✅ Sidebar dark surface uses tokens (`--sidebar`) — a model for the rest.
- ✅ No glassmorphism, no gradient text in TSX, no `hover:scale`, no spring-bounce on hover — many of the most common AI tells were avoided.
- ✅ Radix UI used heavily — accessibility primitives are mostly correct out-of-the-box.

---

## Recommended Actions

In priority order. **Run them in order; the early ones unblock the rest.**

1. **[P0] `/distill`** — Strip the generic palette and AI nav taxonomy. Decide what Crane's visual signature is (graphite + ink? warm cream + deep teal? off-white + maritime navy?) and ruthlessly remove indigo→violet, "Intelligence Hub", and "Good morning, Anna" motif.
2. **[P0] `/typeset`** — Replace Inter with a more characterful sans (Söhne, Geist, Mona Sans, Inter Display, or a serif-pair like Tiempos for headings). Establish a 12/13/14/16/20/28/40 type scale aligned to `theme.css` `@layer base`.
3. **[P0] `/colorize`** — Reduce the chart palette from 5 saturated hues to a tonal scale + 1 accent. Improve dark-mode tonal hierarchy (canvas/surface/overlay). Fix the 234 instances of slate-400 on light backgrounds.
4. **[P0] `/harden`** — Add `<label>` to every input, `aria-label` to every icon-only button, semantic landmarks (`<main>`, `<nav>`, `<header>`), skip-to-content link, axe-core in CI.
5. **[P1] `/adapt`** — Raise touch targets to 44 px on `(pointer: coarse)`. Add `prefers-color-scheme` listener. Mobile breakpoints for the sidebar.
6. **[P1] `/normalize`** — Codemod: replace raw `text-slate-*` / `bg-slate-*` / hex literals with semantic tokens. ESLint rule to prevent regressions.
7. **[P1] `/optimize`** — Remove MUI + Emotion (Radix already covers it). Self-host Inter or move font load to preconnect+stylesheet.
8. **[P1] `/clarify`** — Rewrite nav: "Intelligence Hub" → "Pipeline", "Command Center" → "Today", "Action Matrix" → "Tasks", "Quarterly Review" → "Quarterly", etc.
9. **[P2] `/animate`** — Remove global `:active scale(0.97)`; apply only to CTAs. Extend stagger past 10 children with calc-based delays.
10. **[P2] `/extract`** — Pull `<NavItem />`, `<NavSection />`, `<EmptyState />`, `card-elevated` variants into a reusable layer.
11. **[P2] `/onboard`** — Custom empty states with restrained illustration + clear CTAs.
12. **[P3] `/polish`** — Final pass for `:visited`, `text-rendering`, hard-coded shadow colors.

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/audit` after fixes to see your score improve.
