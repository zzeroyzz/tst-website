# Design Principles Checklist (Example)

Use this checklist to quickly evaluate any page. Mark ✅ / ⚠️ / ❌ next to each item.

## 1) Readability & Hierarchy

- Font sizes establish clear hierarchy (H1 > H2 > body).
- Line length ~45–85 chars; line-height 1.4–1.7.
- Sufficient spacing between sections; consistent grid.
- No walls of text; use headings, bullets, and short paragraphs.

## 2) Color & Contrast

- Text contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large).
- Interactive elements have visible states (hover/focus/active).
- Accent colors are used sparingly and consistently.

## 3) Interaction & Focus

- All interactive controls have visible focus rings.
- Click targets are at least 40×40 px on touch.
- Keyboard navigation works in a logical order.

## 4) Structure & Semantics

- Headings are nested correctly (no skipping levels).
- Buttons are <button>, links are <a>, forms have labels.
- Landmarks used: header, nav, main, footer, aside where relevant.

## 5) Performance Basics

- Images sized appropriately; use modern formats when possible.
- Critical content loads quickly; CLS is minimal (no layout jank).
- Avoid render-blocking where it’s easy to do so.

## 6) Content & Clarity

- Clear primary CTA above the fold.
- Jargon avoided; copy leads with user value.
- Forms ask only for essential fields; errors are clear and helpful.

## 7) Mobile

- Layout adapts cleanly at common breakpoints.
- Tap targets comfortable; gestures not required.
- Fixed headers/footers do not obscure content or inputs.

---

## Review Output Template

- **URL**:
- **Summary (2–3 sentences)**:
- **Top 5 Issues (priority-tagged)**:
  1. [P1]
  2. [P1/P2]
  3. [P2]
  4. [P3]
  5. [P3]
- **Quick Wins (next 48 hours)**:
- **Longer-Term Improvements**:
