# Title: Design Review (Live, Playwright MCP)

## Description

Open a URL, analyze it with Playwright MCP, and return an actionable report aligned to our Tailwind design schema and Neo‑Brutalist overlay.

## Inputs

- url: string (The page to review)
- note (optional): string (Context like target audience, page goal)

## Instructions

Follow the agent spec in `design-review-agent.md` and the checklists in:

- `design-principles-example.md`
- `neo-brutalist-principles.md`

**Also read** the project's `tailwind.config.js` or `tailwind.config.ts` if present and treat tokens as the source of truth.

### Steps

1. Use **Playwright MCP** to open {{url}} and wait for network idle.
2. Capture: an accessibility snapshot, list of clickable elements (role=button/link, names/hrefs), and high-level landmarks.
3. Compare against the general checklist and the Neo‑Brutalist overlay.
4. Resolve Tailwind tokens (colors, spacing, radii, font scale) from `tailwind.config.{js,ts}`; flag off‑token values and recommend closest tokens.
5. Return the **Review Output Template** with P1/P2/P3 severity and **specific** fixes (utility classes/tokens if possible). Include Quick Wins and Longer-Term items.
6. If Playwright MCP is unavailable, state that and stop.

### Output

Return a single, concise report using the Review Output Template with: URL, Summary, Top 5 Issues (with severities and fixes referencing Tailwind tokens), Quick Wins (<=5), Longer-Term (<=3).
