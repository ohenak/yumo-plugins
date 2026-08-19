---
feature: pdlc-consolidation-rehost
ready: false
depends-on: [pdlc-plugin-retirement, pdlc-headless-engine]
---

REQ — pdlc-consolidation-rehost

**DRAFT, UNREVIEWED.** Skeleton successor REQ raised solely to bind an
obligation recorded elsewhere (see §Upstream). Not authored through the
pm-author clarification gate against a human requester; no cross-review has
run. `ready: false` until the operator reviews and flips it — see queue's
draft rule in `docs/_queue/QUEUE.md`.

| Field | Value |
|---|---|
| Upstream | `pdlc-plugin-retirement` REQ O-8 (option (a), accepted loss + bound successor); grounded in that REQ's NG-5 carve-out and `pdlc-headless-engine`'s successor-capability precedent |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft, awaiting operator review | Claude | 0.1 | 2026-08-18 |

## 1. Problem / Context

`pdlc-plugin-retirement`'s sweep deletes the plugin-side workflow bundle,
including `pdlc/workflows/consolidate-learnings.js`. After the sweep, no
surviving host loads that module, so the *unattended, machinery-backed*
consolidation pass — the one `pdlc/skills/consolidate-learnings/SKILL.md`
(lines 8–13) says it delegates to rather than performs — stops being
available. That REQ's O-8 records the operator's choice of option (a):
accept the in-session loss, rewrite the skill's delegation prose honestly,
and bind the machinery-backed pass to this successor REQ plus a queue row,
both raised before the retirement feature's first deletion commit.

## 2. Goals

- **G-1** Re-host the unattended consolidation pass so `@kaneho/pdlc-engine`
  loads or vendors `consolidate-learnings.js` (or its engine-native
  equivalent) as an engine-side capability, restoring machinery-backed
  execution without a plugin-hosted workflow runtime.
- **G-2** Preserve the pass's existing guarantees unchanged: the
  `.consolidation-log.md` boundary, deterministic `failure-mode-id`
  derivation (source REQ's AC-5.1), NFR-4 duplicate suppression, the AC-3.1
  guard-set PR route, and the AC-1.3 in-progress marker.

## 3. Non-Goals

- **NG-1** Not a vehicle for changing consolidation's cadence, promotion
  judgement, or scope (still human-approved promotion; still no
  autonomous skill-file edits) — only its host changes.
- **NG-2** Not the `pdlc-plugin-retirement` sweep itself; that feature ships
  independently of this REQ under its O-8 binding.
- **NG-3** Not a widening of `pdlc-headless-engine`'s own scope; this rides
  its successor-capability path (that REQ's NG-5) but is its own REQ family.

## 4. Acceptance Criteria (placeholder)

Not yet authored. Full AC set is se-author's and te-author's to derive from
this REQ's Goals once `ready: true`; must include coverage for each item in
G-2 and for the consolidation SKILL.md contract at lines 8–13.

## 5. Obligations / Open Questions

- **O-1** Operator review of this REQ, including whether it should be
  authored in full before or after `pdlc-plugin-retirement` merges. Until
  answered, this REQ stays `ready: false` and the queue will not pick it up.
