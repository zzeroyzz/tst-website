# Title: Design Review (Live, Playwright MCP)

## Description

Open a URL, run an accessibility + structure pass with Playwright MCP, and return an actionable report using our checklist.

## Inputs

- url: string

## Instructions

Follow **design-review-agent.md**. Use **Playwright MCP** to:

1. Open {{url}} and wait for network idle.
2. Capture an a11y snapshot and enumerate clickable elements (buttons, links).
3. Compare findings with **design-principles-example.md**.
4. Return the **Review Output Template** with prioritized issues and concrete fixes.
   If Playwright MCP is unavailable, say so and do not proceed.
