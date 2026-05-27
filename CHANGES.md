# Changes

### 2026-05-27 — Fix user dropdown position

- File: apps/web/modules/shell/user-dropdown/UserDropdown.tsx
- Change: Fixed getBoundingClientRect calculation for dropdown positioning.
    Wrong: bottom = window.innerHeight - rect.top + 8
      (put menu 758px off screen above)
    Right: top = rect.bottom + 8
      (puts menu below trigger, visible)
- Reason: Menu was rendering via createPortal into document.body
    but position calculation was placing it above the viewport
    making it invisible
- Risk: Low — visual fix only
- Tested: Yes — menu opens below the user card correctly
- Lesson: When using fixed positioning with getBoundingClientRect:
    Use rect.bottom for menus that open downward.
    Use rect.top for menus that open upward.
