# Title: /design-review

## Description

Run a live design review on a given URL using Playwright MCP and our checklist.

## Inputs

- url: string

## Instructions

Use the **Design Review Agent** procedure:

- Navigate to {{url}} using Playwright MCP.
- Wait for network idle and capture an **a11y snapshot**, plus clickable elements (buttons/links and accessible names).
- Evaluate against **design-principles-example.md**.
- Produce the **Review Output Template** with P1/P2/P3 labels and concrete fixes.
- Include up to 5 **Quick Wins** and 3 **Longer-Term** items.
  If the MCP server is not running, state that and stop.
