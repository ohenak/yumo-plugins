---
feature: ac12-widget
ready: true
depends-on: []
---
# REQ — ac12-widget

## 1. Problem / Context

Stand-in REQ for the AC-1.2 filesystem-observation fixture (TSPEC §7.7). This document exists
to be read, not authored against: the AC-1.2 test's clause 2 asserts at least one recorded read
of exactly this file's path (`docs/ac12-widget/REQ-ac12-widget.md`) under this fixture's
consumer root.

## 2. Goals

- G-1 Be read by clause 2's assertion.

## 3. Non-Goals

- NG-1 Drive an actual pipeline run to completion.

## 4. Constraints

- C-1 Offline only.

## 5. Acceptance Criteria

- AC-1.1 The file exists at a stable, predictable path under this fixture.

## 6. Risks

- R-1 None; this document is never executed against.

## 7. Obligations

- O-1 None.
