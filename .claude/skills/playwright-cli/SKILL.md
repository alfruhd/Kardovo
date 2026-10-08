---
name: playwright-cli
description: Run headless browser sessions, capture desktop and mobile viewports, inspect rendered DOM and visual layouts, test user interactions, and verify UI changes directly from the terminal without guessing.
---

# Playwright CLI Skill

Use Playwright to inspect, test, and visually verify web applications running locally or in staging.

## Core Directives

1. **Visual Grounding First**: Never guess if a frontend change or CSS rule resolved an issue. When diagnosing visual regressions, responsive bugs, or layout shifts, run Playwright to capture a screenshot or inspect elements.
2. **Dual-Viewport Verification**: Test both Desktop (`1440x900`) and Mobile Viewport (`390x844` or iPhone 14/15/Pixel dimensions) to catch unexpected overflow or navigation overlapping.
3. **Automated User Interaction Flows**: Test clicking tabs, submitting forms, verifying modals open/close smoothly, and validating that dynamic states render without JavaScript runtime errors.

## Key Usage Commands

- **Take desktop screenshot**:
  ```bash
  npx playwright screenshot --viewport-size=1440,900 http://localhost:8000/ screenshot-desktop.png
  ```

- **Take mobile screenshot**:
  ```bash
  npx playwright screenshot --device="iPhone 13" http://localhost:8000/scanner screenshot-mobile.png
  ```

- **Test single scenario or route**:
  ```bash
  npx playwright test tests/e2e/scanner.spec.ts
  ```

- **Inspect page DOM / console errors**:
  ```bash
  npx playwright open http://localhost:8000/
  ```
