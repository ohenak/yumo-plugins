<!--
  PDLC work queue — starter template.

  Copy this file to docs/_queue/QUEUE.md in your consuming repo, then drive it with:
      /loop run /pdlc:orchestrate-queue

  HOW IT WORKS
  - orchestrate-queue picks AT MOST ONE ready entry per invocation, in queue order.
  - An entry is eligible only when its Status is `pending` AND its REQ frontmatter
    has `ready: true`. A draft REQ (no `ready: true`) is skipped — park it here safely.
  - Effective dependencies = this table's Depends-On  ∪  the REQ's own `depends-on`.
  - A Phase-0 triage agent verifies each dependency is actually merged into the base
    before the dependent runs (specs are authored against the live codebase).

  STATUS LIFECYCLE (the skill writes these automatically except `done`):
      pending ─pick─▶ in-progress ─success─▶ awaiting-merge ─(YOU merge PR)─▶ done
                          └─ halt/throw ─▶ halted
                                                   blocked  (set by you, optional)
  - `awaiting-merge` means the work is on feat-{feature} / a PR but NOT yet in the base.
  - YOU set `done` after merging the PR. That merge is what unblocks dependents.
  - While any row is `in-progress`, the loop will not pick up new work (serial guard).

  COLUMNS (matched by header name, case-insensitive; extra columns are ignored):
      Order     integer, used to sort pickup order
      Status    pending | in-progress | awaiting-merge | done | halted | blocked
      Feature   the {feature} slug; must match docs/{feature}/ and feat-{feature}
      REQ Path  docs/{feature}/REQ-{feature}.md
      Depends-On  comma/space list of feature slugs, or — / none / blank

  MULTIPLE DEPENDENCIES
  - A feature may depend on several others: list them all in Depends-On
    (e.g. `auth-refresh, notification-v2`) and/or in the REQ's `depends-on`.
    The two are merged (union, de-duplicated) — see the `mobile-push` row below.
  - A multi-dep feature only becomes ready when EVERY dependency is merged into the
    base (status `done`). If even one is still awaiting-merge, triage returns `blocked`
    and the loop skips it this pass, retrying later.
  - The queue does NOT topologically sort for you: it scans by Order and picks the
    first entry whose deps are all satisfied. Out-of-order rows don't deadlock — they
    just get skipped each pass until their deps land — but keep dependents BELOW their
    dependencies in Order to avoid wasted triage passes.

  Each REQ also needs frontmatter to opt in:
      ---
      feature: notification-v2
      ready: true                          # gate: omit/false to keep it a draft
      depends-on: [auth-refresh, sessions] # union with the Depends-On column below
      ---

  Delete the example rows below and add your own.
-->

# PDLC Queue

| Order | Status  | Feature         | REQ Path                                    | Depends-On                     |
|-------|---------|-----------------|---------------------------------------------|--------------------------------|
| 1     | pending | example-feature | docs/example-feature/REQ-example-feature.md | —                              |
| 2     | pending | example-next    | docs/example-next/REQ-example-next.md       | example-feature                |
| 3     | pending | example-mobile  | docs/example-mobile/REQ-example-mobile.md   | example-feature, example-next  |
